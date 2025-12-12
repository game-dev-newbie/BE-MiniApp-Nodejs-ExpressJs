"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class UserAuthProvider extends Model {
    static associate(models) {
      UserAuthProvider.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }

  UserAuthProvider.init(
    {
      user_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provider_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "UserAuthProvider",
      tableName: "user_auth_providers",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return UserAuthProvider;
};
