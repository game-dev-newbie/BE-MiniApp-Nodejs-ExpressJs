"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class Review extends Model {
    static associate(models) {
      Review.belongsTo(models.Booking, { foreignKey: "booking_id" });
      Review.belongsTo(models.Restaurant, { foreignKey: "restaurant_id" });
      Review.belongsTo(models.User, { foreignKey: "user_id" });
      Review.belongsTo(models.RestaurantAccount, {
        foreignKey: "reply_account_id",
        as: "reply_account",
      });
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
      reply_comment: DataTypes.TEXT,
      reply_account_id: DataTypes.BIGINT,
      reply_created_at: DataTypes.DATE,
      reply_updated_at: DataTypes.DATE,
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
