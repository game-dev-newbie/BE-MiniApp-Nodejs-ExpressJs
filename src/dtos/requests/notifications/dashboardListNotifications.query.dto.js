import Joi from "joi";
import { paginationQuerySchema } from "../common/paginationQuery.schema.dto.js";
import { NOTIFICATION_TYPE_LIST } from "../../../constants/index.js";

class DashboardListNotificationsQueryDto {
  static get schema() {
    return paginationQuerySchema.keys({
      read_status: Joi.string().valid("all", "read", "unread").optional(),
      is_read: Joi.boolean().truthy("1").falsy("0").optional(),
      type: Joi.string()
        .valid(...NOTIFICATION_TYPE_LIST)
        .optional(),
      from_time: Joi.string().isoDate().optional(),
      to_time: Joi.string().isoDate().optional(),
    });
  }
}

export default DashboardListNotificationsQueryDto;
