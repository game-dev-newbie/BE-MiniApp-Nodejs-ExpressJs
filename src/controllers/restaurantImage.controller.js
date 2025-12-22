// src/controllers/restaurantImage.controller.js

import { catchAsync } from "../utils/catchAsync.js";
import * as restaurantImageService from "../services/restaurantImage.service.js";
import { RestaurantImageResponse } from "../dtos/index.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../utils/pagination.util.js";

class RestaurantImageController {
  /**
   * Dashboard: tạo ảnh nhà hàng từ file_path đã upload sẵn
   * POST /dashboard/restaurant-images
   */
  createForDashboard = catchAsync(async (req, res, next) => {
    const account = req.restaurantAccount; // gắn bởi jwtAuthorization
    const restaurantId = account.restaurant_id;

    const image = await restaurantImageService.createImageForRestaurant(
      restaurantId,
      req.body
    );

    return res.status(201).json({
      success: true,
      message: "Tạo ảnh nhà hàng thành công",
      data: RestaurantImageResponse.fromModel(image),
    });
  });

  /**
   * Dashboard: lấy danh sách ảnh của nhà hàng
   * GET /dashboard/restaurant-images?type=COVER&page=0&page_size=20
   */
  getMyRestaurantImages = catchAsync(async (req, res, next) => {
    const account = req.restaurantAccount;
    const restaurantId = account.restaurant_id;

    const { limit, offset, page } = parsePagination(req.query);
    const { type } = req.query;

    const result = await restaurantImageService.getImagesForRestaurant(
      restaurantId,
      {
        type,
        limit,
        offset,
      }
    );

    const items = RestaurantImageResponse.fromList(result.items);
    return res.status(200).json({
      success: true,
      message: "Lấy danh sách ảnh nhà hàng thành công",
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
   * Dashboard: xem chi tiết 1 ảnh
   * GET /dashboard/restaurant-images/:id
   */
  getMyRestaurantImageDetail = catchAsync(async (req, res, next) => {
    const account = req.restaurantAccount;
    const restaurantId = account.restaurant_id;
    const imageId = req.params.id;

    const image = await restaurantImageService.getImageByIdForRestaurant(
      restaurantId,
      imageId
    );

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết ảnh nhà hàng thành công",
      data: RestaurantImageResponse.fromModel(image),
    });
  });

  /**
   * Dashboard: xoá 1 ảnh
   * DELETE /dashboard/restaurant-images/:id
   */
  deleteMyRestaurantImage = catchAsync(async (req, res, next) => {
    const account = req.restaurantAccount;
    const restaurantId = account.restaurant_id;
    const imageId = req.params.id;

    await restaurantImageService.deleteImageForRestaurant(
      restaurantId,
      imageId
    );

    return res.status(200).json({
      success: true,
      message: "Xoá ảnh nhà hàng thành công",
    });
  });
}

const restaurantImageController = new RestaurantImageController();
export default restaurantImageController;
