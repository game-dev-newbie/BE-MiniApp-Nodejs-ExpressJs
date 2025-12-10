// src/dtos/index.js

// Dto dành cho requests
// Dto dành cho authentication
export { default as DashboardLoginDto } from "./requests/auth/dashboardLogin.dto.js";
export { default as DashboardOwnerRegisterDto } from "./requests/auth/dashboardOwnerRegister.dto.js";
export { default as DashboardStaffRegisterDto } from "./requests/auth/dashboardStaffRegister.dto.js";
export { default as ZaloLoginDto } from "./requests/auth/zaloLogin.dto.js";

// Dto dành cho restaurant
export { default as RestaurantUpdateDto } from "./requests/restaurants/restaurantUpdate.dto.js";

// Dto dành cho responses
export { default as UserResponse } from "./responses/user.response.js";
export { default as RestaurantAccountResponse } from "./responses/restaurantAccount.response.js";
export { default as RestaurantResponse } from "./responses/restaurant.response.js";
export { default as RestaurantTableResponse } from "./responses/restaurantTable.response.js";
export { default as BookingResponse } from "./responses/booking.response.js";
export { default as ReviewResponse } from "./responses/review.response.js";
