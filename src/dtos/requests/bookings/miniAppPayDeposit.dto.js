// src/dtos/requests/bookings/miniappPayDeposit.dto.js
import Joi from "joi";
import { PAYMENT_PROVIDER_LIST } from "../../../constants/index.js";

/**
 * DTO cho API thanh toán cọc miniapp:
 * POST /miniapp/bookings/:id/pay-deposit
 *
 * Body:
 *  - provider: ZALOPAY | MOMO | VNPAY | CASH (hoặc các provider bạn khai báo)
 *  - mock_result: SUCCESS | FAILED (dùng để test flow)
 */
class MiniAppPayDepositDto {
  static get schema() {
    return Joi.object({
      provider: Joi.string()
        .valid(...PAYMENT_PROVIDER_LIST)
        .required()
        .messages({
          "any.required": "Vui lòng chọn phương thức thanh toán",
          "any.only": "Phương thức thanh toán không hợp lệ",
        }),

      // Cho phép FE gửi mock_result để test:
      //  - "SUCCESS" -> giả lập thanh toán thành công
      //  - "FAILED"  -> giả lập thanh toán thất bại
      mock_result: Joi.string().valid("SUCCESS", "FAILED").optional(),
    });
  }
}

export default MiniAppPayDepositDto;
