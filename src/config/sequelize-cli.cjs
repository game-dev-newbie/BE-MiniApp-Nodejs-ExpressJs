// src/config/sequelize-cli.cjs
require("dotenv").config();

const common = {
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
  username: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || null,
  database: process.env.DB_NAME || "restaurant_booking",
  dialect: "mysql",
};

module.exports = {
  development: {
    ...common,
  },
  test: {
    ...common,
    database: process.env.DB_NAME_TEST || "restaurant_booking_test",
  },
  production: {
    ...common,
    // Có thể override riêng nếu deploy
  },
};
