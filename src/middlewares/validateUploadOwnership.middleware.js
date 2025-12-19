// src/middlewares/validateUploadOwnership.middleware.js

import { AppError } from "../utils/appError.js";
import models from "../models/index.js";

const { Restaurant, RestaurantAccount, RestaurantTable, User } = models;

/**
 * ✅ Validate restaurant_id belongs to current dashboard account
 * Auto-inject restaurant_id to req.query
 *
 * Usage:  Use this middleware for restaurant-related uploads
 * - restaurant_cover
 * - restaurant_gallery
 * - restaurant_menu
 */
export const validateRestaurantOwnership = async (req, res, next) => {
  try {
    const accountId = req.restaurantAccount?.id;

    if (!accountId) {
      throw new AppError(
        "Unauthorized:  Không tìm thấy thông tin tài khoản",
        401
      );
    }

    // Get account's restaurant
    const account = await RestaurantAccount.findByPk(accountId, {
      attributes: ["id", "restaurant_id", "role"],
    });

    if (!account) {
      throw new AppError("Tài khoản không tồn tại", 404);
    }

    if (!account.restaurant_id) {
      throw new AppError("Tài khoản chưa được gắn với nhà hàng nào", 403);
    }

    // ✅ Verify restaurant exists
    const restaurant = await Restaurant.findByPk(account.restaurant_id, {
      attributes: ["id", "is_active"],
    });

    if (!restaurant) {
      throw new AppError("Nhà hàng không tồn tại", 404);
    }

    if (!restaurant.is_active) {
      throw new AppError("Nhà hàng đã bị vô hiệu hóa", 403);
    }

    // ✅ Auto-inject restaurant_id to query
    req.query.restaurant_id = String(account.restaurant_id);

    // ✅ Store validated data for later use
    req.validatedRestaurantId = account.restaurant_id;
    req.validatedAccountRole = account.role;

    console.log(
      `✅ Upload permission granted for restaurant ${account.restaurant_id} by account ${accountId}`
    );

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Validate table_id belongs to current restaurant
 * Auto-inject both restaurant_id and table_id to req.query
 *
 * Usage: Use this middleware for table view uploads
 * - table_view
 */
export const validateTableOwnership = async (req, res, next) => {
  try {
    const { table_id } = req.query;
    const accountId = req.restaurantAccount?.id;

    if (!accountId) {
      throw new AppError(
        "Unauthorized: Không tìm thấy thông tin tài khoản",
        401
      );
    }

    if (!table_id) {
      throw new AppError("Thiếu table_id trong query params", 400);
    }

    // Validate table_id is a number
    if (isNaN(Number(table_id))) {
      throw new AppError("table_id phải là số hợp lệ", 400);
    }

    // Get account's restaurant
    const account = await RestaurantAccount.findByPk(accountId, {
      attributes: ["id", "restaurant_id", "role"],
    });

    if (!account || !account.restaurant_id) {
      throw new AppError(
        "Tài khoản không hợp lệ hoặc chưa gắn với nhà hàng",
        403
      );
    }

    // Check table belongs to this restaurant
    const table = await RestaurantTable.findByPk(table_id, {
      attributes: ["id", "restaurant_id", "name", "status"],
    });

    if (!table) {
      throw new AppError("Bàn không tồn tại", 404);
    }

    if (table.restaurant_id !== account.restaurant_id) {
      throw new AppError(
        "Bạn không có quyền upload ảnh cho bàn của nhà hàng khác",
        403
      );
    }

    // ✅ Auto-inject both IDs to query
    req.query.restaurant_id = String(account.restaurant_id);
    req.query.table_id = String(table_id);

    // ✅ Store validated data
    req.validatedRestaurantId = account.restaurant_id;
    req.validatedTableId = Number(table_id);
    req.validatedTableName = table.name;

    console.log(
      `✅ Upload permission granted for table ${table_id} (${table.name}) of restaurant ${account.restaurant_id}`
    );

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Validate user_id matches current authenticated user
 * Auto-inject user_id to req.query
 *
 * Usage: Use this middleware for user avatar uploads
 * - user_avatar
 */
export const validateUserOwnership = async (req, res, next) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      throw new AppError("Unauthorized:  Không tìm thấy thông tin user", 401);
    }

    // Verify user exists
    const user = await User.findByPk(userId, {
      attributes: ["id", "display_name"],
    });

    if (!user) {
      throw new AppError("User không tồn tại", 404);
    }

    // ✅ Auto-inject user_id to query
    req.query.user_id = String(userId);

    // ✅ Store validated data
    req.validatedUserId = userId;
    req.validatedUserName = user.display_name;

    console.log(
      `✅ Upload permission granted for user ${userId} (${user.display_name})`
    );

    next();
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ Validate restaurant_account_id matches current account
 * Auto-inject restaurant_account_id to req.query
 *
 * Usage:  Use this middleware for restaurant account avatar uploads
 * - restaurant_account_avatar
 */
export const validateRestaurantAccountOwnership = async (req, res, next) => {
  try {
    const accountId = req.restaurantAccount?.id;

    if (!accountId) {
      throw new AppError(
        "Unauthorized: Không tìm thấy thông tin tài khoản",
        401
      );
    }

    // Verify account exists
    const account = await RestaurantAccount.findByPk(accountId, {
      attributes: ["id", "full_name", "role"],
    });

    if (!account) {
      throw new AppError("Tài khoản không tồn tại", 404);
    }

    // ✅ Auto-inject restaurant_account_id to query
    req.query.restaurant_account_id = String(accountId);

    // ✅ Store validated data
    req.validatedRestaurantAccountId = accountId;
    req.validatedAccountName = account.full_name;
    req.validatedAccountRole = account.role;

    console.log(
      `✅ Upload permission granted for account ${accountId} (${account.full_name})`
    );

    next();
  } catch (error) {
    next(error);
  }
};
