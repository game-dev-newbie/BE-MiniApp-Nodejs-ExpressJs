import Joi from "joi";
import PaginationQuerySchema from "../common/paginationQuery.schema.dto.js";

class FavoriteRestaurantsListQueryDto {
  static get schema() {
    // Chỉ dùng pagination, không có filter riêng
    return PaginationQuerySchema;
  }
}

export default FavoriteRestaurantsListQueryDto;
