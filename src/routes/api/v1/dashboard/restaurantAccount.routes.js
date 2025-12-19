// src/routes/api/v1/dashboard/restaurantAccount.routes.js

import { Router } from "express";
import validate from "../../../../middlewares/validate.js";
import restaurantAccountController from "../../../../controllers/restaurantAccount.controller.js";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/index.js";

// DTO
import {
  DashboardChangePasswordDto,
  DashboardUpdateProfileDto,
} from "../../../../dtos/index.js";

const router = Router();

// Lấy thông tin tài khoản hiện tại
router.get(
  "/me",
  ...requireDashboardRoles(AUTH_ROLES.STAFF, AUTH_ROLES.OWNER),
  restaurantAccountController.getMyProfile
);

// Cập nhật tên + avatar_url
router.patch(
  "/me/profile",
  ...requireDashboardRoles(AUTH_ROLES.STAFF, AUTH_ROLES.OWNER),
  validate(DashboardUpdateProfileDto, "body"),
  restaurantAccountController.updateMyProfile
);

// Đổi mật khẩu + thu hồi token
router.post(
  "/me/change-password",
  ...requireDashboardRoles(AUTH_ROLES.STAFF, AUTH_ROLES.OWNER),
  validate(DashboardChangePasswordDto, "body"),
  restaurantAccountController.changePassword
);

export default router;
