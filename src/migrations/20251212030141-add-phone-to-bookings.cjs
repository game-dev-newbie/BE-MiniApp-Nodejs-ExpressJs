"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("bookings", "phone", {
      type: Sequelize.STRING(20),
      allowNull: false, // hoặc false nếu bạn muốn bắt buộc cho mọi record (kể cả cũ)
      after: "user_id", // nếu MySQL và bạn muốn đặt sau user_id, không bắt buộc
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("bookings", "phone");
  },
};
