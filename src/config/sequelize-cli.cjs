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
    // ✳️ Quan trọng: nói với Sequelize là dùng giờ Việt Nam
    timezone: "+07:00", // khi gửi Date xuống DB sẽ cộng/điều chỉnh theo +07

    dialectOptions: {
      // Với MySQL, để nó dùng timezone của connection (ở trên)
      timezone: "local",

      // Optional: nếu bạn muốn lấy DATETIME dưới dạng string thay vì JS Date
      // rồi tự xử lý bằng dayjs:
      dateStrings: true,
      typeCast: function (field, next) {
        // DATETIME / TIMESTAMP -> trả string, không auto convert sang UTC
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
