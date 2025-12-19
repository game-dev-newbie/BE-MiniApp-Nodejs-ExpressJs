import Joi from "joi";
import { paginationQuerySchema } from "../common/paginationQuery.schema.dto.js";

class FavoriteRestaurantsListQueryDto {
  static get schema() {
    // Chỉ dùng pagination, không có filter riêng
    return paginationQuerySchema;
  }
}

export default FavoriteRestaurantsListQueryDto;
