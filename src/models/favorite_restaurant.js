"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class FavoriteRestaurant extends Model {
    static associate(models) {
      FavoriteRestaurant.belongsTo(models.User, { foreignKey: "user_id" });
      FavoriteRestaurant.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
      });
    }
  }

  FavoriteRestaurant.init(
    {
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      restaurant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "FavoriteRestaurant",
      tableName: "favorite_restaurants",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: false, // bảng này chỉ cần created_at
    }
  );

  return FavoriteRestaurant;
};
