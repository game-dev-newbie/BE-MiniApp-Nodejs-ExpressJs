// src/services/restaurantTable.service.js

import models from "../models/index.js";
import { Op } from "sequelize";
import { AppError } from "../utils/appError.js";
import { TABLE_STATUS } from "../constants/index.js";

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

// =====================
// 1) LIST TẤT CẢ BÀN
// =====================

export const listTablesOfMyRestaurant = async (accountId) => {
  const account = await getAccountWithRestaurant(accountId);

  const tables = await RestaurantTable.findAll({
    where: {
      restaurant_id: account.restaurant_id,
      // chỉ lấy bàn chưa bị "xoá mềm"
      status: {
        [Op.ne]: TABLE_STATUS.INACTIVE,
      },
    },
    order: [
      ["status", "ASC"],
      ["name", "ASC"],
      ["id", "ASC"],
    ],
  });

  return tables;
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

  const table = await RestaurantTable.create({
    restaurant_id: account.restaurant_id,
    name: payload.name,
    capacity: payload.capacity,
    location: payload.location,
    status: payload.status || TABLE_STATUS.ACTIVE,
    view_image_url: payload.view_image_url || null,
    view_note: payload.view_note || null,
  });

  return table;
};

// =====================
// 4) CẬP NHẬT BÀN
// =====================

export const updateTable = async (accountId, tableId, payload) => {
  const { table } = await getTableUnderAccountRestaurant(accountId, tableId);

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

  await table.save();
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

  table.status = TABLE_STATUS.INACTIVE;
  await table.save();

  return table;
};
