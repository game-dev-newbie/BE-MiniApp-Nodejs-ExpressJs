// src/routes/api/v1/public/index.js
import { Router } from 'express';

// Import các route con
import authRoutes from './auth.routes.js';
import restaurantRoutes from './restaurant.routes.js';

const router = Router();

// Route dùng để xác thực người dùng
router.use('/auth', authRoutes);


export default router;
