// src/services/passwordReset.service.js

import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { SUBJECT_TYPES } from "../constants/index.js";
import { hashPassword } from "../utils/password.util.js";
import { revokeAllTokensForSubject } from "./token.service.js";
import { Op } from "sequelize";
import * as emailService from "./email.service.js";
import crypto from "crypto";

const { User, RestaurantAccount, PasswordResetToken } = models;

/**
 * Generate random 6-digit token
 */
const generateResetToken = () => {
  return crypto.randomInt(100000, 999999).toString(); // 6 digits
};

/**
 * Clean up expired tokens (optional - can run as cron job)
 */
export const cleanupExpiredTokens = async () => {
  const now = new Date();

  const deleted = await PasswordResetToken.destroy({
    where: {
      expires_at: {
        [Op.lt]: now,
      },
    },
  });

  console.log(`🗑️ Cleaned up ${deleted} expired reset tokens`);
  return deleted;
};

/**
 * Forgot Password - Dashboard (RestaurantAccount)
 */
export const forgotPasswordDashboard = async (email) => {
  // 1. Check account exists
  const account = await RestaurantAccount.findOne({
    where: { email },
    attributes: ["id", "email", "full_name"],
  });

  if (!account) {
    // ⚠️ Security: Don't reveal if email exists or not
    // Return success even if email doesn't exist
    console.log(`⚠️ Forgot password attempt for non-existent email: ${email}`);
    return {
      success: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
    };
  }

  // 2. Delete old unused tokens for this email
  await PasswordResetToken.destroy({
    where: {
      email: account.email,
      subject_type: SUBJECT_TYPES.RESTAURANT_ACCOUNT,
      used_at: null,
    },
  });

  // 3. Generate reset token
  const resetToken = generateResetToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // 4. Save to database
  await PasswordResetToken.create({
    email: account.email,
    subject_type: SUBJECT_TYPES.RESTAURANT_ACCOUNT,
    reset_token: resetToken,
    expires_at: expiresAt,
  });

  // 5. Send email
  try {
    await emailService.sendPasswordResetEmail({
      email: account.email,
      displayName: account.full_name,
      resetToken,
      expiresInMinutes: 15,
      subjectType: SUBJECT_TYPES.RESTAURANT_ACCOUNT,
    });

    console.log(`✅ Password reset email sent to:  ${account.email}`);
  } catch (error) {
    console.error(`❌ Failed to send reset email: `, error);
    throw new AppError("Không thể gửi email.  Vui lòng thử lại sau.", 500);
  }

  return {
    success: true,
    message: "Email hướng dẫn đặt lại mật khẩu đã được gửi",
  };
};

/**
 * Forgot Password - MiniApp (User/Customer)
 */
export const forgotPasswordMiniApp = async (email) => {
  // 1. Check user exists
  const user = await User.findOne({
    where: { email },
    attributes: ["id", "email", "display_name", "password_hash"],
  });

  if (!user) {
    // Security: Don't reveal if email exists
    console.log(`⚠️ Forgot password attempt for non-existent email: ${email}`);
    return {
      success: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
    };
  }

  // 2. Check if user has password (Zalo users don't have password)
  if (!user.password_hash) {
    console.log(`⚠️ User ${email} has no password (Zalo login only)`);
    return {
      success: true,
      message: "Nếu email tồn tại, bạn sẽ nhận được hướng dẫn đặt lại mật khẩu",
    };
  }

  // 3. Delete old unused tokens
  await PasswordResetToken.destroy({
    where: {
      email: user.email,
      subject_type: SUBJECT_TYPES.CUSTOMER,
      used_at: null,
    },
  });

  // 4. Generate reset token
  const resetToken = generateResetToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

  // 5. Save to database
  await PasswordResetToken.create({
    email: user.email,
    subject_type: SUBJECT_TYPES.CUSTOMER,
    reset_token: resetToken,
    expires_at: expiresAt,
  });

  // 6. Send email
  try {
    await emailService.sendPasswordResetEmail({
      email: user.email,
      displayName: user.display_name,
      resetToken,
      expiresInMinutes: 15,
      subjectType: SUBJECT_TYPES.CUSTOMER,
    });

    console.log(`✅ Password reset email sent to: ${user.email}`);
  } catch (error) {
    console.error(`❌ Failed to send reset email:`, error);
    throw new AppError("Không thể gửi email. Vui lòng thử lại sau.", 500);
  }

  return {
    success: true,
    message: "Email hướng dẫn đặt lại mật khẩu đã được gửi",
  };
};

/**
 * Verify Reset Token (optional - for frontend validation)
 */
export const verifyResetToken = async (email, resetToken, subjectType) => {
  const tokenRecord = await PasswordResetToken.findOne({
    where: {
      email,
      reset_token: resetToken,
      subject_type: subjectType,
    },
    order: [["created_at", "DESC"]],
  });

  if (!tokenRecord) {
    throw new AppError("Mã xác nhận không hợp lệ", 400);
  }

  if (!tokenRecord.isValid()) {
    if (tokenRecord.used_at) {
      throw new AppError("Mã xác nhận đã được sử dụng", 400);
    }
    throw new AppError("Mã xác nhận đã hết hạn", 400);
  }

  return {
    valid: true,
    email: tokenRecord.email,
  };
};

/**
 * Reset Password - Dashboard
 */
export const resetPasswordDashboard = async (
  email,
  resetToken,
  newPassword
) => {
  // 1. Verify token
  const tokenRecord = await PasswordResetToken.findOne({
    where: {
      email,
      reset_token: resetToken,
      subject_type: SUBJECT_TYPES.RESTAURANT_ACCOUNT,
    },
    order: [["created_at", "DESC"]],
  });

  if (!tokenRecord) {
    throw new AppError("Mã xác nhận không hợp lệ", 400);
  }

  if (!tokenRecord.isValid()) {
    if (tokenRecord.used_at) {
      throw new AppError("Mã xác nhận đã được sử dụng", 400);
    }
    throw new AppError(
      "Mã xác nhận đã hết hạn.  Vui lòng yêu cầu mã mới.",
      400
    );
  }

  // 2. Find account
  const account = await RestaurantAccount.findOne({
    where: { email },
  });

  if (!account) {
    throw new AppError("Tài khoản không tồn tại", 404);
  }

  // 3. Update password
  const newHash = await hashPassword(newPassword);
  account.password_hash = newHash;
  await account.save();

  // 4. Mark token as used
  await tokenRecord.markAsUsed();

  // 5. Revoke all refresh tokens (force re-login)
  await revokeAllTokensForSubject(account.id, SUBJECT_TYPES.RESTAURANT_ACCOUNT);

  console.log(`✅ Password reset successful for account: ${email}`);

  return {
    success: true,
    message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
  };
};

/**
 * Reset Password - MiniApp
 */
export const resetPasswordMiniApp = async (email, resetToken, newPassword) => {
  // 1. Verify token
  const tokenRecord = await PasswordResetToken.findOne({
    where: {
      email,
      reset_token: resetToken,
      subject_type: SUBJECT_TYPES.CUSTOMER,
    },
    order: [["created_at", "DESC"]],
  });

  if (!tokenRecord) {
    throw new AppError("Mã xác nhận không hợp lệ", 400);
  }

  if (!tokenRecord.isValid()) {
    if (tokenRecord.used_at) {
      throw new AppError("Mã xác nhận đã được sử dụng", 400);
    }
    throw new AppError("Mã xác nhận đã hết hạn. Vui lòng yêu cầu mã mới.", 400);
  }

  // 2. Find user
  const user = await User.findOne({
    where: { email },
  });

  if (!user) {
    throw new AppError("Tài khoản không tồn tại", 404);
  }

  if (!user.password_hash) {
    throw new AppError("Tài khoản Zalo không hỗ trợ đặt lại mật khẩu", 400);
  }

  // 3. Update password
  const newHash = await hashPassword(newPassword);
  user.password_hash = newHash;
  await user.save();

  // 4. Mark token as used
  await tokenRecord.markAsUsed();

  // 5. Revoke all refresh tokens
  await revokeAllTokensForSubject(user.id, SUBJECT_TYPES.CUSTOMER);

  console.log(`✅ Password reset successful for user: ${email}`);

  return {
    success: true,
    message: "Đặt lại mật khẩu thành công. Vui lòng đăng nhập lại.",
  };
};
