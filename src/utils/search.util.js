// src/utils/search.util.js

/**
 * Chuẩn hoá text để đưa vào field search_*:
 * - null/undefined -> ""
 * - chuyển sang string
 * - trim
 * - lowercase
 * - bỏ dấu tiếng Việt (NFD)
 * - đổi đ/Đ -> d
 * - gom nhiều khoảng trắng thành 1
 */
export const normalizeTextForSearch = (value) => {
  if (!value) return "";

  let str = String(value).trim().toLowerCase();

  // Bỏ dấu tiếng Việt (NFD + remove combining marks)
  str = str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");

  // chuyển đ -> d
  str = str.replace(/đ/g, "d").replace(/Đ/g, "d");

  // thay các ký tự không phải chữ/số thành khoảng trắng
  str = str.replace(/[^a-z0-9\s]/g, " ");

  // gom nhiều space thành 1
  str = str.replace(/\s+/g, " ").trim();

  return str;
};

/**
 * Tạo 3 field search cho nhà hàng từ name, address, tags.
 * @param {Object} params
 * @param {string} params.name
 * @param {string} params.address
 * @param {string|string[]} params.tags
 */
export const buildRestaurantSearchFields = ({ name, address, tags }) => {
  // tags có thể là string (vd: "Lẩu, Nướng, Gia đình")
  // hoặc array (vd: ["lẩu", "nướng", "gia đình"])
  let tagsText = "";

  if (Array.isArray(tags)) {
    tagsText = tags.join(" ");
  } else if (typeof tags === "string") {
    tagsText = tags;
  }

  return {
    search_name: normalizeTextForSearch(name),
    search_address: normalizeTextForSearch(address),
    search_tags: normalizeTextForSearch(tagsText),
  };
};
