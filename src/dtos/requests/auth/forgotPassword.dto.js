// src/dtos/requests/auth/forgotPassword.dto.js

import Joi from "joi";

class ForgotPasswordDto {
  static get schema() {
    return Joi.object({
      email: Joi.string().email().required().messages({
        "string.email": "Email không hợp lệ",
        "any.required": "Email là bắt buộc",
      }),
    });
  }
}

export default ForgotPasswordDto;
