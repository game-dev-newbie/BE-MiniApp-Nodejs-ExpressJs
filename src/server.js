// src/server.js
import app from "./app.js";
import { sequelize } from "./models/index.js";
import { PORT, NODE_ENV } from "./config/env.js";
import { setupCronJobs } from "./services/cron.service.js";

const startServer = async () => {
  try {
    console.log("🔌 Đang kiểm tra kết nối database...");
    await sequelize.authenticate();
    console.log("✅ Kết nối database thành công!\n");

    // ✅ NEW: Start cron jobs
    setupCronJobs();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📝 Environment: ${NODE_ENV}`);
      console.log(`🔗 API:  http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Lỗi kết nối database!");
    console.error(error);
    process.exit(1); // dừng server nếu DB fail
  }
};

startServer();
