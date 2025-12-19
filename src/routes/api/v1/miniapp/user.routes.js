// src/routes/api/v1/miniapp/user.routes.js
import { Router } from "express";
import userController from "../../../../controllers/user.controller.js";
import { requireCustomer } from "../../../../middlewares/jwtAuthorization.js";
// nếu bạn có validate Joi:
import validate from "../../../../middlewares/validate.js";
import {
  MiniAppUpdateProfileDto,
  MiniAppChangePasswordDto,
} from "../../../../dtos/index.js";

const router = Router();

// GET  /miniapp/users/me
router.get("/me", ...requireCustomer(), userController.getMe);

// PATCH /miniapp/users/me
router.patch(
  "/me",
  ...requireCustomer(),
  validate(MiniAppUpdateProfileDto, "body"),
  userController.updateMe
);

// POST /miniapp/users/me/change-password
router.post(
  "/me/change-password",
  ...requireCustomer(),
  validate(MiniAppChangePasswordDto, "body"),
  userController.changePassword
);

export default router;
