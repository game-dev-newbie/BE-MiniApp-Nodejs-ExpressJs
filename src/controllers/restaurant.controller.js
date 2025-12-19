// src/controllers/restaurant.controller.js

import * as restaurantService from "../services/restaurant.service.js";
import { RestaurantResponse, ReviewResponse } from "../dtos/index.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../utils/pagination.util.js";

class RestaurantController {
  // ----- DASHBOARD -----

  getMyRestaurant = catchAsync(async (req, res) => {
    let restaurant;

    if (req.restaurant) {
      restaurant = req.restaurant;
    } else if (req.restaurantAccount) {
      restaurant = await restaurantService.getRestaurantByAccountId(
        req.restaurantAccount.id
      );
    } else {
      throw new AppError(
        "Không xác định được nhà hàng từ tài khoản hiện tại",
        400
      );
    }

    const data = RestaurantResponse.toDashboard(restaurant);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin nhà hàng thành công",
      data,
    });
  });

  updateMyRestaurant = catchAsync(async (req, res) => {
    let restaurantId;

    if (req.restaurant) {
      restaurantId = req.restaurant.id;
    } else if (req.restaurantAccount) {
      restaurantId = req.restaurantAccount.restaurant_id;
    } else {
      throw new AppError(
        "Không xác định được nhà hàng từ tài khoản hiện tại",
        400
      );
    }

    const restaurant = await restaurantService.updateRestaurantById(
      restaurantId,
      req.body
    );

    const data = RestaurantResponse.toDashboard(restaurant);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin nhà hàng thành công",
      data,
    });
  });

  // ----- MINIAPP HOME -----

  getMiniappTopRated = catchAsync(async (req, res) => {
    const { limit } = req.query;
    const n = limit ? Number.parseInt(limit, 10) || 5 : 5;

    const restaurants = await restaurantService.getTopRatedRestaurants(n);
    const items = RestaurantResponse.listToMiniappCards(restaurants);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhà hàng nổi bật theo rating thành công",
      data: { items },
    });
  });

  getMiniappTopFavorite = catchAsync(async (req, res) => {
    const { limit } = req.query;
    const n = limit ? Number.parseInt(limit, 10) || 5 : 5;

    const restaurants = await restaurantService.getTopFavoriteRestaurants(n);
    const items = RestaurantResponse.listToMiniappCards(restaurants);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhà hàng được yêu thích nhiều nhất thành công",
      data: { items },
    });
  });

  getMiniappTopByTag = catchAsync(async (req, res) => {
    const { tag, limit } = req.query;
    const n = limit ? Number.parseInt(limit, 10) || 5 : 5;

    const restaurants = await restaurantService.getTopRestaurantsByTag(tag, n);
    const items = RestaurantResponse.listToMiniappCards(restaurants);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhà hàng theo tag thành công",
      data: { items },
    });
  });

  getMiniappDetail = catchAsync(async (req, res) => {
    const { id } = req.params;

    const restaurant = await restaurantService.getRestaurantById(id);
    const data = RestaurantResponse.toMiniappDetail(restaurant);

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết nhà hàng thành công",
      data,
    });
  });

  getRestaurantReviewsForMiniApp = catchAsync(async (req, res, next) => {
    const { id: restaurantId } = req.params;
    const { sort } = req.query;

    const { limit, offset, page } = parsePagination(req.query);
    const result = await restaurantService.getRestaurantReviewsForMiniApp(
      restaurantId,
      { sort, limit, offset }
    );

    const items = ReviewResponse.fromList(result.items, {
      includeRelations: true,
    });

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách review của nhà hàng (miniapp) thành công",
      data: {
        items,
        pagination: buildPaginationMeta({
          total: result.total,
          limit,
          offset,
          page,
        }),
      },
    });
  });
  /**
   * GET /api/v1/miniapp/restaurants/search
   * Query:
   *  - q: keyword (bắt buộc)
   *  - page/page_size hoặc limit/offset
   */
  searchMiniApp = catchAsync(async (req, res, next) => {
    const { q } = req.query;

    // Chuẩn hoá tham số phân trang từ query (?page=, ?page_size=, ?limit=, ?offset=)
    const { limit, offset, page } = parsePagination(req.query);

    // Gọi service để lấy dữ liệu thô
    const result = await restaurantService.searchRestaurantsForMiniApp(
      {
        keyword: q,
        limit,
        offset,
      }
    );

    // Format DTO response ở controller
    // Tuỳ file restaurant.response.js của bạn, chỉnh lại method cho khớp
    const items = result.items.map((restaurant) =>
      // ví dụ:
      // RestaurantResponse.toMiniAppListItem(restaurant)
      RestaurantResponse.toMiniappCard(restaurant)
    );

    const meta = buildPaginationMeta({
      total,
      limit,
      offset,
      page,
    });

    return res.status(200).json({
      success: true,
      message: "Tìm kiếm nhà hàng thành công",
      data: {
        items,
        meta,
      },
    });
  });
}

const restaurantController = new RestaurantController();
export default restaurantController;
