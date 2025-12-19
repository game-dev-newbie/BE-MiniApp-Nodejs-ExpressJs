"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("users", "password_hash", {
      type: Sequelize.STRING(255),
      allowNull: true, // Zalo user có thể không có password
      after: "email", // cho đẹp, để sau cột email (MySQL mới support cái này)
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("users", "password_hash");
  },
};
