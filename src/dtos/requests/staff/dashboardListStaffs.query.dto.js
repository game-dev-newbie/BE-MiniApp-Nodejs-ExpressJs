// src/dtos/requests/staff/dashboardListStaffs.query.dto.js
import Joi from "joi";
import { paginationQuerySchema } from "../common/paginationQuery.schema.dto.js";

class DashboardListStaffsQueryDto {
  static get schema() {
    return paginationQuerySchema.keys({
      q: Joi.string().trim().optional(), // search email/name
      status: Joi.string().optional(),
      is_locked: Joi.boolean().truthy("1").falsy("0").optional(),
    });
  }
}

export default DashboardListStaffsQueryDto;
