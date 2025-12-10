// src/dtos/responses/restaurant.response.js

class RestaurantResponse {
  /**
   * Map 1 instance Restaurant -> object trả cho client
   */
  static fromModel(restaurantInstance) {
    if (!restaurantInstance) return null;

    const plain =
      typeof restaurantInstance.get === "function"
        ? restaurantInstance.get({ plain: true })
        : restaurantInstance;

    const {
      id,
      name,
      address,
      phone,
      description,
      tags,
      search_name,
      search_address,
      search_tags,
      require_deposit,
      default_deposit_amount,
      is_active,
      average_rating,
      review_count,
      invite_code,
      open_time,
      close_time,
      created_at,
      updated_at,
      ...rest
    } = plain;

    return {
      id,
      name,
      address,
      phone,
      description,
      tags,
      search_name,
      search_address,
      search_tags,
      require_deposit,
      default_deposit_amount,
      is_active,
      average_rating,
      review_count,
      invite_code,
      open_time,
      close_time,
      created_at,
      updated_at,
      ...rest,
    };
  }

  static fromList(restaurantInstances) {
    if (!Array.isArray(restaurantInstances)) return [];
    return restaurantInstances.map((r) => RestaurantResponse.fromModel(r));
  }
}

export default RestaurantResponse;
