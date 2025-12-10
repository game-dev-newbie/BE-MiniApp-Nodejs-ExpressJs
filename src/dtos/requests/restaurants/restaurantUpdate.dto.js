// src/dtos/requests/restaurant/restaurantUpdate.dto.js
import Joi from "joi";

class RestaurantUpdateDto {
  static get schema() {
    return Joi.object({
      name: Joi.string().max(255),
      address: Joi.string().max(500),
      phone: Joi.string().max(20),
      description: Joi.string().allow("", null),
      tags: Joi.string().allow("", null),

      // thời gian mở cửa / đóng cửa dạng "HH:mm"
      open_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
        .message("Giờ mở cửa phải có dạng HH:mm")
        .allow(null),
      close_time: Joi.string()
        .pattern(/^([01]\d|2[0-3]):[0-5]\d$/)
        .message("Giờ đóng cửa phải có dạng HH:mm")
        .allow(null),

      require_deposit: Joi.boolean(),
      default_deposit_amount: Joi.number().integer().min(0),

      is_active: Joi.boolean(),
    }).min(1); // bắt buộc phải có ít nhất 1 field truyền lên
  }
}

export default RestaurantUpdateDto;
