// src/constants/restaurantAccount.js
export const RESTAURANT_ACCOUNT_ROLE = Object.freeze({
  OWNER: "OWNER",
  STAFF: "STAFF",
});

export const RESTAURANT_ACCOUNT_STATUS = Object.freeze({
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
  INVITED: "INVITED", // gửi mail/invite nhưng chưa accept
  REJECTED: "REJECTED", // bị từ chối bởi OWNER
});

export const RESTAURANT_ACCOUNT_ROLE_LIST = Object.freeze(
  Object.values(RESTAURANT_ACCOUNT_ROLE)
);

export const RESTAURANT_ACCOUNT_STATUS_LIST = Object.freeze(
  Object.values(RESTAURANT_ACCOUNT_STATUS)
);
