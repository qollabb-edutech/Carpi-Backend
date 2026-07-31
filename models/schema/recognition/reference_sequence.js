import { Sequelize, sequelize } from "../../index.js";

const RecognitionReferenceSequence = sequelize.define("recognition_reference_sequences", {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  year: {
    type: Sequelize.INTEGER,
    allowNull: false,
    unique: true,
  },
  last_sequence: {
    type: Sequelize.INTEGER,
    defaultValue: 0,
  },
});

export default RecognitionReferenceSequence;
