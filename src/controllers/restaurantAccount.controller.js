// src/controllers/restaurantAccount.controller.js

import * as restaurantAccountService from "../services/restaurantAccount.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import { RestaurantAccountResponse } from "../dtos/index.js";

class RestaurantAccountController {
  /**
   * GET /api/v1/dashboard/accounts/me
   * Lấy thông tin tài khoản hiện tại.
   */
  getMyProfile = catchAsync(async (req, res, next) => {
    // jwtAuthorization đã giải mã và gắn vào req.auth
    const accountId = req.restaurantAccount?.id;

    const result = await restaurantAccountService.getMyAccountProfile(
      accountId
    );
    const data = RestaurantAccountResponse.fromModel(result);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin tài khoản thành công",
      data,
    });
  });

  /**
   * PATCH /api/v1/dashboard/accounts/me/profile
   * Cập nhật tên + avatar_url.
   */
  updateMyProfile = catchAsync(async (req, res, next) => {
    const accountId = req.restaurantAccount?.id;

    const result = await restaurantAccountService.updateMyAccountProfile(
      accountId,
      req.body
    );
    const data = RestaurantAccountResponse.fromModel(result);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin tài khoản thành công",
      data,
    });
  });

  /**
   * POST /api/v1/dashboard/accounts/me/change-password
   * Đổi mật khẩu + revoke toàn bộ token.
   */
  changePassword = catchAsync(async (req, res, next) => {
    const accountId = req.restaurantAccount?.id;

    await restaurantAccountService.changePasswordAndRevokeTokens(
      accountId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message:
        "Đổi mật khẩu thành công. Tất cả phiên đăng nhập đã bị thu hồi, vui lòng đăng nhập lại.",
    });
  });
}

const restaurantAccountController = new RestaurantAccountController();
export default restaurantAccountController;
