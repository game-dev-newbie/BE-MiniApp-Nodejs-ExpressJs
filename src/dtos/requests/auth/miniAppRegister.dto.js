// src/dtos/requests/auth/miniAppRegister.dto.js
import Joi from "joi";

class MiniAppRegisterDto {
  static get schema() {
    return Joi.object({
      // tên hiển thị trong miniapp
      display_name: Joi.string().max(255).required(),

      email: Joi.string().email().max(255).required(),

      phone: Joi.string().max(50).allow(null, ""),

      password: Joi.string().min(6).max(100).required(),

      confirm_password: Joi.string()
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.only": "Mật khẩu xác nhận không trùng khớp",
        }),
    });
  }
}

export default MiniAppRegisterDto;
