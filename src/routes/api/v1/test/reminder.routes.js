// src/routes/api/v1/test/reminder.routes.js

import { Router } from "express";
import reminderTestController from "../../../../controllers/reminderTest.controller.js";

const router = Router();

// Check bookings cần reminder
router.get("/check", reminderTestController.checkBookings);

// Trigger gửi reminder manually
router.post("/send", reminderTestController.sendReminders);

export default router;
