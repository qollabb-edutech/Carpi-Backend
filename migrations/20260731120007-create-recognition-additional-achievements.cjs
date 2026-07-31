"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recognition_additional_achievements", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      application_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "recognition_applications",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      achievement_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      title: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      year: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sort_order: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
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

    await queryInterface.addIndex("recognition_additional_achievements", ["application_id"], {
      name: "idx_recognition_additional_achievements_application_id",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("recognition_additional_achievements");
  },
};
