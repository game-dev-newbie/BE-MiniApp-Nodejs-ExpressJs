// src/services/restaurant.service.js

import { Op } from "sequelize";
import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { REVIEW_STATUS, RESTAURANT_IMAGE_TYPE } from "../constants/index.js";
import { buildRestaurantSearchFields } from "../utils/search.util.js";

const { Restaurant, RestaurantAccount, RestaurantImage, User, Booking, Review } =
  models;

// -------- COMMON --------

export const getRestaurantById = async (restaurantId) => {
  const restaurant = await Restaurant.findByPk(restaurantId, {
    include: [
      {
        model: RestaurantImage,
        //required: false,
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

  // Sau khi gán xong name/address/tags mới,
  // build lại search_* từ giá trị hiện tại trên model
  const searchFields = buildRestaurantSearchFields({
    name: restaurant.name,
    address: restaurant.address,
    tags: restaurant.tags,
  });

  restaurant.search_name = searchFields.search_name;
  restaurant.search_address = searchFields.search_address;
  restaurant.search_tags = searchFields.search_tags;

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
        required: false,
        where: { type: RESTAURANT_IMAGE_TYPE.COVER },
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
        required: false,
        where: { type: RESTAURANT_IMAGE_TYPE.COVER },
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

// Lấy danh sách review của 1 nhà hàng cho miniapp (màn detail restaurant)
// sort:
//  - "latest" (default): mới nhất -> cũ
//  - "rating_desc": rating cao xuống thấp
export const getRestaurantReviewsForMiniApp = async (
  restaurantId,
  { sort = "latest", limit, offset } = {}
) => {
  const where = {
    restaurant_id: restaurantId,
    status: REVIEW_STATUS.VISIBLE, // miniapp chỉ thấy review đang hiển thị
  };

  let order;
  if (sort === "rating_desc") {
    order = [
      ["rating", "DESC"],
      ["created_at", "DESC"],
    ];
  } else {
    order = [["created_at", "DESC"]];
  }

  const { rows, count } = await Review.findAndCountAll({
    where,
    include: [
      { model: User },
      { model: Booking },
      { model: RestaurantAccount, as: "reply_account" },
    ],
    order,
    limit,
    offset,
  });

  return {
    items: rows,
    total: count,
  };
};

/**
 * Search nhà hàng cho miniapp.
 * Service chỉ:
 *  - nhận keyword + limit + offset
 *  - query DB
 *  - trả rows + total + limit + offset
 * Không format DTO, không build meta.
 */
export const searchRestaurantsForMiniApp = async ({
  keyword,
  limit,
  offset,
}) => {
  const q = (keyword || "").trim().toLowerCase();

  const where = {
    is_active: true,
    [Op.or]: [
      { search_name: { [Op.like]: `%${q}%` } },
      { search_address: { [Op.like]: `%${q}%` } },
      { search_tags: { [Op.like]: `%${q}%` } },
    ],
  };

  const { rows, count } = await Restaurant.findAndCountAll({
    where,
    limit,
    offset,
    order: [
      ["favorite_count", "DESC"],
      ["average_rating", "DESC"],
      ["id", "DESC"],
    ],
  });

  return {
    items: rows,
    total: count,
  };
};
