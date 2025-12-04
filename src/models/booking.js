"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Booking extends Model {
    static associate(models) {
      Booking.belongsTo(models.Restaurant, { foreignKey: "restaurant_id" });
      Booking.belongsTo(models.RestaurantTable, { foreignKey: "table_id" });
      Booking.belongsTo(models.User, { foreignKey: "user_id" });
      Booking.hasOne(models.Payment, { foreignKey: "booking_id" });
      Booking.hasOne(models.Review, { foreignKey: "booking_id" });
    }
  }

  Booking.init(
    {
      restaurant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      table_id: DataTypes.BIGINT,
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      people_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      booking_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      deposit_amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      payment_status: {
        type: DataTypes.STRING,
        defaultValue: "NONE",
      },
      note: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Booking",
      tableName: "bookings",
      underscored: true,
      timestamps: true,
    }
  );

  return Booking;
};
