"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Payment extends Model {
    static associate(models) {
      Payment.belongsTo(models.Booking, { foreignKey: "booking_id" });
    }
  }

  Payment.init(
    {
      booking_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Payment",
      tableName: "payments",
      underscored: true,
      timestamps: true,
    }
  );

  return Payment;
};
