// src/routes/api/v1/common/upload.routes.js
import { Router } from "express";
import uploadController from "../../../../controllers/upload.controller.js";
import { uploadSingleImageMiddleware } from "../../../../middlewares/uploadImage.middleware.js";
import { requireCustomer } from "../../../../middlewares/jwtAuthorization.js";
import { validateUserOwnership } from "../../../../middlewares/validateUploadOwnership.middleware.js";
import {
  uploadRateLimiter,
  avatarUploadRateLimiter,
} from "../../../../middlewares/rateLimitUpload.middleware.js";

const router = Router();
// ✅ Apply general rate limiting to ALL miniapp upload routes
router.use(uploadRateLimiter);

/**
 * Upload user avatar
 * POST /api/v1/miniapp/uploads/images/users/avatar
 * Field: file (single)
 */
router.post(
  "/images/users/avatar",
  ...requireCustomer(),
  avatarUploadRateLimiter, // ✅ NEW:  Stricter limit for avatar changes
  validateUserOwnership, // ✅ NEW: Validate & auto-inject user_id
  (req, res, next) => {
    req.query.scope = "user_avatar";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

export default router;
