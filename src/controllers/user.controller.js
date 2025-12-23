// src/controllers/user.controller.js
import { UserResponse } from "../dtos/index.js";
import * as userService from "../services/user.service.js";
import { catchAsync } from "../utils/catchAsync.js"; // nếu bạn đang dùng catchAsync wrapper

class UserController {
  getMe = catchAsync(async (req, res) => {
    // giả định middleware auth đã set req.user.id
    const userId = req.user.id;

    const user = await userService.getMyMiniAppProfile(userId);

    const data = await UserResponse.fromModel(user);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin tài khoản thành công",
      data,
    });
  });

  updateMe = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const payload = {
      display_name: req.body.display_name,
      avatar_url: req.body.avatar_url, // path "/uploads/..." sau khi upload
      phone: req.body.phone,
      email: req.body.email,
    };

    const user = await userService.updateMyMiniAppProfile(userId, payload); // :contentReference[oaicite:2]{index=2}

const data = await UserResponse.fromModel(user);

    return res.status(200).json({
      success: true,
      message: "Cập nhật thông tin tài khoản thành công",
      data,
    });
  });

  changePassword = catchAsync(async (req, res) => {
    const userId = req.user.id;

    const payload = {
      current_password: req.body.current_password,
      new_password: req.body.new_password,
    };

    const user = await userService.changePasswordAndRevokeTokensMiniApp(
      userId,
      payload
    ); // :contentReference[oaicite:3]{index=3}

    return res.status(200).json({
      success: true,
      message: "Đổi mật khẩu thành công. Vui lòng đăng nhập lại.",
      data: {
        id: user.id,
      },
    });
  });
}
const userController = new UserController();
export default userController;
