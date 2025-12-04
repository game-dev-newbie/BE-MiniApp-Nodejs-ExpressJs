"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("restaurants", {
      id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      address: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      phone: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      tags: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      search_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      search_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      search_tags: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      require_deposit: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      default_deposit_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
      average_rating: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0,
      },
      review_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("restaurants");
  },
};
