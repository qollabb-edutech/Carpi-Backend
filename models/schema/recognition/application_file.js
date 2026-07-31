import { Sequelize, sequelize } from "../../index.js";

const RecognitionApplicationFile = sequelize.define("recognition_application_files", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  application_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  field_key: { type: Sequelize.STRING(100), allowNull: false },
  section: { type: Sequelize.STRING(50), allowNull: true },
  parent_id: { type: Sequelize.INTEGER, allowNull: true },
  original_name: { type: Sequelize.STRING(255), allowNull: true },
  stored_name: { type: Sequelize.STRING(255), allowNull: true },
  file_url: { type: Sequelize.STRING(1000), allowNull: true },
  mime_type: { type: Sequelize.STRING(100), allowNull: true },
  size_bytes: { type: Sequelize.INTEGER, allowNull: true },
});

export default RecognitionApplicationFile;
