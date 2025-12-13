// src/dtos/requests/reviews/dashboardReplyReview.dto.js
import Joi from "joi";

class DashboardReplyReviewDto {
  static get schema() {
    return Joi.object({
      comment: Joi.string().max(1000).required(),
    });
  }
}

export default DashboardReplyReviewDto;
