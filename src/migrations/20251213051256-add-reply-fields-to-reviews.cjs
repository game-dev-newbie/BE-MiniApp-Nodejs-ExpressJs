"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("reviews", "reply_comment", {
      type: Sequelize.TEXT,
      allowNull: true,
      after: "status", // optional: vị trí cột, MySQL mới hiểu
    });

    await queryInterface.addColumn("reviews", "reply_account_id", {
      type: Sequelize.BIGINT,
      allowNull: true,
      after: "reply_comment",
    });

    await queryInterface.addColumn("reviews", "reply_created_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "reply_account_id",
    });

    await queryInterface.addColumn("reviews", "reply_updated_at", {
      type: Sequelize.DATE,
      allowNull: true,
      after: "reply_created_at",
    });
    // trong migration up()
    await queryInterface.addConstraint("reviews", {
      fields: ["reply_account_id"],
      type: "foreign key",
      name: "fk_reviews_reply_account",
      references: {
        table: "restaurant_accounts",
        field: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },

  async down(queryInterface, Sequelize) {
    // 1) Gỡ constraint trước
    await queryInterface.removeConstraint(
      "reviews",
      "fk_reviews_reply_account"
    );
    // 2) Gỡ các cột sau
    await queryInterface.removeColumn("reviews", "reply_comment");
    await queryInterface.removeColumn("reviews", "reply_account_id");
    await queryInterface.removeColumn("reviews", "reply_created_at");
    await queryInterface.removeColumn("reviews", "reply_updated_at");
  },
};
