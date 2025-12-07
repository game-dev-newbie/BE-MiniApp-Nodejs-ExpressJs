// src/utils/jwt.js
// ---------------------------------------------------------
// File này chỉ làm 3 việc:
// 1. Ký access token
// 2. Ký refresh token
// 3. Verify 2 loại token đó
//
// ---------------------------------------------------------

import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
  ACCESS_TOKEN_LIFE,
  REFRESH_TOKEN_LIFE,
} from "../config/env.js";
import { TOKEN_TYPES } from "../constants/auth.js";

// Kiểm tra cấu hình bí mật JWT
if (!ACCESS_TOKEN_SECRET || !REFRESH_TOKEN_SECRET) {
  throw new Error(
    "JWT_ACCESS_SECRET và JWT_REFRESH_SECRET phải được cấu hình trong biến môi trường (.env)."
  );
}


/**
 * Ký access token.
 *
 * @param {object} payload - Dữ liệu bỏ vào JWT (sub, sub_type, role, provider, type: 'access', ...)
 * @param {object} options - (optional) override options cho jwt.sign (vd: expiresIn)
 * @returns {string} accessToken
 */
export function signAccessToken(payload, options = {}) {
  // Đảm bảo type mặc định là 'access' nếu caller quên set
  const finalPayload = {
    ...payload,
    type: payload.type || TOKEN_TYPES.ACCESS,
  };

  return jwt.sign(finalPayload, ACCESS_TOKEN_SECRET, {
    expiresIn: ACCESS_TOKEN_LIFE,
    ...options,
  });
}

/**
 * Verify access token.
 *
 * - Trả về payload nếu hợp lệ
 * - Throw error (jwt.TokenExpiredError, jwt.JsonWebTokenError, ...) nếu có vấn đề
 *
 * @param {string} token - giá trị "eyJhbGciOi..." nhận từ client
 * @returns {object} payload đã decode
 */
export function verifyAccessToken(token) {
  return jwt.verify(token, ACCESS_TOKEN_SECRET);
}

/**
 * Ký refresh token.
 *
 * @param {object} payload - Nên chứa { sub, sub_type, tid, type: 'refresh' }
 * @param {object} options - (optional) override options cho jwt.sign
 * @returns {string} refreshToken
 */
export function signRefreshToken(payload, options = {}) {
  const finalPayload = {
    ...payload,
    type: payload.type || TOKEN_TYPES.REFRESH,
  };

  return jwt.sign(finalPayload, REFRESH_TOKEN_SECRET, {
    expiresIn: REFRESH_TOKEN_LIFE,
    ...options,
  });
}

/**
 * Verify refresh token.
 *
 * @param {string} token
 * @returns {object} payload đã decode
 */
export function verifyRefreshToken(token) {
  return jwt.verify(token, REFRESH_TOKEN_SECRET);
}
