// src/dtos/requests/auth/dashboardOwnerRegister.dto.js
import Joi from "joi";
import { AUTH_ROLES } from "../../../constants/index.js";

class DashboardOwnerRegisterDto {
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

      // client có thể gửi role, nhưng ta BẮT BUỘC phải là OWNER
      role: Joi.string().valid(AUTH_ROLES.OWNER).required().messages({
        "any.only": "Role không hợp lệ, đăng ký owner phải là OWNER",
      }),

      full_name: Joi.string().max(255).required(),

      // thông tin nhà hàng
      restaurant_name: Joi.string().max(255).required(),
      restaurant_address: Joi.string().max(500).required(),
      restaurant_phone: Joi.string().max(20).required(),
      restaurant_description: Joi.string().allow("", null),
    });
  }
}

export default DashboardOwnerRegisterDto;
