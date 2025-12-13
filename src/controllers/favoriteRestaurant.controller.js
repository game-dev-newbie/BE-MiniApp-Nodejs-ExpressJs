// src/controllers/favoriteRestaurant.controller.js

import { catchAsync } from "../utils/catchAsync.js";
import * as favoriteService from "../services/favoriteRestaurant.service.js";
import { FavoriteRestaurantResponse } from "../dtos/index.js";

class FavoriteRestaurantController {
  /**
   * POST /miniapp/restaurants/:restaurantId/favorites
   */
  addFavorite = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const restaurantId = req.params;

    const favorite = await favoriteService.addFavoriteRestaurant(
      userId,
      restaurantId
    );

    const data = FavoriteRestaurantResponse.fromModel(favorite);

    return res.status(201).json({
      success: true,
      message: "Đã thêm nhà hàng vào danh sách yêu thích",
      data,
    });
  });

  /**
   * DELETE /miniapp/restaurants/:restaurantId/favorites
   */
  removeFavorite = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const restaurantId = req.params;

    await favoriteService.removeFavoriteRestaurant(userId, restaurantId);

    return res.status(200).json({
      success: true,
      message: "Đã bỏ nhà hàng khỏi danh sách yêu thích (nếu có)",
    });
  });

  /**
   * GET /miniapp/favorite-restaurants?limit=&offset=
   */
  getMyFavorites = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const { limit, offset } = req.query;

    const result = await favoriteService.listMyFavoriteRestaurants(userId, {
      limit,
      offset,
    });

    const items = FavoriteRestaurantResponse.fromList(result.items);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhà hàng yêu thích thành công",
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
   * GET /miniapp/restaurants/:restaurantId/favorites/status
   * -> cho miniapp check nhanh 1 nhà hàng đã được user yêu thích chưa
   */
  getFavoriteStatus = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const restaurantId = req.params;

    const isFavorite = await favoriteService.isRestaurantFavorite(
      userId,
      restaurantId
    );

    return res.status(200).json({
      success: true,
      message: "Lấy trạng thái yêu thích thành công",
      data: {
        restaurant_id: restaurantId,
        is_favorite: isFavorite,
      },
    });
  });
}

const favoriteRestaurantController = new FavoriteRestaurantController();
export default favoriteRestaurantController;
