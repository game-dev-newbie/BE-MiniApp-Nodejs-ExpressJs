// src/routes/appRoutes.js
import { Router } from "express";
import dashboardRoutes from "./api/v1/dashboard/index.js";
import publicRoutes from "./api/v1/miniapp/index.js";
import commonRoutes from "./api/v1/common/index.js";
import testRoutes from "./api/v1/test/index.js";
import { ENV_PROD } from "../config/env.js";

const router = Router();

router.use("/v1/dashboard", dashboardRoutes);
router.use("/v1/miniapp", publicRoutes);
router.use("/v1/common", commonRoutes);

if (!ENV_PROD) {
  router.use("/v1/test", testRoutes);
}
export default router;
