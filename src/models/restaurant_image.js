"use strict";
import { Model } from "sequelize";
import { safeUnlinkByWebPath } from "../utils/fileStorage.util.js";

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

      // ✅ IMPROVEMENT: Auto delete file when record is deleted
      hooks: {
        beforeDestroy: async (instance) => {
          try {
            await safeUnlinkByWebPath(instance.file_path);
            console.log(`✅ Auto-deleted file: ${instance.file_path}`);
          } catch (err) {
            console.error(
              `⚠️ Thất bại khi auto-delete file: ${instance.file_path}`,
              err
            );
            // Don't throw - allow record deletion to proceed
          }
        },
      },
    }
  );

  return RestaurantImage;
};
