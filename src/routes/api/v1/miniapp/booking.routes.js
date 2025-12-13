// src/routes/api/v1/miniapp/booking.routes.js
import { Router } from "express";
import { requireCustomer } from "../../../../middlewares/jwtAuthorization.js";
import validate from "../../../../middlewares/validate.js";
import bookingController from "../../../../controllers/booking.controller.js";
import paymentController from "../../../../controllers/payment.controller.js";
import {
  MiniAppCreateBookingDto,
  MiniAppPayDepositDto,
} from "../../../../dtos/index.js";

const router = Router();

// Gợi ý bàn theo số người + thời gian (không bắt buộc login)
router.get(
  "/available-tables",
  ...requireCustomer(),
  bookingController.getAvailableTables
);

// Lịch sử booking của khách hàng miniapp
router.get("/", ...requireCustomer(), bookingController.getMyBookingsMiniapp);

// Chi tiết booking của khách hàng miniapp
router.get(
  "/:id",
  ...requireCustomer(),
  bookingController.getMyBookingDetailMiniapp
);

// Tạo booking – require CUSTOMER miniapp
router.post(
  "/",
  ...requireCustomer(),
  validate(MiniAppCreateBookingDto, "body"),
  bookingController.createBookingMiniapp
);

// Huỷ booking của khách hàng miniapp
router.patch(
  "/:id/cancel",
  ...requireCustomer(),
  bookingController.cancelMyBookingMiniapp
);

// Sửa thông tin booking của khách hàng miniapp
router.patch(
  "/:id",
  ...requireCustomer(),
  bookingController.updateMyBookingMiniapp
);

// Thanh toán cọc
router.post(
  "/:id/pay-deposit",
  ...requireCustomer(),
  validate(MiniAppPayDepositDto, "body"),
  paymentController.payDeposit
);
export default router;
