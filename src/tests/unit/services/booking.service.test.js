// src/tests/unit/services/booking.service.test.js

import * as bookingService from "../../../services/booking.service.js";
import models from "../../../models/index.js";
import { BOOKING_STATUS } from "../../../constants/index. js";
import {
  mockBooking,
  mockRestaurant,
  mockTable,
  mockUser,
} from "../../setup/mockData.js";

jest.mock("../../../models/index. js");
jest.mock("../../../services/notification.service.js");

describe("Booking Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("createBookingForCustomer", () => {
    it("should create booking successfully", async () => {
      const userId = 1;
      const payload = {
        restaurant_id: 1,
        table_id: 1,
        phone: "0901234567",
        customer_name: "Test User",
        people_count: 4,
        booking_date: "2025-12-25",
        booking_time: "19:00",
        note: "Test booking",
      };

      // Mock dependencies
      models.Restaurant = {
        findByPk: jest.fn().mockResolvedValue(mockRestaurant),
      };

      models.RestaurantTable = {
        findByPk: jest.fn().mockResolvedValue(mockTable),
      };

      models.Booking = {
        findOne: jest.fn().mockResolvedValue(null), // No conflict
        create: jest.fn().mockResolvedValue(mockBooking),
        findByPk: jest.fn().mockResolvedValue(mockBooking),
      };

      const result = await bookingService.createBookingForCustomer(
        userId,
        payload
      );

      expect(result).toBeDefined();
      expect(result.id).toBe(mockBooking.id);
      expect(models.Booking.create).toHaveBeenCalled();
    });

    it("should throw error if table has conflict", async () => {
      const userId = 1;
      const payload = {
        restaurant_id: 1,
        table_id: 1,
        phone: "0901234567",
        customer_name: "Test User",
        people_count: 4,
        booking_date: "2025-12-25",
        booking_time: "19:00",
      };

      models.Restaurant = {
        findByPk: jest.fn().mockResolvedValue(mockRestaurant),
      };

      models.RestaurantTable = {
        findByPk: jest.fn().mockResolvedValue(mockTable),
      };

      // Mock existing booking (conflict)
      models.Booking = {
        findOne: jest.fn().mockResolvedValue(mockBooking),
      };

      await expect(
        bookingService.createBookingForCustomer(userId, payload)
      ).rejects.toThrow("đã được đặt");
    });

    it("should throw error if people_count exceeds capacity", async () => {
      const userId = 1;
      const payload = {
        restaurant_id: 1,
        table_id: 1,
        phone: "0901234567",
        customer_name: "Test User",
        people_count: 10, // Exceeds capacity
        booking_date: "2025-12-25",
        booking_time: "19:00",
      };

      models.Restaurant = {
        findByPk: jest.fn().mockResolvedValue(mockRestaurant),
      };

      models.RestaurantTable = {
        findByPk: jest.fn().mockResolvedValue({ ...mockTable, capacity: 4 }),
      };

      await expect(
        bookingService.createBookingForCustomer(userId, payload)
      ).rejects.toThrow();
    });
  });

  describe("confirmBooking", () => {
    it("should confirm PENDING booking", async () => {
      const accountId = 1;
      const bookingId = 1;

      const mockAccount = {
        id: 1,
        restaurant_id: 1,
      };

      const mockPendingBooking = {
        ...mockBooking,
        status: BOOKING_STATUS.PENDING,
        save: jest.fn().mockResolvedThis(),
      };

      models.RestaurantAccount = {
        findByPk: jest.fn().mockResolvedValue(mockAccount),
      };

      models.Booking = {
        findOne: jest.fn().mockResolvedValue(mockPendingBooking),
      };

      models.Restaurant = {
        findByPk: jest.fn().mockResolvedValue(mockRestaurant),
      };

      const result = await bookingService.confirmBooking(accountId, bookingId);

      expect(result.status).toBe(BOOKING_STATUS.CONFIRMED);
      expect(mockPendingBooking.save).toHaveBeenCalled();
    });

    it("should throw error if booking is not PENDING", async () => {
      const accountId = 1;
      const bookingId = 1;

      const mockAccount = {
        id: 1,
        restaurant_id: 1,
      };

      const mockConfirmedBooking = {
        ...mockBooking,
        status: BOOKING_STATUS.CONFIRMED,
      };

      models.RestaurantAccount = {
        findByPk: jest.fn().mockResolvedValue(mockAccount),
      };

      models.Booking = {
        findOne: jest.fn().mockResolvedValue(mockConfirmedBooking),
      };

      await expect(
        bookingService.confirmBooking(accountId, bookingId)
      ).rejects.toThrow("PENDING");
    });
  });
});
