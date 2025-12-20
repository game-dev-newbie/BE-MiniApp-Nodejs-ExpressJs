// src/services/email.service.js

import nodemailer from "nodemailer";
import {
  SMTP_FROM,
  SMTP_HOST,
  SMTP_PASS,
  SMTP_SECURE,
  SMTP_PORT,
  SMTP_USER,
  EMAIL_DEBUG,
  EMAIL_ENABLED,
} from "../config/env.js";
import { SUBJECT_TYPES } from "../constants/index.js";

/**
 * Tạo transporter cho Gmail SMTP
 */
const createTransporter = () => {
  if (!SMTP_USER || !SMTP_PASS) {
    console.warn("⚠️ SMTP credentials không được cấu hình trong .env");
    return null;
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_SECURE, // false cho port 587
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
    // Debug (nếu cần)
    debug: EMAIL_DEBUG,
    logger: EMAIL_DEBUG,
  });
};

/**
 * Gửi email chung
 * @param {Object} options - { to, subject, html, text }
 */
export const sendEmail = async (options) => {
  if (!EMAIL_ENABLED) {
    console.log("📧 Email bị tắt trong config, skip gửi email");
    return { success: false, message: "Email disabled" };
  }

  const transporter = createTransporter();
  if (!transporter) {
    console.error("❌ Không thể tạo email transporter");
    return { success: false, message: "Transporter not configured" };
  }

  try {
    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text || "", // Plain text fallback
      html: options.html,
    });

    console.log("✅ Email đã gửi thành công:", info.messageId);
    console.log("📧 Gửi tới:", options.to);
    console.log("📝 Subject:", options.subject);

    return {
      success: true,
      messageId: info.messageId,
      response: info.response,
    };
  } catch (error) {
    console.error("❌ Lỗi khi gửi email:", error);
    return {
      success: false,
      error: error.message,
    };
  }
};

/**
 * Gửi email xác nhận thanh toán thành công
 */
export const sendPaymentSuccessEmail = async (booking, user, restaurant) => {
  if (!user.email) {
    console.log("⚠️ User không có email, skip gửi email thanh toán");
    return { success: false, message: "User has no email" };
  }

  const { generatePaymentSuccessHTML } = await import(
    "../templates/email/payment-success.template.js"
  );

  const html = generatePaymentSuccessHTML({
    booking,
    user,
    restaurant,
  });

  return await sendEmail({
    to: user.email,
    subject: `✅ Thanh toán thành công - Booking #${booking.id}`,
    html,
  });
};

/**
 * Gửi email thông báo thanh toán thất bại
 */
export const sendPaymentFailedEmail = async (booking, user, restaurant) => {
  if (!user.email) {
    console.log("⚠️ User không có email, skip gửi email");
    return { success: false, message: "User has no email" };
  }

  const { generatePaymentFailedHTML } = await import(
    "../templates/email/payment-failed.template.js"
  );

  const html = generatePaymentFailedHTML({
    booking,
    user,
    restaurant,
  });

  return await sendEmail({
    to: user.email,
    subject: `❌ Thanh toán thất bại - Booking #${booking.id}`,
    html,
  });
};

/**
 * Gửi email xác nhận hoàn tiền
 */
export const sendRefundEmail = async (booking, user, restaurant) => {
  if (!user.email) {
    console.log("⚠️ User không có email, skip gửi email");
    return { success: false, message: "User has no email" };
  }

  const { generateRefundEmailHTML } = await import(
    "../templates/email/refund.template.js"
  );

  const html = generateRefundEmailHTML({
    booking,
    user,
    restaurant,
  });

  return await sendEmail({
    to: user.email,
    subject: `💰 Xác nhận hoàn tiền - Booking #${booking.id}`,
    html,
  });
};

/**
 * Test gửi email (dùng để kiểm tra cấu hình)
 */
export const sendTestEmail = async (toEmail) => {
  return await sendEmail({
    to: toEmail,
    subject: "🧪 Test Email từ Restaurant Booking System",
    html: `
      <h1>Email Test Thành Công! </h1>
      <p>Nếu bạn nhận được email này, nghĩa là cấu hình SMTP đã hoạt động.</p>
      <p>Thời gian:  ${new Date().toLocaleString("vi-VN")}</p>
    `,
  });
};

/**
 * Gửi email nhắc nhở booking
 * @param {Object} booking
 * @param {Object} user
 * @param {Object} restaurant
 * @param {number} hoursUntil - Số giờ còn lại
 */
export const sendBookingReminderEmail = async (
  booking,
  user,
  restaurant,
  hoursUntil
) => {
  if (!user.email) {
    console.log("⚠️ User không có email, skip gửi email nhắc nhở");
    return { success: false, message: "User has no email" };
  }

  const { generateBookingReminderHTML } = await import(
    "../templates/email/booking-reminder.template.js"
  );

  const html = generateBookingReminderHTML({
    booking,
    user,
    restaurant,
    hoursUntil,
  });

  const subject =
    hoursUntil <= 2
      ? `⏰ Nhắc nhở:  Booking #${booking.id} sắp đến giờ (${hoursUntil}h nữa)`
      : `📅 Nhắc nhở: Booking #${booking.id} vào ngày mai`;

  return await sendEmail({
    to: user.email,
    subject,
    html,
  });
};

/**
 * Gửi email reset password
 */
export const sendPasswordResetEmail = async ({
  email,
  displayName,
  resetToken,
  expiresInMinutes = 15,
  subjectType,
}) => {
  if (!email) {
    console.log("⚠️ Email không được cung cấp");
    return { success: false, message: "Email is required" };
  }

  const { generatePasswordResetHTML } = await import(
    "../templates/email/password-reset.template.js"
  );

  const html = generatePasswordResetHTML({
    displayName,
    resetToken,
    expiresInMinutes,
    subjectType,
  });

  const platformName =
    subjectType === SUBJECT_TYPES.CUSTOMER ? "MiniApp" : "Dashboard";

  return await sendEmail({
    to: email,
    subject: `🔐 Đặt lại mật khẩu ${platformName} - Mã đã được gửi vào email!`,
    html,
  });
};
