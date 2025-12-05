"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("auth_tokens", {
      id: {
        type: Sequelize.BIGINT,
        autoIncrement: true,
        allowNull: false,
        primaryKey: true,
      },
      subject_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
      },
      subject_type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        // ví dụ: 'customer', 'restaurant_account', 'admin'
      },
      token_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING(50),
        allowNull: false,
        // ví dụ: 'refresh', 'reset_password'
      },
      is_revoked: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: true,
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

    // Index hỗ trợ query nhanh
    await queryInterface.addIndex(
      "auth_tokens",
      ["subject_id", "subject_type", "type"],
      {
        name: "auth_tokens_subject_type_idx",
      }
    );

    await queryInterface.addIndex("auth_tokens", ["token_id"], {
      name: "auth_tokens_token_id_unique",
      unique: true,
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("auth_tokens");
  },
};
