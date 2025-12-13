// src/controllers/upload.controller.js
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/appError.js";
import { buildImageUrl } from "../utils/uploadPath.util.js";

class UploadController {
  // SINGLE
  uploadSingleImage = catchAsync(async (req, res, next) => {
    if (!req.file) {
      throw new AppError("Không tìm thấy file upload", 400);
    }

    const { originalname, mimetype, size, filename, path: filePath } = req.file;
    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const { relativeUrl, absoluteUrl } = buildImageUrl(filePath, baseUrl);

    return res.status(201).json({
      success: true,
      message: "Upload ảnh thành công",
      data: {
        filename,
        originalName: originalname,
        mimeType: mimetype,
        size,
        path: relativeUrl, // "/uploads/..."
        url: absoluteUrl,
      },
    });
  });

  // MULTIPLE
  uploadMultipleImages = catchAsync(async (req, res, next) => {
    if (!req.files || req.files.length === 0) {
      throw new AppError("Không tìm thấy file upload", 400);
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;

    const files = req.files.map((file) => {
      const { originalname, mimetype, size, filename, path: filePath } = file;
      const { relativeUrl, absoluteUrl } = buildImageUrl(filePath, baseUrl);

      return {
        filename,
        originalName: originalname,
        mimeType: mimetype,
        size,
        path: relativeUrl,
        url: absoluteUrl,
      };
    });

    return res.status(201).json({
      success: true,
      message: "Upload ảnh thành công",
      data: files,
    });
  });
}

const uploadController = new UploadController();
export default uploadController;
