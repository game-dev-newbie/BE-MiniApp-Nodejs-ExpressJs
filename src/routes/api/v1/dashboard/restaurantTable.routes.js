// src/routes/api/v1/dashboard/restaurantTable.routes.js

import { Router } from "express";
import { requireDashboardRoles } from "../../../../middlewares/jwtAuthorization.js";
import { AUTH_ROLES } from "../../../../constants/index.js";
import validate from "../../../../middlewares/validate.js";
import {
  RestaurantTableCreateDto,
  RestaurantTableUpdateDto,
} from "../../../../dtos/index.js";
import restaurantTableController from "../../../../controllers/restaurantTable.controller.js";

const router = Router();

// OWNER + STAFF cùng được xem danh sách & chi tiết bàn
router.get(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  restaurantTableController.listMyTables
);

router.get(
  "/:id",
  ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
  restaurantTableController.getTableDetail
);

// Chỉ OWNER được tạo/cập nhật/xoá (soft)
router.post(
  "/",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  validate(RestaurantTableCreateDto, "body"),
  restaurantTableController.createTable
);

router.patch(
  "/:id",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  validate(RestaurantTableUpdateDto, "body"),
  restaurantTableController.updateTable
);

router.delete(
  "/:id",
  ...requireDashboardRoles(AUTH_ROLES.OWNER),
  restaurantTableController.deleteTable
);

export default router;
