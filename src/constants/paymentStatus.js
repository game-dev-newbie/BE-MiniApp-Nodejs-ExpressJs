// src/constants/paymentStatus.js
export const PAYMENT_STATUS = Object.freeze({
  NONE: "NONE", // booking không yêu cầu cọc
  PENDING: "PENDING", // đã tạo yêu cầu thanh toán
  PAID: "PAID", // đã thanh toán thành công
  FAILED: "FAILED", // thanh toán thất bại
  REFUNDED: "REFUNDED", // hoàn tiền
});

export const PAYMENT_STATUS_LIST = Object.freeze(Object.values(PAYMENT_STATUS));

// nếu bạn cần cả provider:
export const PAYMENT_PROVIDER = Object.freeze({
  ZALOPAY: "ZALOPAY",
  MOMO: "MOMO",
  VNPAY: "VNPAY",
  CARD: "CARD"
});
export const PAYMENT_PROVIDER_LIST = Object.freeze(
  Object.values(PAYMENT_PROVIDER)
);
