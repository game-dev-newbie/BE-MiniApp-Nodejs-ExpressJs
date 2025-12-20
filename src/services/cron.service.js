// src/services/cron.service.js

import cron from "node-cron";
import * as reminderService from "./reminder.service.js";
import * as passwordResetService from "./passwordReset.service.js";

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

  // ============ NEW:  Cleanup Expired Reset Tokens (Every 1 hour) ============
  cron.schedule("0 * * * *", async () => {
    console.log("\n🗑️ ===== CRON: Cleanup Expired Reset Tokens =====");
    console.log(`⏰ Time: ${new Date().toLocaleString("vi-VN")}`);

    try {
      const deleted = await passwordResetService.cleanupExpiredTokens();
      console.log(`✅ Deleted ${deleted} expired tokens`);
    } catch (error) {
      console.error("❌ Cron job error:", error);
    }

    console.log("🗑️ ===== CRON:  Completed =====\n");
  });

  console.log("✅ Cron jobs initialized");
  console.log("⏰ Booking reminder:  Every 15 minutes");
  console.log("🗑️ Token cleanup: Every 1 hour");
};

/**
 * Manual trigger (dùng để test)
 */
export const triggerReminderManually = async () => {
  console.log("🔧 Manual trigger:  Booking reminder");
  return await reminderService.processBookingReminders();
};

/**
 * Manual trigger cleanup tokens (dùng để test)
 */
export const triggerCleanupManually = async () => {
  console.log("🔧 Manual trigger: Cleanup expired tokens");
  return await passwordResetService.cleanupExpiredTokens();
};
