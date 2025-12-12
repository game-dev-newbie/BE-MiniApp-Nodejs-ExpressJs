// src/dtos/responses/restaurantAccount.response.js
import time from "../../utils/time.js";

class RestaurantAccountResponse {
  /**
   * Map 1 instance RestaurantAccount -> object trả cho client
   */
  static fromModel(accountInstance) {
    if (!accountInstance) return null;

    const plain =
      typeof accountInstance.get === "function"
        ? accountInstance.get({ plain: true })
        : accountInstance;

    const {
      id,
      restaurant_id,
      full_name,
      email,
      role,
      status,
      is_locked,
      avatar_url,
      created_at,
      updated_at,
      password_hash, // loại khỏi response
      ...rest
    } = plain;

    return {
      id,
      restaurant_id,
      full_name,
      email,
      role,
      status,
      is_locked,
      avatar_url,
      created_at: time.toVNDateTime(created_at),
      updated_at: time.toVNDateTime(updated_at),
      ...rest,
    };
  }

  static fromList(accountInstances) {
    if (!Array.isArray(accountInstances)) return [];
    return accountInstances.map((a) => RestaurantAccountResponse.fromModel(a));
  }
}

export default RestaurantAccountResponse;
