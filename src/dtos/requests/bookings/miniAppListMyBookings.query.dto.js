import Joi from "joi";
import { paginationQuerySchema } from "../common/paginationQuery.schema.dto.js";

class MiniAppListMyBookingsQueryDto {
  static get schema() {
    return paginationQuerySchema.keys({
      // upcoming | history | cancelled
      category: Joi.string()
        .valid("upcoming", "history", "cancelled")
        .optional(),
    });
  }
}

export default MiniAppListMyBookingsQueryDto;
