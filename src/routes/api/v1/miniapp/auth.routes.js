// src/routes/api/v1/miniapp/auth.routes.js
import { Router } from "express";
import validate from "../../../../middlewares/validate.js";
import {
  ZaloLoginDto,
  MiniAppLoginDto,
  MiniAppRegisterDto,
} from "../../../../dtos/index.js";
import authController from "../../../../controllers/auth.controller.js";

const router = Router();

// Đăng kí mini app local
router.post(
  "/register",
  validate(MiniAppRegisterDto, "body"),
  authController.registerMiniAppLocal
);

// Đăng nhập mini app local
router.post(
  "/login",
  validate(MiniAppLoginDto, "body"),
  authController.loginMiniAppLocal
);

// Đăng nhập xác thực bằng zalo
router.post(
  "/zalo/login",
  validate(ZaloLoginDto, "body"),
  authController.loginWithZalo
);

export default router;
