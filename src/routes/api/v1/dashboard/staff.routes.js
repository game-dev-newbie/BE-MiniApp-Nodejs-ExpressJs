// src/routes/api/v1/dashboard/staff.routes.js
import { Router } from "express";
import validate from "../../../../middlewares/validate.js";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/index.js";

const router = Router();

// Lấy danh sách STAFF đang chờ phê duyệt
router.get(
  "/pending",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
);

// Duyệt STAFF bằng invite_code
router.patch(
  "/:id/approve",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
);

// Từ chối STAFF có id
router.patch(
  "/:id/reject",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
);

export default router;
