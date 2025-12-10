// src/routes/appRoutes.js
import { Router } from "express";
import dashboardRoutes from "./api/v1/dashboard/index.js";
import publicRoutes from "./api/v1/miniapp/index.js";
import commonRoutes from "./api/v1/common/index.js";

const router = Router();

router.use("/v1/dashboard", dashboardRoutes);
router.use("/v1/miniapp", publicRoutes);
router.use("/v1/common", commonRoutes);

export default router;
