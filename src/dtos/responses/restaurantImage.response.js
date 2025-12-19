// src/dtos/responses/restaurantImage.response.js

class RestaurantImageResponse {
  /**
   * Map 1 instance RestaurantImage -> object trả cho client
   */
  static fromModel(imageInstance) {
    if (!imageInstance) return null;

    const plain =
      typeof imageInstance.get === "function"
        ? imageInstance.get({ plain: true })
        : imageInstance;

    const {
      id,
      restaurant_id,
      file_path,
      type,
      caption,
      is_primary,
      created_at,
    } = plain;

    return {
      id,
      restaurant_id,
      file_path,
      type,
      caption,
      is_primary,
      created_at,
    };
  }

  static fromList(imageInstances) {
    if (!Array.isArray(imageInstances)) return [];
    return imageInstances.map((img) => RestaurantImageResponse.fromModel(img));
  }
}

export default RestaurantImageResponse;
