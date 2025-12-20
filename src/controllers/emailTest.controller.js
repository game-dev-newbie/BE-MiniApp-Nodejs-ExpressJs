// src/controllers/emailTest.controller.js

import { catchAsync } from "../utils/catchAsync.js";
import * as emailService from "../services/email.service.js";
import models from "../models/index.js";

const { Booking, User, Restaurant } = models;

class EmailTestController {
  /**
   * Test gửi email đơn giản
   * POST /api/v1/test/email/send
   * Body: { to: "email@example.com" }
   */
  sendTestEmail = catchAsync(async (req, res) => {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({
        success: false,
        message: "Thiếu email nhận (to)",
      });
    }

    const result = await emailService.sendTestEmail(to);

    return res.status(200).json({
      success: result.success,
      message: result.success
        ? "Email test đã được gửi thành công!"
        : "Gửi email thất bại",
      data: result,
    });
  });

  /**
   * Test gửi email thanh toán thành công với booking thật
   * POST /api/v1/test/email/payment-success
   * Body: { booking_id: 123 }
   */
  sendPaymentSuccessTestEmail = catchAsync(async (req, res) => {
    const { booking_id } = req.body;

    if (!booking_id) {
      return res.status(400).json({
        success: false,
        message: "Thiếu booking_id",
      });
    }

    const booking = await Booking.findByPk(booking_id);
    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking không tồn tại",
      });
    }

    const user = await User.findByPk(booking.user_id);
    const restaurant = await Restaurant.findByPk(booking.restaurant_id);

    const result = await emailService.sendPaymentSuccessEmail(
      booking,
      user,
      restaurant
    );

    return res.status(200).json({
      success: result.success,
      message: result.success
        ? "Email thanh toán thành công đã được gửi!"
        : "Gửi email thất bại",
      data: result,
    });
  });
}

const emailTestController = new EmailTestController();
export default emailTestController;
