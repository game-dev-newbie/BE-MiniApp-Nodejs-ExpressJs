// src/dtos/responses/review.response.js

import { UserResponse, RestaurantResponse, BookingMiniAppResponse } from "../index.js";

import time from "../../utils/time.js";

class ReviewResponse {
  /**
   * Map 1 instance Review -> object trả cho client
   * @param {any} reviewInstance
   * @param {object} options
   * @param {boolean} options.includeRelations
   */
// src/dtos/responses/review.response.js

static fromModel(reviewInstance, options = {}) {
  if (!reviewInstance) return null;

  const { includeRelations = true } = options;

  const plain =
    typeof reviewInstance.get === "function"
      ? reviewInstance.get({ plain: true })
      : reviewInstance;

  // Bắt cả alias dạng User và user
  const {
    id,
    booking_id,
    restaurant_id,
    user_id,
    rating,
    comment,
    status,
    reply_comment,
    reply_account_id,
    reply_created_at,
    reply_updated_at,
    created_at,
    updated_at,

    // relations có thể là nhiều kiểu key:
    User,
    Restaurant,
    Booking,


    ...rest
  } = plain;

  // ❗️Nếu bạn vẫn muốn giữ rest, hãy xóa sạch những key nguy hiểm trước khi spread
  delete rest.User;
  delete rest.user;
  delete rest.Restaurant;
  delete rest.restaurant;
  delete rest.Booking;
  delete rest.booking;

  const result = {
    id,
    booking_id,
    restaurant_id,
    user_id,
    rating,
    comment,
    status,
    reply_comment,
    reply_account_id,
    reply_created_at: time.toVNDateTime(reply_created_at),
    reply_updated_at: time.toVNDateTime(reply_updated_at),
    created_at: time.toVNDateTime(created_at),
    updated_at: time.toVNDateTime(updated_at),

    // Nếu không thực sự cần rest thì bỏ luôn dòng này là đẹp nhất:
    // ...rest,
  };

  if (includeRelations) {
    const u = User ;
    if (u) result.User = UserResponse.fromModel(u);

    const r = Restaurant ;
    if (r) result.Restaurant = RestaurantResponse.toDashboard(r);

    const b = Booking;
    if (b) result.Booking = BookingMiniAppResponse.fromModel(b, { includeRelations: false });
  }

  return result;
}


  static fromList(reviewInstances, options = {}) {
    if (!Array.isArray(reviewInstances)) return [];
    return reviewInstances.map((r) => ReviewResponse.fromModel(r, options));
  }
}

export default ReviewResponse;
