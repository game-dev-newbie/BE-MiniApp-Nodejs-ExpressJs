import Joi from "joi";
import { RESTAURANT_IMAGE_TYPE_LIST } from "../../../constants/index.js";

class DashboardCreateRestaurantImageDto {
  static get schema() {
    return Joi.object({
      // path tương đối FE nhận được từ module uploads
      file_path: Joi.string().max(255).required(),

      // COVER | GALLERY | MENU
      type: Joi.string()
        .valid(...RESTAURANT_IMAGE_TYPE_LIST)
        .required(),

      caption: Joi.string().max(255).allow("", null),

      // chỉ có ý nghĩa khi type = COVER
      is_primary: Joi.boolean().default(false),
    });
  }
}

export default DashboardCreateRestaurantImageDto;
