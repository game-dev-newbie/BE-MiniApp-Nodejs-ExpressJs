import Joi from "joi";
import { paginationQuerySchema } from "../common/paginationQuery.schema.dto.js";
import { RESTAURANT_IMAGE_TYPE } from "../../../constants/restaurantImage.js";

class DashboardListRestaurantImagesQueryDto {
  static get schema() {
    return paginationQuerySchema.keys({
      type: Joi.string()
        .valid(...Object.values(RESTAURANT_IMAGE_TYPE))
        .optional(),
    });
  }
}

export default DashboardListRestaurantImagesQueryDto;
