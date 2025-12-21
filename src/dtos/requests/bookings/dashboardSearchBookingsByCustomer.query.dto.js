import Joi from "joi";
import  PaginationQuerySchema  from "../common/paginationQuery.schema.dto.js";

class DashboardSearchBookingsByCustomerQueryDto {
  static get schema() {
    return PaginationQuerySchema.keys({
      q: Joi.string().trim().min(1).required(),
    });
  }
}

export default DashboardSearchBookingsByCustomerQueryDto;
