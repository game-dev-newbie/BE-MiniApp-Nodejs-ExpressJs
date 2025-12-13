// src/routes/api/v1/public/index.js
import { Router } from "express";

// Import các route con
import authMiniAppRoutes from "./auth.routes.js";
import restaurantMiniAppRoutes from "./restaurant.routes.js";
import bookingMiniAppRoutes from "./booking.routes.js";
import notificationMiniAppRoutes from "./notification.routes.js";
import reviewMiniAppRoutes from "./review.routes.js";
import favoriteRestaurantMiniAppRoutes from "./favoriteRestaurant.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

// Route dùng để xác thực người dùng
router.use("/auth", authMiniAppRoutes);

// Route dùng để hiển thị danh sách nhà hàng
router.use("/restaurants", restaurantMiniAppRoutes);

// Route dùng để tạo đơn đặt bàn
router.use("/bookings", bookingMiniAppRoutes);

// Route dùng để quản lý thông báo
router.use("/notifications", notificationMiniAppRoutes);

// Route dùng để quản lý review
router.use("/reviews", reviewMiniAppRoutes);

// Route dùng để quản lí nhà hàng yêu thích
router.use("/favorites", favoriteRestaurantMiniAppRoutes);

// Route dùng để upload ảnh ở miniapp
router.use("/uploads", uploadRoutes);

export default router;
