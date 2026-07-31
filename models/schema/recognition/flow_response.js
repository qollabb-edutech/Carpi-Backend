import { Sequelize, sequelize } from "../../index.js";

const RecognitionFlowResponse = sequelize.define("recognition_flow_responses", {
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
  flow_id: { type: Sequelize.STRING(10), allowNull: true },
  flow_data: {
    type: Sequelize.JSONB,
    allowNull: false,
    defaultValue: {},
  },
});

export default RecognitionFlowResponse;
