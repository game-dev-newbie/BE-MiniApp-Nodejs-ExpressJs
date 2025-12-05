"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class AuthToken extends Model {
    static associate(models) {
      // Polymorphic nên tạm thời không define FK cứng ở đây.
      // Nếu sau này bạn muốn, có thể thêm helper:
      // AuthToken.belongsTo(models.User, { foreignKey: "subject_id" ... });
      // nhưng sẽ hơi hack vì subject_type = 'customer' / 'restaurant_account'.
    }
  }

  AuthToken.init(
    {
      subject_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      subject_type: {
        type: DataTypes.STRING(50),
        allowNull: false,
        // 'customer' | 'restaurant_account' | 'admin' ...
      },
      token_id: {
        // UUID hoặc chuỗi random – chính là tid trong JWT refresh
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: {
        // 'refresh', sau này có thể xài chung cho 'reset_password', 'email_verify'...
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      is_revoked: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "AuthToken",
      tableName: "auth_tokens",
      underscored: true,
      timestamps: true, // created_at, updated_at
    }
  );

  return AuthToken;
};
