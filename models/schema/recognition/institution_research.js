import { Sequelize, sequelize } from "../../index.js";

const RecognitionInstitutionResearch = sequelize.define("recognition_institution_research", {
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
  research_strengths: { type: Sequelize.TEXT, allowNull: true },
  major_labs: { type: Sequelize.TEXT, allowNull: true },
  industry_partnerships: { type: Sequelize.TEXT, allowNull: true },
  technology_transfer_office: { type: Sequelize.TEXT, allowNull: true },
  key_innovations: { type: Sequelize.TEXT, allowNull: true },
});

export default RecognitionInstitutionResearch;
