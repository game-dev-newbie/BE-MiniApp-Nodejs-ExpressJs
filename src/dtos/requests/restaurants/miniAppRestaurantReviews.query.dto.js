import Joi from "joi";
import { paginationQuerySchema } from "../common/paginationQuery.schema.dto.js";

class MiniAppRestaurantReviewsQueryDto {
  static get schema() {
    return paginationQuerySchema.keys({
      // "latest" | "rating_desc"
      sort: Joi.string().valid("latest", "rating_desc").optional(),
    });
  }
}

export default MiniAppRestaurantReviewsQueryDto;
