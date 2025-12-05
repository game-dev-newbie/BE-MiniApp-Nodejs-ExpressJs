// src/constants/reviewStatus.js
export const REVIEW_STATUS = Object.freeze({
  VISIBLE: "VISIBLE",
  HIDDEN: "HIDDEN", //nhà hàng ẩn
  REPORTED: "REPORTED", // bị report đang chờ xử lý
});

export const REVIEW_STATUS_LIST = Object.freeze(Object.values(REVIEW_STATUS));
