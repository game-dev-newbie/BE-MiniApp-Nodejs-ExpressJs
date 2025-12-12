// src/routes/api/v1/miniapp/notification.routes.js
import { Router } from "express";
import { requireCustomer } from "../../../../middlewares/jwtAuthorization.js";
import notificationController from "../../../../controllers/notification.controller.js";

const router = Router();

// Lấy danh sách notification của user hiện tại
router.get(
  "/",
  ...requireCustomer(),
  notificationController.getMyNotifications
);

// Đánh dấu 1 notification là đã đọc
router.patch(
  "/:id/read",
  ...requireCustomer(),
  notificationController.markMyNotificationAsRead
);

// Đánh dấu tất cả notification là đã đọc
router.patch(
  "/read-all",
  ...requireCustomer(),
  notificationController.markAllMyNotificationsAsRead
);

// Lấy số lượng notification chưa đọc của user hiện tại
router.get(
  "/unread-count",
  ...requireCustomer(),
  notificationController.getMyUnreadCount
);


export default router;
