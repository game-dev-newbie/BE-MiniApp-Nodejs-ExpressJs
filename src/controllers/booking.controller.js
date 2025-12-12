// src/controllers/booking.controller.js

import * as bookingService from "../services/booking.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  BookingMiniAppResponse,
  BookingResponse,
  RestaurantTableResponse,
} from "../dtos/index.js";

class BookingController {
  // ============= MINIAPP =============

  // GET /miniapp/bookings/available-tables
  getAvailableTables = catchAsync(async (req, res) => {
    const { restaurant_id, booking_date, booking_time, people_count } =
      req.query;

    const restaurantId = Number(restaurant_id);
    const peopleCount = Number(people_count);

    if (!restaurantId || !booking_date || !booking_time || !peopleCount) {
      return res.status(400).json({
        success: false,
        message:
          "Thiếu tham số restaurant_id, booking_date, booking_time hoặc people_count",
      });
    }

    const tables = await bookingService.findAvailableTables({
      restaurantId,
      booking_date,
      booking_time,
      people_count: peopleCount,
    });

    const items = RestaurantTableResponse.fromList(tables);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bàn phù hợp thành công",
      data: { items },
    });
  });

  // POST /miniapp/bookings
  createBookingMiniapp = catchAsync(async (req, res) => {
    const userId = req.user.id; // từ middleware auth miniapp
    const booking = await bookingService.createBookingForUser(userId, req.body);

    const data = BookingMiniAppResponse.fromModel(booking);

    return res.status(201).json({
      success: true,
      message: "Tạo booking thành công",
      data,
    });
  });

  // GET /miniapp/bookings/my
  getMyBookingsMiniapp = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const bookings = await bookingService.listBookingsForUser(userId);
    const items = BookingMiniAppResponse.fromList(bookings);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách booking của bạn thành công",
      data: { items },
    });
  });

  // GET /miniapp/bookings/:id
  getMyBookingDetailMiniapp = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await bookingService.getBookingDetailForUser(
      userId,
      bookingId
    );

    const data = BookingMiniAppResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết booking thành công",
      data,
    });
  });

  // PATCH /miniapp/bookings/:id/cancel
  cancelMyBookingMiniapp = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await bookingService.cancelBookingByUser(userId, bookingId);

    const data = BookingMiniAppResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Huỷ booking thành công",
      data,
    });
  });
  
  // PATCH /miniapp/bookings/:id
  updateMyBookingMiniapp = catchAsync(async (req, res) => {
    const userId = req.user.id;
    const bookingId = req.params.id;

    const booking = await bookingService.updateBookingByCustomer(
      userId,
      bookingId,
      req.body
    );

    const data = BookingMiniAppResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Cập nhật booking thành công",
      data,
    });
  });

  // ============= DASHBOARD =============

  // GET /dashboard/bookings
  listBookingsDashboard = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const { status, from_date, to_date } = req.query;

    const filters = {};

    if (status) {
      filters.status = status; // có thể validate status nằm trong BOOKING_STATUS nếu muốn gắt hơn
    }
    if (from_date) {
      filters.from_date = from_date;
    }
    if (to_date) {
      filters.to_date = to_date;
    }
    const bookings = await bookingService.listBookingsForRestaurant(
      accountId,
      filters
    );

    const items = BookingResponse.fromList(bookings);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách booking của nhà hàng thành công",
      data: { items },
    });
  });

  // GET /dashboard/bookings/:id
  getBookingDetailDashboard = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const bookingId = req.params.id;

    const booking = await bookingService.getBookingDetailForRestaurant(
      accountId,
      bookingId
    );

    const data = BookingResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Lấy chi tiết booking thành công",
      data,
    });
  });

  // PATCH /dashboard/bookings/:id/confirm
  confirmBookingDashboard = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const bookingId = req.params.id;

    const booking = await bookingService.confirmBooking(accountId, bookingId);

    const data = BookingResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Xác nhận booking thành công",
      data,
    });
  });

  // PATCH /dashboard/bookings/:id/cancel
  cancelBookingDashboard = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const bookingId = req.params.id;

    const booking = await bookingService.cancelBookingByRestaurant(
      accountId,
      bookingId
    );

    const data = BookingResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Huỷ booking thành công",
      data,
    });
  });

  // PATCH /dashboard/bookings/:id/complete
  completeBookingDashboard = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const bookingId = req.params.id;

    const booking = await bookingService.completeBooking(accountId, bookingId);

    const data = BookingResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Đánh dấu hoàn tất booking thành công",
      data,
    });
  });

  // PATCH /dashboard/bookings/:id/no-show
  noShowBookingDashboard = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const bookingId = req.params.id;

    const booking = await bookingService.markNoShow(accountId, bookingId);

    const data = BookingResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Đánh dấu khách không đến (NO_SHOW) thành công",
      data,
    });
  });
}

const bookingController = new BookingController();
export default bookingController;
