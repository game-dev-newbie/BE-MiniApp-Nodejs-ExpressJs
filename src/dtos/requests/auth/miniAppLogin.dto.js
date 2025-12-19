// src/dtos/requests/auth/miniAppLogin.dto.js
import Joi from "joi";

class MiniAppLoginDto {
  static get schema() {
    return Joi.object({
      email: Joi.string().email().max(255).required(),
      password: Joi.string().min(6).max(100).required(),
    });
  }
}

export default MiniAppLoginDto;
