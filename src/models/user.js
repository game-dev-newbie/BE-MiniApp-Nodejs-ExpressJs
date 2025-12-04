"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasMany(models.UserAuthProvider, { foreignKey: "user_id" });
      User.hasMany(models.Booking, { foreignKey: "user_id" });
      User.hasMany(models.Review, { foreignKey: "user_id" });
      User.hasMany(models.FavoriteRestaurant, { foreignKey: "user_id" });
      User.hasMany(models.Notification, { foreignKey: "user_id" });
    }
  }

  User.init(
    {
      display_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: DataTypes.STRING,
      phone: DataTypes.STRING,
      avatar_url: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      underscored: true,
      timestamps: true,
    }
  );

  return User;
};
