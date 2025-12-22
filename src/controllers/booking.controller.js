// src/controllers/booking.controller.js

import * as bookingService from "../services/booking.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  BookingMiniAppResponse,
  BookingResponse,
  RestaurantTableResponse,
} from "../dtos/index.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../utils/pagination.util.js";

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

    const items = RestaurantTableResponse.fromList(tables.availableTables);

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
    const { category } = req.query;

    const { limit, offset, page } = parsePagination(req.query);

    const result = await bookingService.listBookingsForUser(userId, {
      category,
      limit,
      offset,
    });
    const items = BookingMiniAppResponse.fromList(result.items);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách booking của bạn thành công",
      data: {
        items,
        pagination: buildPaginationMeta({
          total: result.total,
          limit,
          offset,
          page,
        }),
      },
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

    const { limit, offset, page } = parsePagination(req.query);

    const filters = { status, from_date, to_date, limit, offset };

    const result = await bookingService.listBookingsForRestaurant(
      accountId,
      filters
    );

    const items = BookingResponse.fromList(result.items);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách booking của nhà hàng thành công",
      data: {
        items,
        pagination: buildPaginationMeta({
          total: result.total,
          limit,
          offset,
          page,
        }),
      },
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

    const data = BookingResponse.fromModel(booking, { includeRelations: true });

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

    const data = BookingResponse.fromModel(booking, { includeRelations: true });

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

    const data = BookingResponse.fromModel(booking, { includeRelations: true });

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

    const data = BookingResponse.fromModel(booking, { includeRelations: true });

    return res.status(200).json({
      success: true,
      message: "Đánh dấu khách không đến (NO_SHOW) thành công",
      data,
    });
  });

  /**
   * DASHBOARD: search booking theo tên khách hàng (customer_name)
   * GET /dashboard/bookings/search?q=...
   */
  searchBookingsByCustomerNameForDashboard = catchAsync(
    async (req, res, next) => {
      const restaurantId = req.restaurantAccount.restaurant_id; // đã gắn từ jwtMiddleware
      const { q } = req.query;

      const { limit, offset, page } = parsePagination(req.query);

      const result =
        await bookingService.searchBookingsByCustomerNameForDashboard(
          restaurantId,
          {
            q,
            limit,
            offset,
          }
        );

      const items = BookingResponse.fromList(result.items);

      return res.status(200).json({
        success: true,
        message: "Tìm kiếm booking theo tên khách hàng thành công",
        data: {
          items,
          pagination: buildPaginationMeta({
            total: result.total,
            limit,
            offset,
            page,
          }),
        },
      });
    }
  );
}

const bookingController = new BookingController();
export default bookingController;
