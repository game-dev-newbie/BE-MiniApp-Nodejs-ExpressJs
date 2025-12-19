// src/dtos/requests/users/miniAppUpdateProfile.dto.js
import Joi from "joi";

/**
 * PATCH /miniapp/users/me
 * Body cho phép update 1 hoặc nhiều field.
 * Bắt buộc phải có ÍT NHẤT 1 field trong số các field dưới đây.
 */
class MiniAppUpdateProfileDto {
  static get schema() {
    return Joi.object({
      display_name: Joi.string().trim().min(1).max(100).optional(),

      // lưu path tương đối để đồng nhất upload + xoá disk: "/uploads/...."
      avatar_url: Joi.string()
        .trim()
        .pattern(/^\/uploads\/.+/i)
        .max(500)
        .optional()
        .messages({
          "string.pattern.base": "avatar_url phải bắt đầu bằng /uploads/",
        }),

      phone: Joi.string()
        .trim()
        // đơn giản: cho phép 9-15 số, có thể bắt đầu bằng +
        .pattern(/^\+?\d{9,15}$/)
        .optional()
        .messages({
          "string.pattern.base": "Số điện thoại không hợp lệ",
        }),

      email: Joi.string().trim().email().max(150).optional(),
    })
      .min(1)
      .unknown(false);
    // bắt buộc phải có ít nhất 1 key để update.
    // chặn client gửi field lạ
  }
}
export default MiniAppUpdateProfileDto;
