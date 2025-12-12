// src/utils/password.util.js
import bcrypt from "bcrypt";

/**
 * Số vòng salt cho bcrypt, mặc định 10 nếu không config.
 */
const SALT_ROUNDS = 10;
/**
 * Hash mật khẩu thuần sang password_hash để lưu DB.
 * @param {string} plainPassword - mật khẩu người dùng nhập
 * @returns {Promise<string>} - password_hash
 */
export const hashPassword = async (plainPassword) => {
  if (!plainPassword) {
    throw new Error("plainPassword is required for hashPassword");
  }
  return bcrypt.hash(plainPassword, SALT_ROUNDS);
};

/**
 * So sánh mật khẩu thuần với hash trong DB.
 * @param {string} plainPassword
 * @param {string} passwordHash
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (plainPassword, passwordHash) => {
  if (!plainPassword || !passwordHash) {
    return false;
  }
  return bcrypt.compare(plainPassword, passwordHash);
};

export default {
  hashPassword,
  comparePassword,
};
