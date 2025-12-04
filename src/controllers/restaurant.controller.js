import { catchAsync } from "../utils/catchAsync.js";
class RestaurantController {
  // Controller methods viết ở đây
  createTable = catchAsync(async (req, res, next) => {
    // Logic để tạo bàn ăn
    res.status(201).json({ message: "Bàn ăn được tạo thành công" });
  });
}

export const restaurantController = new RestaurantController();