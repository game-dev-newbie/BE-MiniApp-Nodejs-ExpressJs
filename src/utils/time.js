// src/utils/time.js
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc.js";
import timezone from "dayjs/plugin/timezone.js";

dayjs.extend(utc);
dayjs.extend(timezone);

// Toàn project default là giờ Việt Nam
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");

/**
 * Nhận vào Date / string / null
 * Trả về 'YYYY-MM-DD HH:mm:ss' theo giờ VN
 */
const toVNDateTime = (value) => {
  if (!value) return null;
  return dayjs(value).tz().format("YYYY-MM-DD HH:mm:ss");
};

/**
 * Ghép booking_date + booking_time thành JS Date (giờ VN)
 * - booking_date: "YYYY-MM-DD"
 * - booking_time: "HH:mm"
 * Trả về:
 *  - Date nếu hợp lệ
 *  - null nếu sai định dạng / không parse được
 */
const buildDateTimeFromDateAndTime = (dateStr, timeStr) => {
  if (!dateStr || !timeStr) return null;

  const dt = dayjs.tz(`${dateStr} ${timeStr}`, "YYYY-MM-DD HH:mm");

  if (!dt.isValid()) return null;

  return dt.toDate(); // JS Date, nhưng đã dựa trên Asia/Ho_Chi_Minh
};

/**
 * Xây khoảng thời gian 1 ngày (hoặc nhiều ngày) cho filter
 * - fromDate, toDate: "YYYY-MM-DD"
 * Trả về object { start: Date|null, end: Date|null }
 */
const buildDayRange = (fromDate, toDate) => {
  let start = null;
  let end = null;

  if (fromDate) {
    start = dayjs.tz(`${fromDate} 00:00:00`, "YYYY-MM-DD HH:mm:ss").toDate();
  }

  if (toDate) {
    end = dayjs.tz(`${toDate} 23:59:59`, "YYYY-MM-DD HH:mm:ss").toDate();
  }

  return { start, end };
};

export default {
  toVNDateTime,
  buildDateTimeFromDateAndTime,
  buildDayRange,
};
