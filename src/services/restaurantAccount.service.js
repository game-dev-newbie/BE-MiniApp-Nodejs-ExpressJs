// src/services/restaurantAccount.service.js

import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { SUBJECT_TYPES } from "../constants/index.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { revokeAllTokensForSubject } from "./token.service.js";
import {
  safeUnlinkByWebPath,
  isSameWebPath,
} from "../utils/fileStorage.util.js";

const { RestaurantAccount } = models;

/**
 * Lấy thông tin tài khoản hiện tại (dashboard).
 */
export const getMyAccountProfile = async (accountId) => {
  const account = await RestaurantAccount.findByPk(accountId);

  if (!account) {
    throw new AppError("Tài khoản không tồn tại", 404);
  }

  return account;
};

/**
 * Cập nhật tên + avatar_url cho tài khoản dashboard.
 * - FE đã upload ảnh xong, có sẵn avatar_url (path/url) rồi mới gọi vào đây.
 */
export const updateMyAccountProfile = async (accountId, payload) => {
  const account = await RestaurantAccount.findByPk(accountId);

  if (!account) {
    throw new AppError("Tài khoản không tồn tại", 404);
  }

  const { full_name, avatar_url } = payload;

  if (typeof full_name !== "undefined") {
    account.full_name = full_name;
  }

  if (typeof avatar_url !== "undefined") {
    const oldAvatar = account.avatar_url;
    const newAvatar = avatar_url;

    account.avatar_url = newAvatar;
    await account.save();

    if (oldAvatar && newAvatar && !isSameWebPath(oldAvatar, newAvatar)) {
      await safeUnlinkByWebPath(oldAvatar);
    }
    return account;
  }

  await account.save();

  return account;
};

/**
 * Đổi mật khẩu cho tài khoản dashboard:
 * - Check mật khẩu hiện tại đúng không
 * - Hash mật khẩu mới
 * - Lưu vào DB
 * - Thu hồi toàn bộ refresh token của account này
 */
export const changePasswordAndRevokeTokens = async (accountId, payload) => {
  const { current_password, new_password } = payload;

  const account = await RestaurantAccount.findByPk(accountId);
  if (!account) {
    throw new AppError("Tài khoản không tồn tại", 404);
  }

  // 1. Kiểm tra mật khẩu hiện tại
  const isCurrentValid = await comparePassword(
    current_password,
    account.password_hash
  );
  if (!isCurrentValid) {
    throw new AppError("Mật khẩu hiện tại không chính xác", 400);
  }

  // 2. Không cho dùng lại y chang mật khẩu cũ
  const isSameAsOld = await comparePassword(
    new_password,
    account.password_hash
  );
  if (isSameAsOld) {
    throw new AppError("Mật khẩu mới phải khác mật khẩu hiện tại", 400);
  }

  // 3. Hash mật khẩu mới
  const newHash = await hashPassword(new_password);
  account.password_hash = newHash;
  await account.save();

  // 4. Thu hồi toàn bộ refresh token của account này
  await revokeAllTokensForSubject(account.id, SUBJECT_TYPES.RESTAURANT_ACCOUNT);

  // Thường đổi mật khẩu xong là bắt user login lại → không cần trả token mới
  return account;
};
