// src/routes/api/v1/dashboard/index.js
import { Router } from "express";

// Import các route con
import restaurantRoutes from "./restaurant.routes.js";
import authRoutes from "./auth.routes.js";
import staffRoutes from "./staff.routes.js";

const router = Router();

// Route dùng để xác thực người dùng
router.use("/auth", authRoutes);

// Route dùng để quản lý nhân viên
router.use("/staff", staffRoutes);

// Route dùng để quản lý nhà hàng
router.use("/restaurants", restaurantRoutes);

export default router;
