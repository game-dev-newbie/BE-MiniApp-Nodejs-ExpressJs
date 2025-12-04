// src/routes/appRoutes.js
import { Router } from "express";
import dashboardRoutes from "./api/v1/dashboard/index.js";
import publicRoutes from "./api/v1/public/index.js";

const router = Router();

router.use("/v1/dashboard", dashboardRoutes);
router.use("/v1/public", publicRoutes);

export default router;
