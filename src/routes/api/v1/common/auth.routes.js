// src/routes/api/v1/common/auth.routes.js
import { Router } from "express";
import authController from "../../../../controllers/auth.controller.js";

const router = Router();

// Route refresh token chung
router.post("/refresh", authController.refreshToken);

// Route logout chung
router.post("/logout", authController.logout);

export default router;
