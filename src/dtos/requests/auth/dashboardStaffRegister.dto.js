// src/dtos/requests/auth/dashboardStaffRegister.dto.js
import Joi from "joi";
import { AUTH_ROLES } from "../../../constants/index.js";

class DashboardStaffRegisterDto {
  static get schema() {
    return Joi.object({
      // thông tin tài khoản
      email: Joi.string().email().max(255).required(),
      password: Joi.string().min(6).max(100).required(),
      confirm_password: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Mật khẩu xác nhận không trùng khớp",
        }),

      // role staff
      role: Joi.string().valid(AUTH_ROLES.STAFF).required().messages({
        "any.only": "Role không hợp lệ, đăng ký staff phải là STAFF",
      }),

      full_name: Joi.string().max(255).required(),

      // invite code của nhà hàng
      invite_code: Joi.string().max(100).required(),
    });
  }
}

export default DashboardStaffRegisterDto;
