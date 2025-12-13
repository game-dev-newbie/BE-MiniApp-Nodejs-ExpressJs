// src/routes/api/v1/common/index.js
import { Router } from "express";
import refreshRoutes from "./refresh.routes.js";

const router = Router();

// Route chung để refresh token cho cả 2 giao diện
router.use("/auth", refreshRoutes);

export default router;
