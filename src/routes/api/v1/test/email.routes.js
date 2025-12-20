// src/routes/api/v1/test/email. routes.js

import { Router } from "express";
import emailTestController from "../../../../controllers/emailTest.controller.js";

const router = Router();

// Test gửi email đơn giản
router.post("/send", emailTestController.sendTestEmail);

// Test email thanh toán thành công
router.post(
  "/payment-success",
  emailTestController.sendPaymentSuccessTestEmail
);


export default router;
