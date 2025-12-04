// scripts/drop-db.js
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
    });

    await connection.query(`DROP DATABASE IF EXISTS \`${DB_NAME}\`;`);

    console.log(`🗑️ Database '${DB_NAME}' đã được xoá (nếu tồn tại).`);
    await connection.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Lỗi khi xoá database:", err.message);
    process.exit(1);
  }
})();
