"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("bookings", "customer_name", {
      type: Sequelize.STRING(100),
      allowNull: false, // hoặc false nếu bạn muốn *tất cả* record đều phải có
      // Nếu dùng MySQL và muốn đặt cạnh phone:
      after: "phone",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("bookings", "customer_name");
  },
};
