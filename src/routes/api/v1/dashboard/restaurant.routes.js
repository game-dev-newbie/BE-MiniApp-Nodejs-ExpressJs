import { restaurantController } from "../../../../controllers/restaurant.controller.js";
import { Router } from "express";


const router = Router();

// Định nghĩa route để tạo bàn ăn
router.get("/", restaurantController.createTable);

export default router;