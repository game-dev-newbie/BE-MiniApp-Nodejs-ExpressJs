// src/utils/fileStorage.util.js
import fs from "fs/promises";
import path from "path";

/**
 * Chỉ cho xoá file nằm trong "<project>/public/uploads/..."
 * Tránh path traversal kiểu: "/uploads/../../.env"
 */
const PUBLIC_DIR = path.resolve(process.cwd(), "public");
const UPLOADS_DIR = path.resolve(PUBLIC_DIR, "uploads");

const toAbsolutePathFromWebPath = (webPath) => {
  if (!webPath) return null;

  // webPath có thể là "/uploads/..." hoặc "uploads/..."
  const normalized = String(webPath).replace(/\\/g, "/").replace(/^\/+/, "");

  // map vào public/<normalized>
  const abs = path.resolve(PUBLIC_DIR, normalized);

  // chỉ cho phép trong public/uploads
  if (!abs.startsWith(UPLOADS_DIR + path.sep)) {
    return null;
  }

  return abs;
};

export const safeUnlinkByWebPath = async (webPath) => {
  const abs = toAbsolutePathFromWebPath(webPath);
  if (!abs) return false;

  try {
    await fs.unlink(abs);
    return true;
  } catch (err) {
    // file không tồn tại -> bỏ qua
    if (err && (err.code === "ENOENT" || err.code === "ENOTDIR")) return false;
    // lỗi khác: cứ throw để bạn nhìn thấy khi debug
    throw err;
  }
};

/**
 * So sánh 2 webPath một cách “ổn định” (bỏ khác biệt / ở đầu, backslash,...)
 */
export const isSameWebPath = (a, b) => {
  const na = String(a || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  const nb = String(b || "")
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  return na !== "" && na === nb;
};
