// src/services/restaurant.service.js

import { Op } from "sequelize";
import models from "../models/index.js";
import { AppError } from "../utils/appError.js";

const { Restaurant, RestaurantAccount, RestaurantImage } = models;

// -------- COMMON --------

export const getRestaurantById = async (restaurantId) => {
  const restaurant = await Restaurant.findByPk(restaurantId, {
    include: [
      {
        model: RestaurantImage,
        as: "RestaurantImages",
        required: false,
        attributes: ["id", "file_path", "type", "caption", "is_primary"],
      },
    ],
  });

  if (!restaurant) {
    throw new AppError("Nhà hàng không tồn tại", 404);
  }

  return restaurant;
};

export const getRestaurantByAccountId = async (restaurantAccountId) => {
  const account = await RestaurantAccount.findByPk(restaurantAccountId);

  if (!account) {
    throw new AppError("Tài khoản nhà hàng không tồn tại", 404);
  }

  if (!account.restaurant_id) {
    throw new AppError("Tài khoản này chưa gắn với nhà hàng nào", 400);
  }

  // dashboard có thể chưa cần images, nên cho nhẹ query: không include
  const restaurant = await Restaurant.findByPk(account.restaurant_id);

  if (!restaurant) {
    throw new AppError("Nhà hàng không tồn tại", 404);
  }

  return restaurant;
};

export const updateRestaurantById = async (restaurantId, payload) => {
  const restaurant = await Restaurant.findByPk(restaurantId);

  if (!restaurant) {
    throw new AppError("Nhà hàng không tồn tại", 404);
  }

  const fields = [
    "name",
    "address",
    "phone",
    "description",
    "tags",
    "open_time",
    "close_time",
    "require_deposit",
    "default_deposit_amount",
    "is_active",
    "main_image_url",
  ];

  for (const key of fields) {
    if (payload[key] !== undefined) {
      restaurant[key] = payload[key];
    }
  }

  // TODO sau này: nếu name/address/tags đổi thì cập nhật search_*

  await restaurant.save();
  return restaurant;
};

// -------- MINIAPP HOME --------

/**
 * Top N nhà hàng rating cao nhất
 */
export const getTopRatedRestaurants = async (limit = 5) => {
  return Restaurant.findAll({
    where: { is_active: true },
    include: [
      {
        model: RestaurantImage,
        as: "RestaurantImages",
        required: false,
        where: { type: "COVER" }, // sau này đổi dùng IMAGE_TYPES.COVER nếu có constants
        attributes: ["id", "file_path", "type", "caption", "is_primary"],
      },
    ],
    order: [
      ["average_rating", "DESC"],
      ["review_count", "DESC"],
      ["id", "DESC"],
    ],
    limit,
  });
};

/**
 * Top N nhà hàng được yêu thích nhiều nhất (favorite_count)
 */
export const getTopFavoriteRestaurants = async (limit = 5) => {
  return Restaurant.findAll({
    where: { is_active: true },
    include: [
      {
        model: RestaurantImage,
        as: "RestaurantImages",
        required: false,
        where: { type: "COVER" },
        attributes: ["id", "file_path", "type", "caption", "is_primary"],
      },
    ],
    order: [
      ["favorite_count", "DESC"],
      ["average_rating", "DESC"],
      ["id", "DESC"],
    ],
    limit,
  });
};

/**
 * Top N theo tag/time-slot
 */
export const getTopRestaurantsByTag = async (tagKeyword, limit = 5) => {
  const where = { is_active: true };

  if (tagKeyword && tagKeyword.trim()) {
    const kw = tagKeyword.trim();
    where.tags = { [Op.like]: `%${kw}%` };
    // sau này có search_tags thì đổi sang dùng search_tags
  }

  return Restaurant.findAll({
    where,
    include: [
      {
        model: RestaurantImage,
        as: "RestaurantImages",
        required: false,
        where: { type: "COVER" },
        attributes: ["id", "file_path", "type", "caption", "is_primary"],
      },
    ],
    order: [
      ["average_rating", "DESC"],
      ["review_count", "DESC"],
      ["id", "DESC"],
    ],
    limit,
  });
};
