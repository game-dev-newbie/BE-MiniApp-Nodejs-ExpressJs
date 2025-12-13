// src/routes/api/v1/dashboard/upload.routes.js
import { Router } from "express";
import uploadController from "../../../../controllers/upload.controller.js";
import { uploadSingleImageMiddleware, uploadMultipleImagesMiddleware } from "../../../../middlewares/uploadImage.middleware.js";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/auth.js";

const router = Router();

// Upload hình cover của nhà hàng
router.post(
  "/images/restaurants/cover",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  (req, res, next) => {
    req.query.scope = "restaurant_cover";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

// Upload hình trưng bày quanh nhà hàng
router.post(
  "/images/restaurants/gallery",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  (req, res, next) => {
    req.query.scope = "restaurant_gallery";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

// Upload nhiều ảnh để trưng bày cùng lúc
router.post(
  "/images/restaurants/galleries",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  (req, res, next) => {
    req.query.scope = "restaurant_gallery";
    next();
  },
  uploadMultipleImagesMiddleware,
  uploadController.uploadMultipleImages
);

// Upload ảnh menu của nhà hàng
router.post(
  "/images/restaurants/menu",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  (req, res, next) => {
    req.query.scope = "restaurant_menu";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

// Upload nhiều ảnh menu cùng lúc
router.post(
  "/images/restaurants/menus",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  (req, res, next) => {
    req.query.scope = "restaurant_menu";
    next();
  },
  uploadMultipleImagesMiddleware,
  uploadController.uploadMultipleImages
);

// Upload view của từng bàn
router.post(
  "/images/tables/view",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  (req, res, next) => {
    req.query.scope = "table_view";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

// Upload ảnh avatar tùy role của account (OWNER/STAFF)
router.post(
  "/images/restaurants-account/avatar",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  (req, res, next) => {
    req.query.scope = "restaurant_account_avatar";
    next();
  },
  uploadSingleImageMiddleware,
  uploadController.uploadSingleImage
);

export default router;
