"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class RestaurantAccount extends Model {
    static associate(models) {
      RestaurantAccount.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
      });
      RestaurantAccount.hasMany(models.Review, {
        foreignKey: "reply_account_id",
        as: "reply_account",
      });
    }
  }

  RestaurantAccount.init(
    {
      restaurant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      full_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password_hash: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      is_locked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },

      avatar_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "RestaurantAccount",
      tableName: "restaurant_accounts",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return RestaurantAccount;
};
