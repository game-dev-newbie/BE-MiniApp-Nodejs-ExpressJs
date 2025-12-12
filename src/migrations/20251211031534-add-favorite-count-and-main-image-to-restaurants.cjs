"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // favorite_count: đếm số người thêm vào yêu thích
    await queryInterface.addColumn("restaurants", "favorite_count", {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    });

    // main_image_url: ảnh đại diện chính của nhà hàng
    await queryInterface.addColumn("restaurants", "main_image_url", {
      type: Sequelize.STRING, // đủ dùng cho URL, nếu thích TEXT cũng được
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("restaurants", "favorite_count");
    await queryInterface.removeColumn("restaurants", "main_image_url");
  },
};
