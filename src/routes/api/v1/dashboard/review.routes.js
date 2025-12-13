// src/routes/api/v1/dashboard/review.routes.js

import { Router } from "express";
import reviewController from "../../../../controllers/review.controller.js";
import validate from "../../../../middlewares/validate.js";
import { DashboardReplyReviewDto } from "../../../../dtos/index.js";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/auth.js";

const router = Router();

// Lấy danh sách review của nhà hàng (dashboard)
router.get(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  reviewController.getRestaurantReviewsForDashboard
);

// Reply 1 review
router.patch(
  "/:id/reply",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  validate(DashboardReplyReviewDto, "body"),
  reviewController.replyReview
);

export default router;
