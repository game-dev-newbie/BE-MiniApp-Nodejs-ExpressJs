import { BookingMiniAppResponse } from "../dtos/index.js";
import * as paymentService from "../services/payment.service.js";
import { catchAsync } from "../utils/catchAsync.js";

class PaymentController {
  payDeposit = catchAsync(async (req, res, next) => {
    const userId = req.user.id;
    const bookingId = req.params;
    const { provider, mock_result } = req.body;

    const booking = await paymentService.payDepositForBooking(
      userId,
      bookingId,
      {
        provider,
        mock_result,
      }
    );

    const data = BookingMiniAppResponse.fromModel(booking);

    return res.status(200).json({
      success: true,
      message: "Thanh toán cọc cho booking thành công",
      data,
    });
  });
}
const paymentController = new PaymentController();
export default paymentController;
