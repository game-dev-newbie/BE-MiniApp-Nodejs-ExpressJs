// src/routes/api/v1/dashboard/index.js
import { Router } from "express";

// Import các route con
import restaurantDashboardRoutes from "./restaurant.routes.js";
import restaurantTableDashboardRoutes from "./restaurantTable.routes.js";
import authDashboardRoutes from "./auth.routes.js";
import staffDashboardRoutes from "./staff.routes.js";
import bookingDashboardRoutes from "./booking.routes.js";
import notificationDashboardRoutes from "./notification.routes.js";
import reviewDashboardRoutes from "./review.routes.js";
import uploadRoutes from "./upload.routes.js";

const router = Router();

// Route dùng để xác thực người dùng
router.use("/auth", authDashboardRoutes);

// Route dùng để quản lý nhân viên
router.use("/staff", staffDashboardRoutes);

// Route dùng để quản lý nhà hàng
router.use("/restaurants", restaurantDashboardRoutes);

// Route dùng để quản lý bàn
router.use("/tables", restaurantTableDashboardRoutes);

// Route dùng để quản lý đặt bàn
router.use("/bookings", bookingDashboardRoutes);

// Route dùng để quản lý thông báo
router.use("/notifications", notificationDashboardRoutes);

// Route dùng để quản lý review
router.use("/reviews", reviewDashboardRoutes);

// Route dùng để upload ảnh trên dashboard
router.use("/uploads", uploadRoutes);

export default router;
