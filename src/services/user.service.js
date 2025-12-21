// src/services/user.service.js

import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { SUBJECT_TYPES } from "../constants/index.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import { revokeAllTokensForSubject } from "./token.service.js";
import {
  safeUnlinkByWebPath,
  isSameWebPath,
} from "../utils/fileStorage.util.js";
import {
  _safeNotify,
  notifyProfileUpdatedCustomer,
  notifyPasswordChangedCustomer,
} from "../utils/notificationHelper.util.js";

const { User } = models;

/**
 * Lấy thông tin tài khoản hiện tại (miniapp).
 */
export const getMyMiniAppProfile = async (userId) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("Tài khoản không tồn tại", 404);
  }

  return user;
};

/**
 * Cập nhật tên + avatar_url cho tài khoản dashboard.
 * - FE đã upload ảnh xong, có sẵn avatar_url (path/url) rồi mới gọi vào đây.
 */
export const updateMyMiniAppProfile = async (userId, payload) => {
  const user = await User.findByPk(userId);

  if (!user) {
    throw new AppError("Tài khoản không tồn tại", 404);
  }

  const { display_name, avatar_url, phone, email } = payload;

  if (typeof display_name !== "undefined") {
    user.display_name = display_name;
  }

  if (typeof avatar_url !== "undefined") {
    const oldAvatar = user.avatar_url;
    const newAvatar = avatar_url;

    // update DB trước
    user.avatar_url = newAvatar;

    // save trước để “DB là nguồn sự thật”
    await user.save();

    // nếu ảnh thay đổi thì xoá file cũ (nếu có)
    if (oldAvatar && newAvatar && !isSameWebPath(oldAvatar, newAvatar)) {
      await safeUnlinkByWebPath(oldAvatar);
    }

    // Thông báo cho user về việc cập nhật profile
    await _safeNotify(() => notifyProfileUpdatedCustomer(user.id));

    return user;
  }
  if (typeof phone !== "undefined") {
    user.phone = phone;
  }

  if (typeof email !== "undefined") {
    user.email = email;
  }

  await user.save();

  return user;
};
/**
 * Đổi mật khẩu cho tài khoản dashboard:
 * - Check mật khẩu hiện tại đúng không
 * - Hash mật khẩu mới
 * - Lưu vào DB
 * - Thu hồi toàn bộ refresh token của account này
 */
export const changePasswordAndRevokeTokensMiniApp = async (userId, payload) => {
  const { current_password, new_password } = payload;

  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("Tài khoản không tồn tại", 404);
  }

  // 1. Kiểm tra mật khẩu hiện tại
  const isCurrentValid = await comparePassword(
    current_password,
    user.password_hash
  );
  if (!isCurrentValid) {
    throw new AppError("Mật khẩu hiện tại không chính xác", 400);
  }

  // 2. Không cho dùng lại y chang mật khẩu cũ
  const isSameAsOld = await comparePassword(new_password, user.password_hash);
  if (isSameAsOld) {
    throw new AppError("Mật khẩu mới phải khác mật khẩu hiện tại", 400);
  }

  // 3. Hash mật khẩu mới
  const newHash = await hashPassword(new_password);
  user.password_hash = newHash;
  await user.save();

  // 4. Thu hồi toàn bộ refresh token của account này
  await revokeAllTokensForSubject(user.id, SUBJECT_TYPES.CUSTOMER);

  // 5. Thông báo cho user về việc đổi mật khẩu
  await _safeNotify(() => notifyPasswordChangedCustomer(user.id));

  // Thường đổi mật khẩu xong là bắt user login lại → không cần trả token mới
  return user;
};
