// src/services/restaurantImage.service.js

import { Op } from "sequelize";
import models, { sequelize } from "../models/index.js";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/appError.js";
import { RESTAURANT_IMAGE_TYPE } from "../constants/restaurantImage.js";
import { normalizeWebPath } from "../utils/uploadPath.util.js";
import {
  safeUnlinkByWebPath,
  isSameWebPath,
} from "../utils/fileStorage.util.js";


const { RestaurantImage, Restaurant } = models;

/**
 * Tạo 1 ảnh cho nhà hàng (dashboard)
 * restaurantId lấy từ tài khoản dashboard (owner/staff)
 */
export const createImageForRestaurant = async (restaurantId, payload) => {
  const { file_path, type, caption, is_primary } = payload;

  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId để tạo ảnh nhà hàng", 400);
  }

  const normalizedPath = normalizeWebPath(file_path);

  if (!normalizeWebPath) {
    throw new AppError("Đường dẫn file không hợp lệ", 400);
  }

  // kiểm tra đường dẫn file thuộc về nhà hàng này
  const expectedPrefix = `/uploads/restaurants/${restaurantId}/`;
  if (!normalizedPath.startsWith(expectedPrefix)) {
    throw new AppError("Đường dẫn file không thuộc về nhà hàng này", 403);
  }

  // ✅ IMPROVEMENT 1: Check file tồn tại trong disk
  const diskPath = path.join(
    process.cwd(),
    "public",
    normalizedPath.replace(/^\//, "")
  );

  if (!fs.existsSync(diskPath)) {
    throw new AppError(
      "File không tồn tại trên server.  Vui lòng upload lại file.",
      404
    );
  }

  const finalImage = await sequelize.transaction(async (t) => {
    const image = await RestaurantImage.create(
      {
        restaurant_id: restaurantId,
        file_path: normalizedPath,
        type,
        caption: caption || null,
        is_primary: Boolean(is_primary),
      },
      { transaction: t }
    );

    // Nếu là ảnh COVER và is_primary = true
    if (type === RESTAURANT_IMAGE_TYPE.COVER && is_primary) {
      // 1. bỏ is_primary của các ảnh COVER khác
      await RestaurantImage.update(
        { is_primary: false },
        {
          where: {
            restaurant_id: restaurantId,
            type: RESTAURANT_IMAGE_TYPE.COVER,
            id: { [Op.ne]: image.id },
          },
          transaction: t,
        }
      );

      // 2. cập nhật main_image_url cho nhà hàng
      const restaurant = await Restaurant.findByPk(restaurantId, {
        transaction: t,
      });
      if (restaurant) {
        restaurant.main_image_url = normalizedPath;
        await restaurant.save({ transaction: t });
      }
    }
    return image;
  });
  return finalImage;
};

/**
 * Lấy danh sách ảnh của nhà hàng (dashboard)
 */
export const getImagesForRestaurant = async (
  restaurantId,
  { type, limit, offset } = {}
) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId để lấy ảnh nhà hàng", 400);
  }

  const where = { restaurant_id: restaurantId };
  if (type) {
    where.type = type;
  }

  const { rows, count } = await RestaurantImage.findAndCountAll({
    where,
    order: [
      ["is_primary", "DESC"],
      ["created_at", "DESC"],
    ],
    limit,
    offset,
  });

  return {
    items: rows,
    total: count,
  };
};

/**
 * Lấy chi tiết 1 ảnh (dashboard)
 */
export const getImageByIdForRestaurant = async (restaurantId, imageId) => {
  const image = await RestaurantImage.findOne({
    where: {
      id: imageId,
      restaurant_id: restaurantId,
    },
  });

  if (!image) {
    throw new AppError(
      "Ảnh không tồn tại hoặc không thuộc nhà hàng của bạn",
      404
    );
  }

  return image;
};

/**
 * Xoá 1 ảnh của nhà hàng.
 * Nếu xoá ảnh COVER primary:
 *  - gán main_image_url sang 1 ảnh COVER khác (nếu có)
 *  - nếu không còn ảnh COVER -> main_image_url = null
 */
export const deleteImageForRestaurant = async (restaurantId, imageId) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId để xoá ảnh nhà hàng", 400);
  }

  const image = await RestaurantImage.findOne({
    where: {
      id: imageId,
      restaurant_id: restaurantId,
    },
  });

  if (!image) {
    throw new AppError(
      "Ảnh không tồn tại hoặc không thuộc nhà hàng của bạn",
      404
    );
  }

  // ✅ Delete physical file FIRST
  try {
    await safeUnlinkByWebPath(image.file_path);
  } catch (fileError) {
    console.error(
      `Thất bại khi xóa ảnh trong disk: ${image.file_path}`,
      fileError
    );
    // Continue anyway - file might already be deleted
  }
  const { type, is_primary } = image;

  if (type === RESTAURANT_IMAGE_TYPE.COVER && is_primary) {
    // tìm 1 cover khác để thay thế
    const newPrimary = await RestaurantImage.findOne({
      where: {
        restaurant_id: restaurantId,
        type: RESTAURANT_IMAGE_TYPE.COVER,
      },
      order: [["created_at", "DESC"]],
    });

    const restaurant = await Restaurant.findByPk(restaurantId);
    if (restaurant) {
      restaurant.main_image_url = newPrimary ? newPrimary.file_path : null;
      await restaurant.save();
    }

    if (newPrimary) {
      newPrimary.is_primary = true;
      await newPrimary.save();
    }
  }

  await image.destroy();
  return { success: true };
};
