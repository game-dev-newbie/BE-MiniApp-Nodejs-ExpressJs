// src/dtos/requests/auth/zaloLogin.dto.js
import Joi from "joi";

class ZaloLoginDto {
  static get schema() {
    return Joi.object({
      accessToken: Joi.string().required(), // accessToken Zalo FE gửi lên

      // toàn bộ object userInfo từ getUserInfo()
      userInfo: Joi.object().required(),

      // tuỳ bạn có dùng phone hay không
      phone: Joi.string().allow(null, "").optional(),
    });
  }
}

export default ZaloLoginDto;
