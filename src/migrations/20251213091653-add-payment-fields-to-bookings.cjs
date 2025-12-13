"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // payment_provider: ZALOPAY / MOMO / VNPAY / CARD / ...
    await queryInterface.addColumn("bookings", "payment_provider", {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: "payment_status", // nếu bạn dùng MySQL và muốn sắp cột
    });

    // mã giao dịch giả lập, để log / hiển thị
    await queryInterface.addColumn("bookings", "payment_reference", {
      type: Sequelize.STRING(255),
      allowNull: true,
      after: "payment_provider",
    });

    // thời điểm thanh toán cọc thành công
    await queryInterface.addColumn("bookings", "paid_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "payment_reference",
    });

    // thời điểm hoàn tiền (nếu có)
    await queryInterface.addColumn("bookings", "refunded_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "paid_at",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("bookings", "refunded_at");
    await queryInterface.removeColumn("bookings", "paid_at");
    await queryInterface.removeColumn("bookings", "payment_reference");
    await queryInterface.removeColumn("bookings", "payment_provider");
  },
};
