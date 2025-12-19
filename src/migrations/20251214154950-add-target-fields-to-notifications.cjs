"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // thêm target_type
    await queryInterface.addColumn("notifications", "target_type", {
      type: Sequelize.STRING(50),
      allowNull: true,
      after: "channel", // tuỳ bạn, có thể bỏ nếu MySQL không cần
    });

    // thêm target_id
    await queryInterface.addColumn("notifications", "target_id", {
      type: Sequelize.BIGINT.UNSIGNED,
      allowNull: true,
      after: "target_type",
    });

    // thêm meta (JSON, lưu info phụ)
    await queryInterface.addColumn("notifications", "meta", {
      type: Sequelize.JSON,
      allowNull: true,
      after: "target_id",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("notifications", "meta");
    await queryInterface.removeColumn("notifications", "target_id");
    await queryInterface.removeColumn("notifications", "target_type");
  },
};
