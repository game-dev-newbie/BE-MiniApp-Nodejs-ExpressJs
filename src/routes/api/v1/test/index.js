// src/routes/api/v1/test/index.js

import { Router } from "express";
import emailTestRoutes from "./email.routes.js";

const router = Router();

router.use("/email", emailTestRoutes);

export default router;
