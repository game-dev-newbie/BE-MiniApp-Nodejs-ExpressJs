"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Notification extends Model {
    static associate(models) {
      Notification.belongsTo(models.User, { foreignKey: "user_id" });
      Notification.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
      });
    }
  }

  Notification.init(
    {
      user_id: DataTypes.BIGINT,
      restaurant_id: DataTypes.BIGINT,
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      channel: {
        type: DataTypes.STRING,
        defaultValue: "IN_APP",
      },
      is_read: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      read_at: DataTypes.DATE,
      sent_at: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "Notification",
      tableName: "notifications",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // bảng này không cần updated_at tách riêng
    }
  );

  return Notification;
};
