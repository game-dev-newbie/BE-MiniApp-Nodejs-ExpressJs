// src/dtos/requests/booking/miniappUpdateBooking.dto.js
import Joi from "joi";

class MiniAppUpdateBookingDto {
  static get schema() {
    return Joi.object({
      // cho phép đổi tên hiển thị
      customer_name: Joi.string().max(100),

      // cho phép đổi số điện thoại liên hệ
      phone: Joi.string().max(20),

      // đổi số người
      people_count: Joi.number().integer().min(1),
      
      // đổi bàn
      table_id: Joi.number().integer().positive(),

      // đổi ngày/giờ – sẽ check logic trong service
      booking_date: Joi.string().pattern(/^\d{4}-\d{2}-\d{2}$/), // "YYYY-MM-DD"
      booking_time: Joi.string().pattern(/^\d{2}:\d{2}$/), // "HH:mm"

      // đổi note
      note: Joi.string().max(500).allow("", null),
    }).min(1); // bắt buộc phải có ít nhất 1 field để update
  }
}

export default MiniAppUpdateBookingDto;
