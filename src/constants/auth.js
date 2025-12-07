// src/constants/auth.js

// Đối tượng đăng nhập (subject_type)
export const SUBJECT_TYPES = Object.freeze({
  CUSTOMER: "CUSTOMER", // bảng users (miniapp)
  RESTAURANT_ACCOUNT: "RESTAURANT_ACCOUNT", // bảng restaurant_accounts(dashboard)
});

// Provider (cách user đăng nhập)
export const AUTH_PROVIDERS = Object.freeze({
  ZALO: "ZALO",
  LOCAL: "LOCAL", // email/password
});

// Role trong hệ thống
export const AUTH_ROLES = Object.freeze({
  CUSTOMER: "CUSTOMER",
  OWNER: "OWNER",
  STAFF: "STAFF",
});

// Loại token
export const TOKEN_TYPES = Object.freeze({
  ACCESS: "ACCESS",
  REFRESH: "REFRESH",
});
