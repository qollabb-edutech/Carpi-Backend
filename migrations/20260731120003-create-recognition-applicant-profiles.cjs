"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("recognition_applicant_profiles", {
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
      full_name: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      designation: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      institution: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      department: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      state: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING(100),
        allowNull: true,
      },
      official_email: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      mobile_number: {
        type: Sequelize.STRING(20),
        allowNull: true,
      },
      linkedin_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      google_scholar_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      orcid: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      researchgate_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      scopus_id: {
        type: Sequelize.STRING(50),
        allowNull: true,
      },
      institution_profile_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      personal_website_url: {
        type: Sequelize.STRING(500),
        allowNull: true,
      },
      highest_qualification: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      years_of_experience: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      primary_research_area: {
        type: Sequelize.STRING(255),
        allowNull: true,
      },
      areas_of_expertise: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      professional_biography: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      major_achievements: {
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
    await queryInterface.dropTable("recognition_applicant_profiles");
  },
};
