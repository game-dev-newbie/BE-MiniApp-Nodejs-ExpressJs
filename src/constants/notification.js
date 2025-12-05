// src/constants/notification.js
export const NOTIFICATION_TYPE = Object.freeze({
  BOOKING_CREATED: "BOOKING_CREATED",
  BOOKING_CONFIRMED: "BOOKING_CONFIRMED",
  BOOKING_CANCELLED: "BOOKING_CANCELLED",
  BOOKING_REMINDER: "BOOKING_REMINDER",
  GENERIC: "GENERIC",
});

export const NOTIFICATION_CHANNEL = Object.freeze({
  IN_APP: "IN_APP",
  ZNS: "ZNS",
  EMAIL: "EMAIL",
});

export const NOTIFICATION_TYPE_LIST = Object.freeze(
  Object.values(NOTIFICATION_TYPE)
);

export const NOTIFICATION_CHANNEL_LIST = Object.freeze(
  Object.values(NOTIFICATION_CHANNEL)
);
