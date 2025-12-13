// src/services/booking.service.js

import { Op } from "sequelize";
import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import {
  BOOKING_STATUS,
  PAYMENT_STATUS,
  TABLE_STATUS,
} from "../constants/index.js";
import time from "../utils/time.js";
import * as paymentService from "../services/payment.service.js";

const { Booking, Restaurant, RestaurantTable, User, RestaurantAccount } =
  models;

/**
 * Merge booking_date + booking_time thành Date (DATETIME).
 */
const buildBookingDateTime = (booking_date, booking_time) => {
  // "2025-12-20" + "19:30" -> "2025-12-20T19:30:00"
  const dt = time.buildDateTimeFromDateAndTime(booking_date, booking_time);
  if (!dt) {
    throw new AppError("Thời gian đặt bàn không hợp lệ", 400);
  }
  return dt;
};

/**
 * Lấy account nhà hàng + chắc chắn có restaurant_id (dashboard).
 */
const getAccountWithRestaurant = async (accountId) => {
  const account = await RestaurantAccount.findByPk(accountId);

  if (!account) {
    throw new AppError("Tài khoản nhà hàng không tồn tại", 404);
  }

  if (!account.restaurant_id) {
    throw new AppError("Tài khoản này chưa gắn với nhà hàng nào", 400);
  }

  return account;
};

/**
 * Lấy booking và đảm bảo thuộc đúng restaurant (dashboard).
 */
const getBookingUnderRestaurant = async (accountId, bookingId) => {
  const account = await getAccountWithRestaurant(accountId);

  const booking = await Booking.findByPk(bookingId);

  if (!booking) {
    throw new AppError("Booking không tồn tại", 404);
  }

  if (booking.restaurant_id !== account.restaurant_id) {
    throw new AppError(
      "Bạn không có quyền thao tác với booking của nhà hàng khác",
      403
    );
  }

  return { account, booking };
};

/**
 * Kiểm tra bàn có rảnh ở thời điểm booking_time không.
 * Trùng slot nếu có booking cùng restaurant + table + booking_time
 * với status PENDING hoặc CONFIRMED.
 */
const isTableBusyAt = async (restaurantId, tableId, bookingDateTime) => {
  const count = await Booking.count({
    where: {
      restaurant_id: restaurantId,
      table_id: tableId,
      booking_time: bookingDateTime,
      status: {
        [Op.in]: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
      },
    },
  });

  return count > 0;
};

// ==================================
// 1) MINIAPP – GỢI Ý BÀN CÓ SỨC CHỨA
// ==================================

export const findAvailableTables = async ({
  restaurantId,
  booking_date,
  booking_time,
  people_count,
}) => {
  const restaurant = await Restaurant.findByPk(restaurantId);

  if (!restaurant || restaurant.is_active === false) {
    throw new AppError("Nhà hàng không tồn tại hoặc đã ngừng hoạt động", 404);
  }

  const bookingDateTime = buildBookingDateTime(booking_date, booking_time);

  // Lấy tất cả bàn còn hoạt động
  const allTables = await RestaurantTable.findAll({
    where: {
      restaurant_id: restaurantId,
      status: {
        [Op.ne]: TABLE_STATUS.INACTIVE,
      },
    },
  });

  if (!allTables.length) {
    throw new AppError("Nhà hàng chưa cấu hình bàn nào", 400);
  }

  const capacities = allTables.map((t) => t.capacity || 0);
  const maxCapacity = Math.max(...capacities);

  if (people_count > maxCapacity) {
    throw new AppError(
      `Nhà hàng chỉ hỗ trợ tối đa ${maxCapacity} người cho một bàn. Vui lòng giảm số lượng hoặc liên hệ trực tiếp nhà hàng.`,
      400
    );
  }

  // Lấy các booking đang giữ bàn tại thời điểm đó
  const busyBookings = await Booking.findAll({
    where: {
      restaurant_id: restaurantId,
      booking_time: bookingDateTime,
      status: {
        [Op.in]: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
      },
    },
  });

  const busyTableIds = new Set(busyBookings.map((b) => b.table_id));

  // Lọc ra bàn phù hợp
  const availableTables = allTables.filter((t) => {
    if (!t.capacity || t.capacity < people_count) return false;
    if (busyTableIds.has(t.id)) return false;
    return true;
  });

  return { restaurant, availableTables };
};

// ==================================
// 2) MINIAPP – TẠO BOOKING
// ==================================

export const createBookingForUser = async (userId, payload) => {
  const {
    restaurant_id,
    phone,
    customer_name,
    table_id,
    people_count,
    booking_date,
    booking_time,
    note,
  } = payload;

  const bookingDateTime = buildBookingDateTime(booking_date, booking_time);

  const now = new Date();
  if (bookingDateTime <= now) {
    throw new AppError("Không thể đặt bàn trong quá khứ", 400);
  }

  const restaurant = await Restaurant.findByPk(restaurant_id);
  if (!restaurant || restaurant.is_active === false) {
    throw new AppError("Nhà hàng không tồn tại hoặc đã ngừng hoạt động", 404);
  }

  const table = await RestaurantTable.findByPk(table_id);
  if (!table) {
    throw new AppError("Bàn không tồn tại", 404);
  }

  if (table.restaurant_id !== restaurant.id) {
    throw new AppError("Bàn không thuộc về nhà hàng được chọn", 400);
  }

  if (table.status === TABLE_STATUS.INACTIVE) {
    throw new AppError("Bàn này hiện đang không sử dụng", 400);
  }

  if (!table.capacity || table.capacity < people_count) {
    throw new AppError(
      `Bàn chỉ hỗ trợ tối đa ${table.capacity || 0} người`,
      400
    );
  }

  // Kiểm tra trùng slot
  const busy = await isTableBusyAt(restaurant.id, table.id, bookingDateTime);
  if (busy) {
    throw new AppError(
      "Bàn đã được đặt ở thời điểm này, vui lòng chọn bàn hoặc thời gian khác",
      400
    );
  }

  // (Optional) Có thể update thông tin phone user ở đây nếu muốn
  const user = await User.findByPk(userId);
  if (!user) {
    throw new AppError("Người dùng không tồn tại", 404);
  }

  // TÍNH TOÁN ĐẶT CỌC BAN ĐẦU DỰA VÀO CẤU HÌNH NHÀ HÀNG
  const { depositAmount, paymentStatus } =
    paymentService.computeInitialPaymentForBooking(restaurant);

  // Tạm thời không chơi đặt cọc phức tạp: deposit=0, payment_status=NONE
  const booking = await Booking.create({
    restaurant_id: restaurant.id,
    table_id: table.id,
    user_id: user.id,
    people_count,
    phone,
    customer_name,
    booking_time: bookingDateTime,
    status: BOOKING_STATUS.PENDING,
    deposit_amount: depositAmount,
    payment_status: paymentStatus,
    note: note || null,
  });

  return booking;
};

// ==================================
// 3) MINIAPP – LIST & DETAIL & CANCEL & UPDATE
// ==================================

export const listBookingsForUser = async (userId, filters = {}) => {
  const { category } = filters; // "upcoming" | "history" | "cancelled"

  const where = {
    user_id: userId,
  };

  const now = new Date();

  switch (category) {
    case "upcoming": {
      // Sắp tới: thời gian còn ở tương lai, chưa huỷ, chưa no_show, chưa complete
      where.status = {
        [Op.in]: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
      };
      where.booking_time = {
        [Op.gt]: now,
      };
      break;
    }

    case "history": {
      // Lịch sử: đã hoàn tất (đã check-in xong)
      where.status = BOOKING_STATUS.COMPLETED;
      break;
    }

    case "cancelled": {
      // Đã huỷ: huỷ + no_show
      where.status = {
        [Op.in]: [BOOKING_STATUS.CANCELLED, BOOKING_STATUS.NO_SHOW],
      };
      break;
    }

    default: {
      break;
    }
  }

  const bookings = await Booking.findAll({
    where,
    order: [["booking_time", "DESC"]],
  });

  return bookings;
};

export const getBookingDetailForUser = async (userId, bookingId) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking || booking.user_id !== userId) {
    throw new AppError("Booking không tồn tại", 404);
  }

  return booking;
};

export const cancelBookingByUser = async (userId, bookingId) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking || booking.user_id !== userId) {
    throw new AppError("Booking không tồn tại", 404);
  }

  if (
    ![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status)
  ) {
    throw new AppError(
      "Chỉ có thể huỷ booking đang ở trạng thái PENDING hoặc CONFIRMED",
      400
    );
  }

  // Nếu booking có cọc và đã thanh toán (PAID) -> hoàn cọc cho khách
  paymentService.maybeRefundDepositOnCancel(booking, { by: "USER" });

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  return booking;
};
/**
 * Customer update booking:
 * - chỉ cho phép khi booking đang PENDING
 * - cho phép đổi: customer_name, phone, people_count, booking_date/time, table_id, note
 * - nếu đổi thời gian hoặc đổi bàn hoặc đổi số người -> check trùng slot + sức chứa
 */
export const updateBookingByCustomer = async (userId, bookingId, payload) => {
  const booking = await Booking.findByPk(bookingId);

  if (!booking || booking.user_id !== userId) {
    throw new AppError("Booking không tồn tại", 404);
  }

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(
      "Chỉ có thể chỉnh sửa booking đang ở trạng thái PENDING",
      400
    );
  }

  const {
    customer_name,
    phone,
    people_count,
    booking_date,
    booking_time,
    table_id,
    note,
  } = payload;

  const wantsChangeTime = Boolean(booking_date || booking_time);
  if (wantsChangeTime && !(booking_date && booking_time)) {
    throw new AppError(
      "Khi thay đổi thời gian, cần gửi đầy đủ booking_date và booking_time",
      400
    );
  }

  // Nhà hàng của booking
  const restaurant = await Restaurant.findByPk(booking.restaurant_id);
  if (!restaurant || restaurant.is_active === false) {
    throw new AppError("Nhà hàng không tồn tại hoặc đã ngừng hoạt động", 404);
  }

  // Quyết định bàn mới: nếu không gửi table_id thì giữ bàn cũ
  const targetTableId =
    typeof table_id === "number" ? table_id : booking.table_id;

  const table = await RestaurantTable.findByPk(targetTableId);
  if (!table) {
    throw new AppError("Bàn không tồn tại", 404);
  }

  if (table.restaurant_id !== booking.restaurant_id) {
    throw new AppError("Bàn không thuộc về nhà hàng của booking", 400);
  }

  if (table.status === TABLE_STATUS.INACTIVE) {
    throw new AppError("Bàn này hiện không sử dụng", 400);
  }

  // Số người mới
  const newPeopleCount =
    typeof people_count === "number" ? people_count : booking.people_count;

  if (!table.capacity || table.capacity < newPeopleCount) {
    throw new AppError(
      `Bàn chỉ hỗ trợ tối đa ${table.capacity || 0} người`,
      400
    );
  }

  // Thời gian mới
  let newBookingTime = booking.booking_time;
  if (wantsChangeTime) {
    newBookingTime = buildBookingDateTime(booking_date, booking_time);
  }

  // Xác định xem người dùng đang thay đổi những gì
  const isChangingTable = targetTableId !== booking.table_id;
  const isChangingTime =
    wantsChangeTime &&
    newBookingTime.getTime() !== booking.booking_time.getTime();
  const isChangingPeople =
    typeof people_count === "number" && people_count !== booking.people_count;

  // Chỉ cần check xung đột slot khi đổi table hoặc đổi time
  const isChangingSlot = isChangingTable || isChangingTime;

  if (isChangingSlot) {
    const conflictCount = await Booking.count({
      where: {
        id: { [Op.ne]: booking.id },
        restaurant_id: booking.restaurant_id,
        table_id: targetTableId,
        booking_time: newBookingTime,
        status: {
          [Op.in]: [BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED],
        },
      },
    });

    if (conflictCount > 0) {
      let message = "Thời gian hoặc bàn mới bạn chọn đã có người đặt.";

      if (isChangingTable && !isChangingTime) {
        // Đổi bàn, giữ nguyên thời gian
        message =
          "Ở thời gian hiện tại, bàn mới bạn chọn đã có người đặt. Vui lòng chọn bàn khác.";
      } else if (!isChangingTable && isChangingTime) {
        // Đổi thời gian, giữ nguyên bàn
        message =
          "Ở thời gian mới bạn chọn, bàn hiện tại đã có người đặt. Vui lòng chọn thời gian khác.";
      } else if (isChangingTable && isChangingTime) {
        // Vừa đổi bàn vừa đổi thời gian
        message =
          "Ở thời gian mới và bàn mới bạn chọn đã có người đặt. Vui lòng chọn lại bàn hoặc thời gian khác.";
      }

      throw new AppError(message, 400);
    }
  }

  // Gán các field được phép sửa
  if (typeof customer_name === "string") {
    booking.customer_name = customer_name;
  }

  if (typeof phone === "string") {
    booking.phone = phone;
  }

  if (typeof note !== "undefined") {
    booking.note = note || null;
  }

  booking.people_count = newPeopleCount;
  booking.table_id = targetTableId;
  booking.booking_time = newBookingTime;

  await booking.save();

  return booking;
};

// ==================================
// 4) DASHBOARD – LIST & DETAIL
// ==================================

export const listBookingsForRestaurant = async (accountId, filters = {}) => {
  const account = await getAccountWithRestaurant(accountId);

  const where = {
    restaurant_id: account.restaurant_id,
  };

  const { status, from_date, to_date } = filters;

  if (status) {
    where.status = status;
  }

  const { start, end } = time.buildDayRange(from_date, to_date);

  if (start || end) {
    where.booking_time = {};
    if (start) where.booking_time[Op.gte] = start;
    if (end) where.booking_time[Op.lte] = end;
  }
  const bookings = await Booking.findAll({
    where,
    order: [["booking_time", "ASC"]],
  });

  return bookings;
};

export const getBookingDetailForRestaurant = async (accountId, bookingId) => {
  const { booking } = await getBookingUnderRestaurant(accountId, bookingId);
  return booking;
};

// ==================================
// 5) DASHBOARD – CONFIRM / CANCEL / COMPLETE / NO_SHOW
// ==================================

export const confirmBooking = async (accountId, bookingId) => {
  const { booking } = await getBookingUnderRestaurant(accountId, bookingId);

  if (booking.status !== BOOKING_STATUS.PENDING) {
    throw new AppError(
      "Chỉ có thể xác nhận booking đang ở trạng thái PENDING",
      400
    );
  }

  booking.status = BOOKING_STATUS.CONFIRMED;
  await booking.save();

  return booking;
};

export const cancelBookingByRestaurant = async (accountId, bookingId) => {
  const { booking } = await getBookingUnderRestaurant(accountId, bookingId);

  if (
    ![BOOKING_STATUS.PENDING, BOOKING_STATUS.CONFIRMED].includes(booking.status)
  ) {
    throw new AppError(
      "Chỉ có thể huỷ booking đang ở trạng thái PENDING hoặc CONFIRMED",
      400
    );
  }

  // Nếu nhà hàng huỷ mà booking đã thanh toán cọc -> nên hoàn cọc cho khách
  paymentService.maybeRefundDepositOnCancel(booking, { by: "RESTAURANT" });

  booking.status = BOOKING_STATUS.CANCELLED;
  await booking.save();

  return booking;
};

export const completeBooking = async (accountId, bookingId) => {
  const { booking } = await getBookingUnderRestaurant(accountId, bookingId);

  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw new AppError(
      "Chỉ có thể hoàn tất booking đang ở trạng thái CONFIRMED",
      400
    );
  }

  booking.status = BOOKING_STATUS.COMPLETED;
  await booking.save();

  return booking;
};

export const markNoShow = async (accountId, bookingId) => {
  // Đảm bảo account thuộc đúng nhà hàng và booking thuộc về nhà hàng đó
  const { booking } = await getBookingUnderRestaurant(accountId, bookingId);

  // Chỉ cho phép đánh dấu NO_SHOW khi đã CONFIRMED
  if (booking.status !== BOOKING_STATUS.CONFIRMED) {
    throw new AppError(
      "Chỉ có thể đánh dấu NO_SHOW cho booking đang ở trạng thái CONFIRMED",
      400
    );
  }

  // Check thời gian: chỉ được no_show khi đã qua giờ booking
  const GRACE_MINUTES = 15;
  const now = new Date();
  const graceTime = new Date(
    booking.booking_time.getTime() + GRACE_MINUTES * 60 * 1000
  );

  if (graceTime > now) {
    throw new AppError(
      `Chỉ có thể đánh dấu NO_SHOW sau ${GRACE_MINUTES} phút kể từ giờ đặt bàn`,
      400
    );
  }

  // Nếu mọi điều kiện ok → đánh dấu NO_SHOW
  booking.status = BOOKING_STATUS.NO_SHOW;
  await booking.save();

  // Sau này muốn notify cho khách thì gắn thêm createNotification() ở đây

  return booking;
};
