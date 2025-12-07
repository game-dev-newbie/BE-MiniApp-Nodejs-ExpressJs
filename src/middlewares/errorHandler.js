// src/middlewares/errorHandler.js
import AppError from "../utils/AppError.js";
import { ValidationError as SequelizeValidationError } from "sequelize";

export const errorHandler = (err, req, res, next) => {
  // Log ra console cho dev
  console.error("🔥 Error:", err);

  // 1) Lỗi do mình chủ động quăng
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        details: err.details ?? null,
      },
    });
  }

  // 2) Lỗi validate của Sequelize
  if (err instanceof SequelizeValidationError) {
    return res.status(400).json({
      success: false,
      error: {
        code: "DB_VALIDATION_ERROR",
        message: "Dữ liệu không hợp lệ với database",
        details: err.errors?.map((e) => ({
          message: e.message,
          path: e.path,
          type: e.type,
        })),
      },
    });
  }

  // 3) Lỗi JWT phổ biến
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "INVALID_TOKEN",
        message: "Token không hợp lệ",
      },
    });
  }

  if (err.name === "TokenExpiredError") {
    return res.status(401).json({
      success: false,
      error: {
        code: "TOKEN_EXPIRED",
        message: "Phiên đăng nhập đã hết hạn",
      },
    });
  }

  // 4) Fallback: lỗi không phân loại
  return res.status(500).json({
    success: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Có lỗi xảy ra trên server",
    },
  });
};
