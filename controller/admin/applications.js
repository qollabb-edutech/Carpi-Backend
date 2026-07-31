import { Op } from "sequelize";
import { sequelize } from "../../models/index.js";
import {
  RecognitionApplication,
  RecognitionApplicantProfile,
  RecognitionFlowResponse,
  RecognitionCommercialisation,
  RecognitionInstitutionResearch,
  RecognitionAdditionalAchievement,
  RecognitionApplicationFile,
} from "../../models/association.js";
import {
  attachSignedUrlsToFiles,
  generateSignedUrlFromKey,
  resolveObjectKey,
} from "../../aws/s3.js";

const APPLICATION_INCLUDES = [
  { model: RecognitionApplicantProfile, as: "applicant" },
  { model: RecognitionFlowResponse, as: "flowResponse" },
  { model: RecognitionCommercialisation, as: "commercialisation" },
  { model: RecognitionInstitutionResearch, as: "institutionResearch" },
  { model: RecognitionAdditionalAchievement, as: "additionalAchievements" },
  { model: RecognitionApplicationFile, as: "files" },
];

const LIST_SORT_FIELDS = {
  reference_number: "reference_number",
  submitted_at: "submitted_at",
  status: "status",
  broad_category_title: "broad_category_title",
  createdAt: "createdAt",
};

export async function getDashboardStats(_req, res) {
  try {
    const totalSubmitted = await RecognitionApplication.count({
      where: { status: "submitted" },
    });

    const categoryCounts = await RecognitionApplication.findAll({
      attributes: [
        "broad_category_title",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: {
        status: "submitted",
        broad_category_title: { [Op.ne]: null },
      },
      group: ["broad_category_title"],
      order: [[sequelize.literal("count"), "DESC"]],
      limit: 10,
      raw: true,
    });

    const now = new Date();
    const last7Days = new Date(now);
    last7Days.setDate(last7Days.getDate() - 7);
    const last30Days = new Date(now);
    last30Days.setDate(last30Days.getDate() - 30);

    const last7DaysCount = await RecognitionApplication.count({
      where: {
        status: "submitted",
        submitted_at: { [Op.gte]: last7Days },
      },
    });

    const last30DaysCount = await RecognitionApplication.count({
      where: {
        status: "submitted",
        submitted_at: { [Op.gte]: last30Days },
      },
    });

    return res.status(200).json({
      error: false,
      message: "Dashboard stats fetched",
      data: {
        totalSubmitted,
        last7DaysCount,
        last30DaysCount,
        categoryCounts: categoryCounts.map((row) => ({
          category: row.broad_category_title,
          count: Number(row.count),
        })),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: true, message: error.message || "Failed to fetch stats" });
  }
}

export async function listApplications(req, res) {
  try {
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 100);
    const offset = parseInt(req.query.offset, 10) || 0;
    const search = (req.query.search || "").trim();
    const sortBy = LIST_SORT_FIELDS[req.query.sortBy] || "submitted_at";
    const orderBy = req.query.orderBy?.toUpperCase() === "ASC" ? "ASC" : "DESC";

    const where = { status: "submitted" };

    if (search) {
      where[Op.or] = [
        { reference_number: { [Op.iLike]: `%${search}%` } },
        { broad_category_title: { [Op.iLike]: `%${search}%` } },
        { sub_category_title: { [Op.iLike]: `%${search}%` } },
        { "$applicant.full_name$": { [Op.iLike]: `%${search}%` } },
        { "$applicant.official_email$": { [Op.iLike]: `%${search}%` } },
      ];
    }

    const { rows, count } = await RecognitionApplication.findAndCountAll({
      where,
      include: [
        {
          model: RecognitionApplicantProfile,
          as: "applicant",
          required: false,
        },
      ],
      limit,
      offset,
      order: [[sortBy, orderBy]],
      distinct: true,
    });

    return res.status(200).json({
      error: false,
      message: "Applications fetched",
      data: {
        rows,
        totalCount: count,
        limit,
        offset,
      },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || "Failed to fetch applications",
    });
  }
}

export async function getApplicationDetail(req, res) {
  try {
    const application = await RecognitionApplication.findOne({
      where: { id: req.params.id, status: "submitted" },
      include: APPLICATION_INCLUDES,
    });

    if (!application) {
      return res.status(404).json({ error: true, message: "Application not found" });
    }

    const data = application.toJSON();
    data.files = await attachSignedUrlsToFiles(data.files || []);

    return res.status(200).json({
      error: false,
      message: "Application fetched",
      data,
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || "Failed to fetch application",
    });
  }
}

export async function deleteApplication(req, res) {
  const transaction = await sequelize.transaction();

  try {
    const application = await RecognitionApplication.findOne({
      where: { id: req.params.id, status: "submitted" },
      transaction,
    });

    if (!application) {
      await transaction.rollback();
      return res.status(404).json({ error: true, message: "Application not found" });
    }

    const destroyOpts = { where: { application_id: application.id }, transaction };

    await RecognitionApplicationFile.destroy(destroyOpts);
    await RecognitionAdditionalAchievement.destroy(destroyOpts);
    await RecognitionInstitutionResearch.destroy(destroyOpts);
    await RecognitionCommercialisation.destroy(destroyOpts);
    await RecognitionFlowResponse.destroy(destroyOpts);
    await RecognitionApplicantProfile.destroy(destroyOpts);
    await application.destroy({ transaction });

    await transaction.commit();

    return res.status(200).json({
      error: false,
      message: "Application deleted successfully",
    });
  } catch (error) {
    await transaction.rollback();
    return res.status(500).json({
      error: true,
      message: error.message || "Failed to delete application",
    });
  }
}

export async function getApplicationFileUrl(req, res) {
  try {
    const application = await RecognitionApplication.findOne({
      where: { id: req.params.id, status: "submitted" },
      attributes: ["id"],
    });

    if (!application) {
      return res.status(404).json({ error: true, message: "Application not found" });
    }

    const file = await RecognitionApplicationFile.findOne({
      where: {
        id: req.params.fileId,
        application_id: application.id,
      },
    });

    if (!file) {
      return res.status(404).json({ error: true, message: "File not found" });
    }

    const key = resolveObjectKey(file);
    if (!key) {
      return res.status(404).json({ error: true, message: "File storage key not found" });
    }

    const signed_url = await generateSignedUrlFromKey(key);

    return res.status(200).json({
      error: false,
      message: "Signed URL generated",
      data: { signed_url },
    });
  } catch (error) {
    return res.status(500).json({
      error: true,
      message: error.message || "Failed to generate signed URL",
    });
  }
}
