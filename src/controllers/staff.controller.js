// src/controllers/staff.controller.js

import * as staffService from "../services/staff.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import {
  parsePagination,
  buildPaginationMeta,
} from "../utils/pagination.util.js";
import { RestaurantAccountResponse } from "../dtos/index.js";

class StaffController {
  // GET /dashboard/staff
  listStaff = catchAsync(async (req, res) => {
    const ownerAccountId = req.restaurantAccount.id;

    const { limit, offset, page } = parsePagination(req.query);

    const result = await staffService.listStaffOfOwnerRestaurant(
      ownerAccountId,
      { limit, offset }
    );

    const items = result.items.map((acc) =>
      RestaurantAccountResponse.fromModel(acc)
    );

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách nhân viên thành công",
      data: {
        items,
        pagination: buildPaginationMeta({
          total: result.total,
          limit,
          offset,
          page,
        }),
      },
    });
  });

  // PATCH /dashboard/staff/:id/approve
  approveStaff = catchAsync(async (req, res) => {
    const ownerAccountId = req.restaurantAccount.id;
    const staffId = req.params.id;

    const staff = await staffService.approveStaff(ownerAccountId, staffId);

    const data = RestaurantAccountResponse.fromModel(staff);

    return res.status(200).json({
      success: true,
      message: "Duyệt tài khoản nhân viên thành công",
      data,
    });
  });

  // PATCH /dashboard/staff/:id/reject
  rejectStaff = catchAsync(async (req, res) => {
    const ownerAccountId = req.restaurantAccount.id;
    const staffId = req.params.id;

    const staff = await staffService.rejectStaff(ownerAccountId, staffId);

    const data = RestaurantAccountResponse.fromModel(staff);

    return res.status(200).json({
      success: true,
      message: "Từ chối tài khoản nhân viên thành công",
      data,
    });
  });

  // PATCH /dashboard/staff/:id/lock
  lockStaff = catchAsync(async (req, res) => {
    const ownerAccountId = req.restaurantAccount.id;
    const staffId = req.params.id;

    const staff = await staffService.lockStaff(ownerAccountId, staffId);

    const data = RestaurantAccountResponse.fromModel(staff);

    return res.status(200).json({
      success: true,
      message: "Khoá tài khoản nhân viên thành công",
      data,
    });
  });

  // PATCH /dashboard/staff/:id/unlock
  unlockStaff = catchAsync(async (req, res) => {
    const ownerAccountId = req.restaurantAccount.id;
    const staffId = req.params.id;

    const staff = await staffService.unlockStaff(ownerAccountId, staffId);

    const data = RestaurantAccountResponse.fromModel(staff);

    return res.status(200).json({
      success: true,
      message: "Mở khóa tài khoản nhân viên thành công",
      data,
    });
  });
}

const staffController = new StaffController();
export default staffController;
