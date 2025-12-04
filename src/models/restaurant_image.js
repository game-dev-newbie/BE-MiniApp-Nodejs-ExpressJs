"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class RestaurantImage extends Model {
    static associate(models) {
      RestaurantImage.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
      });
    }
  }

  RestaurantImage.init(
    {
      restaurant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      file_path: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      caption: DataTypes.STRING,
      is_primary: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
    },
    {
      sequelize,
      modelName: "RestaurantImage",
      tableName: "restaurant_images",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false,
    }
  );

  return RestaurantImage;
};
