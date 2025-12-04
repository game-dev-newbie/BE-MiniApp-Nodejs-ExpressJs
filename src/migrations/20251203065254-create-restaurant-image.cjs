"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("restaurant_images", {
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
      file_path: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false, // 'COVER','GALLERY','MENU'
      },
      caption: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      is_primary: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("restaurant_images");
  },
};
