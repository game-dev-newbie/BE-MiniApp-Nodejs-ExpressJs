// src/controllers/reminderTest.controller.js

import { catchAsync } from "../utils/catchAsync.js";
import * as reminderService from "../services/reminder.service.js";
import { triggerReminderManually } from "../services/cron.service.js";

class ReminderTestController {
  /**
   * Test tìm bookings cần reminder
   * GET /api/v1/test/reminder/check
   */
  checkBookings = catchAsync(async (req, res) => {
    const bookings = await reminderService.findBookingsNeedingReminder();

    return res.status(200).json({
      success: true,
      message: `Tìm thấy ${bookings.length} booking(s) cần kiểm tra`,
      data: {
        count: bookings.length,
        bookings: bookings.map((b) => ({
          id: b.id,
          booking_time: b.booking_time,
          customer_name: b.customer_name,
          user_email: b.User?.email,
          restaurant_name: b.Restaurant?.name,
          reminder_sent_at: b.reminder_sent_at,
        })),
      },
    });
  });

  /**
   * Test gửi reminders (manual trigger)
   * POST /api/v1/test/reminder/send
   */
  sendReminders = catchAsync(async (req, res) => {
    const result = await triggerReminderManually();

    return res.status(200).json({
      success: true,
      message: "Reminder process completed",
      data: result,
    });
  });
}

const reminderTestController = new ReminderTestController();
export default reminderTestController;
