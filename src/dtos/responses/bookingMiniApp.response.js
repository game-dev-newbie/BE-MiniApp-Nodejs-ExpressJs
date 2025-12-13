// src/dtos/responses/bookingMiniapp.response.js

import time from "../../utils/time.js";

const BOOKING_STATUS_LABELS = {
  PENDING: "Chờ xác nhận",
  CONFIRMED: "Đã xác nhận",
  CANCELLED: "Đã hủy",
  COMPLETED: "Hoàn tất",
  NO_SHOW: "Khách không đến",
};

const PAYMENT_STATUS_LABELS = {
  NONE: "Chưa đặt cọc",
  PENDING: "Đang chờ thanh toán",
  PAID: "Đã thanh toán",
  FAILED: "Thanh toán thất bại",
  REFUNDED: "Đã hoàn tiền",
};

class BookingMiniAppResponse {
  /**
   * Dùng cho miniapp:
   * - Thêm label tiếng Việt cho status / payment_status
   * - Định dạng booking_time cho dễ hiển thị
   * - Giữ những field user cần xem trong app
   */
  static fromModel(bookingInstance) {
    if (!bookingInstance) return null;

    const plain =
      typeof bookingInstance.get === "function"
        ? bookingInstance.get({ plain: true })
        : bookingInstance;

    const {
      id,
      restaurant_id,
      table_id,
      user_id,
      customer_name,
      people_count,
      booking_time,
      status,
      deposit_amount,
      payment_status,
      payment_provider,
      payment_reference,
      paid_at,
      refunded_at,
      note,
      phone,
      created_at,
      updated_at,
      // nếu Booking đã include thêm table/restaurant thì vẫn giữ trong rest
      ...rest
    } = plain;

    return {
      id,
      restaurant_id,
      table_id,
      people_count,
      phone,
      note,
      customer_name,

      status,
      status_label: BOOKING_STATUS_LABELS[status] || status,

      payment_status,
      payment_status_label:
        PAYMENT_STATUS_LABELS[payment_status] || payment_status,

      deposit_amount, // miniapp có thể dùng để hiển thị “cọc bao nhiêu”

      payment_provider: payment_provider || null,
      payment_reference: payment_reference || null,

      paid_at: time.toVNDateTime(paid_at) || null,
      refunded_at: time.toVNDateTime(refunded_at) || null,
      
      booking_time: time.toVNDateTime(booking_time),

      created_at: time.toVNDateTime(created_at),
      updated_at: time.toVNDateTime(updated_at),

      // để sau này nếu bạn include thêm table / restaurant ở service
      // thì miniapp vẫn lấy được ở rest (vd: rest.table.name, rest.restaurant.name)
      ...rest,
    };
  }

  static fromList(list) {
    if (!Array.isArray(list)) return [];
    return list.map((b) => this.fromModel(b));
  }
}

export default BookingMiniAppResponse;
