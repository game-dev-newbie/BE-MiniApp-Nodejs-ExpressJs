// src/models/index.js
import { DataTypes } from "sequelize";
import sequelize from "../config/database.js";

// Import từng factory model ESM
import UserFactory from "./user.js";
import UserAuthProviderFactory from "./user_auth_provider.js";
import RestaurantFactory from "./restaurant.js";
import RestaurantAccountFactory from "./restaurant_account.js";
import RestaurantTableFactory from "./restaurant_table.js";
import BookingFactory from "./booking.js";
import PaymentFactory from "./payment.js";
import ReviewFactory from "./review.js";
import FavoriteRestaurantFactory from "./favorite_restaurant.js";
import NotificationFactory from "./notification.js";
import RestaurantImageFactory from "./restaurant_image.js";
import AuthTokenFactory from "./auth_token.js";

// Khởi tạo models
const models = {};

models.User = UserFactory(sequelize, DataTypes);
models.UserAuthProvider = UserAuthProviderFactory(sequelize, DataTypes);
models.Restaurant = RestaurantFactory(sequelize, DataTypes);
models.RestaurantAccount = RestaurantAccountFactory(sequelize, DataTypes);
models.RestaurantTable = RestaurantTableFactory(sequelize, DataTypes);
models.Booking = BookingFactory(sequelize, DataTypes);
models.Payment = PaymentFactory(sequelize, DataTypes);
models.Review = ReviewFactory(sequelize, DataTypes);
models.FavoriteRestaurant = FavoriteRestaurantFactory(sequelize, DataTypes);
models.Notification = NotificationFactory(sequelize, DataTypes);
models.RestaurantImage = RestaurantImageFactory(sequelize, DataTypes);
models.AuthToken = AuthTokenFactory(sequelize, DataTypes);

// Gọi associate cho tất cả model (nếu có)
Object.values(models).forEach((model) => {
  if (typeof model.associate === "function") {
    model.associate(models);
  }
});
// Log các model đã load
console.log('📦 Đã load model:', Object.keys(models));


// Export cho app dùng
export { sequelize };
export default models;
