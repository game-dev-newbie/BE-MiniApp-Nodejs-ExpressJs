"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("reviews", {
      id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      booking_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "bookings",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      restaurant_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "restaurants",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      user_id: {
        type: Sequelize.BIGINT,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "VISIBLE",
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

    await queryInterface.addConstraint("reviews", {
      type: "unique",
      fields: ["booking_id"],
      name: "uq_reviews_booking",
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("reviews");
  },
};
