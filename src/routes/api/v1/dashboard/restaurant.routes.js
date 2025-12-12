// src/routes/api/v1/dashboard/restaurant.routes.js
import { Router } from "express";
import restaurantController from "../../../../controllers/restaurant.controller.js";
import validate from "../../../../middlewares/validate.js";
import { RestaurantUpdateDto } from "../../../../dtos/index.js";
import { AUTH_ROLES } from "../../../../constants/auth.js";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";

const router = Router();

// Định nghĩa route để lấy thông tin nhà hàng
router.get(
  "/me",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  restaurantController.getMyRestaurant
);
// Định nghĩa route để cập nhật thông tin nhà hàng
router.patch(
  "/me",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  validate(RestaurantUpdateDto, "body"),
  restaurantController.updateMyRestaurant
);

export default router;
