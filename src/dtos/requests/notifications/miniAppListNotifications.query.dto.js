import Joi from "joi";
import PaginationQuerySchema from "../common/paginationQuery.schema.dto.js";
import { NOTIFICATION_TYPE_LIST } from "../../../constants/index.js";

class MiniAppListNotificationsQueryDto {
  static get schema() {
    return PaginationQuerySchema.keys({
      // "all" | "read" | "unread"
      read_status: Joi.string().valid("all", "read", "unread").optional(),

      // back-compat: vẫn cho is_read nếu bạn còn dùng đâu đó
      is_read: Joi.boolean().truthy("1").falsy("0").optional(),

      type: Joi.string()
        .valid(...NOTIFICATION_TYPE_LIST)
        .optional(),

      from_time: Joi.string().isoDate().optional(), // ISO date/datetime
      to_time: Joi.string().isoDate().optional(),
    });
  }
}

export default MiniAppListNotificationsQueryDto;
