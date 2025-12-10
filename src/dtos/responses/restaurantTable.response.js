// src/dtos/responses/restaurantTable.response.js

class RestaurantTableResponse {
  /**
   * Map 1 instance RestaurantTable -> object trả cho client
   */
  static fromModel(tableInstance) {
    if (!tableInstance) return null;

    const plain =
      typeof tableInstance.get === "function"
        ? tableInstance.get({ plain: true })
        : tableInstance;

    const {
      id,
      restaurant_id,
      name,
      capacity,
      location,
      status,
      view_image_url,
      view_note,
      created_at,
      updated_at,
      ...rest
    } = plain;

    return {
      id,
      restaurant_id,
      name,
      capacity,
      location,
      status,
      view_image_url,
      view_note,
      created_at,
      updated_at,
      ...rest,
    };
  }

  static fromList(tableInstances) {
    if (!Array.isArray(tableInstances)) return [];
    return tableInstances.map((t) => RestaurantTableResponse.fromModel(t));
  }
}

export default RestaurantTableResponse;
