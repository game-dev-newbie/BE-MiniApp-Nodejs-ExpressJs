import Joi from "joi";
import PaginationQuerySchema from "../common/paginationQuery.schema.dto.js";

class MiniAppListMyReviewsQueryDto {
  static get schema() {
    return PaginationQuerySchema.keys({
      reply_status: Joi.string()
        .valid("all", "replied", "not_replied")
        .optional(),
    });
  }
}

export default MiniAppListMyReviewsQueryDto;
