// src/dtos/requests/user/miniAppChangePassword.dto.js
import Joi from "joi";

/**
 * POST /miniapp/users/me/change-password
 * current_password: mật khẩu hiện tại
 * new_password: mật khẩu mới (không cho trùng current_password)
 */
class MiniAppChangePasswordDto {
  static get schema() {
    return Joi.object({
      current_password: Joi.string().min(6).max(72).required(),

      new_password: Joi.string()
        .min(6)
        .max(72)
        .required()
        .invalid(Joi.ref("current_password"))
        .messages({
          "any.invalid": "Mật khẩu mới không được trùng mật khẩu hiện tại",
        }),
        
    }).unknown(false);
  }
}

export default MiniAppChangePasswordDto;
