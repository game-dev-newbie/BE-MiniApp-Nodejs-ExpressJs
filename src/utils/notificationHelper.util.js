// src/utils/notificationHelper.util.js

import {
  NOTIFICATION_TYPE,
  NOTIFICATION_TARGET_TYPE,
} from "../constants/index.js";
import * as notificationService from "../services/notification.service.js";

// Fire-and-forget: không làm fail nghiệp vụ nếu notification lỗi
export const _safeNotify = async (fn) => {
  try {
    await fn();
  } catch (e) {
    // eslint-disable-next-line no-console
    console.error("[Notification] failed:", e?.message || e);
  }
};

/**
 * ==========================================================
 * INTERNAL HELPERS
 * ==========================================================
 */

const trimText = (s) => (typeof s === "string" ? s.trim() : s);

/**
 * Wrapper để đảm bảo title/message sạch sẽ + meta là JSON object
 */
const create = async (payload) => {
  const { title, message, meta, ...rest } = payload;

  return notificationService.createNotification({
    ...rest,
    title: trimText(title),
    message: trimText(message),
    // meta: nếu undefined thì bỏ qua để service dùng default null
    ...(meta !== undefined ? { meta } : {}),
  });
};

/**
 * Meta chuẩn cho booking (giữ keys cũ + bổ sung vài field hữu ích)
 */
const buildBookingMeta = (booking, restaurant, extra = {}) => ({
  bookingId: booking?.id ?? null,
  restaurantId: restaurant?.id ?? booking?.restaurant_id ?? null,
  bookingTime: booking?.booking_time ?? null,

  // extra useful (không phá FE vì chỉ thêm key)
  userId: booking?.user_id ?? null,
  tableId: booking?.table_id ?? null,
  status: booking?.status ?? null,
  peopleCount: booking?.people_count ?? null,
  customerName: booking?.customer_name ?? null,
  phone: booking?.phone ?? null,

  ...extra,
});

/**
 * Meta chuẩn cho staff (giữ keys cũ + bổ sung)
 */
const buildStaffMeta = (staff, extra = {}) => ({
  staffId: staff?.id ?? null,
  staffEmail: staff?.email ?? null,
  staffName: staff?.full_name ?? null,

  role: staff?.role ?? null,
  status: staff?.status ?? null,
  restaurantId: staff?.restaurant_id ?? null,

  ...extra,
});

/**
 * Meta chuẩn cho review (giữ keys cũ + bổ sung)
 */
const buildReviewMeta = (review, user, restaurant, extra = {}) => ({
  reviewId: review?.id ?? null,
  rating: review?.rating ?? null,
  userId: user?.id ?? review?.user_id ?? null,
  bookingId: review?.booking_id ?? null,
  restaurantId: restaurant?.id ?? review?.restaurant_id ?? null,

  ...extra,
});

/**
 * ==========================================================
 * BOOKING NOTIFICATIONS
 * ==========================================================
 */

export const notifyBookingCreatedToCustomer = async (booking, restaurant) => {
  return create({
    userId: booking.user_id,
    type: NOTIFICATION_TYPE.BOOKING_CREATED,
    title: "Booking được tạo thành công",
    message: `Bạn đã tạo booking thành công tại nhà hàng ${restaurant.name}.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

export const notifyBookingCreatedToDashboard = async (booking, restaurant) => {
  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.BOOKING_CREATED,
    title: "Có booking mới",
    message: `Khách hàng ${booking.customer_name} vừa tạo booking mới tại nhà hàng của bạn.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

export const notifyBookingUpdatedToCustomer = async (booking, restaurant) => {
  return create({
    userId: booking.user_id,
    type: NOTIFICATION_TYPE.BOOKING_UPDATED,
    title: "Booking đã được cập nhật",
    message: `Booking của bạn tại nhà hàng ${restaurant.name} đã được thay đổi thành công.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

export const notifyBookingConfirmed = async (booking, restaurant) => {
  return create({
    userId: booking.user_id,
    type: NOTIFICATION_TYPE.BOOKING_CONFIRMED,
    title: "Booking đã được xác nhận",
    message: `Booking của bạn tại nhà hàng ${restaurant.name} đã được xác nhận.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

export const notifyBookingCancelledToDashboard = async (
  booking,
  restaurant
) => {
  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
    title: "Booking bị hủy",
    message: `Khách hàng ${booking.customer_name} đã hủy booking tại nhà hàng của bạn.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

export const notifyBookingCancelledToCustomer = async (booking, restaurant) => {
  return create({
    userId: booking.user_id,
    type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
    title: "Booking đã bị hủy",
    message: `Booking của bạn tại nhà hàng ${restaurant.name} đã bị hủy.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

/**
 * Dashboard nhận thông báo khi customer cập nhật booking
 */
export const notifyBookingUpdatedToDashboard = async (
  booking,
  restaurant,
  customerDisplayName
) => {
  const customerName =
    customerDisplayName || booking.customer_name || "Khách hàng";

  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.BOOKING_UPDATED,
    title: "Booking được cập nhật",
    message: `Khách hàng ${customerName} vừa cập nhật booking.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

/**
 * Customer tự hủy booking → thông báo cho chính customer
 */
export const notifyBookingCancelledByCustomerToCustomer = async (
  booking,
  restaurant
) => {
  return create({
    userId: booking.user_id,
    type: NOTIFICATION_TYPE.BOOKING_CANCELLED,
    title: "Huỷ booking thành công",
    message: `Bạn đã huỷ booking của mình tại nhà hàng ${restaurant.name}.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

export const notifyBookingCompleted = async (booking, restaurant) => {
  return create({
    userId: booking.user_id,
    type: NOTIFICATION_TYPE.BOOKING_COMPLETED,
    title: "Booking đã hoàn tất",
    message: `Booking của bạn tại nhà hàng ${restaurant.name} đã hoàn tất. Cảm ơn bạn đã sử dụng dịch vụ!`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

export const notifyBookingNoShow = async (booking, restaurant) => {
  return create({
    userId: booking.user_id,
    type: NOTIFICATION_TYPE.BOOKING_NO_SHOW,
    title: "Bạn đã không đến",
    message: `Booking của bạn tại nhà hàng ${restaurant.name} đã được đánh dấu là không đến.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant),
  });
};

export const notifyBookingRefundSuccess = async (
  booking,
  restaurant,
  refundAmount
) => {
  return create({
    userId: booking.user_id,
    type: NOTIFICATION_TYPE.BOOKING_REFUND_SUCCESS,
    title: "Hoàn tiền thành công",
    message: `Tiền cọc ${refundAmount.toLocaleString(
      "vi-VN"
    )} VNĐ cho booking tại ${restaurant.name} đã được hoàn lại.`,
    targetType: NOTIFICATION_TARGET_TYPE.BOOKING,
    targetId: booking.id,
    meta: buildBookingMeta(booking, restaurant, { refundAmount }),
  });
};

/**
 * ==========================================================
 * STAFF NOTIFICATIONS
 * ==========================================================
 */

export const notifyStaffRegistered = async (staff, restaurant) => {
  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.STAFF_REGISTERED,
    title: "Nhân viên mới đăng ký",
    message: `${staff.full_name} (${staff.email}) vừa đăng ký làm nhân viên.  Vui lòng kiểm tra và phê duyệt.`,
    targetType: NOTIFICATION_TARGET_TYPE.STAFF,
    targetId: staff.id,
    meta: buildStaffMeta(staff),
  });
};

export const notifyStaffApproved = async (staff, restaurant) => {
  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.STAFF_APPROVED,
    title: "Nhân viên được phê duyệt",
    message: `Nhân viên ${staff.full_name} đã được phê duyệt thành công.`,
    targetType: NOTIFICATION_TARGET_TYPE.STAFF,
    targetId: staff.id,
    meta: buildStaffMeta(staff),
  });
};

export const notifyStaffRejected = async (staff, restaurant) => {
  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.STAFF_REJECTED,
    title: "Nhân viên bị từ chối",
    message: `Nhân viên ${staff.full_name} đã bị từ chối.`,
    targetType: NOTIFICATION_TARGET_TYPE.STAFF,
    targetId: staff.id,
    meta: buildStaffMeta(staff),
  });
};

export const notifyStaffLocked = async (staff, restaurant) => {
  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.STAFF_LOCKED,
    title: "Nhân viên bị khóa",
    message: `Nhân viên ${staff.full_name} đã bị khóa.`,
    targetType: NOTIFICATION_TARGET_TYPE.STAFF,
    targetId: staff.id,
    meta: buildStaffMeta(staff),
  });
};

export const notifyStaffUnlocked = async (staff, restaurant) => {
  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.STAFF_UNLOCKED,
    title: "Nhân viên được mở khóa",
    message: `Nhân viên ${staff.full_name} đã được mở khóa.`,
    targetType: NOTIFICATION_TARGET_TYPE.STAFF,
    targetId: staff.id,
    meta: buildStaffMeta(staff),
  });
};

/**
 * ==========================================================
 * REVIEW NOTIFICATIONS
 * ==========================================================
 */

export const notifyReviewCreated = async (review, user, restaurant) => {
  const commentPreview = review.comment
    ? `"${review.comment.substring(0, 50)}${
        review.comment.length > 50 ? "..." : ""
      }"`
    : "";

  return create({
    restaurantId: restaurant.id,
    type: NOTIFICATION_TYPE.REVIEW_CREATED,
    title: "Đánh giá mới",
    message: `${user.display_name} vừa đánh giá ${review.rating} sao cho nhà hàng ${restaurant.name}. ${commentPreview}`,
    targetType: NOTIFICATION_TARGET_TYPE.REVIEW,
    targetId: review.id,
    meta: buildReviewMeta(review, user, restaurant),
  });
};

export const notifyReviewReplied = async (review, restaurant) => {
  return create({
    userId: review.user_id,
    type: NOTIFICATION_TYPE.REVIEW_REPLIED,
    title: "Nhà hàng đã phản hồi đánh giá",
    message: `Nhà hàng ${restaurant.name} đã phản hồi đánh giá của bạn.`,
    targetType: NOTIFICATION_TARGET_TYPE.REVIEW,
    targetId: review.id,
    meta: {
      reviewId: review.id,
      restaurantId: restaurant.id,
      bookingId: review.booking_id ?? null,
    },
  });
};

/**
 * ==========================================================
 * SECURITY / PROFILE NOTIFICATIONS
 * ==========================================================
 */

export const notifyPasswordChangedCustomer = async (userId) => {
  return create({
    userId,
    type: NOTIFICATION_TYPE.PASSWORD_CHANGED,
    title: "Mật khẩu đã được thay đổi",
    message:
      "Mật khẩu của bạn đã được thay đổi thành công. Vui lòng đăng nhập lại.",
    targetType: NOTIFICATION_TARGET_TYPE.USER,
    targetId: userId,
  });
};

export const notifyPasswordChangedRestaurant = async (
  restaurantId,
  accountId
) => {
  return create({
    restaurantId,
    type: NOTIFICATION_TYPE.PASSWORD_CHANGED,
    title: "Mật khẩu đã được thay đổi",
    message:
      "Mật khẩu của bạn đã được thay đổi thành công. Vui lòng đăng nhập lại.",
    targetType: NOTIFICATION_TARGET_TYPE.RESTAURANT_ACCOUNT,
    targetId: accountId,
  });
};

export const notifyProfileUpdatedCustomer = async (userId) => {
  return create({
    userId,
    type: NOTIFICATION_TYPE.PROFILE_UPDATED,
    title: "Cập nhật thông tin thành công",
    message: "Thông tin tài khoản của bạn đã được cập nhật.",
    targetType: NOTIFICATION_TARGET_TYPE.USER,
    targetId: userId,
  });
};

export const notifyProfileUpdatedRestaurant = async (
  restaurantId,
  accountId
) => {
  return create({
    restaurantId,
    type: NOTIFICATION_TYPE.PROFILE_UPDATED,
    title: "Cập nhật thông tin thành công",
    message: "Thông tin tài khoản của bạn đã được cập nhật.",
    targetType: NOTIFICATION_TARGET_TYPE.RESTAURANT_ACCOUNT,
    targetId: accountId,
  });
};
