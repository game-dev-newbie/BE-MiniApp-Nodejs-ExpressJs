// src/routes/api/v1/dashboard/restaurantImage.routes.js

import { Router } from "express";
import restaurantImageController from "../../../../controllers/restaurantImage.controller.js";
import validate from "../../../../middlewares/validate.js";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/auth.js";
import {
  DashboardCreateRestaurantImageDto,
  DashboardListRestaurantImagesQueryDto,
} from "../../../../dtos/index.js";

const router = Router();

// Chỉ OWNER được tạo ảnh
router.post(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  validate(DashboardCreateRestaurantImageDto, "body"),
  restaurantImageController.createForDashboard
);

// Cả OWNER + STAFF đều được xem danh sách & chi tiết ảnh
router.get(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  validate(DashboardListRestaurantImagesQueryDto, "query"),
  restaurantImageController.getMyRestaurantImages
);

// Cả OWNER + STAFF đều được xem chi tiết ảnh
router.get(
  "/:id",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  restaurantImageController.getMyRestaurantImageDetail
);

// Chỉ OWNER được xoá ảnh
router.delete(
  "/:id",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  restaurantImageController.deleteMyRestaurantImage
);

export default router;
