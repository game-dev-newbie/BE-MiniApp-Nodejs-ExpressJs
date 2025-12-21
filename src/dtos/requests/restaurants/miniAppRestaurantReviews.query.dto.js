import Joi from "joi";
import PaginationQuerySchema from "../common/paginationQuery.schema.dto.js";

class MiniAppRestaurantReviewsQueryDto {
  static get schema() {
    return PaginationQuerySchema.keys({
      // "latest" | "rating_desc"
      sort: Joi.string().valid("latest", "rating_desc").optional(),
    });
  }
}

export default MiniAppRestaurantReviewsQueryDto;
