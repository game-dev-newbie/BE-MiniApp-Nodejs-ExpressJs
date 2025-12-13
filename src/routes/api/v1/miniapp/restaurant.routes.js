// src/routes/api/v1/miniapp/restaurant.routes.js
import restaurantController from "../../../../controllers/restaurant.controller.js";
import { Router } from "express";

const router = Router();

// Home – top 5 rating cao nhất
router.get("/home/top-rated", restaurantController.getMiniappTopRated);

// Home – top 5 được yêu thích nhất
router.get("/home/top-favorites", restaurantController.getMiniappTopFavorite);

// Home – top theo tag/time-slot (?tag=morning / lunch / dinner / ...)
router.get("/home/top-by-tag", restaurantController.getMiniappTopByTag);

// Detail nhà hàng
router.get("/:id", restaurantController.getMiniappDetail);

// Danh sách review của 1 nhà hàng
router.get("/:id/reviews", restaurantController.getRestaurantReviewsForMiniApp);

export default router;
