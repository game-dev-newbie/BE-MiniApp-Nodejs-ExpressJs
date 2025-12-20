// src/models/password_reset_token.js

"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class PasswordResetToken extends Model {
    static associate(models) {
      // No associations needed
    }

    /**
     * Check if token is valid (not expired & not used)
     */
    isValid() {
      const now = new Date();
      return !this.used_at && new Date(this.expires_at) > now;
    }

    /**
     * Mark token as used
     */
    async markAsUsed() {
      this.used_at = new Date();
      await this.save();
    }
  }

  PasswordResetToken.init(
    {
      id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      subject_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        comment: "CUSTOMER | RESTAURANT_ACCOUNT",
      },
      reset_token: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      used_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "PasswordResetToken",
      tableName: "password_reset_tokens",
      underscored: true,
      timestamps: true,
      createdAt: "created_at",
      updatedAt: "updated_at",
    }
  );

  return PasswordResetToken;
};
