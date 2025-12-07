// src/routes/api/v1/dashboard/index.js
import { Router } from "express";
import restaurantRoutes from "./restaurant.routes.js";
import authRoutes from "./auth.routes.js";
// ... các module khác

const router = Router();

router.use("/auths", authRoutes);


export default router;
