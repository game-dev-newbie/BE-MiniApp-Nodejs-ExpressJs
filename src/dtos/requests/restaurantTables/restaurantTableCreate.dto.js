// src/dtos/requests/restaurantTables/restaurantTableCreate.dto.js
import Joi from "joi";
import { TABLE_STATUS_LIST } from "../../../constants/index.js";

class RestaurantTableCreateDto {
  static get schema() {
    return Joi.object({
      name: Joi.string().max(255).required(),
      capacity: Joi.number().integer().min(1).required(),
      location: Joi.string().max(255).allow("", null),
      status: Joi.string()
        .valid(...TABLE_STATUS_LIST)
        .default("ACTIVE"),
      view_image_url: Joi.string().max(255).allow("", null),
      view_note: Joi.string().max(255).allow("", null),
    });
  }
}

export default RestaurantTableCreateDto;
