"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("password_reset_tokens", {
      id: {
        type: Sequelize.BIGINT,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      email: {
        type: Sequelize.STRING(150),
        allowNull: false,
        comment: "Email của user/account request reset",
      },
      subject_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        comment: "CUSTOMER (users) hoặc RESTAURANT_ACCOUNT",
      },
      reset_token: {
        type: Sequelize.STRING(100),
        allowNull: false,
        unique: true,
        comment: "Token để reset password (6 chữ số hoặc random string)",
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
        comment: "Thời điểm token hết hạn (15 phút sau khi tạo)",
      },
      used_at: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Thời điểm token đã được sử dụng",
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.fn("NOW"),
      },
    });

    // Indexes
    await queryInterface.addIndex("password_reset_tokens", ["email"], {
      name: "idx_password_reset_tokens_email",
    });

    await queryInterface.addIndex("password_reset_tokens", ["reset_token"], {
      name: "idx_password_reset_tokens_token",
      unique: true,
    });

    await queryInterface.addIndex(
      "password_reset_tokens",
      ["email", "subject_type", "used_at"],
      {
        name: "idx_password_reset_tokens_lookup",
      }
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("password_reset_tokens");
  },
};
