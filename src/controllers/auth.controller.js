import * as authService from "../services/auth.service.js";
import { catchAsync } from "../utils/catchAsync.js";

import UserResponse from "../dtos/responses/user.response.js";
import RestaurantAccountResponse from "../dtos/responses/restaurantAccount.response.js";
import RestaurantResponse from "../dtos/responses/restaurant.response.js";

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
}

const authController = new AuthController();
export default authController;
