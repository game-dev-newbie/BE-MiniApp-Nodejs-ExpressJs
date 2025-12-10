"use strict";

/** @type {import('sequelize-cli').Migration} */

module.exports = {
  async up(queryInterface, Sequelize) {
    // Thêm open_time
    await queryInterface.addColumn("restaurants", "open_time", {
      type: Sequelize.TIME, // MySQL TIME: chỉ giờ/phút/giây
      allowNull: true, // tuỳ bạn, có thể cho NOT NULL + default
      // defaultValue: "08:00:00",
    });

    // Thêm close_time
    await queryInterface.addColumn("restaurants", "close_time", {
      type: Sequelize.TIME,
      allowNull: true,
      // defaultValue: "22:00:00",
    });
  },

  async down(queryInterface, Sequelize) {
    // Rollback
    await queryInterface.removeColumn("restaurants", "open_time");
    await queryInterface.removeColumn("restaurants", "close_time");
  },
};
