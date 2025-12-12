// src/dtos/requests/restaurantTables/restaurantTableUpdate.dto.js
import Joi from "joi";
import { TABLE_STATUS_LIST } from "../../../constants/index.js";

class RestaurantTableUpdateDto {
  static get schema() {
    return Joi.object({
      name: Joi.string().max(255),
      capacity: Joi.number().integer().min(1),
      location: Joi.string().max(255).allow("", null),
      status: Joi.string().valid(...TABLE_STATUS_LIST),
      view_image_url: Joi.string().max(255).allow("", null),
      view_note: Joi.string().max(255).allow("", null),
    }).min(1); // phải có ít nhất 1 field để update
  }
}

export default RestaurantTableUpdateDto;
