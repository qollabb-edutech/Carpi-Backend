import { Sequelize, sequelize } from "../../index.js";

const RecognitionApplication = sequelize.define("recognition_applications", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  reference_number: {
    type: Sequelize.STRING(30),
    allowNull: true,
    unique: true,
  },
  status: {
    type: Sequelize.STRING(20),
    allowNull: false,
    defaultValue: "submitted",
  },
  current_step: {
    type: Sequelize.STRING(50),
    allowNull: true,
  },
  broad_category_id: { type: Sequelize.STRING(100), allowNull: true },
  broad_category_title: { type: Sequelize.STRING(255), allowNull: true },
  sub_category_id: { type: Sequelize.STRING(100), allowNull: true },
  sub_category_title: { type: Sequelize.STRING(255), allowNull: true },
  flow_id: { type: Sequelize.STRING(10), allowNull: true },
  has_commercialisation_section: { type: Sequelize.BOOLEAN, defaultValue: false },
  has_institution_research_section: { type: Sequelize.BOOLEAN, defaultValue: false },
  collaboration_interests: { type: Sequelize.JSONB, allowNull: true },
  declaration_information_accurate: { type: Sequelize.BOOLEAN, defaultValue: false },
  declaration_authorized_to_share: { type: Sequelize.BOOLEAN, defaultValue: false },
  declaration_authorize_verification: { type: Sequelize.BOOLEAN, defaultValue: false },
  declaration_consent_publish: { type: Sequelize.BOOLEAN, defaultValue: false },
  declaration_consent_commercialization_contact: { type: Sequelize.BOOLEAN, defaultValue: false },
  declaration_agree_privacy_terms: { type: Sequelize.BOOLEAN, defaultValue: false },
  submitted_at: { type: Sequelize.DATE, allowNull: true },
  ip_address: { type: Sequelize.STRING(45), allowNull: true },
  user_agent: { type: Sequelize.TEXT, allowNull: true },
});

export default RecognitionApplication;
