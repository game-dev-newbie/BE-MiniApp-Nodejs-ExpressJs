import Joi from "joi";
import PaginationQuerySchema  from "../common/paginationQuery.schema.dto.js";
import { REVIEW_STATUS } from "../../../constants/index.js";

class DashboardListRestaurantReviewsQueryDto {
  static get schema() {
    return PaginationQuerySchema.keys({
      rating: Joi.number().integer().min(1).max(5).optional(),
      status: Joi.string()
        .valid(...Object.values(REVIEW_STATUS))
        .optional(),
      from_time: Joi.string().isoDate().optional(),
      to_time: Joi.string().isoDate().optional(),
    });
  }
}

export default DashboardListRestaurantReviewsQueryDto;
