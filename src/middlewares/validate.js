// src/middlewares/validate.js
import AppError from "../utils/AppError.js";

const validate =
  (DtoClass, property = "body") =>
  (req, res, next) => {
    // Phòng khi quên không khai báo schema cho DTO
    if (!DtoClass?.schema) {
      return next(
        new AppError("DTO schema chưa được định nghĩa cho request này", 500)
      );
    }

    const { error, value } = DtoClass.schema.validate(req[property], {
      abortEarly: false, // gom tất cả lỗi
      stripUnknown: true, // bỏ field thừa client gửi lên
    });

    if (error) {
      const details = error.details.map((d) => ({
        message: d.message,
        path: d.path,
      }));

      return next(new AppError("Validation error", 400, { details }));
    }

    // Gắn lại data đã được Joi “làm sạch”
    req[property] = value;
    return next();
  };

export default validate;
