import RecognitionApplication from "./schema/recognition/application.js";
import RecognitionApplicantProfile from "./schema/recognition/applicant_profile.js";
import RecognitionFlowResponse from "./schema/recognition/flow_response.js";
import RecognitionCommercialisation from "./schema/recognition/commercialisation.js";
import RecognitionInstitutionResearch from "./schema/recognition/institution_research.js";
import RecognitionAdditionalAchievement from "./schema/recognition/additional_achievement.js";
import RecognitionApplicationFile from "./schema/recognition/application_file.js";

function associateModels() {
  RecognitionApplication.hasOne(RecognitionApplicantProfile, {
    foreignKey: "application_id",
    as: "applicant",
  });
  RecognitionApplicantProfile.belongsTo(RecognitionApplication, {
    foreignKey: "application_id",
    as: "application",
  });

  RecognitionApplication.hasOne(RecognitionFlowResponse, {
    foreignKey: "application_id",
    as: "flowResponse",
  });
  RecognitionFlowResponse.belongsTo(RecognitionApplication, {
    foreignKey: "application_id",
    as: "application",
  });

  RecognitionApplication.hasOne(RecognitionCommercialisation, {
    foreignKey: "application_id",
    as: "commercialisation",
  });
  RecognitionCommercialisation.belongsTo(RecognitionApplication, {
    foreignKey: "application_id",
    as: "application",
  });

  RecognitionApplication.hasOne(RecognitionInstitutionResearch, {
    foreignKey: "application_id",
    as: "institutionResearch",
  });
  RecognitionInstitutionResearch.belongsTo(RecognitionApplication, {
    foreignKey: "application_id",
    as: "application",
  });

  RecognitionApplication.hasMany(RecognitionAdditionalAchievement, {
    foreignKey: "application_id",
    as: "additionalAchievements",
  });
  RecognitionAdditionalAchievement.belongsTo(RecognitionApplication, {
    foreignKey: "application_id",
    as: "application",
  });

  RecognitionApplication.hasMany(RecognitionApplicationFile, {
    foreignKey: "application_id",
    as: "files",
  });
  RecognitionApplicationFile.belongsTo(RecognitionApplication, {
    foreignKey: "application_id",
    as: "application",
  });
}

associateModels();

export {
  RecognitionApplication,
  RecognitionApplicantProfile,
  RecognitionFlowResponse,
  RecognitionCommercialisation,
  RecognitionInstitutionResearch,
  RecognitionAdditionalAchievement,
  RecognitionApplicationFile,
};
