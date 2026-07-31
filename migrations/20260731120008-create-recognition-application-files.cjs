"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recognition_application_files", {
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
      field_key: {
        type: Sequelize.STRING(100),
        allowNull: false,
      },
      section: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      parent_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      original_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      stored_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      file_url: {
        type: Sequelize.STRING(1000),
        allowNull: true,
      },
      mime_type: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      size_bytes: {
        type: Sequelize.INTEGER,
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

    await queryInterface.addIndex("recognition_application_files", ["application_id"], {
      name: "idx_recognition_application_files_application_id",
    });
    await queryInterface.addIndex("recognition_application_files", ["field_key"], {
      name: "idx_recognition_application_files_field_key",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("recognition_application_files");
  },
};
