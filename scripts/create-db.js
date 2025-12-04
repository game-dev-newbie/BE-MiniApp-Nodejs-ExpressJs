// scripts/create-db.js
import mysql from "mysql2/promise";
import {
  DB_HOST,
  DB_PORT,
  DB_NAME,
  DB_USER,
  DB_PASSWORD,
} from "../src/config/env.js";

(async () => {
  try {
    const connection = await mysql.createConnection({
      host: DB_HOST,
      port: DB_PORT,
      user: DB_USER,
      password: DB_PASSWORD,
      multipleStatements: true,
    });

    await connection.query(
      `CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    );

    console.log(`✅ Database '${DB_NAME}' đã tồn tại hoặc vừa được tạo.`);
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi tạo database:", err.message);
    process.exit(1);
  }
})();
