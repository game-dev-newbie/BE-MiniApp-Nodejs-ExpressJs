// src/templates/email/payment-success. template.js

import time from "../../utils/time.js";

/**
 * Template email thanh toán thành công
 */
export const generatePaymentSuccessHTML = ({ booking, user, restaurant }) => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanh toán thành công</title>
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
      background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
      color: white;
      padding:  30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header . icon {
      font-size: 48px;
      margin-bottom:  10px;
    }
    .content {
      padding: 30px 20px;
    }
    .section {
      margin-bottom: 30px;
    }
    .section h2 {
      color: #4CAF50;
      font-size: 20px;
      margin-bottom: 15px;
      border-bottom: 2px solid #4CAF50;
      padding-bottom: 8px;
    }
    . info-table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    . info-table td {
      padding: 12px 8px;
      border-bottom: 1px solid #eee;
    }
    .info-table td:first-child {
      color: #666;
      width: 40%;
    }
    .info-table td:last-child {
      font-weight: 600;
      color: #333;
    }
    .highlight-box {
      background: #f9f9f9;
      border-left: 4px solid #4CAF50;
      padding:  15px;
      margin:  20px 0;
      border-radius: 4px;
    }
    .highlight-box strong {
      color: #4CAF50;
      font-size: 18px;
    }
    .notes {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .notes h3 {
      margin-top: 0;
      color: #856404;
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
    . footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      color: #888;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
    .footer p {
      margin: 5px 0;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background: #4CAF50;
      color: white;
      text-decoration: none;
      border-radius: 5px;
      margin: 20px 0;
      font-weight: 600;
    }
    .button:hover {
      background: #45a049;
    }
  </style>
</head>
<body>
  <div class="container">
    <!-- Header -->
    <div class="header">
      <div class="icon">✅</div>
      <h1>Thanh Toán Thành Công! </h1>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Cảm ơn bạn đã đặt bàn tại ${
        restaurant.name
      }</p>
    </div>

    <!-- Content -->
    <div class="content">
      <!-- Thông tin booking -->
      <div class="section">
        <h2>📋 Thông Tin Đặt Bàn</h2>
        <table class="info-table">
          <tr>
            <td>Mã booking:</td>
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
            <td>Số điện thoại:</td>
            <td>${restaurant.phone}</td>
          </tr>
          <tr>
            <td>Thời gian đặt bàn:</td>
            <td><strong>${time.toVNDateTime(booking.booking_time)}</strong></td>
          </tr>
          <tr>
            <td>Số người:</td>
            <td>${booking.people_count} người</td>
          </tr>
          <tr>
            <td>Tên khách hàng:</td>
            <td>${booking.customer_name}</td>
          </tr>
          <tr>
            <td>Số điện thoại: </td>
            <td>${booking.phone}</td>
          </tr>
        </table>
      </div>

      <!-- Thông tin thanh toán -->
      <div class="section">
        <h2>💳 Thông Tin Thanh Toán</h2>
        
        <div class="highlight-box">
          <div>Số tiền đặt cọc:</div>
          <strong style="font-size: 24px;">${booking.deposit_amount.toLocaleString()} VNĐ</strong>
        </div>

        <table class="info-table">
          <tr>
            <td>Phương thức thanh toán:</td>
            <td>${booking.payment_provider || "N/A"}</td>
          </tr>
          <tr>
            <td>Mã giao dịch:</td>
            <td>${booking.payment_reference || "N/A"}</td>
          </tr>
          <tr>
            <td>Trạng thái:</td>
            <td style="color: #4CAF50;">✅ Đã thanh toán</td>
          </tr>
          <tr>
            <td>Thời gian thanh toán:</td>
            <td>${time.toVNDateTime(booking.paid_at)}</td>
          </tr>
        </table>
      </div>

      <!-- Lưu ý -->
      <div class="notes">
        <h3>📌 Lưu Ý Quan Trọng:</h3>
        <ul>
          <li>Vui lòng đến <strong>đúng giờ</strong> đã đặt:  <strong>${time.toVNDateTime(
            booking.booking_time
          )}</strong></li>
          <li>Số tiền đặt cọc <strong>${booking.deposit_amount.toLocaleString()} VNĐ</strong> sẽ được <strong>trừ vào tổng bill</strong> khi thanh toán</li>
          <li>Nếu cần thay đổi hoặc hủy booking, vui lòng liên hệ nhà hàng ít nhất <strong>2 giờ</strong> trước</li>
          <li>Liên hệ nhà hàng:  <strong>${restaurant.phone}</strong></li>
          <li>Nếu quý khách đến muộn quá <strong>15 phút</strong> mà không báo trước, booking có thể bị hủy</li>
        </ul>
      </div>

      ${
        booking.note
          ? `
      <div class="section">
        <h2>📝 Ghi Chú Của Bạn</h2>
        <p style="padding:  10px; background: #f9f9f9; border-radius: 4px;">${booking.note}</p>
      </div>
      `
          : ""
      }

      <!-- Call to action -->
      <div style="text-align: center; margin-top: 30px;">
        <p style="color: #666;">Chúng tôi rất mong được phục vụ quý khách!</p>
        <p style="font-size: 24px; margin:  10px 0;">🍽️</p>
      </div>
    </div>

    <!-- Footer -->
    <div class="footer">
      <p>Email này được gửi tự động từ <strong>Restaurant Booking System</strong></p>
      <p>Vui lòng không trả lời email này</p>
      <p style="margin-top: 10px; color:  #aaa;">© ${new Date().getFullYear()} Restaurant Booking System.  All rights reserved.</p>
    </div>
  </div>
</body>
</html>
  `;
};
