// src/utils/zalo.util.js
import crypto from "crypto";
import * as env from "../config/env.js";
import { AppError } from "./appError.js";

/**
 * URL Graph API Zalo để lấy thông tin user.
 */
const ZALO_GRAPH_ME_URL =
  env.ZALO_GRAPH_ME_URL || "https://graph.zalo.me/v2.0/me";

/**
 * URL decode số điện thoại (nếu dùng getPhoneNumber).
 */
const ZALO_PHONE_DECODE_URL =
  env.ZALO_PHONE_DECODE_URL || "https://graph.zalo.me/v2.0/me/phone";

/**
 * Secret key của Zalo App (lấy trong Zalo for Dev).
 */
const ZALO_APP_SECRET = env.ZALO_APP_SECRET;

/**
 * Tạo appsecret_proof = HMAC-SHA256(accessToken, ZALO_APP_SECRET)
 * Zalo yêu cầu gửi kèm khi gọi /v2.0/me từ server.
 * @param {string} accessToken
 * @returns {string}
 */
export function createAppSecretProof(accessToken) {
  if (!ZALO_APP_SECRET) {
    throw new AppError("ZALO_APP_SECRET chưa được cấu hình trong env.js", 500);
  }

  return crypto
    .createHmac("sha256", ZALO_APP_SECRET)
    .update(accessToken)
    .digest("hex");
}

/**
 * Gọi Zalo Graph API để lấy profile user: id, name, avatar_url.
 * @param {string} accessToken - accessToken lấy từ zmp-sdk phía FE
 * @returns {Promise<{ zaloId: string, name: string, avatarUrl: string | null, raw: any }>}
 */
export async function fetchZaloProfile(accessToken) {
  if (!accessToken) {
    throw new AppError("Thiếu accessToken để gọi Zalo Graph API", 400);
  }

  const appsecretProof = createAppSecretProof(accessToken);

  const response = await fetch(ZALO_GRAPH_ME_URL, {
    method: "GET",
    headers: {
      access_token: accessToken,
      appsecret_proof: appsecretProof,
    },
  });

  if (!response.ok) {
    throw new AppError("Không gọi được Zalo Graph API", 502);
  }

  const data = await response.json();

  // Trong một số phiên bản, Zalo trả error_code / error khác 0 khi lỗi
  if ((data.error && data.error !== 0) || data.error_code) {
    console.warn("Zalo /me error:", data);
    throw new AppError(data.message || "Zalo Graph API trả về lỗi", 401);
  }

  const zaloId = data.id;
  const name = data.name || "Zalo user";
  const avatarUrl = data.picture?.data?.url || null;

  if (!zaloId) {
    throw new AppError("Không lấy được Zalo ID từ Graph API", 500);
  }

  return { zaloId, name, avatarUrl, raw: data };
}

/**
 * (Optional) Decode số điện thoại từ token getPhoneNumber() phía client.
 * Nếu không cần phone thì có thể không dùng hàm này.
 *
 * @param {string} accessToken - access token Zalo
 * @param {string} phoneToken - token (code) từ getPhoneNumber()
 * @returns {Promise<string | null>} - số điện thoại hoặc null nếu lỗi
 */
export async function fetchZaloPhoneNumber(accessToken, phoneToken) {
  if (!phoneToken) return null;

  if (!ZALO_APP_SECRET) {
    console.warn(
      "[Zalo] Thiếu ZALO_APP_SECRET, không thể decode số điện thoại"
    );
    return null;
  }

  const url = new URL(ZALO_PHONE_DECODE_URL);
  url.searchParams.set("access_token", accessToken);
  url.searchParams.set("code", phoneToken);
  url.searchParams.set("secret_key", ZALO_APP_SECRET);

  const response = await fetch(url);

  if (!response.ok) {
    console.warn("[Zalo] Decode phone API HTTP error:", response.status);
    return null;
  }

  const data = await response.json();

  // tuỳ spec, bạn chỉnh lại field error nếu cần
  if ((data.error && data.error !== 0) || data.error_code) {
    console.warn("[Zalo] Decode phone error:", data);
    return null;
  }

  const phone = data.data?.number || null;
  return phone;
}

export default {
  createAppSecretProof,
  fetchZaloProfile,
  fetchZaloPhoneNumber,
};
