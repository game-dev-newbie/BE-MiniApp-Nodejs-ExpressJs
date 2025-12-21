import Joi from "joi";
import PaginationQuerySchema  from "../common/paginationQuery.schema.dto.js";
import { BOOKING_STATUS } from "../../../constants/index.js";

class DashboardListBookingsQueryDto {
  static get schema() {
    return PaginationQuerySchema.keys({
      status: Joi.string()
        .valid(...Object.values(BOOKING_STATUS))
        .optional(),
      from_date: Joi.string().isoDate().optional(), // "2025-12-20"
      to_date: Joi.string().isoDate().optional(),
    });
  }
}

export default DashboardListBookingsQueryDto;
