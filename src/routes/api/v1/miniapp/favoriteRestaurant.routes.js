// src/routes/api/v1/miniapp/favoriteRestaurant.routes.js

import { Router } from "express";
import favoriteRestaurantController from "../../../../controllers/favoriteRestaurant.controller.js";
import { requireCustomer } from "../../../../middlewares/jwtAuthorization.js";

const router = Router();

// Danh sách nhà hàng yêu thích của user
router.get(
  "/",
  ...requireCustomer(),
  favoriteRestaurantController.getMyFavorites
);

// Check 1 nhà hàng đã được user yêu thích chưa
router.get(
  "/restaurants/:id/status",
  ...requireCustomer(),
  favoriteRestaurantController.getFavoriteStatus
);

// Thêm vào danh sách yêu thích
router.post(
  "/restaurants/:id/add",
  ...requireCustomer(),
  favoriteRestaurantController.addFavorite
);

// Bỏ khỏi danh sách yêu thích
router.delete(
  "/restaurants/:id/remove",
  ...requireCustomer(),
  favoriteRestaurantController.removeFavorite
);


export default router;
