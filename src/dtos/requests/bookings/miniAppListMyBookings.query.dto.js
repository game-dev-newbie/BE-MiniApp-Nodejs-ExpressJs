import Joi from "joi";
import PaginationQuerySchema from "../common/paginationQuery.schema.dto.js";

class MiniAppListMyBookingsQueryDto {
  static get schema() {
    return PaginationQuerySchema.keys({
      // upcoming | history | cancelled
      category: Joi.string()
        .valid("upcoming", "history", "cancelled")
        .optional(),
    });
  }
}

export default MiniAppListMyBookingsQueryDto;
