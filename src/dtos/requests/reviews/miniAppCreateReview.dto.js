// src/dtos/requests/reviews/miniAppCreateReview.dto.js
import Joi from "joi";

class MiniAppCreateReviewDto {
  static get schema() {
    return Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      comment: Joi.string().max(1000).allow("", null),
    });
  }
}

export default MiniAppCreateReviewDto;
