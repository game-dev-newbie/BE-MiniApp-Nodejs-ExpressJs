// src/middlewares/jwtAuthorization.js
// ---------------------------------------------------------
// Middleware xác thực & phân quyền dựa trên access token.
//
// Payload access token (do token.service.js tạo) có dạng:
//
// {
//   sub:        <id của subject (user.id hoặc restaurant_account.id)>,
//   sub_type:   <SUBJECT_TYPES.CUSTOMER | SUBJECT_TYPES.RESTAURANT_ACCOUNT>,
//   role:       <AUTH_ROLES.CUSTOMER | AUTH_ROLES.OWNER | AUTH_ROLES.STAFF>,
//   provider:   <AUTH_PROVIDERS.ZALO | AUTH_PROVIDERS.LOCAL>,
//   type:       TOKEN_TYPES.ACCESS,
//   iat, exp
// }
//
// Mục tiêu:
//  - authenticate:
//      + decode token
//      + load principal từ DB (User / RestaurantAccount / Restaurant)
//      + check trạng thái còn hiệu lực
//      + gắn vào req.auth + req.user / req.restaurantAccount / req.restaurant
//
//  - requireSubjectTypes(...subTypes)
//  - requireRoles(...roles)
//  - requireDashboardRoles(...roles)  // OWNER / STAFF
//  - requireCustomer()                // CUSTOMER miniapp
// ---------------------------------------------------------

import { AppError } from "../utils/appError.js";
import { getAccessPayloadFromRequest } from "../utils/tokenHelper.js";
import models from "../models/index.js";
import {
  SUBJECT_TYPES,
  AUTH_ROLES,
  RESTAURANT_ACCOUNT_STATUS,
} from "../constants/index.js";

const { User, RestaurantAccount, Restaurant } = models;

/**
 * Middleware xác thực chính:
 *  - Decode access token
 *  - Load principal từ DB
 *  - Check trạng thái active
 *  - Gắn thông tin vào req để controller dùng
 */
export const authenticate = async (req, res, next) => {
  try {
    const payload = getAccessPayloadFromRequest(req);

    const { sub, sub_type: subType, role, provider, type, iat, exp } = payload;

    if (!sub || !subType) {
      throw new AppError("Token không chứa đủ thông tin subject", 401);
    }

    let user = null;
    let restaurantAccount = null;
    let restaurant = null;

    // Tuỳ loại subject mà load đúng bảng
    switch (subType) {
      case SUBJECT_TYPES.CUSTOMER: {
        user = await User.findByPk(sub);

        if (!user) {
          // user bị xoá khỏi hệ thống
          throw new AppError(
            "Tài khoản khách hàng không còn tồn tại trong hệ thống",
            401
          );
        }

        break;
      }

      case SUBJECT_TYPES.RESTAURANT_ACCOUNT: {
        restaurantAccount = await RestaurantAccount.findByPk(sub);

        if (!restaurantAccount) {
          throw new AppError(
            "Tài khoản nhà hàng không còn tồn tại trong hệ thống",
            401
          );
        }

        // Check trạng thái tài khoản (revoke theo subject-level)
        if (restaurantAccount.status !== RESTAURANT_ACCOUNT_STATUS.ACTIVE) {
          throw new AppError(
            "Tài khoản nhà hàng đã bị vô hiệu hóa hoặc chưa được duyệt",
            403
          );
        }

        // Load luôn nhà hàng để đảm bảo nhà hàng còn active
        restaurant = await Restaurant.findByPk(restaurantAccount.restaurant_id);

        if (!restaurant || restaurant.is_active === false) {
          throw new AppError(
            "Nhà hàng hiện không còn hoạt động hoặc đã bị khóa",
            403
          );
        }

        break;
      }

      default: {
        throw new AppError("Loại subject không được hỗ trợ", 403);
      }
    }

    // Gắn info đã xác thực lên req để các layer sau dùng
    req.auth = {
      sub,
      subType,
      role,
      provider,
      tokenType: type,
      iat,
      exp,
    };

    // Tuỳ loại subject, expose thêm principal cụ thể
    if (user) {
      req.user = user;
    }

    if (restaurantAccount) {
      req.restaurantAccount = restaurantAccount;
    }

    if (restaurant) {
      req.restaurant = restaurant;
    }

    return next();
  } catch (err) {
    return next(err);
  }
};

/**
 * Factory middleware: yêu cầu subjectType thuộc 1 trong danh sách cho phép.
 *
 * Ví dụ:
 *  - requireSubjectTypes(SUBJECT_TYPES.RESTAURANT_ACCOUNT)
 *  - requireSubjectTypes(SUBJECT_TYPES.CUSTOMER)
 */
export const requireSubjectTypes = (...allowedSubTypes) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(new AppError("Chưa xác thực", 401));
    }

    if (!allowedSubTypes.includes(req.auth.subType)) {
      return next(
        new AppError("Không đủ quyền: loại subject không hợp lệ", 403)
      );
    }

    return next();
  };
};

/**
 * Factory middleware: yêu cầu role thuộc 1 trong danh sách cho phép.
 *
 * Ví dụ:
 *  - requireRoles(AUTH_ROLES.OWNER)
 *  - requireRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF)
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.auth) {
      return next(new AppError("Chưa xác thực", 401));
    }

    if (!allowedRoles.includes(req.auth.role)) {
      return next(new AppError("Không đủ quyền: role không hợp lệ", 403));
    }

    return next();
  };
};

/**
 * Shortcut cho các route DASHBOARD (OWNER / STAFF).
 *
 * Ví dụ:
 *
 *  router.get(
 *    "/bookings",
 *    ...requireDashboardRoles(AUTH_ROLES.OWNER, AUTH_ROLES.STAFF),
 *    bookingController.getDashboardBookings
 *  );
 */
export const requireDashboardRoles = (...roles) => {
  return [
    authenticate,
    requireSubjectTypes(SUBJECT_TYPES.RESTAURANT_ACCOUNT),
    requireRoles(...roles),
  ];
};

/**
 * Shortcut cho các route MINIAPP CUSTOMER (user Zalo).
 *
 * Ví dụ:
 *
 *  router.post(
 *    "/bookings",
 *    ...requireCustomer(),
 *    bookingController.createBookingForCustomer
 *  );
 */
export const requireCustomer = () => {
  return [
    authenticate,
    requireSubjectTypes(SUBJECT_TYPES.CUSTOMER),
    requireRoles(AUTH_ROLES.CUSTOMER),
  ];
};
