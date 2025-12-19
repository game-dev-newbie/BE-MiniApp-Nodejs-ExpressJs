// src/utils/uploadPath.util.js

import path from "path";
import { AppError } from "./appError.js"; // ✅ Import AppError

/**
 * ✅ IMPROVED:  Throw AppError with proper HTTP status codes
 *
 * Tính ra:
 *  - webDir: đường dẫn tương đối cho URL + lưu DB, vd: "uploads/restaurants/1/cover"
 *  - diskDir:  đường dẫn tuyệt đối trên ổ đĩa, vd: "<project>/public/uploads/restaurants/1/cover"
 *
 * scope hiện hỗ trợ:
 *  - restaurant_cover
 *  - restaurant_gallery
 *  - restaurant_menu
 *  - table_view
 *  - user_avatar
 *  - restaurant_account_avatar
 */
// ✅ Helper:  Validate required ID
const validateRequiredId = (id, idName, context) => {
  if (!id) {
    throw new AppError(`Thiếu ${idName} để upload ${context}`, 400);
  }
  if (isNaN(Number(id))) {
    throw new AppError(`${idName} phải là số hợp lệ`, 400);
  }
};

// ✅ Usage in buildDirsByScope
export const buildDirsByScope = (
  scope,
  { restaurantId, tableId, userId, restaurantAccountId } = {}
) => {
  const safeScope = String(scope || "").trim();

  if (!safeScope) {
    throw new AppError("Upload scope không được để trống", 400);
  }

  let webDir;

  switch (safeScope) {
    case "restaurant_cover":
      validateRequiredId(restaurantId, "restaurant_id", "ảnh cover nhà hàng");
      webDir = path.posix.join(
        "uploads",
        "restaurants",
        String(restaurantId),
        "cover"
      );
      break;

    case "restaurant_gallery":
      validateRequiredId(restaurantId, "restaurant_id", "ảnh gallery nhà hàng");
      webDir = path.posix.join(
        "uploads",
        "restaurants",
        String(restaurantId),
        "gallery"
      );
      break;

    case "restaurant_menu":
      validateRequiredId(restaurantId, "restaurant_id", "ảnh menu nhà hàng");
      webDir = path.posix.join(
        "uploads",
        "restaurants",
        String(restaurantId),
        "menu"
      );
      break;

    case "table_view":
      validateRequiredId(restaurantId, "restaurant_id", "ảnh view bàn");
      validateRequiredId(tableId, "table_id", "ảnh view bàn");
      webDir = path.posix.join(
        "uploads",
        "restaurants",
        String(restaurantId),
        "tables",
        String(tableId),
        "view"
      );
      break;

    case "user_avatar":
      validateRequiredId(userId, "user_id", "avatar user");
      webDir = path.posix.join("uploads", "users", String(userId), "avatar");
      break;

    case "restaurant_account_avatar":
      validateRequiredId(
        restaurantAccountId,
        "restaurant_account_id",
        "avatar tài khoản"
      );
      webDir = path.posix.join(
        "uploads",
        "restaurant-accounts",
        String(restaurantAccountId),
        "avatar"
      );
      break;

    default:
      throw new AppError(
        `Upload scope "${safeScope}" không hợp lệ. Các scope hợp lệ: restaurant_cover, restaurant_gallery, restaurant_menu, table_view, user_avatar, restaurant_account_avatar`,
        400
      );
  }

  const diskDir = path.join(process.cwd(), "public", webDir);
  return { webDir, diskDir };
};

/**
 * Chuẩn hoá web path, đảm bảo bắt đầu bằng "/"
 * input: "uploads/..." -> output: "/uploads/..."
 */
export const normalizeWebPath = (webPath) => {
  if (!webPath) return null;

  let p = webPath.replace(/\\/g, "/");
  if (!p.startsWith("/")) p = `/${p}`;

  return p;
};

/**
 * Từ đường dẫn file trên ổ đĩa (vd: "public/uploads/. ../file.jpg")
 * -> relativeUrl: "/uploads/. ../file.jpg"
 * -> absoluteUrl: "<baseUrl>/uploads/.../file.jpg"
 *
 * baseUrl có thể truyền từ:
 *  - req.protocol + req.get("host")
 *  - hoặc từ APP_URL trong env
 */
export const buildImageUrl = (diskPath, baseUrl) => {
  if (!diskPath) {
    throw new AppError("Đường dẫn file không hợp lệ", 500);
  }

  // Extract relative path from disk path
  const publicDir = path.join(process.cwd(), "public");
  const relativePath = path.relative(publicDir, diskPath);

  // Convert to web path format
  const relativeUrl = normalizeWebPath(relativePath);

  // Build absolute URL
  const absoluteUrl = baseUrl
    ? `${baseUrl.replace(/\/$/, "")}${relativeUrl}`
    : relativeUrl;

  return {
    relativeUrl,
    absoluteUrl,
  };
};
