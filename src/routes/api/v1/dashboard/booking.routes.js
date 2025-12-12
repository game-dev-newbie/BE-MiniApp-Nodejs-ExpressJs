// src/routes/api/v1/dashboard/booking.routes.js
import { Router } from "express";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/index.js";
import bookingController from "../../../../controllers/booking.controller.js";

const router = Router();

// Lấy danh sách booking (dashboard)
router.get(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  bookingController.listBookingsDashboard
);

// Lấy chi tiết booking (dashboard)
router.get(
  "/:id",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  bookingController.getBookingDetailDashboard
);

// xác nhận booking (dashboard)
router.patch(
  "/:id/confirm",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  bookingController.confirmBookingDashboard
);

// huỷ booking (dashboard)
router.patch(
  "/:id/cancel",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  bookingController.cancelBookingDashboard
);

// checkin booking (dashboard)
router.patch(
  "/:id/complete",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  bookingController.completeBookingDashboard
);

// đánh dấu no-show booking (dashboard)
router.patch(
  "/:id/no-show",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  bookingController.noShowBookingDashboard
);

export default router;
