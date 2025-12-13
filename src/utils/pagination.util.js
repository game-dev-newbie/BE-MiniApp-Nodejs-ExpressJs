// src/utils/pagination.util.js

const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 50;

/**
 * Chuẩn hoá tham số phân trang từ query
 * Hỗ trợ cả:
 *  - ?page=1&page_size=20
 *  - ?limit=20&offset=0
 */
export const parsePagination = (query = {}) => {
  const { page, page_size, limit, offset } = query;

  // Ưu tiên page/page_size, nếu không có thì dùng limit/offset
  let pageNumber = Number(page) || 0;
  let pageSize = Number(page_size) || Number(limit) || DEFAULT_LIMIT;
  let offsetNumber = Number(offset) || 0;

  // Chuẩn hoá
  if (pageNumber < 0) pageNumber = 0;

  if (pageSize <= 0 || Number.isNaN(pageSize)) {
    pageSize = DEFAULT_LIMIT;
  }
  if (pageSize > MAX_LIMIT) {
    pageSize = MAX_LIMIT;
  }

  // Nếu client dùng page/page_size thì tính offset từ đó
  if (page !== undefined || page_size !== undefined) {
    offsetNumber = pageNumber * pageSize;
  } else {
    if (offsetNumber < 0 || Number.isNaN(offsetNumber)) {
      offsetNumber = 0;
    }
    // tính lại pageNumber cho meta
    pageNumber = Math.floor(offsetNumber / pageSize);
  }

  return {
    limit: pageSize,
    offset: offsetNumber,
    page: pageNumber,
  };
};

/**
 * Tạo meta trả về cho client
 */
export const buildPaginationMeta = ({ total, limit, offset, page }) => {
  const currentPage = page ?? Math.floor(offset / limit);
  const totalPages = limit > 0 ? Math.ceil(total / limit) : 0;

  return {
    total,
    limit,
    offset,
    page: currentPage,
    total_pages: totalPages,
  };
};
