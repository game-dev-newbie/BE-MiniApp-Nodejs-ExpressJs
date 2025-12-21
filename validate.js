// src/middlewares/validate.js
import { AppError } from "../utils/appError.js";

const validate =
  (DtoClassOrSchema, property = "body") =>
  (req, res, next) => {
    // FIX: Support both Class (DtoClass.schema) and direct Joi Object (schema)
    // Ưu tiên kiểm tra hàm validate() để xác định đâu là Joi Schema thực sự
    let schema;
    
    if (typeof DtoClassOrSchema?.validate === 'function') {
        schema = DtoClassOrSchema;
    } else if (typeof DtoClassOrSchema?.schema?.validate === 'function') {
        schema = DtoClassOrSchema.schema;
    }

    // Phòng khi quên không khai báo schema cho DTO
    if (!schema) {
      return next(
        new AppError("DTO schema chưa được định nghĩa hoặc không hợp lệ", 500)
      );
    }

    const { error, value } = schema.validate(req[property], {
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

    // ✅ FIX: Only reassign if property is writable
    // req. query and req.params are read-only in Express
    try {
      if (property === "body" || property === "headers") {
        // These are writable
        req[property] = value;
      } else {
        // For query/params, store in separate property
        // This allows controllers to access validated data if needed
        req[
          `validated${property.charAt(0).toUpperCase()}${property.slice(1)}`
        ] = value;
      }
    } catch (err) {
      // If reassignment fails, just continue
      // The validation already passed, so req[property] is valid
      console.warn(
        `⚠️ Could not reassign req.${property}, but validation passed`
      );
    }
    return next();
  };

export default validate;
