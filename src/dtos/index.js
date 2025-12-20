// src/dtos/index.js

// Dto dành cho requests
// Dto dành cho authentication
export { default as DashboardLoginDto } from "./requests/auth/dashboardLogin.dto.js";
export { default as DashboardOwnerRegisterDto } from "./requests/auth/dashboardOwnerRegister.dto.js";
export { default as DashboardStaffRegisterDto } from "./requests/auth/dashboardStaffRegister.dto.js";
export { default as ZaloLoginDto } from "./requests/auth/zaloLogin.dto.js";
export { default as MiniAppRegisterDto } from "./requests/auth/miniAppRegister.dto.js";
export { default as MiniAppLoginDto } from "./requests/auth/miniAppLogin.dto.js";
export { default as ForgotPasswordDto } from "./requests/auth/forgotPassword.dto.js";
export { default as ResetPasswordDto } from "./requests/auth/resetPassword.dto.js";

// Dto dành cho restaurants
export { default as RestaurantUpdateDto } from "./requests/restaurants/restaurantUpdate.dto.js";

// Dto dành cho restaurant_tables
export { default as RestaurantTableCreateDto } from "./requests/restaurantTables/restaurantTableCreate.dto.js";
export { default as RestaurantTableUpdateDto } from "./requests/restaurantTables/restaurantTableUpdate.dto.js";

// Dto dành cho booking
export { default as MiniAppCreateBookingDto } from "./requests/bookings/miniAppCreateBooking.dto.js";
export { default as MiniAppUpdateBookingDto } from "./requests/bookings/miniAppUpdateBooking.dto.js";
export { default as MiniAppPayDepositDto } from "./requests/bookings/miniAppPayDeposit.dto.js";

// Dto dành cho reviews
export { default as MiniAppCreateReviewDto } from "./requests/reviews/miniAppCreateReview.dto.js";
export { default as DashboardReplyReviewDto } from "./requests/reviews/dashboardReplyReview.dto.js";

// Dto dành cho restaurant_accounts
export { default as DashboardUpdateProfileDto } from "./requests/restaurantAccounts/dashboardUpdateProfile.dto.js";
export { default as DashboardChangePasswordDto } from "./requests/restaurantAccounts/dashboardChangePassword.dto.js";

// Dto dành cho restaurant_images
export { default as DashboardCreateRestaurantImageDto } from "./requests/restaurantImages/dashboardCreateRestaurantImage.dto.js";

// Dto dành cho user
export { default as MiniAppChangePasswordDto } from "./requests/users/miniAppChangePassword.dto.js";
export { default as MiniAppUpdateProfileDto } from "./requests/users/miniAppUpdateProfile.dto.js";

/*           ==================================               */
// Dto dành cho responses
export { default as UserResponse } from "./responses/user.response.js";
export { default as RestaurantAccountResponse } from "./responses/restaurantAccount.response.js";
export { default as RestaurantResponse } from "./responses/restaurant.response.js";
export { default as RestaurantTableResponse } from "./responses/restaurantTable.response.js";
export { default as BookingResponse } from "./responses/booking.response.js";
export { default as BookingMiniAppResponse } from "./responses/bookingMiniApp.response.js";
export { default as ReviewResponse } from "./responses/review.response.js";
export { default as NotificationResponse } from "./responses/notification.response.js";
export { default as FavoriteRestaurantResponse } from "./responses/favoriteRestaurant.response.js";
export { default as RestaurantImageResponse } from "./responses/restaurantImage.response.js";

// === Dto dành cho request chứa query phân trang + filter ===
export { default as DashboardListBookingsQueryDto } from "./requests/bookings/dashboardListBookings.query.dto.js";
export { default as DashboardSearchBookingsByCustomerQueryDto } from "./requests/bookings/dashboardSearchBookingsByCustomer.query.dto.js";
export { default as MiniAppListMyBookingsQueryDto } from "./requests/bookings/miniAppListMyBookings.query.dto.js";
export { default as FavoriteRestaurantsListQueryDto } from "./requests/favoriteRestaurants/favoriteRestaurantsList.query.dto.js";
export { default as DashboardListNotificationsQueryDto } from "./requests/notifications/dashboardListNotifications.query.dto.js";
export { default as MiniAppListNotificationsQueryDto } from "./requests/notifications/miniAppListNotifications.query.dto.js";
export { default as DashboardListRestaurantImagesQueryDto } from "./requests/restaurantImages/dashboardListRestaurantImages.query.dto.js";
export { default as MiniAppRestaurantReviewsQueryDto } from "./requests/restaurants/miniAppRestaurantReviews.query.dto.js";
export { default as MiniAppSearchRestaurantsQueryDto } from "./requests/restaurants/miniAppSearchRestaurants.query.dto.js";
export { default as DashboardListRestaurantReviewsQueryDto } from "./requests/reviews/dashboardListRestaurantReviews.query.dto.js";
export { default as MiniAppListMyReviewsQueryDto } from "./requests/reviews/miniAppListMyReviews.query.dto.js";
export { default as DashboardListStaffsQueryDto } from "./requests/staff/dashboardListStaffs.query.dto.js";
