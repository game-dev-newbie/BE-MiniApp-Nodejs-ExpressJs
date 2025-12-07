// src/utils/AppError.js

export default class AppError extends Error {
  constructor(
    message,
    statusCode = 500,
    code = "INTERNAL_ERROR",
    details = null
  ) {
    super(message);

    this.statusCode = statusCode;
    this.code = code;
    this.details = details;

    // giữ stack sạch cho debug
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}
