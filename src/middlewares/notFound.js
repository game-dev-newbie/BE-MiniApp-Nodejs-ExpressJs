// src/middlewares/notFound.js
import AppError from "../utils/AppError.js";

export const notFound = (req, res, next) => {
  const err = new AppError(
    `Không tìm thấy route: ${req.method} ${req.originalUrl}`,
    404,
    "NOT_FOUND"
  );
  next(err);
};
