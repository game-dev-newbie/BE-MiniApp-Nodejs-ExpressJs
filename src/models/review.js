"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Booking, { foreignKey: "booking_id" });
      Review.belongsTo(models.Restaurant, { foreignKey: "restaurant_id" });
      Review.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }

  Review.init(
    {
      booking_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      restaurant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: DataTypes.TEXT,
      status: {
        type: DataTypes.STRING,
        defaultValue: "VISIBLE",
      },
    },
    {
      sequelize,
      modelName: "Review",
      tableName: "reviews",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return Review;
};
