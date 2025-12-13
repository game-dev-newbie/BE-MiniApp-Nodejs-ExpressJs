// src/services/favoriteRestaurant.service.js

import models from "../models/index.js";
import { AppError } from "../utils/appError.js";

const { FavoriteRestaurant, Restaurant } = models;

/**
 * Thêm 1 nhà hàng vào danh sách yêu thích của user
 * - Idempotent: đã tồn tại thì không tạo thêm, chỉ trả lại bản ghi cũ
 */
// Thêm vào danh sách yêu thích + tăng favorite_count
export const addFavoriteRestaurant = async (userId, restaurantId) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId", 400);
  }

  const restaurant = await Restaurant.findByPk(restaurantId);

  if (!restaurant || !restaurant.is_active) {
    throw new AppError("Nhà hàng không tồn tại hoặc đang không hoạt động", 404);
  }

  // Check đã tồn tại chưa
  let favorite = await FavoriteRestaurant.findOne({
    where: {
      user_id: userId,
      restaurant_id: restaurantId,
    },
  });

  if (favorite) {
    // đã yêu thích rồi thì không tăng count nữa
    return favorite;
  }

  // Tạo mới + tăng favorite_count atomically
  // (đơn giản nhất: làm 2 lệnh, đủ cho đồ án)
  favorite = await FavoriteRestaurant.create({
    user_id: userId,
    restaurant_id: restaurantId,
  });

  await Restaurant.increment("favorite_count", {
    by: 1,
    where: { id: restaurantId },
  });
  // Nếu trong model bạn đặt thuộc tính là favoriteCount thì sửa thành "favoriteCount"

  return favorite;
};

// Bỏ yêu thích + giảm favorite_count
export const removeFavoriteRestaurant = async (userId, restaurantId) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId", 400);
  }

  const favorite = await FavoriteRestaurant.findOne({
    where: {
      user_id: userId,
      restaurant_id: restaurantId,
    },
  });

  if (!favorite) {
    // không có bản ghi thì cũng không giảm
    return false;
  }

  await favorite.destroy();

  // Giảm favorite_count xuống 1, nhưng không để âm
  const restaurant = await Restaurant.findByPk(restaurantId);
  if (!restaurant) return true;

  const current = restaurant.favorite_count ?? 0; // hoặc favoriteCount
  if (current > 0) {
    await Restaurant.decrement("favorite_count", {
      by: 1,
      where: { id: restaurantId },
    });
  }

  return true;
};

/**
 * Kiểm tra 1 nhà hàng có đang được user yêu thích hay không
 */
export const isRestaurantFavorite = async (userId, restaurantId) => {
  if (!restaurantId) return false;

  const count = await FavoriteRestaurant.count({
    where: {
      user_id: userId,
      restaurant_id: restaurantId,
    },
  });

  return count > 0;
};

/**
 * Lấy danh sách nhà hàng yêu thích của user
 * - Trả về FavoriteRestaurant + include Restaurant
 * - Sắp xếp theo thời gian yêu thích mới nhất
 */
export const listMyFavoriteRestaurants = async (
  userId,
  { limit = 20, offset = 0 } = {}
) => {
  const parsedLimit = Number.isNaN(Number(limit)) ? 20 : Number(limit);
  const parsedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

  const { rows, count } = await FavoriteRestaurant.findAndCountAll({
    where: {
      user_id: userId,
    },
    include: [
      {
        model: Restaurant,
        as: "restaurant",
        required: true,
        where: {
          is_active: true,
        },
      },
    ],
    order: [["created_at", "DESC"]],
    limit: parsedLimit,
    offset: parsedOffset,
  });

  return {
    items: rows,
    total: count,
    limit: parsedLimit,
    offset: parsedOffset,
  };
};
