// src/routes/api/v1/public/index.js
import { Router } from 'express';

// Import các route con
import authMiniAppRoutes from './auth.routes.js';
import restaurantMiniAppRoutes from './restaurant.routes.js';
import bookingMiniAppRoutes from './booking.routes.js';
import notificationMiniAppRoutes from './notification.routes.js';

const router = Router();

// Route dùng để xác thực người dùng
router.use('/auth', authMiniAppRoutes);

// Route dùng để hiển thị danh sách nhà hàng
router.use('/restaurants', restaurantMiniAppRoutes);

// Route dùng để tạo đơn đặt bàn
router.use('/bookings', bookingMiniAppRoutes);

// Route dùng để quản lý thông báo
router.use('/notifications', notificationMiniAppRoutes);

export default router;
