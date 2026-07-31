import { Sequelize, sequelize } from "../../index.js";

const RecognitionCommercialisation = sequelize.define("recognition_commercialisation", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  application_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
  },
  assistance_looking_for: { type: Sequelize.STRING(100), allowNull: true },
  preferred_models: { type: Sequelize.JSONB, allowNull: true },
  financial_expectations: { type: Sequelize.TEXT, allowNull: true },
  confidentiality_level: {
    type: Sequelize.ENUM("public", "summary_only", "confidential"),
    allowNull: true,
  },
  extra_data: { type: Sequelize.JSONB, allowNull: true },
});

export default RecognitionCommercialisation;
