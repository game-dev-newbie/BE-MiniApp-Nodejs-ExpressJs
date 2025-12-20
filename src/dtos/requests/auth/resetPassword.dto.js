// src/dtos/requests/auth/resetPassword.dto.js

import Joi from "joi";

class ResetPasswordDto {
  static get schema() {
    return Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "any.required": "Email là bắt buộc",
      }),
      reset_token: Joi.string()
        .length(6)
        .pattern(/^[0-9]+$/)
        .required()
        .messages({
          "string.length": "Mã xác nhận phải có 6 chữ số",
          "string.pattern. base": "Mã xác nhận chỉ chứa số",
          "any.required": "Mã xác nhận là bắt buộc",
        }),
      new_password: Joi.string()
        .min(8)
        .max(128)
        .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .required()
        .messages({
          "string.min": "Mật khẩu phải có ít nhất 8 ký tự",
          "string.max": "Mật khẩu không được vượt quá 128 ký tự",
          "string.pattern.base":
            "Mật khẩu phải chứa ít nhất 1 chữ thường, 1 chữ hoa và 1 số",
          "any.required": "Mật khẩu mới là bắt buộc",
        }),
        confirm_new_password: Joi.any()
        .valid(Joi.ref("new_password"))
        .required()
    });
  }
}

export default ResetPasswordDto;
