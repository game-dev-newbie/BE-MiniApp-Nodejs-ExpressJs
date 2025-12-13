// src/routes/api/v1/miniapp/review.routes.js

import { Router } from "express";
import reviewController from "../../../../controllers/review.controller.js";
import validate from "../../../../middlewares/validate.js";
import { MiniAppCreateReviewDto } from "../../../../dtos/index.js";
import { requireCustomer } from "../../../../middlewares/jwtAuthorization.js";

const router = Router();

// Tạo review từ booking COMPLETED
router.post(
  "/bookings/:id/comment",
  ...requireCustomer(),
  validate(MiniAppCreateReviewDto, "body"),
  reviewController.createReviewFromBooking
);

// Danh sách review của chính user
router.get("/my-reviews", ...requireCustomer(), reviewController.getMyReviews);

// Xóa review của user
router.delete("/:id", ...requireCustomer(), reviewController.deleteMyReview);

export default router;
