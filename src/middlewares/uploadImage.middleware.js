// src/middlewares/uploadImage.middleware.js
import multer from "multer";
import fs from "fs";
import path from "path";
import { AppError } from "../utils/appError.js";
import { buildDirsByScope } from "../utils/uploadPath.util.js";

const ensureDirSync = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    try {
      const { scope, restaurant_id, table_id, user_id, restaurant_account_id } =
        req.query;

      const { webDir, diskDir } = buildDirsByScope(scope, {
        restaurantId: restaurant_id,
        tableId: table_id,
        userId: user_id,
        restaurantAccountId: restaurant_account_id,
      });

      ensureDirSync(diskDir);

      req.uploadMeta = {
        ...(req.uploadMeta || {}),
        webDir,
        diskDir,
      };

      cb(null, diskDir);
    } catch (err) {
      cb(err);
    }
  },

  filename(req, file, cb) {
    const ext = path.extname(file.originalname);
    const baseName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;

    if (req.uploadMeta && req.uploadMeta.webDir) {
      // nếu sau này muốn xài, vẫn có sẵn webFilePath cuối cùng
      req.uploadMeta.webFilePath = path.posix.join(
        req.uploadMeta.webDir,
        baseName
      );
    }

    cb(null, baseName);
  },
});

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Chỉ cho phép upload file ảnh", 400));
  }
  cb(null, true);
};

// SINGLE
const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
}).single("file"); // field: file

export const uploadSingleImageMiddleware = (req, res, next) => {
  uploadSingle(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(new AppError(`Lỗi upload file: ${err.message}`, 400));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new AppError("Vui lòng chọn file ảnh để upload", 400));
    }

    return next();
  });
};

// MULTIPLE
const uploadMulti = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB mỗi file
    files: 10, // tối đa 10 file / request (bạn muốn chỉnh thì đổi ở đây)
  },
}).array("files", 10); // field: files[]

export const uploadMultipleImagesMiddleware = (req, res, next) => {
  uploadMulti(req, res, (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(new AppError(`Lỗi upload file: ${err.message}`, 400));
      }
      return next(err);
    }

    if (!req.files || req.files.length === 0) {
      return next(
        new AppError("Vui lòng chọn ít nhất 1 file ảnh để upload", 400)
      );
    }

    return next();
  });
};
