// src/routes/api/v1/miniapp/auth.routes.js
import { Router } from "express";
import validate from "../../../../middlewares/validate.js";
import { ZaloLoginDto } from "../../../../dtos/index.js";
import authController from "../../../../controllers/auth.controller.js";

const router = Router();

router.post(
  "/zalo/login",
  validate(ZaloLoginDto, "body"),
  authController.loginWithZalo
);

export default router;
