// src/routes/api/v1/dashboard/notification.routes.js
import { Router } from "express";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/index.js";
import notificationController from "../../../../controllers/notification.controller.js";

const router = Router();

// Lấy danh sách notification của nhà hàng
router.get(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  notificationController.getRestaurantNotifications
);

// Đanh dấu 1 notification là đã đọc
router.patch(
  "/:id/read",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  notificationController.markRestaurantNotificationAsRead
);

// Đánh dấu tất cả notification là đã đọc
router.patch(
  "/read-all",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  notificationController.markAllRestaurantNotificationsAsRead
);

// Lấy số lượng notification chưa đọc của nhà hàng
router.get(
  "/unread-count",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  notificationController.getRestaurantUnreadCount
);

export default router;
