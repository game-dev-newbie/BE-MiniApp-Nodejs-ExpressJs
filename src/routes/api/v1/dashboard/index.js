// src/routes/api/v1/dashboard/index.js
import { Router } from "express";
import restaurantRoutes from "./restaurant.routes.js";
// ... các module khác

const router = Router();

router.use("/tables", restaurantRoutes);
// router.use('/users', userRoutes);
// router.use('/restaurants', restaurantRoutes);
// router.use('/bookings', bookingRoutes);
// ...

export default router;
