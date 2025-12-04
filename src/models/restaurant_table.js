"use strict";
import { Model } from "sequelize";

export default (sequelize, DataTypes) => {
  class RestaurantTable extends Model {
    static associate(models) {
      RestaurantTable.belongsTo(models.Restaurant, {
        foreignKey: "restaurant_id",
      });
      RestaurantTable.hasMany(models.Booking, { foreignKey: "table_id" });
    }
  }

  RestaurantTable.init(
    {
      restaurant_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      capacity: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      location: DataTypes.STRING,
      status: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      view_image_url: DataTypes.STRING,
      view_note: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "RestaurantTable",
      tableName: "restaurant_tables",
      underscored: true,
      timestamps: true,
    }
  );

  return RestaurantTable;
};
