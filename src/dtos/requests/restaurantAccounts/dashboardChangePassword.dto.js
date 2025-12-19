// src/dtos/requests/restaurantAccounts/dashboardChangePassword.dto.js
import Joi from "joi";

class DashboardChangePasswordDto {
  static get schema() {
    return Joi.object({
      current_password: Joi.string().min(6).max(100).required(),
      new_password: Joi.string().min(6).max(100).required(),
      confirm_password: Joi.string()
        .valid(Joi.ref("new_password"))
        .required()
        .messages({
          "any.only": "Mật khẩu xác nhận không trùng khớp với mật khẩu mới",
        }),
    });
  }
}

export default DashboardChangePasswordDto;
