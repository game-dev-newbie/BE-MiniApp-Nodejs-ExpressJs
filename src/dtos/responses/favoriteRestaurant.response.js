// src/dtos/responses/favoriteRestaurant.response.js

import { RestaurantResponse } from "../index.js";
import time from "../../utils/time.js";

class FavoriteRestaurantResponse {
  /**
   * Map 1 instance FavoriteRestaurant -> object trả cho client
   * yêu cầu đã include { restaurant }
   */
  static fromModel(favoriteInstance) {
    if (!favoriteInstance) return null;

    const plain =
      typeof favoriteInstance.get === "function"
        ? favoriteInstance.get({ plain: true })
        : favoriteInstance;

    const { id, user_id, restaurant_id, restaurant, ...rest } = plain;

    return {
      id,
      user_id,
      restaurant_id,
      created_at: time.toVNDateTime(rest.created_at),
      restaurant: restaurant ? RestaurantResponse.fromModel(restaurant) : null,
      ...rest,
    };
  }

  static fromList(favoriteInstances) {
    if (!Array.isArray(favoriteInstances)) return [];
    return favoriteInstances.map((f) =>
      FavoriteRestaurantResponse.fromModel(f)
    );
  }
}

export default FavoriteRestaurantResponse;
