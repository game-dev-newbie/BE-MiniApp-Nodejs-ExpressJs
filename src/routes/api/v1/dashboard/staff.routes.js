// src/routes/api/v1/dashboard/staff.routes.js

import { Router } from "express";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/index.js";
import staffController from "../../../../controllers/staff.controller.js";

const router = Router();

// Chỉ OWNER được quản lý staff

// Lấy danh sách tất cả staff của nhà hàng mình
router.get(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  staffController.listStaff
);

// Duyệt 1 staff (INVITED -> ACTIVE)
router.patch(
  "/:id/approve",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  staffController.approveStaff
);

// Từ chối 1 staff (INVITED -> REJECTED)
router.patch(
  "/:id/reject",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  staffController.rejectStaff
);

// Khoá 1 staff (ACTIVE -> is_locked = true)
router.patch(
  "/:id/lock",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  staffController.lockStaff
);

// Mở khoá 1 staff (ACTIVE + is_locked = true -> false)
router.patch(
  "/:id/unlock",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  staffController.unlockStaff
);

export default router;
