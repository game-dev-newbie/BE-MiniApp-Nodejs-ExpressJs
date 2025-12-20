// src/services/reminder.service.js

import models from "../models/index.js";
import { Op } from "sequelize";
import { BOOKING_STATUS } from "../constants/index.js";
import * as emailService from "./email.service.js";

const { Booking, User, Restaurant } = models;

/**
 * Tìm bookings cần gửi reminder
 *
 * Logic:
 * - Booking time trong khoảng:  NOW đến NOW + 26 giờ
 * - Status: PENDING hoặc CONFIRMED
 * - Chưa gửi reminder (reminder_sent_at IS NULL)
 * - Đã thanh toán hoặc không yêu cầu cọc
 */
export const findBookingsNeedingReminder = async () => {
  const now = new Date();
  const futureTime = new Date(now.getTime() + 26 * 60 * 60 * 1000); // +26 giờ

  const bookings = await Booking.findAll({
    where: {
      booking_time: {
        [Op.gte]: now,
        [Op.lte]: futureTime,
      },
      status: {
        [Op.in]: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
      },
      reminder_sent_at: null, // Chưa gửi reminder
    },
    include: [
      {
        model: User,
        attributes: ["id", "display_name", "email", "phone"],
      },
      {
        model: Restaurant,
        attributes: ["id", "name", "address", "phone"],
      },
    ],
  });

  return bookings;
};

/**
 * Tính số giờ còn lại đến booking
 */
const calculateHoursUntil = (bookingTime) => {
  const now = new Date();
  const diffMs = new Date(bookingTime).getTime() - now.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60)); // Convert to hours
};

/**
 * Check xem có nên gửi reminder hay không
 *
 * Rules:
 * - Gửi khi còn ~24 giờ (23-25 giờ)
 * - Hoặc gửi khi còn ~2 giờ (1.5-2.5 giờ)
 */
const shouldSendReminder = (hoursUntil) => {
  // Reminder 24 giờ trước
  if (hoursUntil >= 23 && hoursUntil <= 25) {
    return { send: true, type: "24H" };
  }

  // Reminder 2 giờ trước
  if (hoursUntil >= 1.5 && hoursUntil <= 2.5) {
    return { send: true, type: "2H" };
  }

  return { send: false, type: null };
};

/**
 * Gửi reminder cho 1 booking
 */
const sendReminderForBooking = async (booking) => {
  const hoursUntil = calculateHoursUntil(booking.booking_time);
  const { send, type } = shouldSendReminder(hoursUntil);

  if (!send) {
    return {
      success: false,
      reason: `Not time yet (${hoursUntil}h remaining)`,
    };
  }

  const user = booking.User;
  const restaurant = booking.Restaurant;

  if (!user || !restaurant) {
    console.error(`❌ Missing user or restaurant for booking ${booking.id}`);
    return { success: false, reason: "Missing data" };
  }

  try {
    // Gửi email
    const result = await emailService.sendBookingReminderEmail(
      booking,
      user,
      restaurant,
      hoursUntil
    );

    if (result.success) {
      // Đánh dấu đã gửi
      booking.reminder_sent_at = new Date();
      booking.reminder_type = type;
      await booking.save();

      console.log(
        `✅ Reminder sent for booking #${booking.id} (${type}, ${hoursUntil}h until)`
      );
      return { success: true, type, hoursUntil };
    }

    return { success: false, reason: result.message };
  } catch (error) {
    console.error(
      `❌ Error sending reminder for booking ${booking.id}:`,
      error
    );
    return { success: false, reason: error.message };
  }
};

/**
 * Process tất cả reminders (được gọi bởi cron job)
 */
export const processBookingReminders = async () => {
  console.log("🔔 Starting booking reminder process...");

  const bookings = await findBookingsNeedingReminder();

  if (bookings.length === 0) {
    console.log("📭 No bookings need reminder at this time");
    return { processed: 0, sent: 0, failed: 0 };
  }

  console.log(`📬 Found ${bookings.length} bookings to check`);

  let sent = 0;
  let failed = 0;

  for (const booking of bookings) {
    const result = await sendReminderForBooking(booking);
    if (result.success) {
      sent++;
    } else {
      failed++;
      console.log(`⏭️ Skipped booking #${booking.id}:  ${result.reason}`);
    }
  }

  console.log(`✅ Reminder process completed: ${sent} sent, ${failed} skipped`);

  return {
    processed: bookings.length,
    sent,
    failed,
  };
};
