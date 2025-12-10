// src/services/token.service.js
// ---------------------------------------------------------
// Đây là lớp "nghiệp vụ Token":
// - Tạo cặp accessToken + refreshToken cho 1 subject (user hoặc restaurant_account)
// - Lưu refresh token ID (token_id / tid) vào bảng auth_tokens
// - Xử lý refresh token (đổi sang cặp mới, rotate)
// - Hỗ trợ revoke token nếu cần
//
// Nó sử dụng:
//   - Model AuthToken (Sequelize)
//   - crypto.randomUUID() để tạo token_id
//   - Các hàm ký/verify từ utils/jwt.js
// ---------------------------------------------------------

import crypto from "crypto";
import { Op } from "sequelize";
import models from "../models/index.js";
import {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";
import { REFRESH_TOKEN_DAYS } from "../config/env.js";
import { TOKEN_TYPES, AUTH_ROLES } from "../constants/index.js";
// Lấy model AuthToken từ Sequelize
const { AuthToken } = models;

/**
 * Tính expires_at cho refresh token (dùng lưu vào DB).
 * Trả về một đối tượng Date = now + REFRESH_TOKEN_LIFE (mặc định).
 */
function calcRefreshExpiresAt() {
  if (!Number.isFinite(REFRESH_TOKEN_DAYS) || REFRESH_TOKEN_DAYS <= 0) {
    throw new Error("Invalid REFRESH_TOKEN_DAYS config");
  }

  const now = Date.now();
  const ms = REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000;
  return new Date(now + ms);
}

/**
 * Tạo 1 cặp accessToken + refreshToken cho 1 "subject".
 *
 * subject = bất kỳ thực thể đăng nhập nào:
 *   - customer (users.id)
 *   - restaurant_account (restaurant_accounts.id)
 *
 * @param {object} params
 * @param {number} params.subjectId - id của thực thể đăng nhập (users.id hoặc restaurant_accounts.id)
 * @param {string} params.subjectType - 'customer' | 'restaurant_account' | 'admin' ...
 * @param {string} params.role - role trong hệ thống (customer / owner / staff)
 * @param {string} [params.provider] - 'zalo' | 'local' ... (optional, hữu ích cho customer)
 *
 * @returns {Promise<{ accessToken: string, refreshToken: string }>}
 */
export const issueTokens = async ({
  subjectId,
  subjectType,
  role,
  provider,
}) => {
  if (!subjectId || !subjectType) {
    throw new Error("subjectId và subjectType là bắt buộc khi issueTokens.");
  }

  // Tạo ID ngẫu nhiên cho refresh token (tid).
  // ID này được lưu trong DB, còn JWT chỉ chứa tid chứ không lưu raw token.
  const tokenId = crypto.randomUUID();

  // Thời điểm hết hạn (mirror với thời gian sống của refresh token)
  const refreshExpiresAt = calcRefreshExpiresAt();

  // 1. Lưu record refresh token vào bảng auth_tokens
  await AuthToken.create({
    subject_id: subjectId,
    subject_type: subjectType,
    token_id: tokenId,
    type: TOKEN_TYPES.REFRESH,
    is_revoked: false,
    expires_at: refreshExpiresAt,
  });

  // 2. Ký access token
  const accessPayload = {
    sub: subjectId, // id của user/restaurant_account
    sub_type: subjectType,
    role,
    provider,
    type: TOKEN_TYPES.ACCESS,
  };

  const accessToken = signAccessToken(accessPayload);

  // 3. Ký refresh token
  const refreshPayload = {
    sub: subjectId,
    sub_type: subjectType,
    tid: tokenId, // cực kỳ quan trọng để map với auth_tokens.token_id
    type: TOKEN_TYPES.REFRESH,
  };

  const refreshToken = signRefreshToken(refreshPayload);

  return {
    accessToken,
    refreshToken,
  };
};

/**
 * Xử lý luồng "refresh token":
 *
 * - Verify refreshToken (JWT, hết hạn, chữ ký, v.v.)
 * - Kiểm tra record trong auth_tokens còn hiệu lực không (chưa revoke, chưa hết hạn)
 * - Revoke record cũ (rotate)
 * - Tạo cặp access+refresh mới bằng issueTokens
 *
 * @param {string} refreshToken - JWT refresh client gửi lên
 * @param {function} getPrincipalBySubject - hàm callback để load lại "principal"
 *      (vì mỗi subjectType map với bảng khác nhau: users / restaurant_accounts)
 *      signature: async (sub, subType) => principalObject
 *
 * @returns {Promise<{ accessToken: string, refreshToken: string, principal: any }>}
 */
export const refreshTokens = async (refreshToken, getPrincipalBySubject) => {
  if (!refreshToken) {
    throw new Error("Thiếu refreshToken trong request.");
  }

  // 1. Verify JWT refresh token
  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    // Lỗi verify (expired / invalid)
    err.statusCode = 401;
    throw err;
  }

  const { sub, sub_type: subType, tid, type } = payload;

  if (type !== TOKEN_TYPES.REFRESH) {
    const error = new Error("Token không phải loại refresh.");
    error.statusCode = 400;
    throw error;
  }

  // 2. Tìm record refresh tương ứng trong auth_tokens
  const tokenRecord = await AuthToken.findOne({
    where: {
      subject_id: sub,
      subject_type: subType,
      token_id: tid,
      type: TOKEN_TYPES.REFRESH,
      is_revoked: false,
      expires_at: { [Op.gt]: new Date() }, // chưa hết hạn theo DB
    },
  });

  if (!tokenRecord) {
    const error = new Error("Refresh token không hợp lệ hoặc đã bị thu hồi.");
    error.statusCode = 401;
    throw error;
  }

  // 3. Revoke token cũ (rotate)
  tokenRecord.is_revoked = true;
  await tokenRecord.save();

  // 4. Load lại "principal" (user hoặc restaurant_account) để lấy role / provider
  // Hàm getPrincipalBySubject do bạn truyền từ AuthService vào,
  // cách implement tuỳ theo subType.
  let principal = null;
  if (typeof getPrincipalBySubject === "function") {
    principal = await getPrincipalBySubject(sub, subType);
  }

  if (!principal) {
    const error = new Error("Không tìm thấy thực thể tương ứng với token.");
    error.statusCode = 401;
    throw error;
  }

  // 5. Dùng issueTokens tạo cặp token mới
  const { accessToken, refreshToken: newRefreshToken } = await issueTokens({
    subjectId: sub,
    subjectType: subType,
    role: principal.role || AUTH_ROLES.CUSTOMER, // tuỳ thực thể
    provider: principal.provider || undefined,
  });

  return {
    accessToken,
    refreshToken: newRefreshToken,
    principal,
  };
};

/**
 * Thu hồi (revoke) tất cả refresh token của 1 subject.
 * Hữu ích cho logout all devices, hoặc khi đổi mật khẩu.
 *
 * @param {number} subjectId
 * @param {string} subjectType
 */
export const revokeAllTokensForSubject = async (subjectId, subjectType) => {
  await AuthToken.update(
    { is_revoked: true },
    {
      where: {
        subject_id: subjectId,
        subject_type: subjectType,
        type: TOKEN_TYPES.REFRESH,
        is_revoked: false,
      },
    }
  );
};

/**
 * Thu hồi một refresh token cụ thể dựa trên token_id (tid).
 * (Bạn có thể dùng khi muốn logout 1 thiết bị cụ thể nếu lưu tid ở client.)
 *
 * @param {string} tokenId
 */
export const revokeTokenById = async (tokenId) => {
  await AuthToken.update(
    { is_revoked: true },
    {
      where: {
        token_id: tokenId,
        type: TOKEN_TYPES.REFRESH,
        is_revoked: false,
      },
    }
  );
};
