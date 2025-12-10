// src/dtos/responses/user.response.js

class UserResponse {
  /**
   * Map 1 instance User (Sequelize) -> object trả cho client
   */
  static fromModel(userInstance) {
    if (!userInstance) return null;

    const plain =
      typeof userInstance.get === "function"
        ? userInstance.get({ plain: true })
        : userInstance;

    const {
      id,
      display_name,
      email,
      phone,
      avatar_url,
      created_at,
      updated_at,
      ...rest
    } = plain;

    return {
      id,
      display_name,
      email,
      phone,
      avatar_url,
      created_at,
      updated_at,
      ...rest,
    };
  }

  /**
   * Map danh sách User -> danh sách DTO
   */
  static fromList(userInstances) {
    if (!Array.isArray(userInstances)) return [];
    return userInstances.map((u) => UserResponse.fromModel(u));
  }
}

export default UserResponse;
