import Joi from "joi";
import { paginationQuerySchema } from "../common/paginationQuery.schema.dto.js";

class DashboardSearchBookingsByCustomerQueryDto {
  static get schema() {
    return paginationQuerySchema.keys({
      q: Joi.string().trim().min(1).required(),
    });
  }
}

export default DashboardSearchBookingsByCustomerQueryDto;
