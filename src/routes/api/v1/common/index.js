// src/routes/api/v1/common/index.js
import { Router } from "express";
import refreshRoutes from "./refresh.routes.js";


const router = Router();

router.use("/auth", refreshRoutes);


export default router;
