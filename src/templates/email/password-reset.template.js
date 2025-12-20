// src/templates/email/password-reset.template.js

/**
 * Template email quên mật khẩu
 */
export const generatePasswordResetHTML = ({
  displayName,
  resetToken,
  expiresInMinutes = 15,
  subjectType,
}) => {
  const platformName =
    subjectType === "CUSTOMER"
      ? "Restaurant Booking MiniApp"
      : "Restaurant Dashboard";

  return `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Đặt lại mật khẩu</title>
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
      max-width:  600px;
      margin:  20px auto;
      background:  #ffffff;
      border-radius:  8px;
      overflow: hidden;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    .header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding:  30px 20px;
      text-align:  center;
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
    .token-box {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 20px;
      margin:  20px 0;
      border-radius: 8px;
      text-align: center;
    }
    .token {
      font-size: 36px;
      font-weight:  bold;
      letter-spacing: 8px;
      font-family: 'Courier New', monospace;
      margin: 10px 0;
    }
    .warning-box {
      background: #fff3cd;
      border-left: 4px solid #ffc107;
      padding: 15px;
      margin: 20px 0;
      border-radius: 4px;
    }
    .warning-box h3 {
      margin-top: 0;
      color: #856404;
      font-size: 16px;
    }
    .warning-box ul {
      margin: 10px 0;
      padding-left: 20px;
    }
    .warning-box li {
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
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="icon">🔐</div>
      <h1>Đặt Lại Mật Khẩu</h1>
      <p style="margin:  10px 0 0 0; font-size: 14px;">${platformName}</p>
    </div>

    <div class="content">
      <p>Xin chào <strong>${displayName}</strong>,</p>
      
      <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn. </p>

      <div class="token-box">
        <div style="font-size: 14px; margin-bottom: 10px;">Mã xác nhận của bạn:</div>
        <div class="token">${resetToken}</div>
        <div style="font-size: 12px; margin-top: 10px; opacity: 0.9;">
          Sử dụng mã này để đặt lại mật khẩu
        </div>
      </div>

      <div class="warning-box">
        <h3>⚠️ Lưu Ý Quan Trọng: </h3>
        <ul>
          <li>Mã xác nhận có hiệu lực trong <strong>${expiresInMinutes} phút</strong></li>
          <li>Mã chỉ có thể sử dụng <strong>1 lần duy nhất</strong></li>
          <li><strong>KHÔNG chia sẻ</strong> mã này với bất kỳ ai</li>
          <li>Nếu bạn <strong>không yêu cầu</strong> đặt lại mật khẩu, vui lòng <strong>bỏ qua</strong> email này</li>
        </ul>
      </div>

      <p style="margin-top: 30px;">
        Nếu bạn gặp khó khăn hoặc cần hỗ trợ, vui lòng liên hệ với chúng tôi. 
      </p>

      <p style="margin-top: 20px; color: #666;">
        Trân trọng,<br>
        <strong>Restaurant Booking Team</strong>
      </p>
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
