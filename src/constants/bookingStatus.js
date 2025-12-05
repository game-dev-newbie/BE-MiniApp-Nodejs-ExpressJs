// src/constants/bookingStatus.js
export const BOOKING_STATUS = Object.freeze({
  PENDING: "PENDING", // vừa tạo, chờ nhà hàng xử lý
  CONFIRMED: "CONFIRMED", // nhà hàng xác nhận
  CANCELLED: "CANCELLED", // khách hoặc nhà hàng hủy
  COMPLETED: "COMPLETED", // đã đến dùng dịch vụ
  NO_SHOW: "NO_SHOW", // khách bùng
});

export const BOOKING_STATUS_LIST = Object.freeze(Object.values(BOOKING_STATUS));
