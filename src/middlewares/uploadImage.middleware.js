// src/middlewares/uploadImage. middleware.js

import multer from "multer";
import sharp from "sharp"; // ✅ NEW
import fs from "fs";
import path from "path";
import { AppError } from "../utils/appError.js";
import { buildDirsByScope } from "../utils/uploadPath.util.js";

const ensureDirSync = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// ✅ CHANGED: Use memory storage instead of disk storage
// Files will be processed in memory, then saved to disk after compression
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image/")) {
    return cb(new AppError("Chỉ cho phép upload file ảnh", 400));
  }
  cb(null, true);
};

/**
 * ✅ NEW: Get compression options based on scope
 */
function getCompressionOptions(scope) {
  switch (scope) {
    case "restaurant_cover":
    case "restaurant_gallery":
      return {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85,
        format: "jpeg",
      };

    case "restaurant_menu":
      return {
        maxWidth: 1200,
        maxHeight: 1600,
        quality: 90, // Higher quality for text readability
        format: "jpeg",
      };

    case "table_view":
      return {
        maxWidth: 1280,
        maxHeight: 720,
        quality: 80,
        format: "jpeg",
      };

    case "user_avatar":
    case "restaurant_account_avatar":
      return {
        maxWidth: 512,
        maxHeight: 512,
        quality: 85,
        format: "jpeg",
      };

    default:
      return {
        maxWidth: 1920,
        maxHeight: 1080,
        quality: 85,
        format: "jpeg",
      };
  }
}

/**
 * ✅ NEW: Process and compress image with Sharp
 */
async function processImage(buffer, outputPath, options = {}) {
  const {
    maxWidth = 1920,
    maxHeight = 1080,
    quality = 85,
    format = "jpeg",
  } = options;

  let sharpInstance = sharp(buffer);

  // Resize if needed
  sharpInstance = sharpInstance.resize(maxWidth, maxHeight, {
    fit: "inside", // Maintain aspect ratio
    withoutEnlargement: true, // Don't upscale small images
  });

  // Convert to specified format with quality
  if (format === "jpeg") {
    sharpInstance = sharpInstance.jpeg({
      quality,
      progressive: true, // Progressive JPEG for better loading
      mozjpeg: true, // Use mozjpeg for better compression
    });
  } else if (format === "png") {
    sharpInstance = sharpInstance.png({
      quality,
      compressionLevel: 9,
    });
  } else if (format === "webp") {
    sharpInstance = sharpInstance.webp({ quality });
  }

  // Save to disk
  await sharpInstance.toFile(outputPath);
}

// =====================
// SINGLE IMAGE UPLOAD
// =====================

const uploadSingle = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB (before compression)
  },
}).single("file");

export const uploadSingleImageMiddleware = (req, res, next) => {
  uploadSingle(req, res, async (err) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return next(new AppError(`Lỗi upload file: ${err.message}`, 400));
      }
      return next(err);
    }

    if (!req.file) {
      return next(new AppError("Vui lòng chọn file ảnh để upload", 400));
    }

    try {
      const { scope, restaurant_id, table_id, user_id, restaurant_account_id } =
        req.query;

      // Get directories
      const { webDir, diskDir } = buildDirsByScope(scope, {
        restaurantId: restaurant_id,
        tableId: table_id,
        userId: user_id,
        restaurantAccountId: restaurant_account_id,
      });

      ensureDirSync(diskDir);

      // Generate filename (force . jpg extension after compression)
      const timestamp = Date.now();
      const random = Math.round(Math.random() * 1e9);
      const filename = `${timestamp}-${random}.jpg`; // ✅ Force .jpg
      const diskPath = path.join(diskDir, filename);

      // ✅ Get compression options based on scope
      const compressionOptions = getCompressionOptions(scope);

      // ✅ Process & compress image
      const originalSize = req.file.buffer.length;

      await processImage(req.file.buffer, diskPath, compressionOptions);

      // Get compressed file size
      const stats = fs.statSync(diskPath);
      const compressedSize = stats.size;
      const savedPercent = (
        ((originalSize - compressedSize) / originalSize) *
        100
      ).toFixed(1);

      // ✅ Log compression stats
      console.log(`✅ Image compressed:  ${req.file.originalname}`);
      console.log(`   Original:    ${(originalSize / 1024).toFixed(2)} KB`);
      console.log(`   Compressed: ${(compressedSize / 1024).toFixed(2)} KB`);
      console.log(`   Saved:      ${savedPercent}%`);

      // Attach metadata to req. file for controller
      req.file.filename = filename;
      req.file.path = diskPath;
      req.file.size = compressedSize; // ✅ Update to compressed size
      req.file.mimetype = "image/jpeg"; // ✅ Update mimetype

      // Store web path
      req.uploadMeta = {
        webDir,
        diskDir,
        webFilePath: path.posix.join(webDir, filename),
      };

      next();
    } catch (error) {
      console.error("❌ Image processing error:", error);
      return next(new AppError("Lỗi xử lý ảnh", 500));
    }
  });
};

// =====================
// MULTIPLE IMAGES UPLOAD
// =====================

const uploadMulti = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 10, // Max 10 files
  },
}).array("files", 10);

export const uploadMultipleImagesMiddleware = (req, res, next) => {
  uploadMulti(req, res, async (err) => {
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

      const compressionOptions = getCompressionOptions(scope);

      // ✅ Process all images
      const processedFiles = [];
      let totalOriginalSize = 0;
      let totalCompressedSize = 0;

      for (const file of req.files) {
        const timestamp = Date.now();
        const random = Math.round(Math.random() * 1e9);
        const filename = `${timestamp}-${random}.jpg`; // ✅ Force . jpg
        const diskPath = path.join(diskDir, filename);

        // Compress image
        const originalSize = file.buffer.length;
        totalOriginalSize += originalSize;

        await processImage(file.buffer, diskPath, compressionOptions);

        const stats = fs.statSync(diskPath);
        const compressedSize = stats.size;
        totalCompressedSize += compressedSize;

        processedFiles.push({
          originalname: file.originalname,
          filename,
          path: diskPath,
          size: compressedSize,
          mimetype: "image/jpeg",
        });

        console.log(
          `✅ Compressed:  ${file.originalname} → ${(
            compressedSize / 1024
          ).toFixed(2)} KB`
        );
      }

      const savedPercent = (
        ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) *
        100
      ).toFixed(1);
      console.log(`📊 Total:  ${req.files.length} files`);
      console.log(`   Original:   ${(totalOriginalSize / 1024).toFixed(2)} KB`);
      console.log(
        `   Compressed: ${(totalCompressedSize / 1024).toFixed(2)} KB`
      );
      console.log(`   Saved:      ${savedPercent}%`);

      // Replace req.files with processed files
      req.files = processedFiles;

      req.uploadMeta = { webDir, diskDir };

      next();
    } catch (error) {
      console.error("❌ Image processing error:", error);
      return next(new AppError("Lỗi xử lý ảnh", 500));
    }
  });
};
