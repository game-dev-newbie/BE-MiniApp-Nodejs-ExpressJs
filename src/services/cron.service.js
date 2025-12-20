// src/services/cron.service.js

import cron from "node-cron";
import * as reminderService from "./reminder.service.js";

/**
 * Setup tất cả cron jobs
 */
export const setupCronJobs = () => {
  // Chạy mỗi 15 phút
  // Format: "*/15 * * * *" = phút 0, 15, 30, 45 của mỗi giờ
  cron.schedule("*/15 * * * *", async () => {
    console.log("\n🔔 ===== CRON:  Booking Reminder Check =====");
    console.log(`⏰ Time: ${new Date().toLocaleString("vi-VN")}`);

    try {
      const result = await reminderService.processBookingReminders();
      console.log(`📊 Results: `, result);
    } catch (error) {
      console.error("❌ Cron job error:", error);
    }

    console.log("🔔 ===== CRON: Completed =====\n");
  });

  console.log("✅ Cron jobs initialized");
  console.log("⏰ Booking reminder:  Every 15 minutes");
};

/**
 * Manual trigger (dùng để test)
 */
export const triggerReminderManually = async () => {
  console.log("🔧 Manual trigger:  Booking reminder");
  return await reminderService.processBookingReminders();
};
