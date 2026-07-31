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
  getFlowIdForSubCategory,
  requiresCommercialisationSection,
  requiresInstitutionResearchSection,
} from "../../helper/flowMap.js";
import { generateReferenceNumber } from "../../helper/referenceNumber.js";
import { uploadCarpiFile } from "../../aws/s3.js";
import { sanitizeRecognitionPayload } from "../../helper/sanitizeRecognitionPayload.js";

export async function uploadRecognitionFile(req) {
  try {
    if (!req.file) {
      return { error: true, message: "No file uploaded" };
    }

    const fieldKey = (req.body?.field_key || "").trim();
    const section = (req.body?.section || "supporting").trim();

    if (!fieldKey) {
      return { error: true, message: "field_key is required" };
    }

    return await uploadCarpiFile(req.file, { fieldKey, section });
  } catch (error) {
    return { error: true, message: error.message || "Failed to upload file" };
  }
}

function validateSubmitPayload(payload) {
  const errors = [];
  if (!payload.broad_category_id) errors.push("Broad category is required");
  if (!payload.sub_category_id) errors.push("Sub category is required");

  const applicant = payload.applicant || {};
  if (!applicant.full_name) errors.push("Full name is required");
  if (!applicant.designation) errors.push("Designation is required");
  if (!applicant.institution) errors.push("Institution is required");
  if (!applicant.official_email) errors.push("Official email is required");
  if (!applicant.mobile_number) errors.push("Mobile number is required");
  if (!applicant.linkedin_url) errors.push("LinkedIn URL is required");

  const declarations = payload.declarations || {};
  const declarationKeys = [
    "declaration_information_accurate",
    "declaration_authorized_to_share",
    "declaration_authorize_verification",
    "declaration_consent_publish",
    "declaration_consent_commercialization_contact",
    "declaration_agree_privacy_terms",
  ];
  declarationKeys.forEach((key) => {
    if (!declarations[key]) errors.push(`Declaration required: ${key}`);
  });

  return errors;
}

function buildApplicantProfile(payload) {
  const applicant = payload.applicant || {};
  const professional = payload.professional || {};
  const { city_state, ...restApplicant } = applicant;

  const allowedApplicant = {
    full_name: restApplicant.full_name,
    designation: restApplicant.designation,
    institution: restApplicant.institution,
    department: restApplicant.department,
    official_email: restApplicant.official_email,
    mobile_number: restApplicant.mobile_number,
    linkedin_url: restApplicant.linkedin_url,
    google_scholar_url: restApplicant.google_scholar_url,
    orcid: restApplicant.orcid,
    researchgate_url: restApplicant.researchgate_url,
    scopus_id: restApplicant.scopus_id,
    institution_profile_url: restApplicant.institution_profile_url,
    personal_website_url: restApplicant.personal_website_url,
  };

  return {
    ...allowedApplicant,
    ...professional,
    city: city_state || null,
    state: null,
    country: null,
  };
}

export async function submitApplication(req) {
  const transaction = await sequelize.transaction();

  try {
    let payload = req.body?.payload ?? req.body;
    if (typeof payload === "string") {
      payload = JSON.parse(payload);
    }

    const { sanitized, errors: sanitizeErrors } = sanitizeRecognitionPayload(payload);
    payload = sanitized;

    const errors = [...sanitizeErrors, ...validateSubmitPayload(payload)];
    if (errors.length > 0) {
      await transaction.rollback();
      return { error: true, message: errors.join("; ") };
    }

    const flowId = getFlowIdForSubCategory(payload.sub_category_id);
    const flowData = payload.flow_data || {};
    const referenceNumber = await generateReferenceNumber();
    const submittedFiles = Array.isArray(payload.files) ? payload.files : [];

    const application = await RecognitionApplication.create(
      {
        reference_number: referenceNumber,
        status: "submitted",
        submitted_at: new Date(),
        current_step: "submitted",
        broad_category_id: payload.broad_category_id,
        broad_category_title: payload.broad_category_title,
        sub_category_id: payload.sub_category_id,
        sub_category_title: payload.sub_category_title,
        flow_id: flowId,
        has_commercialisation_section: requiresCommercialisationSection(
          payload.sub_category_id,
          flowData
        ),
        has_institution_research_section: requiresInstitutionResearchSection(
          payload.sub_category_id,
          flowData
        ),
        collaboration_interests: payload.collaboration_interests || [],
        declaration_information_accurate: !!payload.declarations?.declaration_information_accurate,
        declaration_authorized_to_share: !!payload.declarations?.declaration_authorized_to_share,
        declaration_authorize_verification:
          !!payload.declarations?.declaration_authorize_verification,
        declaration_consent_publish: !!payload.declarations?.declaration_consent_publish,
        declaration_consent_commercialization_contact:
          !!payload.declarations?.declaration_consent_commercialization_contact,
        declaration_agree_privacy_terms: !!payload.declarations?.declaration_agree_privacy_terms,
        ip_address: req.ip,
        user_agent: req.headers["user-agent"] || null,
      },
      { transaction }
    );

    await RecognitionApplicantProfile.create(
      {
        application_id: application.id,
        ...buildApplicantProfile(payload),
      },
      { transaction }
    );

    await RecognitionFlowResponse.create(
      {
        application_id: application.id,
        flow_id: flowId,
        flow_data: flowData,
      },
      { transaction }
    );

    if (payload.commercialisation && requiresCommercialisationSection(payload.sub_category_id, flowData)) {
      await RecognitionCommercialisation.create(
        {
          application_id: application.id,
          assistance_looking_for: payload.commercialisation.assistance_looking_for,
          preferred_models: payload.commercialisation.preferred_models || [],
          financial_expectations: payload.commercialisation.financial_expectations,
          confidentiality_level: payload.commercialisation.confidentiality_level,
          extra_data: payload.commercialisation.extra_data || null,
        },
        { transaction }
      );
    }

    if (
      payload.institution_research &&
      requiresInstitutionResearchSection(payload.sub_category_id, flowData)
    ) {
      await RecognitionInstitutionResearch.create(
        {
          application_id: application.id,
          research_strengths: payload.institution_research.research_strengths,
          major_labs: payload.institution_research.major_labs,
          industry_partnerships: payload.institution_research.industry_partnerships,
          technology_transfer_office: payload.institution_research.technology_transfer_office,
          key_innovations: payload.institution_research.key_innovations,
        },
        { transaction }
      );
    }

    const items = Array.isArray(payload.additional_achievements)
      ? payload.additional_achievements
      : [];
    if (items.length > 0) {
      await RecognitionAdditionalAchievement.bulkCreate(
        items.map((item, index) => ({
          application_id: application.id,
          achievement_type: item.achievement_type,
          title: item.title,
          year: item.year || null,
          description: item.description,
          sort_order: index,
        })),
        { transaction }
      );
    }

    for (const file of submittedFiles) {
      if (!file?.url) continue;

      await RecognitionApplicationFile.create(
        {
          application_id: application.id,
          field_key: file.field_key || "unknown",
          section: file.section || "general",
          parent_id: null,
          original_name: file.original_name || file.name || null,
          stored_name: file.key || null,
          file_url: file.url,
          mime_type: file.mime_type || file.type || null,
          size_bytes: file.size_bytes || file.size || null,
        },
        { transaction }
      );
    }

    await transaction.commit();

    return {
      error: false,
      message: "Application submitted successfully",
      data: { reference_number: referenceNumber, id: application.id },
    };
  } catch (error) {
    await transaction.rollback();
    return { error: true, message: error.message || "Failed to submit application" };
  }
}

