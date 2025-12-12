// src/controllers/restaurantTable.controller.js

import * as restaurantTableService from "../services/restaurantTable.service.js";
import { catchAsync } from "../utils/catchAsync.js";
import RestaurantTableResponse from "../dtos/responses/restaurantTable.response.js";

class RestaurantTableController {
  // GET /dashboard/tables
  listMyTables = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;

    const tables = await restaurantTableService.listTablesOfMyRestaurant(
      accountId
    );

    const items = RestaurantTableResponse.fromList(tables);

    return res.status(200).json({
      success: true,
      message: "Lấy danh sách bàn của nhà hàng thành công",
      data: { items },
    });
  });

  // GET /dashboard/tables/:id
  getTableDetail = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const tableId = req.params.id;

    const table = await restaurantTableService.getTableDetail(
      accountId,
      tableId
    );

    const data = RestaurantTableResponse.fromModel(table);

    return res.status(200).json({
      success: true,
      message: "Lấy thông tin bàn thành công",
      data,
    });
  });

  // POST /dashboard/tables
  createTable = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;

    const table = await restaurantTableService.createTable(accountId, req.body);

    const data = RestaurantTableResponse.fromModel(table);

    return res.status(201).json({
      success: true,
      message: "Tạo bàn mới thành công",
      data,
    });
  });

  // PATCH /dashboard/tables/:id
  updateTable = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const tableId = req.params.id;

    const table = await restaurantTableService.updateTable(
      accountId,
      tableId,
      req.body
    );

    const data = RestaurantTableResponse.fromModel(table);

    return res.status(200).json({
      success: true,
      message: "Cập nhật bàn thành công",
      data,
    });
  });

  // DELETE /dashboard/tables/:id (soft delete -> INACTIVE)
  deleteTable = catchAsync(async (req, res) => {
    const accountId = req.restaurantAccount.id;
    const tableId = req.params.id;

    const table = await restaurantTableService.softDeleteTable(
      accountId,
      tableId
    );

    const data = RestaurantTableResponse.fromModel(table);

    return res.status(200).json({
      success: true,
      message: "Đặt trạng thái INACTIVE cho bàn thành công",
      data,
    });
  });
}

const restaurantTableController = new RestaurantTableController();
export default restaurantTableController;
