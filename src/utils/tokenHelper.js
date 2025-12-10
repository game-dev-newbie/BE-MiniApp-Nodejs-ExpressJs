// src/utils/tokenHelper.js
// ---------------------------------------------------------
// Nhiệm vụ:
//  - Đọc access token từ request (Authorization: Bearer ...)
//  - Verify chữ ký + hết hạn bằng verifyAccessToken()
//  - Đảm bảo token là loại ACCESS (không phải refresh)
//  - Trả về payload thuần để middleware xử lý tiếp
// ---------------------------------------------------------

import { AppError } from "./appError.js";
import { verifyAccessToken } from "./jwt.js";
import { TOKEN_TYPES } from "../constants/index.js";

/**
 * Lấy raw access token từ request.
 *
 * Ưu tiên:
 *  - Header: Authorization: Bearer <token>
 *
 * @param {import("express").Request} req
 * @returns {string} accessToken
 * @throws {AppError} nếu thiếu hoặc format sai
 */
export const getAccessTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || req.headers.Authorization;

  if (!authHeader || typeof authHeader !== "string") {
    throw new AppError("Thiếu header Authorization", 401);
  }

  const parts = authHeader.split(" ");

  // Format đúng phải là "Bearer <token>"
  if (parts.length !== 2 || parts[0] !== "Bearer") {
    throw new AppError("Authorization header không đúng định dạng Bearer", 401);
  }

  const token = parts[1];

  if (!token) {
    throw new AppError(
      "Không tìm thấy access token trong Authorization header",
      401
    );
  }

  return token;
};

/**
 * Verify access token và trả về payload.
 *
 * - Dùng verifyAccessToken() để kiểm tra chữ ký + hết hạn.
 * - Kiểm tra payload.type phải là ACCESS (theo TOKEN_TYPES).
 *
 * @param {import("express").Request} req
 * @returns {object} payload - payload decode từ access token
 * @throws {AppError} nếu token không hợp lệ / hết hạn / sai loại
 */
export const getAccessPayloadFromRequest = (req) => {
  const token = getAccessTokenFromRequest(req);

  let payload;
  try {
    // verifyAccessToken: hàm sync dùng jwt.verify bên trong
    payload = verifyAccessToken(token);
  } catch (err) {
    // Có thể refine theo err.name (TokenExpiredError, JsonWebTokenError) nếu muốn
    throw new AppError("Access token không hợp lệ hoặc đã hết hạn", 401);
  }

  if (!payload) {
    throw new AppError("Không đọc được payload từ access token", 401);
  }

  if (payload.type !== TOKEN_TYPES.ACCESS) {
    throw new AppError("Token không phải loại ACCESS", 401);
  }

  return payload;
};
