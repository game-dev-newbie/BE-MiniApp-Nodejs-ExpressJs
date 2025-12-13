// src/services/review.service.js

import { Op } from "sequelize";
import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { BOOKING_STATUS, REVIEW_STATUS } from "../constants/index.js";
import time from "../utils/time.js";

const { Review, Booking, RestaurantAccount, Restaurant, User } = models;

// Lấy booking của đúng user, đúng id, nếu không thì bắn lỗi
const getBookingOfUserOrThrow = async (userId, bookingId) => {
  const booking = await Booking.findOne({
    where: {
      id: bookingId,
      user_id: userId,
    },
  });

  if (!booking) {
    throw new AppError("Không tìm thấy booking tương ứng với user", 404);
  }

  return booking;
};

// Đảm bảo review thuộc về nhà hàng của account dashboard
const getReviewUnderRestaurant = async (accountId, reviewId) => {
  const account = await RestaurantAccount.findByPk(accountId);

  if (!account || !account.restaurant_id) {
    throw new AppError(
      "Tài khoản nhà hàng không hợp lệ hoặc chưa gắn với nhà hàng",
      403
    );
  }

  const review = await Review.findOne({
    where: {
      id: reviewId,
      restaurant_id: account.restaurant_id,
    },
  });

  if (!review) {
    throw new AppError(
      "Không tìm thấy review thuộc về nhà hàng của tài khoản này",
      404
    );
  }

  return { account, review };
};

// ==================================
// 1) MINIAPP – TẠO REVIEW TỪ BOOKING COMPLETED
// ==================================

/**
 * User tạo review từ 1 booking đã COMPLETED
 * - mỗi booking tối đa 1 review tại 1 thời điểm
 * - không có flow update, nhưng user có thể xóa review rồi tạo lại
 */
export const createReviewFromBooking = async (userId, bookingId, payload) => {
  const { rating, comment } = payload;

  const booking = await getBookingOfUserOrThrow(userId, bookingId);

  if (booking.status !== BOOKING_STATUS.COMPLETED) {
    throw new AppError(
      "Chỉ có thể đánh giá sau khi booking đã hoàn tất (COMPLETED)",
      400
    );
  }

  // Check 1 booking chỉ có 1 review
  const existing = await Review.findOne({
    where: { booking_id: booking.id },
  });

  if (existing) {
    throw new AppError("Booking này đã được đánh giá rồi", 400);
  }

  const review = await Review.create({
    booking_id: booking.id,
    restaurant_id: booking.restaurant_id,
    user_id: userId,
    rating,
    comment: comment || null,
    status: REVIEW_STATUS.VISIBLE,
  });

  // Có thể include thêm quan hệ nếu cần cho response
  const fullReview = await Review.findByPk(review.id, {
    include: [
      { model: Restaurant, as: "restaurant" },
      { model: User, as: "user" },
      { model: Booking, as: "booking" },
      { model: RestaurantAccount, as: "reply_account" },
    ],
  });

  // TODO: gửi notification REVIEW_CREATED cho dashboard nếu bạn muốn

  return fullReview;
};

// ==================================
// 2) MINIAPP – LIST MY REVIEWS (LỌC REPLIED / NOT_REPLIED)
// ==================================

/**
 * Lấy danh sách review của chính user
 * reply_status:
 *  - "all" (default)
 *  - "replied"     -> reply_comment IS NOT NULL
 *  - "not_replied" -> reply_comment IS NULL
 */
export const listMyReviews = async (userId, filters = {}) => {
  const {
    reply_status, // "all" | "replied" | "not_replied"
    limit = 20,
    offset = 0,
  } = filters;

  const where = {
    user_id: userId,
    status: REVIEW_STATUS.VISIBLE, // miniapp chỉ xem review đang hiển thị
  };

  const normalizedReplyStatus = reply_status
    ? String(reply_status).trim().toLowerCase()
    : "all";

  if (normalizedReplyStatus === "replied") {
    where.reply_comment = {
      [Op.not]: null,
    };
  } else if (normalizedReplyStatus === "not_replied") {
    where.reply_comment = null;
  }

  const parsedLimit = Number.isNaN(Number(limit)) ? 20 : Number(limit);
  const parsedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

  const { rows, count } = await Review.findAndCountAll({
    where,
    include: [
      { model: Restaurant, as: "restaurant" },
      { model: Booking, as: "booking" },
      { model: RestaurantAccount, as: "reply_account" },
    ],
    order: [["created_at", "DESC"]],
    limit: parsedLimit,
    offset: parsedOffset,
  });

  return {
    items: rows,
    total: count,
    limit: parsedLimit,
    offset: parsedOffset,
  };
};

// ==================================
// 3) MINIAPP – DELETE REVIEW (ĐỂ USER REVIEW LẠI)
// ==================================

export const deleteMyReview = async (userId, reviewId) => {
  const review = await Review.findOne({
    where: {
      id: reviewId,
      user_id: userId,
    },
  });

  if (!review) {
    throw new AppError("Không tìm thấy review của user", 404);
  }

  // Hard delete: xóa hẳn record
  await review.destroy();

  return true;
};

// ==================================
// 4) MINIAPP – LIST REVIEWS CỦA MỘT NHÀ HÀNG
// ==================================

/**
 * Cho miniapp xem list review của 1 restaurant
 * sort:
 *  - "latest" (default)   -> mới nhất
 *  - "rating_desc"        -> rating cao tới thấp
 */
export const listRestaurantReviewsForMiniApp = async (
  restaurantId,
  filters = {}
) => {
  const { sort = "latest", limit = 20, offset = 0 } = filters;

  const where = {
    restaurant_id: restaurantId,
    status: REVIEW_STATUS.VISIBLE,
  };

  const parsedLimit = Number.isNaN(Number(limit)) ? 20 : Number(limit);
  const parsedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

  let order;
  if (sort === "rating_desc") {
    order = [
      ["rating", "DESC"],
      ["created_at", "DESC"],
    ];
  } else {
    order = [["created_at", "DESC"]];
  }

  const { rows, count } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, as: "user" },
      { model: Booking, as: "booking" },
      { model: RestaurantAccount, as: "reply_account" },
    ],
    order,
    limit: parsedLimit,
    offset: parsedOffset,
  });

  return {
    items: rows,
    total: count,
    limit: parsedLimit,
    offset: parsedOffset,
  };
};

// ==================================
// 5) DASHBOARD – LIST REVIEWS CỦA NHÀ HÀNG
// ==================================

/**
 * Dashboard list review nhà hàng với filter:
 *  - rating_min, rating_max
 *  - status: VISIBLE / HIDDEN / REPORTED
 *  - from_time, to_time: filter created_at
 */
export const listRestaurantReviewsForDashboard = async (
  restaurantId,
  filters = {}
) => {
  const {
    rating, // CHỈ 1 con số, vd: 5 -> lọc tất cả review rating = 5
    status,
    from_time, // string
    to_time, // string
    limit = 20,
    offset = 0,
  } = filters;

  const where = {
    restaurant_id: restaurantId,
  };

  // ---- filter status: VISIBLE / HIDDEN / REPORTED ----
  if (status && Object.values(REVIEW_STATUS).includes(status)) {
    where.status = status;
  }

  // ---- filter rating: chỉ 1 giá trị ----
  if (typeof rating !== "undefined") {
    const ratingNum = Number(rating);
    if (!Number.isNaN(ratingNum)) {
      where.rating = ratingNum; // ví dụ: rating=4 -> lấy tất cả review có rating = 4
    }
  }

  // ---- filter theo khoảng thời gian created_at (from_time / to_time) ----
  const parseDateTime = (value) => {
    if (!value) return undefined;
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return undefined;
    return d;
  };

  const fromTime = parseDateTime(from_time);
  const toTime = parseDateTime(to_time);

  if (fromTime || toTime) {
    where.created_at = {};
    if (fromTime) {
      where.created_at[Op.gte] = fromTime;
    }
    if (toTime) {
      where.created_at[Op.lte] = toTime;
    }
  }

  const parsedLimit = Number.isNaN(Number(limit)) ? 20 : Number(limit);
  const parsedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

  const { rows, count } = await Review.findAndCountAll({
    where,
    include: [
      { model: User, as: "user" },
      { model: Booking, as: "booking" },
      { model: RestaurantAccount, as: "reply_account" },
    ],
    order: [["created_at", "DESC"]],
    limit: parsedLimit,
    offset: parsedOffset,
  });

  return {
    items: rows,
    total: count,
    limit: parsedLimit,
    offset: parsedOffset,
  };
};

// ==================================
// 6) DASHBOARD – REPLY REVIEW
// ==================================

/**
 * Dashboard reply 1 review
 * - nếu lần đầu: set reply_comment + reply_account_id + reply_created_at + reply_updated_at
 * - nếu đã có: update reply_comment + reply_updated_at
 */
export const replyReview = async (accountId, reviewId, payload) => {
  const { comment } = payload;

  const { account, review } = await getReviewUnderRestaurant(
    accountId,
    reviewId
  );

  const now = new Date();

  if (!review.reply_created_at) {
    // lần đầu reply
    review.reply_created_at = now;
  }

  review.reply_comment = comment;
  review.reply_account_id = account.id;
  review.reply_updated_at = now;

  await review.save();

  const fullReview = await Review.findByPk(review.id, {
    include: [
      { model: User, as: "user" },
      { model: Booking, as: "booking" },
      { model: RestaurantAccount, as: "reply_account" },
    ],
  });

  return fullReview;
};
