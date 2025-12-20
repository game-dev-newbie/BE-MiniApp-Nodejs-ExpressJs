// src/templates/email/payment-failed. template.js

import time from "../../utils/time.js";

export const generatePaymentFailedHTML = ({ booking, user, restaurant }) => {
  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thanh toán thất bại</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      line-height: 1.6;
      color: #333;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
    }
    .container {
      max-width:  600px;
      margin:  20px auto;
      background: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #f44336 0%, #e53935 100%);
      color: white;
      padding: 30px 20px;
      text-align: center;
    }
    .header h1 {
      margin: 0;
      font-size: 28px;
      font-weight:  600;
    }
    .header .icon {
      font-size: 48px;
      margin-bottom: 10px;
    }
    .content {
      padding: 30px 20px;
    }
    .info-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .button {
      display: inline-block;
      padding: 12px 30px;
      background:  #4CAF50;
      color:  white;
      text-decoration:  none;
      border-radius:  5px;
      margin:  20px 0;
      font-weight: 600;
      text-align: center;
    }
    .footer {
      background: #f8f8f8;
      padding: 20px;
      text-align: center;
      color: #888;
      font-size: 12px;
      border-top: 1px solid #eee;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">❌</div>
      <h1>Thanh Toán Thất Bại</h1>
      <p style="margin: 10px 0 0 0; font-size: 14px;">Booking #${booking.id}</p>
    </div>

    <div class="content">
      <p>Xin chào <strong>${user.display_name}</strong>,</p>
      
      <p>Thanh toán đặt cọc cho booking của bạn tại <strong>${restaurant.name}</strong> không thành công.</p>

      <div class="info-box">
        <strong>📌 Booking vẫn được giữ trong 15 phút</strong>
        <p style="margin: 10px 0 0 0;">Bạn có thể thử thanh toán lại hoặc chọn phương thức thanh toán khác.</p>
      </div>

      <div style="text-align: center;">
        <a href="#" class="button">Thử Thanh Toán Lại</a>
      </div>

      <p style="margin-top: 20px; color: #666; font-size: 14px;">
        Nếu gặp khó khăn, vui lòng liên hệ:  <strong>${restaurant.phone}</strong>
      </p>
    </div>

    <div class="footer">
      <p>Email này được gửi tự động từ <strong>Restaurant Booking System</strong></p>
    </div>
  </div>
</body>
</html>
  `;
};
