// src/dtos/requests/restaurants/restaurantUpdate.dto.js
import Joi from "joi";

class RestaurantUpdateDto {
  static get schema() {
    return Joi.object({
      name: Joi.string().max(255),
      address: Joi.string().max(500),
      phone: Joi.string().max(20),
      description: Joi.string().allow("", null),
      tags: Joi.string().allow("", null),

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

      // cho phép URL tuyệt đối hoặc path tương đối, nên không dùng .uri()
      main_image_url: Joi.string().max(255).allow("", null),
    }).min(1); // phải có ít nhất 1 field để update
  }
}

export default RestaurantUpdateDto;
