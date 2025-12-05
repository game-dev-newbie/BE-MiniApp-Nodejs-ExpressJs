// src/constants/tableStatus.js
export const TABLE_STATUS = Object.freeze({
  ACTIVE: "ACTIVE", // dùng được
  INACTIVE: "INACTIVE", // tạm khóa cấu hình
  OUT_OF_SERVICE: "OUT_OF_SERVICE", // hư, đang sửa
});

export const TABLE_STATUS_LIST = Object.freeze(Object.values(TABLE_STATUS));
