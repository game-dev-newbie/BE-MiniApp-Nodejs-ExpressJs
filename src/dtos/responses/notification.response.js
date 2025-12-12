// src/dtos/responses/notification.response.js

import time from "../../utils/time.js";

class NotificationResponse {
  /**
   * Map 1 instance Notification -> object trả cho client
   */
  static fromModel(notificationInstance) {
    if (!notificationInstance) return null;

    const plain =
      typeof notificationInstance.get === "function"
        ? notificationInstance.get({ plain: true })
        : notificationInstance;

    const {
      id,
      user_id,
      restaurant_id,
      type,
      title,
      message,
      channel,
      is_read,
      read_at,
      created_at,
      sent_at,
      // nếu sau này bạn thêm field khác (vd: data JSON) sẽ nằm trong rest
      ...rest
    } = plain;

    return {
      id,
      user_id,
      restaurant_id,
      type,
      title,
      message,
      channel,
      is_read,
      read_at: time.toVNDateTime(read_at),
      created_at: time.toVNDateTime(created_at),
      sent_at: time.toVNDateTime(sent_at),
      ...rest,
    };
  }

  static fromList(notificationInstances) {
    if (!Array.isArray(notificationInstances)) return [];
    return notificationInstances.map((n) => NotificationResponse.fromModel(n));
  }
}

export default NotificationResponse;
