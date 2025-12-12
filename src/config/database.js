// src/config/database.js
import { Sequelize } from "sequelize";
import { DB_HOST, DB_PORT, DB_NAME, DB_PASSWORD, DB_USER } from "./env.js";

const sequelize = new Sequelize(
  DB_NAME || "restaurant_booking",
  DB_USER || "root",
  DB_PASSWORD || null,
  {
    host: DB_HOST || "localhost",
    port: DB_PORT ? Number(DB_PORT) : 3306,
    dialect: "mysql",

    timezone: "+07:00", // gửi Date xuống DB theo giờ VN

    dialectOptions: {
      timezone: "local",
      dateStrings: true,
      typeCast: function (field, next) {
        if (field.type === "DATETIME" || field.type === "TIMESTAMP") {
          return field.string();
        }
        return next();
      },
    },

    define: {
      underscored: true,
      timestamps: true,
    },
    logging: true, // bật lên nếu muốn debug SQL
  }
);

export default sequelize;
