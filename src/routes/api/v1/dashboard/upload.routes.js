// src/routes/api/v1/dashboard/upload.routes.js
import { Router } from "express";
import uploadController from "../../../../controllers/upload.controller.js";
import {
  uploadSingleImageMiddleware,
  uploadMultipleImagesMiddleware,
} from "../../../../middlewares/uploadImage.middleware.js";
import {
  validateRestaurantOwnership,
  validateTableOwnership,
  validateRestaurantAccountOwnership,
} from "../../../../middlewares/validateUploadOwnership.middleware.js";
import {
  uploadRateLimiter,
  avatarUploadRateLimiter,
  multipleUploadRateLimiter,
} from "../../../../middlewares/rateLimitUpload.middleware.js";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/auth.js";

const router = Router();

// ✅ Apply general rate limiting to ALL upload routes
router.use(uploadRateLimiter);

// =====================================================
// RESTAURANT IMAGES
// =====================================================

/**
 * Upload restaurant cover image
 * POST /api/v1/dashboard/uploads/images/restaurants/cover
 * Field: file (single)
 */
router.post(
  "/images/restaurants/cover",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  validateRestaurantOwnership, // ✅ NEW: Validate & auto-inject restaurant_id
  (req, res, next) => {
    req.query.scope = "restaurant_cover";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

/**
 * Upload single restaurant gallery image
 * POST /api/v1/dashboard/uploads/images/restaurants/gallery
 * Field: file (single)
 */
router.post(
  "/images/restaurants/gallery",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  validateRestaurantOwnership, // ✅ NEW
  (req, res, next) => {
    req.query.scope = "restaurant_gallery";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

/**
 * Upload multiple restaurant gallery images
 * POST /api/v1/dashboard/uploads/images/restaurants/galleries
 * Field: files (multiple, max 10)
 */
router.post(
  "/images/restaurants/galleries",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  multipleUploadRateLimiter, // ✅ NEW:  Stricter limit for multiple uploads
  validateRestaurantOwnership, // ✅ NEW
  (req, res, next) => {
    req.query.scope = "restaurant_gallery";
    next();
  },
  uploadMultipleImagesMiddleware,
  uploadController.uploadMultipleImages
);

/**
 * Upload single restaurant menu image
 * POST /api/v1/dashboard/uploads/images/restaurants/menu
 * Field: file (single)
 */
router.post(
  "/images/restaurants/menu",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  validateRestaurantOwnership, // ✅ NEW
  (req, res, next) => {
    req.query.scope = "restaurant_menu";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

/**
 * Upload multiple restaurant menu images
 * POST /api/v1/dashboard/uploads/images/restaurants/menus
 * Field: files (multiple, max 10)
 */
router.post(
  "/images/restaurants/menus",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  multipleUploadRateLimiter, // ✅ NEW
  validateRestaurantOwnership, // ✅ NEW
  (req, res, next) => {
    req.query.scope = "restaurant_menu";
    next();
  },
  uploadMultipleImagesMiddleware,
  uploadController.uploadMultipleImages
);

// =====================================================
// TABLE IMAGES
// =====================================================

/**
 * Upload table view image
 * POST /api/v1/dashboard/uploads/images/tables/view? table_id=123
 * Field: file (single)
 * Query: table_id (required)
 */
router.post(
  "/images/tables/view",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  validateTableOwnership, // ✅ NEW:  Validate table & auto-inject restaurant_id + table_id
  (req, res, next) => {
    req.query.scope = "table_view";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

// =====================================================
// ACCOUNT AVATARS
// =====================================================

/**
 * Upload restaurant account avatar (OWNER/STAFF)
 * POST /api/v1/dashboard/uploads/images/restaurant-accounts/avatar
 * Field: file (single)
 */
router.post(
  "/images/restaurant-accounts/avatar",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  avatarUploadRateLimiter, // ✅ NEW:  Stricter limit for avatar changes
  validateRestaurantAccountOwnership, // ✅ NEW: Validate & auto-inject restaurant_account_id
  (req, res, next) => {
    req.query.scope = "restaurant_account_avatar";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

export default router;
