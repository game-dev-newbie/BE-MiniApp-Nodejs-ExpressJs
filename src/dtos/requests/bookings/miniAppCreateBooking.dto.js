// src/dtos/requests/booking/miniappCreateBooking.dto.js
import Joi from "joi";

class MiniAppCreateBookingDto {
  static get schema() {
    return Joi.object({
      restaurant_id: Joi.number().integer().positive().required(),
      phone: Joi.string().max(20).required(),
      customer_name: Joi.string().max(100).required(),
      table_id: Joi.number().integer().positive().required(),
      people_count: Joi.number().integer().min(1).required(),

      // FE tách ngày & giờ, BE merge thành DATETIME
      booking_date: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required(), // "YYYY-MM-DD"
      booking_time: Joi.string()
        .pattern(/^\d{2}:\d{2}$/)
        .required(), // "HH:mm"

      note: Joi.string().max(500).allow("", null),
    });
  }
}

export default MiniAppCreateBookingDto;
