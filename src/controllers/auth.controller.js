import * as authService from "../services/auth.service.js";
import { catchAsync } from "../utils/catchAsync.js";

import {
  RestaurantAccountResponse,
  RestaurantResponse,
  UserResponse,
} from "../dtos/index.js";
class AuthController {
  registerDashboardOwner = catchAsync(async (req, res, next) => {
    const { account, restaurant, tokens } =
      await authService.registerDashboardOwner(req.body);

    const data = {
      account: RestaurantAccountResponse.fromModel(account),
      restaurant: RestaurantResponse.toDashboard(restaurant),
      tokens,
    };

    return res.status(201).json({
      success: true,
      message: "Đăng ký chủ nhà hàng thành công",
      data,
    });
  });

  registerDashboardStaff = catchAsync(async (req, res, next) => {
    const { account, restaurant } = await authService.registerDashboardStaff(
      req.body
    );

    const data = {
      account: RestaurantAccountResponse.fromModel(account),
      restaurant: RestaurantResponse.toDashboard(restaurant),
    };

    return res.status(201).json({
      success: true,
      message: "Đăng ký nhân viên thành công, chờ chủ nhà hàng duyệt",
      data,
    });
  });

  loginDashboard = catchAsync(async (req, res, next) => {
    const { account, restaurant, tokens } = await authService.loginDashboard(
      req.body
    );

    const data = {
      account: RestaurantAccountResponse.fromModel(account),
      restaurant: RestaurantResponse.toDashboard(restaurant),
      tokens,
    };

    return res.status(200).json({
      success: true,
      message: "Đăng nhập dashboard thành công",
      data,
    });
  });

  loginWithZalo = catchAsync(async (req, res, next) => {
    const { user, tokens } = await authService.loginWithZalo(req.body);

    const data = {
      user: UserResponse.fromModel(user),
      tokens,
    };
    return res.status(200).json({
      success: true,
      message: "Đăng nhập bằng Zalo thành công",
      data,
    });
  });

  // ============ MINIAPP: REGISTER LOCAL ============

  registerMiniAppLocal = catchAsync(async (req, res, next) => {
    const { user, tokens } = await authService.registerMiniAppLocal(req.body);

    const data = {
      user: UserResponse.fromModel(user),
      tokens,
    };

    return res.status(201).json({
      success: true,
      message: "Đăng ký tài khoản miniapp thành công",
      data,
    });
  });

  // ============ MINIAPP: LOGIN LOCAL ============

  loginMiniAppLocal = catchAsync(async (req, res, next) => {
    const { user, tokens } = await authService.loginMiniAppLocal(req.body);

    const data = {
      user: UserResponse.fromModel(user),
      tokens,
    };

    return res.status(200).json({
      success: true,
      message: "Đăng nhập miniapp thành công",
      data,
    });
  });

  // ============ REFRESH TOKEN CHUNG ============

  refreshToken = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    const { user, account, restaurant, tokens } =
      await authService.refreshAuthTokens(refreshToken);

    const data = {
      tokens,
    };

    // Tuỳ kiểu principal mà gắn DTO phù hợp
    if (user) {
      data.user = UserResponse.fromModel(user);
    }

    if (account) {
      data.account = RestaurantAccountResponse.fromModel(account);
    }

    if (restaurant) {
      data.restaurant = RestaurantResponse.toDashboard(restaurant);
    }

    return res.status(200).json({
      success: true,
      message: "Làm mới token thành công",
      data,
    });
  });

  // ============ LOGOUT 1 SESSION ============

  logout = catchAsync(async (req, res, next) => {
    const { refreshToken } = req.body;

    await authService.logoutSession(refreshToken);

    return res.status(200).json({
      success: true,
      message: "Đăng xuất phiên hiện tại thành công",
    });
  });
}

const authController = new AuthController();
export default authController;
