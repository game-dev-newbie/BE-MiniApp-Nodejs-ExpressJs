// src/templates/email/refund.template. js

import time from "../../utils/time.js";

export const generateRefundEmailHTML = ({ booking, user, restaurant }) => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Xác nhận hoàn tiền</title>
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
      background:  #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .content {
      padding: 30px 20px;
    }
    .highlight-box {
      background: #e3f2fd;
      border-left: 4px solid #2196F3;
      padding:  15px;
      margin:  20px 0;
      border-radius: 4px;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      color: #888;
      font-size: 12px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div style="font-size: 48px; margin-bottom: 10px;">💰</div>
      <h1>Xác Nhận Hoàn Tiền</h1>
    </div>

    <div class="content">
      <p>Xin chào <strong>${user.display_name}</strong>,</p>
      
      <p>Chúng tôi xác nhận đã xử lý hoàn tiền cho booking <strong>#${
        booking.id
      }</strong> tại <strong>${restaurant.name}</strong>.</p>

      <div class="highlight-box">
        <div>Số tiền hoàn lại:</div>
        <strong style="font-size: 24px; color: #2196F3;">${booking.deposit_amount.toLocaleString()} VNĐ</strong>
      </div>

      <p><strong>Thông tin hoàn tiền:</strong></p>
      <ul>
        <li>Mã giao dịch gốc: <strong>${booking.payment_reference}</strong></li>
        <li>Thời gian hoàn tiền: <strong>${time.toVNDateTime(
          booking.refunded_at
        )}</strong></li>
        <li>Phương thức:  ${booking.payment_provider}</li>
      </ul>

      <div style="background: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0;">
        <strong>📌 Lưu ý:</strong>
        <p style="margin: 10px 0 0 0;">Số tiền sẽ được hoàn về tài khoản của bạn trong vòng <strong>3-7 ngày làm việc</strong> tùy vào ngân hàng.</p>
      </div>

      <p style="margin-top: 20px;">Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi!</p>
    </div>

    <div class="footer">
      <p>© ${new Date().getFullYear()} Restaurant Booking System</p>
    </div>
  </div>
</body>
</html>
  `;
};
