"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recognition_institution_research", {
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
      research_strengths: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      major_labs: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      industry_partnerships: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      technology_transfer_office: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      key_innovations: {
        type: Sequelize.TEXT,
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
    await queryInterface.dropTable("recognition_institution_research");
  },
};
