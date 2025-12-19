import Joi from "joi";
import { paginationQuerySchema } from "../common/paginationQuery.schema.dto.js";

class MiniAppListMyReviewsQueryDto {
  static get schema() {
    return paginationQuerySchema.keys({
      reply_status: Joi.string()
        .valid("all", "replied", "not_replied")
        .optional(),
    });
  }
}

export default MiniAppListMyReviewsQueryDto;
