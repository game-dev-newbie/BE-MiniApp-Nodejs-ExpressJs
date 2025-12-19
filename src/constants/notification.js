// src/constants/notification.js

export const NOTIFICATION_TYPE = Object.freeze({
  // Vòng đời booking (dùng chung cho cả miniapp + dashboard)
  BOOKING_CREATED: "BOOKING_CREATED", // tạo mới
  BOOKING_UPDATED: "BOOKING_UPDATED", // customer hoặc nhà hàng chỉnh sửa
  BOOKING_CANCELLED: "BOOKING_CANCELLED", // bị hủy (bởi khách hoặc nhà hàng)
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED", // nhà hàng confirm
  BOOKING_CHECKED_IN: "BOOKING_CHECKED_IN", // check-in thành công
  BOOKING_NO_SHOW: "BOOKING_NO_SHOW", // khách không đến

  // Thanh toán liên quan booking
  BOOKING_PAYMENT_SUCCESS: "BOOKING_PAYMENT_SUCCESS",
  BOOKING_PAYMENT_FAILED: "BOOKING_PAYMENT_FAILED",
  BOOKING_REFUND_SUCCESS: "BOOKING_REFUND_SUCCESS",

  // Nhắc lịch
  BOOKING_REMINDER: "BOOKING_REMINDER",

  // Staff / account phía dashboard
  STAFF_REGISTERED: "STAFF_REGISTERED", // staff mới đăng ký
  STAFF_STATUS_CHANGED: "STAFF_STATUS_CHANGED", // được duyệt / khóa / mở khóa

  // Review
  REVIEW_CREATED: "REVIEW_CREATED", // có review mới

  // Thay đổi mật khẩu
  CHANGED_PASSWORD: "CHANGED_PASSWORD",

  // Thay đổi thông tin cá nhân thành công
  UPDATED_INFO_SUCCESS: "UPDATED_INFO_SUCCESS",

  // Dự phòng
  GENERIC: "GENERIC",
});

export const NOTIFICATION_CHANNEL = Object.freeze({
  IN_APP: "IN_APP",
  ZNS: "ZNS",
  EMAIL: "EMAIL",
});

// Loại đối tượng mà thông báo trỏ đến (để FE biết gọi API nào)
export const NOTIFICATION_TARGET_TYPE = Object.freeze({
  BOOKING: "BOOKING",
  REVIEW: "REVIEW",
  PAYMENT: "PAYMENT",
  USER: "USER",
  RESTAURANT_ACCOUNT: "RESTAURANT_ACCOUNT",
  STAFF: "STAFF",
});

export const NOTIFICATION_TARGET_TYPE_LIST = Object.freeze(
  Object.values(NOTIFICATION_TARGET_TYPE)
);

export const NOTIFICATION_TYPE_LIST = Object.freeze(
  Object.values(NOTIFICATION_TYPE)
);

export const NOTIFICATION_CHANNEL_LIST = Object.freeze(
  Object.values(NOTIFICATION_CHANNEL)
);
