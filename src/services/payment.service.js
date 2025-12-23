// src/services/payment.service.js

import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import {
  PAYMENT_STATUS,
  PAYMENT_PROVIDER,
  BOOKING_STATUS,
  NOTIFICATION_TYPE,
} from "../constants/index.js";
import * as notificationService from "./notification.service.js";
import * as emailService from "./email.service.js"; // ✅ NEW
import { _safeNotify, notifyBookingPaymentFailed, notifyBookingPaymentSuccess } from "../utils/notificationHelper.util.js";

const { Booking, User, Restaurant } = models;

/**
 * Tính toán thông tin đặt cọc ban đầu cho booking
 * - Nếu nhà hàng không yêu cầu cọc hoặc default_deposit_amount <= 0:
 *    -> deposit_amount = 0, payment_status = NONE
 * - Nếu yêu cầu cọc:
 *    -> deposit_amount = default_deposit_amount
 *    -> payment_status = PENDING (chờ thanh toán)
 */
export const computeInitialPaymentForBooking = (restaurant) => {
  const requireDeposit = Boolean(restaurant.require_deposit);
  const defaultAmount = restaurant.default_deposit_amount || 0;

  if (!requireDeposit || defaultAmount <= 0) {
    return {
      depositAmount: 0,
      paymentStatus: PAYMENT_STATUS.NONE,
    };
  }

  return {
    depositAmount: defaultAmount,
    paymentStatus: PAYMENT_STATUS.PENDING,
  };
};

/**
 * Thanh toán cọc cho booking (miniapp)
 *
 * Flow:
 * - Chỉ áp dụng cho booking có deposit_amount > 0
 * - Cho phép mock:
 *    - mock_result = "FAILED"  -> payment_status = FAILED
 *    - mock_result = "SUCCESS" -> payment_status = PAID
 * - Chỉ cho thanh toán khi:
 *    - booking thuộc về userId
 *    - booking.status đang PENDING (hoặc CONFIRMED nếu bạn cho phép, nhưng tôi khoá ở PENDING cho rõ)
 *    - payment_status là PENDING hoặc FAILED (cho phép retry nếu trước đó FAILED)
 */

// ...  existing functions (computeInitialPaymentForBooking)

export const payDepositForBooking = async (userId, bookingId, payload) => {
  const { provider, mock_result } = payload;

  const booking = await Booking.findByPk(bookingId);

  if (!booking || booking.user_id !== userId) {
    throw new AppError("Booking không tồn tại hoặc không thuộc về bạn", 404);
  }

  if (booking.deposit_amount <= 0) {
    throw new AppError("Booking này không yêu cầu đặt cọc", 400);
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(
      "Chỉ có thể thanh toán cọc cho booking đang ở trạng thái PENDING",
      400
    );
  }

  if (
    ![PAYMENT_STATUS.PENDING, PAYMENT_STATUS.FAILED].includes(
      booking.payment_status
    )
  ) {
    throw new AppError(
      "Trạng thái thanh toán hiện tại không cho phép thanh toán cọc",
      400
    );
  }

  if (provider && !Object.values(PAYMENT_PROVIDER).includes(provider)) {
    throw new AppError("Phương thức thanh toán không hợp lệ", 400);
  }

  const result = (mock_result || "SUCCESS").toUpperCase();

  // ✅ Lấy thông tin user và restaurant để gửi email
  const user = await User.findByPk(userId);
  const restaurant = await Restaurant.findByPk(booking.restaurant_id);

  // CASE:  giả lập thất bại
  if (result === "FAILED") {
    booking.payment_status = PAYMENT_STATUS.FAILED;
    booking.payment_provider = null;
    booking.payment_reference = null;
    booking.paid_at = null;
    await booking.save();

    // Thông báo
    await _safeNotify(
      notifyBookingPaymentFailed(booking, booking.deposit_amount, restaurant)
    );

    // ✅ NEW: Gửi email thanh toán thất bại
    try {
      await emailService.sendPaymentFailedEmail(booking, user, restaurant);
      console.log("✅ Email thanh toán thất bại đã được gửi");
    } catch (err) {
      console.error("❌ Lỗi khi gửi email thanh toán thất bại:", err);
      // Không throw error - payment vẫn đã được xử lý
    }

    return booking;
  }

  // CASE: giả lập thành công
  if (result === "SUCCESS") {
    booking.payment_status = PAYMENT_STATUS.PAID;
    booking.payment_provider = provider || PAYMENT_PROVIDER.ZALOPAY;
    booking.paid_at = new Date();
    booking.payment_reference = `PAY-${booking.id}-${Date.now()}`;
    await booking.save();

    // Thông báo cho khách
    await _safeNotify(
      notifyBookingPaymentSuccess(booking, restaurant, booking.deposit_amount)
    );

    // Thông báo cho nhà hàng
    await _safeNotify(
      notifyBookingPaymentSuccess(booking, restaurant, booking.deposit_amount)
       
    );

    // ✅ NEW: Gửi email xác nhận thanh toán thành công
    try {
      await emailService.sendPaymentSuccessEmail(booking, user, restaurant);
      console.log("✅ Email xác nhận thanh toán đã được gửi tới:", user.email);
    } catch (err) {
      console.error("❌ Lỗi khi gửi email xác nhận thanh toán:", err);
      // Không throw error - thanh toán đã thành công rồi
    }

    return booking;
  }

  throw new AppError(
    "mock_result không hợp lệ, chỉ nhận SUCCESS hoặc FAILED",
    400
  );
};

/**
 * Xử lý hoàn cọc khi HUỶ BOOKING
 *
 * Policy đã chốt:
 * - Nếu thanh toán thành công (PAID) và khách TỰ HUỶ:
 *    -> được hoàn cọc (REFUNDED)
 * - Nếu NO_SHOW -> không hoàn cọc
 *
 * Hàm này:
 * - Chỉ chỉnh field payment_* trên instance booking (KHÔNG save),
 *   để service booking gom lại save 1 lần.
 *
 * @param {Booking} booking - instance Sequelize
 * @param {Object} options
 * @param {"USER"|"RESTAURANT"} options.by - ai là người huỷ (dùng cho policy sau này nếu cần phân biệt)
 */
// ✅ NEW: Update refund function để gửi email
export const maybeRefundDepositOnCancel = async (booking, { by } = {}) => {
  if (booking.deposit_amount <= 0) return;
  if (booking.payment_status !== PAYMENT_STATUS.PAID) return;

  booking.payment_status = PAYMENT_STATUS.REFUNDED;
  booking.refunded_at = new Date();

  // ✅ Gửi email xác nhận hoàn tiền
  try {
    const user = await User.findByPk(booking.user_id);
    const restaurant = await Restaurant.findByPk(booking.restaurant_id);

    if (user && restaurant) {
      await emailService.sendRefundEmail(booking, user, restaurant);
      console.log("✅ Email xác nhận hoàn tiền đã được gửi");
    }
  } catch (err) {
    console.error("❌ Lỗi khi gửi email hoàn tiền:", err);
  }
};
