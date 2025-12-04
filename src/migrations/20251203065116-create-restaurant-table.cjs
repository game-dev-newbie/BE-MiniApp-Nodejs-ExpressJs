"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("restaurant_tables", {
      id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      restaurant_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "restaurants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      capacity: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      location: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      view_image_url: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      view_note: {
        type: Sequelize.STRING,
        allowNull: true,
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
    await queryInterface.dropTable("restaurant_tables");
  },
};
