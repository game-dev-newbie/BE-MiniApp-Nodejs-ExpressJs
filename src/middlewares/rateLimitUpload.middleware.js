// src/middlewares/rateLimitUpload.middleware.js

import rateLimit from "express-rate-limit";
import { AppError } from "../utils/appError.js";

/**
 * ✅ General rate limiter for all upload endpoints
 * Max 20 uploads per 15 minutes per IP/user
 *
 * Usage:  Apply to all upload routes
 */
export const uploadRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // Max 20 requests per windowMs

  // ✅ Custom key generator - rate limit per user, not per IP
  keyGenerator: (req) => {
    // Priority: user_id > account_id > IP
    const userId = req.user?.id;
    const accountId = req.restaurantAccount?.id;

    if (userId) {
      return `user_${userId}`;
    }
    if (accountId) {
      return `account_${accountId}`;
    }
    return req.ip; // Fallback to IP
  },

  // ✅ Custom error message
  message: {
    success: false,
    message: "Bạn đã upload quá nhiều file.  Vui lòng thử lại sau 15 phút.",
    statusCode: 429,
  },

  // ✅ Standard headers for rate limit info
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers

  // ✅ Custom handler for rate limit exceeded
  handler: (req, res) => {
    const error = new AppError(
      "Bạn đã upload quá nhiều file. Vui lòng thử lại sau 15 phút.",
      429
    );

    return res.status(429).json({
      success: false,
      message: error.message,
      statusCode: 429,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000), // Seconds until reset
    });
  },

  // ✅ Skip rate limiting for certain conditions
  skip: (req) => {
    // Skip for test routes (optional)
    if (req.path.includes("/test-")) {
      return true;
    }
    return false;
  },
});

/**
 * ✅ Stricter rate limiter for avatar uploads
 * Max 5 uploads per 10 minutes per user
 *
 * Usage: Apply to avatar upload routes only
 * - /images/users/avatar
 * - /images/restaurant-accounts/avatar
 */
export const avatarUploadRateLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 5, // Max 5 requests per windowMs

  // ✅ Rate limit per user/account
  keyGenerator: (req) => {
    const userId = req.user?.id;
    const accountId = req.restaurantAccount?.id;

    if (userId) {
      return `avatar_user_${userId}`;
    }
    if (accountId) {
      return `avatar_account_${accountId}`;
    }
    return `avatar_ip_${req.ip}`;
  },

  message: {
    success: false,
    message:
      "Bạn đã thay đổi avatar quá nhiều lần. Vui lòng thử lại sau 10 phút.",
    statusCode: 429,
  },

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    const error = new AppError(
      "Bạn đã thay đổi avatar quá nhiều lần.  Vui lòng thử lại sau 10 phút.",
      429
    );

    return res.status(429).json({
      success: false,
      message: error.message,
      statusCode: 429,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },

  skip: (req) => {
    if (req.path.includes("/test-")) {
      return true;
    }
    return false;
  },
});

/**
 * ✅ Ultra-strict rate limiter for multiple file uploads
 * Max 10 multi-upload requests per 30 minutes
 *
 * Usage: Apply to routes that accept multiple files
 * - /images/restaurants/galleries
 * - /images/restaurants/menus
 */
export const multipleUploadRateLimiter = rateLimit({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10, // Max 10 multi-upload requests

  keyGenerator: (req) => {
    const accountId = req.restaurantAccount?.id;
    if (accountId) {
      return `multi_upload_account_${accountId}`;
    }
    return `multi_upload_ip_${req.ip}`;
  },

  message: {
    success: false,
    message:
      "Bạn đã upload quá nhiều ảnh cùng lúc. Vui lòng thử lại sau 30 phút.",
    statusCode: 429,
  },

  standardHeaders: true,
  legacyHeaders: false,

  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message:
        "Bạn đã upload quá nhiều ảnh cùng lúc.  Vui lòng thử lại sau 30 phút.",
      statusCode: 429,
      retryAfter: Math.ceil(req.rateLimit.resetTime / 1000),
    });
  },
});
