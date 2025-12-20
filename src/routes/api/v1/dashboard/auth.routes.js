// src/routes/api/v1/dashboard/auth.routes.js
import { Router } from "express";
import validate from "../../../../middlewares/validate.js";
import {
  DashboardLoginDto,
  DashboardOwnerRegisterDto,
  DashboardStaffRegisterDto,
  ForgotPasswordDto,
  ResetPasswordDto,
} from "../../../../dtos/index.js";
import authController from "../../../../controllers/auth.controller.js";

const router = Router();

// Đăng ký OWNER + create restaurant
router.post(
  "/register/owner",
  validate(DashboardOwnerRegisterDto, "body"),
  authController.registerDashboardOwner
);

// Đăng ký STAFF bằng invite_code
router.post(
  "/register/staff",
  validate(DashboardStaffRegisterDto, "body"),
  authController.registerDashboardStaff
);

// Login chung cho cả owner + staff
router.post(
  "/login",
  validate(DashboardLoginDto, "body"),
  authController.loginDashboard
);

/**
 * Forgot Password
 * POST /v1/dashboard/auth/forgot-password
 * Body: { email }
 */
router.post(
  "/forgot-password",
  validate(ForgotPasswordDto, "body"),
  authController.forgotPasswordDashboard
);


/**
 * Reset Password
 * POST /v1/dashboard/auth/reset-password
 * Body: { email, reset_token, new_password }
 */
router.post(
  "/reset-password",
  validate(ResetPasswordDto, "body"),
  authController.resetPasswordDashboard
);

export default router;
