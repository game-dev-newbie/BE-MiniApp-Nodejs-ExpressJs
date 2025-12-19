// src/services/notification.service.js

import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { Op } from "sequelize";
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TYPE_LIST,
  NOTIFICATION_CHANNEL_LIST,
  NOTIFICATION_TARGET_TYPE_LIST,
} from "../constants/index.js";
import time from "../utils/time.js";

const { Notification } = models;

/**
 * Helper parse boolean từ query string
 * "true"/"1" => true, "false"/"0" => false, còn lại => undefined
 */
const parseBoolean = (value) => {
  if (value === undefined || value === null) return undefined;
  if (typeof value === "boolean") return value;
  const normalized = String(value).trim().toLowerCase();
  if (["true", "1", "yes"].includes(normalized)) return true;
  if (["false", "0", "no"].includes(normalized)) return false;
  return undefined;
};

/**
 * Tạo notification cơ bản
 */
export const createNotification = async ({
  userId = null,
  restaurantId = null,
  type,
  title,
  message,
  channel = NOTIFICATION_CHANNEL.IN_APP,
  targetType = null,
  targetId = null,
  meta = null,
}) => {
  if (!type || !NOTIFICATION_TYPE_LIST.includes(type)) {
    throw new AppError("Loại thông báo không hợp lệ", 400);
  }

  if (!NOTIFICATION_CHANNEL_LIST.includes(channel)) {
    throw new AppError("Kênh thông báo không hợp lệ", 400);
  }

  if (targetType && !NOTIFICATION_TARGET_TYPE_LIST.includes(targetType)) {
    throw new AppError("Loại target của notification không hợp lệ", 400);
  }

  if (!userId && !restaurantId) {
    throw new AppError(
      "Notification cần gắn với user_id hoặc restaurant_id",
      400
    );
  }

  const notification = await Notification.create({
    user_id: userId,
    restaurant_id: restaurantId,
    type,
    title,
    message,
    channel,
    target_type: targetType,
    target_id: targetId,
    meta,
    is_read: false,
  });

  return notification;
};

/**
 * =========================
 *   MINIAPP (CUSTOMER)
 * =========================
 */

// Lấy danh sách notification của user
// Lấy danh sách notification của user
export const getUserNotifications = async (
  userId,
  {
    read_status, // "all" | "read" | "unread"
    is_read, // string | boolean (back-compat)
    type, // string
    limit,
    offset,
    from_time, // string
    to_time, // string
  } = {}
) => {
  if (!userId) {
    throw new AppError("Thiếu userId để lấy thông báo", 400);
  }

  const where = {
    user_id: userId,
    channel: NOTIFICATION_CHANNEL.IN_APP,
  };

  // ----- CASE 1/2/3: all / read / unread -----
  const normalizedReadStatus = read_status
    ? String(read_status).trim().toLowerCase()
    : "all";

  if (normalizedReadStatus === "read") {
    // chỉ lấy đã đọc
    where.is_read = true;
  } else if (normalizedReadStatus === "unread") {
    // chỉ lấy chưa đọc
    where.is_read = false;
  } else if (typeof is_read !== "undefined") {
    // fallback: nếu chưa dùng read_status mà còn xài is_read cũ
    const parsed = parseBoolean(is_read);
    if (typeof parsed === "boolean") {
      where.is_read = parsed;
    }
  }
  // nếu read_status = "all" và không có is_read → không filter is_read

  // ----- Lọc theo type (nếu có) -----
  if (type && NOTIFICATION_TYPE_LIST.includes(type)) {
    where.type = type;
  }

  // ----- Lọc theo khoảng thời gian created_at (from_time / to_time) -----
  const { start, end } = time.buildDayRange(from_time, to_time);

  if (start || end) {
    where.created_at = {};
    if (start) {
      where.created_at[Op.gte] = start;
    }
    if (end) {
      where.created_at[Op.lte] = end;
    }
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [["created_at", "DESC"]], // mới nhất trước
    limit,
    offset,
  });

  return {
    items: rows,
    total: count,
  };
};

// Đánh dấu tất cả notification là đã đọc
export const markAllUserNotificationsAsRead = async (userId) => {
  if (!userId) {
    throw new AppError("Thiếu userId để đánh dấu đã đọc", 400);
  }

  const [affectedRows] = await Notification.update(
    { is_read: true, read_at: new Date() },
    {
      where: {
        user_id: userId,
        channel: NOTIFICATION_CHANNEL.IN_APP,
        is_read: false,
      },
    }
  );

  return { affectedRows };
};

// Đếm số notification chưa đọc của user
export const getUserUnreadCount = async (userId) => {
  if (!userId) {
    throw new AppError("Thiếu userId để đếm thông báo chưa đọc", 400);
  }

  const count = await Notification.count({
    where: {
      user_id: userId,
      channel: NOTIFICATION_CHANNEL.IN_APP,
      is_read: false,
    },
  });

  return count;
};

// =========================
//   MINIAPP: XOÁ THÔNG BÁO
// =========================

/**
 * Xoá 1 notification của user hiện tại (miniapp)
 */
export const deleteUserNotification = async (userId, notificationId) => {
  if (!userId) {
    throw new AppError("Thiếu userId để xoá thông báo", 400);
  }

  const notification = await Notification.findByPk(notificationId);

  if (
    !notification ||
    notification.user_id !== userId ||
    notification.channel !== NOTIFICATION_CHANNEL.IN_APP
  ) {
    throw new AppError("Không tìm thấy thông báo để xoá", 404);
  }

  await notification.destroy();

  return { id: notificationId };
};

/**
 * Xoá tất cả notification ĐÃ ĐỌC của user hiện tại (miniapp)
 */
export const deleteAllReadUserNotifications = async (userId) => {
  if (!userId) {
    throw new AppError("Thiếu userId để xoá thông báo", 400);
  }

  const deletedRows = await Notification.destroy({
    where: {
      user_id: userId,
      channel: NOTIFICATION_CHANNEL.IN_APP,
      is_read: true,
    },
  });

  return { deletedRows };
};

/**
 * =========================
 *   DASHBOARD (RESTAURANT)
 * =========================
 */

// Lấy danh sách notification của nhà hàng
export const getRestaurantNotifications = async (
  restaurantId,
  {
    read_status, // "all" | "read" | "unread"
    is_read, // string | boolean (back-compat)
    type, // string
    limit,
    offset,
    from_time, // string
    to_time, // string
  } = {}
) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId để lấy thông báo", 400);
  }

  const where = {
    restaurant_id: restaurantId,
    channel: NOTIFICATION_CHANNEL.IN_APP,
  };

  // ----- CASE 1/2/3: all / read / unread -----
  const normalizedReadStatus = read_status
    ? String(read_status).trim().toLowerCase()
    : "all";

  if (normalizedReadStatus === "read") {
    where.is_read = true;
  } else if (normalizedReadStatus === "unread") {
    where.is_read = false;
  } else if (typeof is_read !== "undefined") {
    const parsed = parseBoolean(is_read);
    if (typeof parsed === "boolean") {
      where.is_read = parsed;
    }
  }

  // ----- Lọc theo type (nếu có) -----
  if (type && NOTIFICATION_TYPE_LIST.includes(type)) {
    where.type = type;
  }

  // ----- Lọc theo khoảng thời gian created_at (from_time / to_time) -----
  const { start, end } = time.buildDayRange(from_time, to_time);

  if (fromTime || toTime) {
    where.created_at = {};
    if (start) {
      where.created_at[Op.gte] = start;
    }
    if (end) {
      where.created_at[Op.lte] = end;
    }
  }

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [["created_at", "DESC"]],
    limit,
    offset,
  });

  return {
    items: rows,
    total: count,
  };
};

// Đánh dấu 1 notification là đã đọc
export const markRestaurantNotificationAsRead = async (
  restaurantId,
  notificationId
) => {
  const notification = await Notification.findByPk(notificationId);

  if (!notification || notification.restaurant_id !== restaurantId) {
    throw new AppError("Không tìm thấy thông báo", 404);
  }

  if (!notification.is_read) {
    notification.is_read = true;
    notification.read_at = new Date();
    await notification.save();
  }

  return notification;
};

// Đánh dấu tất cả notification là đã đọc
export const markAllRestaurantNotificationsAsRead = async (restaurantId) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId để đánh dấu đã đọc", 400);
  }

  const [affectedRows] = await Notification.update(
    { is_read: true, read_at: new Date() },
    {
      where: {
        restaurant_id: restaurantId,
        channel: NOTIFICATION_CHANNEL.IN_APP,
        is_read: false,
      },
    }
  );

  return { affectedRows };
};

// Đếm số notification chưa đọc của nhà hàng
export const getRestaurantUnreadCount = async (restaurantId) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId để đếm thông báo chưa đọc", 400);
  }

  const count = await Notification.count({
    where: {
      restaurant_id: restaurantId,
      channel: NOTIFICATION_CHANNEL.IN_APP,
      is_read: false,
    },
  });

  return count;
};

// =========================
//   DASHBOARD: XOÁ THÔNG BÁO
// =========================

/**
 * Xoá 1 notification của nhà hàng (dashboard)
 */
export const deleteRestaurantNotification = async (
  restaurantId,
  notificationId
) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId để xoá thông báo", 400);
  }

  const notification = await Notification.findByPk(notificationId);

  if (
    !notification ||
    notification.restaurant_id !== restaurantId ||
    notification.channel !== NOTIFICATION_CHANNEL.IN_APP
  ) {
    throw new AppError("Không tìm thấy thông báo để xoá", 404);
  }

  await notification.destroy();

  return { id: notificationId };
};

/**
 * Xoá tất cả notification ĐÃ ĐỌC của nhà hàng (dashboard)
 */
export const deleteAllReadRestaurantNotifications = async (restaurantId) => {
  if (!restaurantId) {
    throw new AppError("Thiếu restaurantId để xoá thông báo", 400);
  }

  const deletedRows = await Notification.destroy({
    where: {
      restaurant_id: restaurantId,
      channel: NOTIFICATION_CHANNEL.IN_APP,
      is_read: true,
    },
  });

  return { deletedRows };
};
