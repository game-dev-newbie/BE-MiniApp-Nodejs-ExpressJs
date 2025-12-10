import * as authService from "../services/auth.service.js";
import { catchAsync } from "../utils/catchAsync.js";

class AuthController {
  registerDashboardOwner = catchAsync(async (req, res, next) => {
    const result = await authService.registerDashboardOwner(req.body);

    return res.status(201).json({
      success: true,
      message: "Đăng ký chủ nhà hàng thành công",
      data: result,
    });
  });

  registerDashboardStaff = catchAsync(async (req, res, next) => {
    const result = await authService.registerDashboardStaff(req.body);

    return res.status(201).json({
      success: true,
      message: "Đăng ký nhân viên thành công, chờ chủ nhà hàng duyệt",
      data: result,
    });
  });

  loginDashboard = catchAsync(async (req, res, next) => {
    const result = await authService.loginDashboard(req.body);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập dashboard thành công",
      data: result,
    });
  });
  loginWithZalo = catchAsync(async (req, res, next) => {
    const result = await authService.loginWithZalo(req.body);

    return res.status(200).json({
      success: true,
      message: "Đăng nhập bằng Zalo thành công",
      data: result,
    });
  });
}

const authController = new AuthController();
export default authController;
