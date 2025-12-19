// src/controllers/notification.controller.js

import { catchAsync } from "../utils/catchAsync.js";
import * as notificationService from "../services/notification.service.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../utils/pagination.util.js";
import { NotificationResponse } from "../dtos/index.js";

class NotificationController {
  /**
   * MINIAPP: lấy danh sách notification của user hiện tại
   * GET /miniapp/notifications?is_read=false&type=BOOKING_CREATED&limit=20&offset=0
   */
  getMyNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const {
      read_status,
      is_read, // để back-compat, nhưng FE mới nên dùng read_status
      type,
      from_time,
      to_time,
    } = req.query;

    const { limit, offset, page } = parsePagination(req.query);

    const result = await notificationService.getUserNotifications(userId, {
      read_status,
      is_read,
      type,
      limit,
      offset,
      from_time,
      to_time,
    });

    const items = NotificationResponse.fromList(result.items);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách thông báo miniapp thành công",
      data: {
        items,
        pagination: buildPaginationMeta({
          total: result.total,
          limit,
          offset,
          page,
        }),
      },
    });
  });

  /**
   * MINIAPP: đánh dấu 1 notification là đã đọc
   * PATCH /miniapp/notifications/:id/read
   */
  markMyNotificationAsRead = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const notification = await notificationService.markUserNotificationAsRead(
      userId,
      notificationId
    );

    const data = NotificationResponse.fromModel(notification);

    return res.status(200).json({
      success: true,
      message: "Đánh dấu thông báo đã đọc thành công",
      data,
    });
  });

  /**
   * MINIAPP: đánh dấu tất cả thông báo là đã đọc
   * PATCH /miniapp/notifications/read-all
   */
  markAllMyNotificationsAsRead = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const result = await notificationService.markAllUserNotificationsAsRead(
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Đánh dấu tất cả thông báo đã đọc thành công",
      data: {
        affected_rows: result.affectedRows,
      },
    });
  });
  /**
   * MINIAPP: đếm số thông báo chưa đọc
   * GET /miniapp/notifications/unread-count
   */
  getMyUnreadCount = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const unreadCount = await notificationService.getUserUnreadCount(userId);

    return res.status(200).json({
      success: true,
      message: "Lấy số thông báo chưa đọc thành công",
      data: {
        unread_count: unreadCount,
      },
    });
  });

  /**
   * MINIAPP: xoá 1 notification
   * DELETE /miniapp/notifications/:id
   */
  deleteMyNotification = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const notificationId = req.params.id;

    const result = await notificationService.deleteUserNotification(
      userId,
      notificationId
    );

    return res.status(200).json({
      success: true,
      message: "Xoá thông báo thành công",
      data: result,
    });
  });

  /**
   * MINIAPP: xoá tất cả notification ĐÃ ĐỌC
   * DELETE /miniapp/notifications/read-all
   */
  deleteAllMyReadNotifications = catchAsync(async (req, res, next) => {
    const userId = req.user.id;

    const result = await notificationService.deleteAllReadUserNotifications(
      userId
    );

    return res.status(200).json({
      success: true,
      message: "Xoá tất cả thông báo đã đọc thành công",
      data: {
        deleted_rows: result.deletedRows,
      },
    });
  });

  /**
   * DASHBOARD: lấy danh sách notification của nhà hàng
   * GET /dashboard/notifications?is_read=false&type=BOOKING_CREATED&limit=20&offset=0
   */
  getRestaurantNotifications = catchAsync(async (req, res, next) => {
    const restaurantId = req.restaurantAccount.restaurant_id;

    const {
      read_status,
      is_read, // back-compat
      type,
      from_time,
      to_time,
    } = req.query;

    const { limit, offset, page } = parsePagination(req.query);

    const result = await notificationService.getRestaurantNotifications(
      restaurantId,
      {
        read_status,
        is_read,
        type,
        limit,
        offset,
        from_time,
        to_time,
      }
    );

    const items = NotificationResponse.fromList(result.items);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách thông báo dashboard thành công",
      data: {
        items,
        pagination: buildPaginationMeta({
          total: result.total,
          limit,
          offset,
          page,
        }),
      },
    });
  });

  /**
   * DASHBOARD: đánh dấu 1 notification đã đọc
   * PATCH /dashboard/notifications/:id/read
   */
  markRestaurantNotificationAsRead = catchAsync(async (req, res, next) => {
    const restaurantId = req.restaurantAccount.restaurant_id;
    const notificationId = req.params.id;

    const notification =
      await notificationService.markRestaurantNotificationAsRead(
        restaurantId,
        notificationId
      );

    const data = NotificationResponse.fromModel(notification);

    return res.status(200).json({
      success: true,
      message: "Đánh dấu thông báo đã đọc thành công",
      data,
    });
  });

  /**
   * DASHBOARD: đánh dấu tất cả notification đã đọc
   * PATCH /dashboard/notifications/read-all
   */
  markAllRestaurantNotificationsAsRead = catchAsync(async (req, res, next) => {
    const restaurantId = req.restaurantAccount.restaurant_id;

    const result =
      await notificationService.markAllRestaurantNotificationsAsRead(
        restaurantId
      );

    return res.status(200).json({
      success: true,
      message: "Đánh dấu tất cả thông báo đã đọc thành công",
      data: {
        affected_rows: result.affectedRows,
      },
    });
  });
  /**
   * DASHBOARD: đếm số thông báo chưa đọc của nhà hàng
   * GET /dashboard/notifications/unread-count
   */
  getRestaurantUnreadCount = catchAsync(async (req, res, next) => {
    const restaurantId = req.restaurantAccount.restaurant_id;

    const unreadCount = await notificationService.getRestaurantUnreadCount(
      restaurantId
    );

    return res.status(200).json({
      success: true,
      message: "Lấy số thông báo chưa đọc của nhà hàng thành công",
      data: {
        unread_count: unreadCount,
      },
    });
  });

  /**
   * DASHBOARD: xoá 1 notification của nhà hàng
   * DELETE /dashboard/notifications/:id
   */
  deleteRestaurantNotification = catchAsync(async (req, res, next) => {
    const restaurantId = req.restaurantAccount.restaurant_id;
    const notificationId = req.params.id;

    const result = await notificationService.deleteRestaurantNotification(
      restaurantId,
      notificationId
    );

    return res.status(200).json({
      success: true,
      message: "Xoá thông báo thành công",
      data: result,
    });
  });

  /**
   * DASHBOARD: xoá tất cả notification ĐÃ ĐỌC của nhà hàng
   * DELETE /dashboard/notifications/read-all
   */
  deleteAllRestaurantReadNotifications = catchAsync(async (req, res, next) => {
    const restaurantId = req.restaurantAccount.restaurant_id;

    const result =
      await notificationService.deleteAllReadRestaurantNotifications(
        restaurantId
      );

    return res.status(200).json({
      success: true,
      message: "Xoá tất cả thông báo đã đọc của nhà hàng thành công",
      data: {
        deleted_rows: result.deletedRows,
      },
    });
  });
}

const notificationController = new NotificationController();
export default notificationController;
