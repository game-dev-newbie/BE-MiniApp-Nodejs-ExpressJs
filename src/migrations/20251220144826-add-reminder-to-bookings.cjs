"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Thời điểm gửi email nhắc nhở
    await queryInterface.addColumn("bookings", "reminder_sent_at", {
      type: Sequelize.DATE,
      allowNull: true,
      comment: "Thời điểm đã gửi email nhắc nhở",
      after: "refunded_at", // MySQL only
    });

    // Loại reminder (nếu muốn hỗ trợ nhiều loại:  24h, 2h, etc.)
    await queryInterface.addColumn("bookings", "reminder_type", {
      type: Sequelize.STRING(20),
      allowNull: true,
      comment: "Loại reminder:  24H, 2H, CUSTOM",
      after: "reminder_sent_at",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("bookings", "reminder_type");
    await queryInterface.removeColumn("bookings", "reminder_sent_at");
  },
};
