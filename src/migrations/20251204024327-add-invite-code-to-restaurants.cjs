"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // thêm cột invite_code
    await queryInterface.addColumn("restaurants", "invite_code", {
      type: Sequelize.STRING(64),
      allowNull: true,
      // unique ở đây được, nhưng để chắc chắn mình thêm index riêng phía dưới
    });

    // thêm unique index cho invite_code
    await queryInterface.addIndex("restaurants", ["invite_code"], {
      unique: true,
      name: "uq_restaurants_invite_code",
      where: {
        invite_code: { [Sequelize.Op.ne]: null }, // tránh NULL trùng (nếu muốn, có thể bỏ where đi)
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeIndex(
      "restaurants",
      "uq_restaurants_invite_code"
    );
    await queryInterface.removeColumn("restaurants", "invite_code");
  },
};
