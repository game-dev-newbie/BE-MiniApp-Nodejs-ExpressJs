// src/utils/uploadPath.util.js
import path from "path";

/**
 * Tính ra:
 *  - webDir: đường dẫn tương đối cho URL + lưu DB, vd: "uploads/restaurants/1/cover"
 *  - diskDir: đường dẫn tuyệt đối trên ổ đĩa, vd: "<project>/public/uploads/restaurants/1/cover"
 *
 * scope hiện hỗ trợ:
 *  - restaurant_cover
 *  - restaurant_gallery
 *  - restaurant_menu
 *  - table_view
 *  - user_avatar
 *  - restaurant_account_avatar
 */
export const buildDirsByScope = (
  scope,
  { restaurantId, tableId, userId, restaurantAccountId } = {}
) => {
  const safeScope = String(scope || "").trim();

  let webDir; // luôn bắt đầu từ "uploads/..."

  switch (safeScope) {
    case "restaurant_cover":
      if (restaurantId) {
        webDir = path.posix.join(
          "uploads",
          "restaurants",
          String(restaurantId),
          "cover"
        );
      }
      break;

    case "restaurant_gallery":
      if (restaurantId) {
        webDir = path.posix.join(
          "uploads",
          "restaurants",
          String(restaurantId),
          "gallery"
        );
      }
      break;

    case "restaurant_menu":
      if (restaurantId) {
        webDir = path.posix.join(
          "uploads",
          "restaurants",
          String(restaurantId),
          "menu"
        );
      }
      break;

    case "table_view":
      if (tableId) {
        webDir = path.posix.join("uploads", "tables", String(tableId), "view");
      }
      break;

    case "user_avatar":
      if (userId) {
        webDir = path.posix.join("uploads", "users", String(userId), "avatar");
      }
      break;

    case "restaurant_account_avatar":
      if (restaurantAccountId) {
        webDir = path.posix.join(
          "uploads",
          "restaurant-accounts",
          String(restaurantAccountId),
          "avatar"
        );
      }
      break;

    default:
      break;
  }

  // fallback nếu thiếu scope / id
  if (!webDir) {
    webDir = path.posix.join("uploads", "others");
  }

  // diskDir: <project>/public/<webDir>
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
 * Từ đường dẫn file trên ổ đĩa (vd: "public/uploads/.../file.jpg")
 * -> relativeUrl: "/uploads/.../file.jpg"
 * -> absoluteUrl: "<baseUrl>/uploads/.../file.jpg"
 *
 * baseUrl có thể truyền từ:
 *  - req.protocol + req.get("host")
 *  - hoặc từ APP_URL trong env
 */
export const buildImageUrl = (filePath, baseUrl = "") => {
  if (!filePath) {
    return { relativeUrl: null, absoluteUrl: null };
  }

  // chuẩn hoá "\" -> "/"
  let normalized = filePath.replace(/\\/g, "/");

  // bỏ prefix "public/"
  if (normalized.startsWith("public/")) {
    normalized = normalized.slice("public/".length);
  }

  // đảm bảo không có dư "/" ở đầu
  normalized = normalized.replace(/^\/+/, "");

  const relativeUrl = `/${normalized}`; // "/uploads/..."

  const trimmedBase = (baseUrl || "").replace(/\/+$/, "");
  const absoluteUrl = trimmedBase
    ? `${trimmedBase}${relativeUrl}`
    : relativeUrl;

  return { relativeUrl, absoluteUrl };
};
