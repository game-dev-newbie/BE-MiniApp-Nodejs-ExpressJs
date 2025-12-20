// src/routes/api/v1/test/index.js

import { Router } from "express";
import emailTestRoutes from "./email.routes.js";
import reminderTestRoutes from "./reminder.routes.js";

const router = Router();

router.use("/email", emailTestRoutes);
router.use("/reminder", reminderTestRoutes); // ✅ NEW
export default router;
