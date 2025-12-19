// src/dtos/requests/common/paginationQuery.schema.dto.js
import Joi from "joi";

export const paginationQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).optional(),
  page_size: Joi.number().integer().min(1).max(50).optional(),
  limit: Joi.number().integer().min(1).max(50).optional(),
  offset: Joi.number().integer().min(0).optional(),
});
