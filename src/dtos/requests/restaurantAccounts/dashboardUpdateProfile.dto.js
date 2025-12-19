// src/dtos/requests/restaurantAccounts/dashboardUpdateProfile.dto.js
import Joi from "joi";

class DashboardUpdateProfileDto {
  static get schema() {
    return Joi.object({
      full_name: Joi.string().max(255),
      avatar_url: Joi.string().max(255).allow("", null),
      // avatar_url là path/url lấy được sau khi gọi module upload
    }).or("full_name", "avatar_url"); // ít nhất phải có 1 field
  }
}

export default DashboardUpdateProfileDto;
