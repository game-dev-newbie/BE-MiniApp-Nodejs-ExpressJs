"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Restaurant extends Model {
    static associate(models) {
      Restaurant.hasMany(models.RestaurantAccount, {
        foreignKey: "restaurant_id",
      });
      Restaurant.hasMany(models.RestaurantTable, {
        foreignKey: "restaurant_id",
      });
      Restaurant.hasMany(models.Booking, { foreignKey: "restaurant_id" });
      Restaurant.hasMany(models.Review, { foreignKey: "restaurant_id" });
      Restaurant.hasMany(models.FavoriteRestaurant, {
        foreignKey: "restaurant_id",
      });
      Restaurant.hasMany(models.Notification, { foreignKey: "restaurant_id" });
      Restaurant.hasMany(models.RestaurantImage, {
        foreignKey: "restaurant_id",
      });
    }
  }

  Restaurant.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      address: DataTypes.TEXT,
      phone: DataTypes.STRING,
      description: DataTypes.TEXT,
      tags: DataTypes.STRING,
      search_name: DataTypes.STRING,
      search_address: DataTypes.STRING,
      search_tags: DataTypes.STRING,
      require_deposit: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      default_deposit_amount: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      average_rating: {
        type: DataTypes.FLOAT,
        defaultValue: 0,
      },
      review_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      // 🔥 field mới
      invite_code: {
        type: DataTypes.STRING(64),
        allowNull: true,
      },
      favorite_count: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
      },
      main_image_url: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      open_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
      close_time: {
        type: DataTypes.TIME,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "Restaurant",
      tableName: "restaurants",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Restaurant;
};
