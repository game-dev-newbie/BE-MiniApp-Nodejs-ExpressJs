// src/dtos/responses/review.response.js

import UserResponse from "./user.response.js";
import RestaurantResponse from "./restaurant.response.js";
import BookingResponse from "./booking.response.js";

class ReviewResponse {
  /**
   * Map 1 instance Review -> object trả cho client
   * @param {any} reviewInstance
   * @param {object} options
   * @param {boolean} options.includeRelations
   */
  static fromModel(reviewInstance, options = {}) {
    if (!reviewInstance) return null;

    const { includeRelations = true } = options;

    const plain =
      typeof reviewInstance.get === "function"
        ? reviewInstance.get({ plain: true })
        : reviewInstance;

    const {
      id,
      booking_id,
      restaurant_id,
      user_id,
      rating,
      comment,
      status,
      created_at,
      updated_at,
      // possible relations:
      booking,
      restaurant,
      user,
      ...rest
    } = plain;

    const result = {
      id,
      booking_id,
      restaurant_id,
      user_id,
      rating,
      comment,
      status,
      created_at,
      updated_at,
      ...rest,
    };

    if (includeRelations) {
      if (restaurant) {
        result.restaurant = RestaurantResponse.fromModel(restaurant);
      }
      if (user) {
        result.user = UserResponse.fromModel(user);
      }
      if (booking) {
        // để tránh vòng lặp deep, ta disable includeRelations trong Booking
        result.booking = BookingResponse.fromModel(booking, {
          includeRelations: false,
        });
      }
    }

    return result;
  }

  static fromList(reviewInstances, options = {}) {
    if (!Array.isArray(reviewInstances)) return [];
    return reviewInstances.map((r) => ReviewResponse.fromModel(r, options));
  }
}

export default ReviewResponse;
