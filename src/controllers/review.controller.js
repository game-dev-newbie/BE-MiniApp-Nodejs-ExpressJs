// src/controllers/review.controller.js

import { catchAsync } from "../utils/catchAsync.js";
import * as reviewService from "../services/review.service.js";
import ReviewResponse from "../dtos/responses/review.response.js";

class ReviewController {
  // ===================== MINIAPP =====================

  /**
   * POST /miniapp/reviews/bookings/:id/comment
   * Body: { rating, comment }
   */
  createReviewFromBooking = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const bookingId = req.params;

    const review = await reviewService.createReviewFromBooking(
      userId,
      bookingId,
      req.body
    );

    const data = ReviewResponse.fromModel(review, { includeRelations: true });

    return res.status(201).json({
      success: true,
      message: "Tạo review thành công",
      data,
    });
  });

  /**
   * GET /miniapp/reviews/my-reviews?reply_status=all|replied|not_replied&limit=&offset=
   */
  getMyReviews = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { reply_status, limit, offset } = req.query;

    const result = await reviewService.listMyReviews(userId, {
      reply_status,
      limit,
      offset,
    });

    const items = ReviewResponse.fromList(result.items, {
      includeRelations: true,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách review của user thành công",
      data: {
        items,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      },
    });
  });

  /**
   * DELETE /miniapp/reviews/:id
   */
  deleteMyReview = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const reviewId = req.params;

    await reviewService.deleteMyReview(userId, reviewId);

    return res.status(200).json({
      success: true,
      message: "Xóa review thành công. Bạn có thể đánh giá lại booking này.",
    });
  });

  // ===================== DASHBOARD =====================

  /**
   * GET /dashboard/reviews?rating=&status=&from_time=&to_time=&limit=&offset=
   */
  getRestaurantReviewsForDashboard = catchAsync(async (req, res, next) => {
    const restaurantId = req.restaurantAccount.restaurant_id;

    const {
      rating, // thay vì rating_min, rating_max
      status,
      from_time,
      to_time,
      limit,
      offset,
    } = req.query;

    const result = await reviewService.listRestaurantReviewsForDashboard(
      restaurantId,
      {
        rating,
        status,
        from_time,
        to_time,
        limit,
        offset,
      }
    );

    const items = ReviewResponse.fromList(result.items, {
      includeRelations: true,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách review của nhà hàng (dashboard) thành công",
      data: {
        items,
        pagination: {
          total: result.total,
          limit: result.limit,
          offset: result.offset,
        },
      },
    });
  });

  /**
   * PATCH /dashboard/reviews/:id/reply
   * Body: { comment }
   */
  replyReview = catchAsync(async (req, res, next) => {
    const accountId = req.restaurantAccount.id;
    const reviewId = req.params;

    const review = await reviewService.replyReview(
      accountId,
      reviewId,
      req.body
    );

    const data = ReviewResponse.fromModel(review, { includeRelations: true });

    return res.status(200).json({
      success: true,
      message: "Trả lời review thành công",
      data,
    });
  });
}

const reviewController = new ReviewController();
export default reviewController;
