"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recognition_commercialisation", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        unique: true,
        references: {
          model: "recognition_applications",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      assistance_looking_for: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      preferred_models: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      financial_expectations: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      confidentiality_level: {
        type: Sequelize.ENUM("public", "summary_only", "confidential"),
        allowNull: true,
      },
      extra_data: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      deletedAt: {
        type: Sequelize.DATE,
        allowNull: true,
        defaultValue: null,
        comment: "Soft delete timestamp (paranoid mode)",
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("recognition_commercialisation");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_recognition_commercialisation_confidentiality_level";'
    );
  },
};
