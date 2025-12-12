// src/services/staff.service.js

import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import {
  RESTAURANT_ACCOUNT_ROLE,
  RESTAURANT_ACCOUNT_STATUS,
} from "../constants/index.js";

const { RestaurantAccount } = models;

/**
 * Helper: lấy owner account từ req (bạn pass req.restaurantAccount.id vào cũng được)
 */
const getOwnerAccount = async (ownerAccountId) => {
  const owner = await RestaurantAccount.findByPk(ownerAccountId);

  if (!owner) {
    throw new AppError("Tài khoản chủ nhà hàng không tồn tại", 404);
  }

  if (owner.role !== RESTAURANT_ACCOUNT_ROLE.OWNER) {
    throw new AppError("Chỉ chủ nhà hàng mới được thao tác với nhân viên", 403);
  }

  if (!owner.restaurant_id) {
    throw new AppError("Tài khoản chủ nhà hàng chưa gắn với nhà hàng nào", 400);
  }

  return owner;
};

/**
 * Helper: đảm bảo staff thuộc cùng nhà hàng với owner
 */
const getStaffUnderOwner = async (ownerAccountId, staffAccountId) => {
  const owner = await getOwnerAccount(ownerAccountId);

  const staff = await RestaurantAccount.findByPk(staffAccountId);

  if (!staff) {
    throw new AppError("Nhân viên không tồn tại", 404);
  }

  if (staff.role !== RESTAURANT_ACCOUNT_ROLE.STAFF) {
    throw new AppError("Tài khoản này không phải nhân viên", 400);
  }

  if (staff.restaurant_id !== owner.restaurant_id) {
    throw new AppError(
      "Bạn không có quyền thao tác với nhân viên của nhà hàng khác",
      403
    );
  }

  return { owner, staff };
};

// =======================
// 1) LẤY DANH SÁCH STAFF
// =======================

export const listStaffOfOwnerRestaurant = async (ownerAccountId) => {
  const owner = await getOwnerAccount(ownerAccountId);

  const staffs = await RestaurantAccount.findAll({
    where: {
      restaurant_id: owner.restaurant_id,
      role: RESTAURANT_ACCOUNT_ROLE.STAFF,
    },
    order: [
      ["status", "ASC"],
      ["is_locked", "ASC"],
      ["created_at", "ASC"],
    ],
  });

  return staffs;
};

// =======================
// 2) DUYỆT STAFF (INVITED -> ACTIVE)
// =======================

export const approveStaff = async (ownerAccountId, staffAccountId) => {
  const { staff } = await getStaffUnderOwner(ownerAccountId, staffAccountId);

  // Không cho duyệt nếu đang bị khóa
  if (staff.is_locked) {
    throw new AppError(
      "Không thể duyệt tài khoản nhân viên đang bị khóa. Hãy mở khóa trước.",
      400
    );
  }

  // Cho phép duyệt cả INVITED và REJECTED
  if (
    staff.status !== RESTAURANT_ACCOUNT_STATUS.INVITED &&
    staff.status !== RESTAURANT_ACCOUNT_STATUS.REJECTED
  ) {
    throw new AppError(
      "Chỉ có thể duyệt tài khoản đang ở trạng thái 'INVITED' hoặc 'REJECTED'",
      400
    );
  }

  staff.status = RESTAURANT_ACCOUNT_STATUS.ACTIVE;
  staff.is_locked = false; // duyệt xong thì luôn mở khóa

  await staff.save();
  return staff;
};

// =======================
// 3) TỪ CHỐI STAFF (INVITED -> REJECTED)
// =======================

export const rejectStaff = async (ownerAccountId, staffAccountId) => {
  const { staff } = await getStaffUnderOwner(ownerAccountId, staffAccountId);

  if (staff.status !== RESTAURANT_ACCOUNT_STATUS.INVITED) {
    throw new AppError(
      "Chỉ có thể từ chối tài khoản đang ở trạng thái 'INVITED'",
      400
    );
  }

  // tuỳ bạn: có thể dùng REJECTED hoặc DELETED
  staff.status = RESTAURANT_ACCOUNT_STATUS.REJECTED;
  await staff.save();

  return staff;
};

// =======================
// 4) KHÓA STAFF (ACTIVE -> is_locked = true)
// =======================

export const lockStaff = async (ownerAccountId, staffAccountId) => {
  const { staff } = await getStaffUnderOwner(ownerAccountId, staffAccountId);

  if (staff.status !== RESTAURANT_ACCOUNT_STATUS.ACTIVE) {
    throw new AppError(
      "Chỉ có thể khóa tài khoản đang ở trạng thái 'ACTIVE'",
      400
    );
  }

  if (staff.is_locked) {
    throw new AppError("Tài khoản nhân viên đã bị khóa sẵn rồi", 400);
  }

  staff.is_locked = true;
  await staff.save();

  return staff;
};

// =======================
// 5) MỞ KHÓA STAFF (ACTIVE + is_locked = true -> false)
// =======================

export const unlockStaff = async (ownerAccountId, staffAccountId) => {
  const { staff } = await getStaffUnderOwner(ownerAccountId, staffAccountId);

  if (staff.status !== RESTAURANT_ACCOUNT_STATUS.ACTIVE) {
    throw new AppError(
      "Chỉ có thể mở khóa tài khoản đang ở trạng thái 'ACTIVE'",
      400
    );
  }

  if (!staff.is_locked) {
    throw new AppError("Tài khoản nhân viên đang không bị khóa", 400);
  }

  staff.is_locked = false;
  await staff.save();

  return staff;
};
