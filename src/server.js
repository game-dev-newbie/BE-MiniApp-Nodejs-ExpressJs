// src/server.js
import app from "./app.js";
import { sequelize } from "./models/index.js";
import { PORT, HOST } from "./config/env.js";

async function startServer() {
  try {
    console.log("🔌 Đang kiểm tra kết nối database...");
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công!\n");

    app.listen(PORT, HOST, () => {
      console.log(`🚀 Server đang chạy tại http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi kết nối database!");
    console.error(error);
    process.exit(1); // dừng server nếu DB fail
  }
}

startServer();
