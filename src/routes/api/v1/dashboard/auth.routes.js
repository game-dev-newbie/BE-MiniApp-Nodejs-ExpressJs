import { Router } from "express";
import validate from "../../../../middlewares/validate.js";

import {
  DashboardLoginDto,
  DashboardOwnerRegisterDto,
  DashboardStaffRegisterDto,
} from "../../../../dtos/index.js";
import authController from "../../../../controllers/auth.controller.js";

const router = Router();

// Đăng ký OWNER + create restaurant
router.post(
  "/register-owner",
  validate(DashboardOwnerRegisterDto, "body"),
  authController.registerOwner
);

// Đăng ký STAFF bằng invite_code
router.post(
  "/register-staff",
  validate(DashboardStaffRegisterDto, "body"),
  authController.registerStaff
);

// Login chung cho cả owner + staff
router.post(
  "/login",
  validate(DashboardLoginDto, "body"),
  authController.loginRestaurant
);

export default router;
