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

router.post(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  validate(DashboardCreateRestaurantImageDto, "body"),
  restaurantImageController.createForDashboard
);

router.get(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  validate(DashboardListRestaurantImagesQueryDto, "query"),
  restaurantImageController.getMyRestaurantImages
);

router.get(
  "/:id",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  restaurantImageController.getMyRestaurantImageDetail
);

router.delete(
  "/:id",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  restaurantImageController.deleteMyRestaurantImage
);

export default router;
