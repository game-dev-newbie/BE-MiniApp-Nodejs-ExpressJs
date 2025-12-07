// src/dtos/requests/auth/zaloLogin.dto.js
import Joi from "joi";

class ZaloLoginDto {
  static get schema() {
    return Joi.object({
      accessToken: Joi.string().required(), // accessToken Zalo FE gửi lên
    });
  }
}

export default ZaloLoginDto;
