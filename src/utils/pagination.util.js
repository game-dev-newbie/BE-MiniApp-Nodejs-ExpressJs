// src/utils/pagination.util.js (IMPROVED VERSION)

const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 50;
const DEEP_PAGINATION_THRESHOLD = 1000;

/**
 * Parse pagination params with enhanced validation
 */
export const parsePagination = (query = {}) => {
  const { page, page_size, limit, offset } = query;

  let pageNumber = Number(page) || 1;
  let pageSize = Number(page_size) || Number(limit) || DEFAULT_LIMIT;
  let offsetNumber = Number(offset) || 0;

  // Normalize
  if (pageNumber < 1) pageNumber = 1;
  if (pageSize <= 0 || Number.isNaN(pageSize)) pageSize = DEFAULT_LIMIT;
  if (pageSize > MAX_LIMIT) pageSize = MAX_LIMIT;

  // Calculate offset from page
  if (page !== undefined || page_size !== undefined) {
    offsetNumber = (pageNumber - 1) * pageSize;
  } else {
    if (offsetNumber < 0 || Number.isNaN(offsetNumber)) offsetNumber = 0;
    pageNumber = Math.floor(offsetNumber / pageSize) + 1;
  }

  // ✨ Warn about deep pagination
  if (offsetNumber > DEEP_PAGINATION_THRESHOLD) {
    console.warn(
      `[Pagination Warning] Deep offset:  ${offsetNumber}. Consider cursor-based pagination for better performance. `
    );
  }

  return {
    limit: pageSize,
    offset: offsetNumber,
    page: pageNumber,
  };
};

/**
 * Build enhanced pagination metadata
 */
export const buildPaginationMeta = ({ total, limit, offset, page }) => {
  // ✅ Protect against division by zero
  const safeLimit = limit > 0 ? limit : 1;
  const currentPage = page ?? Math.floor(offset / safeLimit) + 1;
  const totalPages = Math.ceil(total / safeLimit);

  return {
    total,
    limit,
    offset,
    page: currentPage,
    total_pages: totalPages,
    // ✨ Navigation helpers
    has_next: currentPage < totalPages,
    has_prev: currentPage > 1,
    next_page: currentPage < totalPages ? currentPage + 1 : null,
    prev_page: currentPage > 1 ? currentPage - 1 : null,
  };
};

/**
 * ✨ New:  Cursor-based pagination parser
 */
export const parseCursorPagination = (query = {}) => {
  const { cursor, limit = DEFAULT_LIMIT } = query;

  const safeLimit = Math.min(
    Math.max(1, Number(limit) || DEFAULT_LIMIT),
    MAX_LIMIT
  );

  return {
    cursor: cursor || null,
    limit: safeLimit,
  };
};

/**
 * ✨ New: Build cursor pagination metadata
 */
export const buildCursorPaginationMeta = ({ items, limit, hasMore }) => {
  const nextCursor =
    hasMore && items.length > 0 ? items[items.length - 1].id : null;

  return {
    has_more: hasMore,
    next_cursor: nextCursor,
    count: items.length,
  };
};
