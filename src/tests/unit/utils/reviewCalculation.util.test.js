// src/tests/unit/utils/reviewCalculation.util.test.js


import { recalculateRestaurantRating } from "../../../utils/reviewCalculation.util.js";
import models from "../../../models/index.js";

// Mock models
jest.mock("../../../models/index.js");

describe("Review Calculation Utility", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("recalculateRestaurantRating", () => {
    it("should calculate correct average rating", async () => {
      const restaurantId = 1;

      // Mock Review. findOne to return average rating
      models.Review = {
        findOne: jest.fn().mockResolvedValue({
          avg_rating: "4.5",
          count: "10",
        }),
      };

      // Mock Restaurant.update
      models.Restaurant = {
        update: jest.fn().mockResolvedValue([1]),
      };

      const result = await recalculateRestaurantRating(restaurantId);

      expect(result.averageRating).toBe(4.5);
      expect(result.reviewCount).toBe(10);
      expect(models.Restaurant.update).toHaveBeenCalledWith(
        {
          average_rating: 4.5,
          review_count: 10,
        },
        {
          where: { id: restaurantId },
        }
      );
    });

    it("should round average rating to 1 decimal", async () => {
      const restaurantId = 1;

      models.Review = {
        findOne: jest.fn().mockResolvedValue({
          avg_rating: "4.666666",
          count: "3",
        }),
      };

      models.Restaurant = {
        update: jest.fn().mockResolvedValue([1]),
      };

      const result = await recalculateRestaurantRating(restaurantId);

      expect(result.averageRating).toBe(4.7); // Rounded
    });

    it("should handle no reviews case", async () => {
      const restaurantId = 1;

      models.Review = {
        findOne: jest.fn().mockResolvedValue({
          avg_rating: null,
          count: "0",
        }),
      };

      models.Restaurant = {
        update: jest.fn().mockResolvedValue([1]),
      };

      const result = await recalculateRestaurantRating(restaurantId);

      expect(result.averageRating).toBe(0);
      expect(result.reviewCount).toBe(0);
    });

    it("should return 0 if restaurantId is missing", async () => {
      const result = await recalculateRestaurantRating(null);

      expect(result.averageRating).toBe(0);
      expect(result.reviewCount).toBe(0);
    });
  });
});
