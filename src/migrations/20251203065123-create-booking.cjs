"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("bookings", {
      id: {
        allowNull: false,
        type: Sequelize.BIGINT,
        autoIncrement: true,
        primaryKey: true,
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
      table_id: {
        type: Sequelize.BIGINT,
        allowNull: true,
        references: {
          model: "restaurant_tables",
          key: "id",
        },
        onUpdate: "SET NULL",
        onDelete: "SET NULL",
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
      people_count: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      booking_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      deposit_amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      payment_status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "NONE",
      },
      note: {
        type: Sequelize.TEXT,
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

    await queryInterface.addIndex("bookings", [
      "restaurant_id",
      "booking_time",
    ]);
    await queryInterface.addIndex("bookings", ["user_id", "booking_time"]);
  },

  async down(queryInterface) {
    await queryInterface.dropTable("bookings");
  },
};
