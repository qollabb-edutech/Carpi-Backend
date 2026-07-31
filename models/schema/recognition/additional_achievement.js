import { Sequelize, sequelize } from "../../index.js";

const RecognitionAdditionalAchievement = sequelize.define("recognition_additional_achievements", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  application_id: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  achievement_type: { type: Sequelize.STRING(100), allowNull: true },
  title: { type: Sequelize.STRING(255), allowNull: true },
  year: { type: Sequelize.INTEGER, allowNull: true },
  description: { type: Sequelize.TEXT, allowNull: true },
  sort_order: { type: Sequelize.INTEGER, defaultValue: 0 },
});

export default RecognitionAdditionalAchievement;
