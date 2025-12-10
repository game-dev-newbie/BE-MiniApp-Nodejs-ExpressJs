// src/dtos/responses/booking.response.js

import RestaurantResponse from "./restaurant.response.js";
import RestaurantTableResponse from "./restaurantTable.response.js";
import UserResponse from "./user.response.js";

class BookingResponse {
  /**
   * Map 1 instance Booking -> object trả cho client
   * @param {any} bookingInstance - instance Sequelize hoặc plain object
   * @param {object} options
   * @param {boolean} options.includeRelations - có map kèm restaurant/table/user không
   */
  static fromModel(bookingInstance, options = {}) {
    if (!bookingInstance) return null;

    const { includeRelations = true } = options;

    const plain =
      typeof bookingInstance.get === "function"
        ? bookingInstance.get({ plain: true })
        : bookingInstance;

    const {
      id,
      restaurant_id,
      table_id,
      user_id,
      people_count,
      booking_time,
      status,
      deposit_amount,
      payment_status,
      note,
      created_at,
      updated_at,
      // nếu bạn có include relation thì nó thường nằm ở đây:
      restaurant,
      table,
      user,
      ...rest
    } = plain;

    const result = {
      id,
      restaurant_id,
      table_id,
      user_id,
      people_count,
      booking_time,
      status,
      deposit_amount,
      payment_status,
      note,
      created_at,
      updated_at,
      ...rest,
    };

    if (includeRelations) {
      // Map kèm thông tin cơ bản
      if (restaurant) {
        result.restaurant = RestaurantResponse.fromModel(restaurant);
      }
      if (table) {
        result.table = RestaurantTableResponse.fromModel(table);
      }
      if (user) {
        result.user = UserResponse.fromModel(user);
      }
    }

    return result;
  }

  static fromList(bookingInstances, options = {}) {
    if (!Array.isArray(bookingInstances)) return [];
    return bookingInstances.map((b) => BookingResponse.fromModel(b, options));
  }
}

export default BookingResponse;
