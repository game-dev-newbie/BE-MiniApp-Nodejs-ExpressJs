// src/services/restaurantTable.service.js

import models from "../models/index.js";
import { Op } from "sequelize";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/appError.js";
import { TABLE_STATUS } from "../constants/index.js";
import {
  safeUnlinkByWebPath,
  isSameWebPath,
} from "../utils/fileStorage.util.js";

const { RestaurantAccount, RestaurantTable } = models;

/**
 * Lấy owner/staff hiện tại + đảm bảo account gắn với một nhà hàng.
 */
const getAccountWithRestaurant = async (accountId) => {
  const account = await RestaurantAccount.findByPk(accountId);

  if (!account) {
    throw new AppError("Tài khoản nhà hàng không tồn tại", 404);
  }

  if (!account.restaurant_id) {
    throw new AppError("Tài khoản này chưa được gắn với nhà hàng nào", 400);
  }

  return account;
};

/**
 * Đảm bảo bàn thuộc đúng nhà hàng của account đang login
 */
const getTableUnderAccountRestaurant = async (accountId, tableId) => {
  const account = await getAccountWithRestaurant(accountId);

  const table = await RestaurantTable.findByPk(tableId);

  if (!table) {
    throw new AppError("Bàn không tồn tại", 404);
  }

  if (table.restaurant_id !== account.restaurant_id) {
    throw new AppError(
      "Bạn không có quyền thao tác với bàn của nhà hàng khác",
      403
    );
  }

  return { account, table };
};

/**
 * ✅ NEW: Validate view_image_url path
 * Ensures path follows new structure:  uploads/restaurants/{rid}/tables/{tid}/view/
 */
const validateTableImagePath = (restaurantId, tableId, imagePath) => {
  if (!imagePath) {
    return null; // Null is OK
  }

  const normalizedPath = normalizeWebPath(imagePath);

  if (!normalizedPath) {
    throw new AppError("Đường dẫn ảnh không hợp lệ", 400);
  }

  // ✅ NEW STRUCTURE: Check path belongs to this restaurant's table
  const expectedPrefix = `/uploads/restaurants/${restaurantId}/tables/${tableId}/view/`;

  if (!normalizedPath.startsWith(expectedPrefix)) {
    throw new AppError(
      `Đường dẫn ảnh không hợp lệ.  Đường dẫn phải bắt đầu bằng:  ${expectedPrefix}`,
      403
    );
  }

  // ✅ Check file exists on disk
  const diskPath = path.join(
    process.cwd(),
    "public",
    normalizedPath.replace(/^\//, "")
  );

  if (!fs.existsSync(diskPath)) {
    throw new AppError(
      "File ảnh không tồn tại trên server.  Vui lòng upload lại.",
      404
    );
  }

  return normalizedPath;
};

// =====================
// 1) LIST TẤT CẢ BÀN
// =====================

export const listTablesOfMyRestaurant = async (
  accountId,
  { limit, offset } = {}
) => {
  const account = await getAccountWithRestaurant(accountId);

  const { rows, count } = await RestaurantTable.findAndCountAll({
    where: {
      restaurant_id: account.restaurant_id,
      // chỉ lấy bàn chưa bị "xoá mềm"
      status: {
        [Op.ne]: TABLE_STATUS.INACTIVE,
      },
    },
    limit,
    offset,
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
      ["id", "ASC"],
    ],
  });

  return { items: rows, total: count };
};

// =====================
// 2) LẤY CHI TIẾT 1 BÀN
// =====================

export const getTableDetail = async (accountId, tableId) => {
  const { table } = await getTableUnderAccountRestaurant(accountId, tableId);
  if (table.status === TABLE_STATUS.INACTIVE) {
    throw new AppError("Bàn không tồn tại hoặc đã bị xoá", 404);
  }
  return table;
};

// =====================
// 3) TẠO BÀN MỚI
// =====================

export const createTable = async (accountId, payload) => {
  const account = await getAccountWithRestaurant(accountId);

  // ✅ IMPROVED: Validate view_image_url if provided
  let validatedImageUrl = null;

  if (payload.view_image_url) {
    const normalizedPath = normalizeWebPath(payload.view_image_url);

    if (!normalizedPath) {
      throw new AppError("Đường dẫn ảnh không hợp lệ", 400);
    }

    // ✅ NEW:  For createTable, we can't validate full path yet (no tableId)
    // So we do basic validation:  must be in restaurant's folder
    const expectedPrefix = `/uploads/restaurants/${account.restaurant_id}/tables/`;

    if (!normalizedPath.startsWith(expectedPrefix)) {
      throw new AppError(
        `Đường dẫn ảnh phải bắt đầu bằng: ${expectedPrefix}`,
        403
      );
    }

    // Check file exists
    const diskPath = path.join(
      process.cwd(),
      "public",
      normalizedPath.replace(/^\//, "")
    );

    if (!fs.existsSync(diskPath)) {
      throw new AppError(
        "File ảnh không tồn tại trên server. Vui lòng upload lại.",
        404
      );
    }

    validatedImageUrl = normalizedPath;
  }
  const table = await RestaurantTable.create({
    restaurant_id: account.restaurant_id,
    name: payload.name,
    capacity: payload.capacity,
    location: payload.location,
    status: payload.status || TABLE_STATUS.ACTIVE,
    view_image_url: validatedImageUrl,
    view_note: payload.view_note || null,
  });

  return table;
};

// =====================
// 4) CẬP NHẬT BÀN
// =====================

export const updateTable = async (accountId, tableId, payload) => {
  const { account, table } = await getTableUnderAccountRestaurant(
    accountId,
    tableId
  );
  const oldView = table.view_image_url;

  const fields = [
    "name",
    "capacity",
    "location",
    "status",
    "view_image_url",
    "view_note",
  ];

  for (const key of fields) {
    if (payload[key] !== undefined) {
      table[key] = payload[key];
    }
  }

  // ✅ IMPROVED: Validate view_image_url with NEW PATH STRUCTURE
  if (payload.view_image_url !== undefined) {
    const validatedPath = validateTableImagePath(
      account.restaurant_id,
      tableId,
      payload.view_image_url
    );
    table.view_image_url = validatedPath;
  }

  await table.save();

  // Nếu client gửi view_image_url mới (kể cả null) -> xem như có ý định thay đổi ảnh
  // ✅ Cleanup old image
  if (payload.view_image_url !== undefined) {
    const newView = table.view_image_url;

    // Case 1: Thay ảnh mới → xóa ảnh cũ
    if (oldView && newView && !isSameWebPath(oldView, newView)) {
      try {
        await safeUnlinkByWebPath(oldView);
        console.log(`✅ Deleted old table image: ${oldView}`);
      } catch (err) {
        console.error(`⚠️ Failed to delete old table image: ${oldView}`, err);
      }
    }

    // Case 2: Xóa ảnh (set null) → xóa file cũ
    if (oldView && !newView) {
      try {
        await safeUnlinkByWebPath(oldView);
        console.log(`✅ Deleted removed table image: ${oldView}`);
      } catch (err) {
        console.error(
          `⚠️ Failed to delete removed table image: ${oldView}`,
          err
        );
      }
    }
  }
  return table;
};

// =====================
// 5) "XOÁ" BÀN = INACTIVE
// =====================

export const softDeleteTable = async (accountId, tableId) => {
  const { table } = await getTableUnderAccountRestaurant(accountId, tableId);

  // Thay vì xoá record (dễ toang bookings.table_id), ta set INACTIVE
  if (table.status === TABLE_STATUS.INACTIVE) {
    throw new AppError("Bàn này đã ở trạng thái INACTIVE rồi", 400);
  }
  // ✅ IMPROVED: Delete view_image_url file when soft deleting
  const oldView = table.view_image_url;

  table.status = TABLE_STATUS.INACTIVE;

  // ✅ Optional: Clear view_image_url when soft deleting
  table.view_image_url = null;

  await table.save();

  // ✅ Delete physical file
  if (oldView) {
    try {
      await safeUnlinkByWebPath(oldView);
      console.log(`✅ Deleted table view image on soft delete: ${oldView}`);
    } catch (err) {
      console.error(`⚠️ Failed to delete table view image: ${oldView}`, err);
      // Don't throw - soft delete should succeed anyway
    }
  }
  return table;
};
