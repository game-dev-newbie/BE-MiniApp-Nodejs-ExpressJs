// src/services/notification.service.js

import models from "../models/index.js";
import { AppError } from "../utils/appError.js";
import { Op } from "sequelize";
import {
  NOTIFICATION_TYPE,
  NOTIFICATION_CHANNEL,
  NOTIFICATION_TYPE_LIST,
  NOTIFICATION_CHANNEL_LIST,
} from "../constants/notification.js";
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

const parseDateTime = (value) => {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return undefined;
  }
  return date;
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
}) => {
  if (!type || !NOTIFICATION_TYPE_LIST.includes(type)) {
    throw new AppError("Loại thông báo không hợp lệ", 400);
  }

  if (!NOTIFICATION_CHANNEL_LIST.includes(channel)) {
    throw new AppError("Kênh thông báo không hợp lệ", 400);
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
    limit = 20,
    offset = 0,
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
    if (fromTime) {
      where.created_at[Op.gte] = start;
    }
    if (toTime) {
      where.created_at[Op.lte] = end;
    }
  }

  // ----- Phân trang -----
  const parsedLimit = Number.isNaN(Number(limit)) ? 20 : Number(limit);
  const parsedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

  const { rows, count } = await Notification.findAndCountAll({
    where,
    order: [["created_at", "DESC"]], // mới nhất trước
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
    limit = 20,
    offset = 0,
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
  const fromTime = parseDateTime(from_time);
  const toTime = parseDateTime(to_time);

  if (fromTime || toTime) {
    where.created_at = {};
    if (fromTime) {
      where.created_at[Op.gte] = fromTime;
    }
    if (toTime) {
      where.created_at[Op.lte] = toTime;
    }
  }

  // ----- Phân trang -----
  const parsedLimit = Number.isNaN(Number(limit)) ? 20 : Number(limit);
  const parsedOffset = Number.isNaN(Number(offset)) ? 0 : Number(offset);

  const { rows, count } = await Notification.findAndCountAll({
    where,
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
