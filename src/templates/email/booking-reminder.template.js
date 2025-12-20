// src/templates/email/booking-reminder.template.js

import time from "../../utils/time. js";

/**
 * Template email nhắc nhở booking
 * @param {Object} params
 * @param {Object} params.booking
 * @param {Object} params.user
 * @param {Object} params.restaurant
 * @param {number} params.hoursUntil - Số giờ còn lại đến booking
 */
export const generateBookingReminderHTML = ({
  booking,
  user,
  restaurant,
  hoursUntil,
}) => {
  const bookingTimeFormatted = time.toVNDateTime(booking.booking_time);

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Nhắc nhở booking</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding:  0;
      background-color: #f4f4f4;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #FF9800 0%, #F57C00 100%);
      color: white;
      padding: 30px 20px;
      text-align:  center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight:  600;
    }
    .header . icon {
      font-size: 48px;
      margin-bottom:  10px;
    }
    .content {
      padding: 30px 20px;
    }
    .highlight-box {
      background: #fff3e0;
      border-left:  4px solid #FF9800;
      padding: 20px;
      margin: 20px 0;
      border-radius: 4px;
      text-align: center;
    }
    .highlight-box .time {
      font-size: 32px;
      font-weight:  bold;
      color: #F57C00;
      margin: 10px 0;
    }
    .info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .info-table td {
      padding: 12px 8px;
      border-bottom:  1px solid #eee;
    }
    .info-table td:first-child {
      color: #666;
      width: 40%;
    }
    .info-table td:last-child {
      font-weight: 600;
      color: #333;
    }
    .notes {
      background: #fff9c4;
      border-left: 4px solid #FFC107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .notes h3 {
      margin-top: 0;
      color: #F57C00;
      font-size: 16px;
    }
    .notes ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .notes li {
      margin-bottom: 8px;
      color: #856404;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      color: #888;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #FF9800;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">⏰</div>
      <h1>Nhắc Nhở Booking</h1>
      <p style="margin:  10px 0 0 0; font-size: 14px;">Bạn có lịch hẹn sắp tới! </p>
    </div>

    <div class="content">
      <p>Xin chào <strong>${
        user.display_name || booking.customer_name
      }</strong>,</p>
      
      <p>Đây là email nhắc nhở về booking của bạn tại <strong>${
        restaurant.name
      }</strong>.</p>

      <div class="highlight-box">
        <div>Booking của bạn sẽ diễn ra trong</div>
        <div class="time">${hoursUntil} giờ nữa</div>
        <div style="font-size: 20px; margin-top: 10px;">
          📅 ${bookingTimeFormatted}
        </div>
      </div>

      <div class="section">
        <h2 style="color: #FF9800; font-size: 20px; margin-bottom: 15px;">📋 Thông Tin Booking</h2>
        <table class="info-table">
          <tr>
            <td>Mã booking: </td>
            <td>#${booking.id}</td>
          </tr>
          <tr>
            <td>Nhà hàng:</td>
            <td>${restaurant.name}</td>
          </tr>
          <tr>
            <td>Địa chỉ:</td>
            <td>${restaurant.address}</td>
          </tr>
          <tr>
            <td>Số điện thoại nhà hàng:</td>
            <td>${restaurant.phone}</td>
          </tr>
          <tr>
            <td>Thời gian: </td>
            <td><strong>${bookingTimeFormatted}</strong></td>
          </tr>
          <tr>
            <td>Số người:</td>
            <td>${booking.people_count} người</td>
          </tr>
          ${
            booking.note
              ? `
          <tr>
            <td>Ghi chú:</td>
            <td>${booking.note}</td>
          </tr>
          `
              : ""
          }
        </table>
      </div>

      <div class="notes">
        <h3>⚠️ Lưu Ý Quan Trọng:</h3>
        <ul>
          <li>Vui lòng đến <strong>đúng giờ</strong></li>
          <li>Nếu muốn <strong>hủy hoặc thay đổi</strong> booking, vui lòng liên hệ nhà hàng trước ít nhất <strong>2 giờ</strong></li>
          <li>Liên hệ nhà hàng:  <strong>${restaurant.phone}</strong></li>
          ${
            booking.deposit_amount > 0
              ? `
          <li>Số tiền đặt cọc <strong>${booking.deposit_amount.toLocaleString()} VNĐ</strong> đã được thanh toán</li>
          `
              : ""
          }
        </ul>
      </div>

      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666;">Chúng tôi rất mong được phục vụ quý khách! </p>
        <p style="font-size: 24px; margin:  10px 0;">🍽️</p>
      </div>
    </div>

    <div class="footer">
      <p>Email này được gửi tự động từ <strong>Restaurant Booking System</strong></p>
      <p>Vui lòng không trả lời email này</p>
      <p style="margin-top: 10px; color: #aaa;">© ${new Date().getFullYear()} Restaurant Booking System.  All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};
