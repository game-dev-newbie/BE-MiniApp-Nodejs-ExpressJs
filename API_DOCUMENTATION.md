# 📚 RESTAURANT BOOKING SYSTEM - API DOCUMENTATION

**Base URL:** `http://localhost:8027`  
**(tùy, nếu sử dụng chung máy local, khác thì dùng static domain)**
**Version:** v1  
**Last Updated:** 2025-12-20  
**Author:** Backend Team

---

## 📋 TABLE OF CONTENTS

### PART 1: AUTHENTICATION & AUTHORIZATION

- [1.1. Authentication Overview](#11-authentication-overview)
- [1.2. Token System](#12-token-system)
- [1.3. Authorization Header](#13-authorization-header)
- [2. Dashboard Authentication](#2-dashboard-authentication)
  - [2.1. Register Owner](#21-register-owner)
  - [2.2. Register Staff](#22-register-staff)
  - [2.3. Login Dashboard](#23-login-dashboard)
  - [2.4. Forget Password](#24-forget-password)
  - [2.5. Reset Password](#25-reset-password)
- [3. MiniApp Authentication](#3-miniapp-authentication)
  - [3.1. Login with Zalo](#31-login-with-zalo)
  - [3.2. Register Local](#32-register-local)
  - [3.3. Login Local](#33-login-local)
- [4. Refresh Token](#4-refresh-token)
- [5. Logout](#5-logout)

### PART 2: DASHBOARD APIs

- [6. Restaurant Management](#4-restaurant-management)
- [7. Table Management](#5-table-management)
- [8. Booking Management](#6-booking-management)
- [9. Review Management](#7-review-management)
- [10. Staff Management](#8-staff-management)
- [11. Upload Management](#9-upload-management)
- [12. Restaurant Images](#10-restaurant-images)
- [13. Notifications (Dashboard)](#11-notifications-dashboard)
- [14. Account Management (Dashboard)](#12-account-management-dashboard)

### PART 3: MINIAPP APIs

- [15. Restaurant Discovery](#13-restaurant-discovery)
- [16. Booking Flow](#14-booking-flow)
- [17. Payment](#15-payment)
- [18. Reviews](#16-reviews)
- [19. Favorites](#17-favorites)
- [20. User Profile](#18-user-profile)
- [21. Notifications (MiniApp)](#19-notifications-miniapp)

### APPENDIX

- [Common Error Codes](#common-error-codes)
- [Status & State Definitions](#status--state-definitions)
- [Common Use Cases](#common-use-cases)

---

## PART 1: AUTHENTICATION & AUTHORIZATION

### 1.1. Authentication Overview

Hệ thống có 2 loại user:

**1. DASHBOARD (Restaurant Account)**

- **OWNER:** Chủ nhà hàng
- **STAFF:** Nhân viên
- **Table:** `restaurant_accounts`

**2. MINIAPP (Customer)**

- **CUSTOMER:** Khách hàng đặt bàn
- **Table:** `users`

### 1.2. Token System

**Access Token (Short-lived: 30 minutes)**

```json
{
  "sub": 123,
  "subType": "CUSTOMER",
  "role": "CUSTOMER",
  "provider": "ZALO",
  "type": "ACCESS",
  "iat": 1703000000,
  "exp": 1703604800
}
```

**Refresh Token (Long-lived: 30 days)**

```json
{
  "sub": 123,
  "subType": "CUSTOMER",
  "role": "CUSTOMER",
  "provider": "ZALO",
  "type": "REFRESH",
  "iat": 1703000000,
  "exp": 1705592800
}
```

** Lưu ý**

- Dashboard: Lưu 2 tokens vào localStorage, mỗi request thì gửi accessToken kèm vào header với cú pháp Authorization: Beare <accessToken>. Khi req nào hết hạn accessToken thì gửi ngay refreshToken vào header với cú pháp refreshToken để có thể nhận lại tokens mới và sau đó gửi accessToken đính kèm lại cho req cũ

- Miniapp: Lưu 2 tokens vào nativeStorage của zalo hỗ trợ (nếu môi trường test web thì lưu localStorage). Flow giống với dashboard nêu trên.

### 1.3. Authorization Header

```http
Authorization: Bearer <access_token>
```

## ** Lưu ý gắn vào mỗi request cần có quyền để sử dụng**

## 2. DASHBOARD AUTHENTICATION

### 2.1. Register Owner

**Endpoint:** `POST /api/v1/dashboard/auth/register/owner`

**Description:** Đăng ký tài khoản OWNER + tạo nhà hàng mới

**Request Body:**

```json
{
  "full_name": "Nguyễn Văn A",
  "email": "owner@restaurant.com",
  "password": "Password123!",
  "restaurant_name": "Nhà Hàng ABC",
  "restaurant_address": "123 Đường XYZ, Quận 1, TP.HCM",
  "restaurant_phone": "0901234567",
  "restaurant_description" : "..." (có thể không nhập)
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Đăng ký owner thành công",
  "data": {
    "account": {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "owner@restaurant.com",
      "role": "OWNER",
      "status": "ACTIVE",
      "is_locked": false,
      "avatar_url": null,
      "created_at": "2025-12-20 10:00:00",
      "updated_at": "2025-12-20 10:00:00"
    },
    "restaurant": {
      "id": 1,
      "name": "Nhà Hàng ABC",
      "address": "123 Đường XYZ, Quận 1, TP.HCM",
      "phone": "0901234567",
      "is_active": true,
      "invite_code": "ABC123XYZ",
      "created_at": "2025-12-20 10:00:00"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

---

### 2.2. Register Staff

**Endpoint:** `POST /api/v1/dashboard/auth/register/staff`

**Description:** Nhân viên đăng ký bằng invite_code từ OWNER

**Request Body:**

```json
{
  "full_name": "Trần Thị B",
  "email": "staff@restaurant.com",
  "password": "Password123!",
  "invite_code": "ABC123XYZ"
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Đăng ký staff thành công.  Vui lòng đợi owner phê duyệt.",
  "data": {
    "account": {
      "id": 2,
      "full_name": "Trần Thị B",
      "email": "staff@restaurant.com",
      "role": "STAFF",
      "status": "INVITED",
      "is_locked": false,
      "restaurant_id": 1
    }
  }
}
```

> **Note:** Staff cần được OWNER approve trước khi login được! Phải được duyệt và đăng nhập mới có tokens

---

### 2.3. Login Dashboard

**Endpoint:** `POST /api/v1/dashboard/auth/login`

**Description:** Đăng nhập dashboard (Owner/Staff)

**Request Body:**

```json
{
  "email": "owner@restaurant.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đăng nhập dashboard thành công",
  "data": {
    "account": {
      "id": 1,
      "full_name": "Nguyễn Văn A",
      "email": "owner@restaurant.com",
      "role": "OWNER",
      "status": "ACTIVE",
      "is_locked": false,
      "restaurant_id": 1,
      "avatar_url": null
    },
    "restaurant": {
      "id": 1,
      "name": "Nhà Hàng ABC",
      "address": "123 Đường XYZ, Quận 1, TP.HCM",
      "phone": "0901234567",
      "is_active": true,
      "invite_code": "ABC123XYZ"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.. .",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

**Error Responses:**

```json
// 401 - Email/Password sai
{
  "success":  false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Email hoặc mật khẩu không đúng"
  }
}

// 403 - Staff chưa được approve
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Tài khoản staff chưa được owner phê duyệt"
  }
}

// 403 - Account bị lock
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Tài khoản đã bị khoá"
  }
}
```

---

## 3. MINIAPP AUTHENTICATION

### 3.1. Login with Zalo

**Endpoint:** `POST /api/v1/miniapp/auth/zalo/login`

**Description:** Đăng nhập MiniApp bằng tài khoản Zalo

**Frontend Flow:**

```javascript
// 1. Get access token from Zalo
import { getAccessToken, getUserInfo } from "zmp-sdk";

const { accessToken } = await getAccessToken();
const { userInfo } = await getUserInfo();

// Miniapp tự gọi api của zalo hỗ trợ và lấy thông tin, sau đó truyền vào req.body gửi lên cho server. Đây là giả lập code
// 2. Call API
const response = await fetch("${base_URL}/api/v1/miniapp/auth/zalo/login", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    accessToken,
    userInfo,
    phone: "0901234567", // Optional
  }),
});
```

**Request Body:**

```json
{
  "accessToken": "zalo_access_token_here",
  "userInfo": {
    "id": "zalo_user_id_123",
    "name": "Nguyễn Văn C",
    "avatar": "https://avatar.zaloapp.com/..."
  },
  "phone": "0901234567"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đăng nhập bằng Zalo thành công",
  "data": {
    "user": {
      "id": 10,
      "display_name": "Nguyễn Văn C",
      "email": null,
      "phone": "0901234567",
      "avatar_url": "https://avatar.zaloapp.com/...",
      "created_at": "2025-12-20 10:30:00",
      "updated_at": "2025-12-20 10:30:00"
    },
    "tokens": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    }
  }
}
```

> **Note:** Nếu user lần đầu login → Tự động tạo account mới

---

### 3.2. Register Local

**Endpoint:** `POST /api/v1/miniapp/auth/register`

**Description:** Đăng ký tài khoản local (email/password) cho MiniApp

**Request Body:**

```json
{
  "display_name": "Lê Thị D",
  "email": "customer@example.com",
  "password": "Password123!",
  "phone": "0901234567" (optional, không cần nhập)
}
```

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Đăng ký tài khoản miniapp thành công",
  "data": {
    "user": {
      "id": 11,
      "display_name": "Lê Thị D",
      "email": "customer@example.com",
      "phone": "0901234567",
      "avatar_url": null,
      "created_at": "2025-12-20 11:00:00"
    },
    "tokens": {
      "accessToken": ".. .",
      "refreshToken": "..."
    }
  }
}
```

---

### 3.3. Login Local

**Endpoint:** `POST /api/v1/miniapp/auth/login`

**Description:** Đăng nhập MiniApp bằng email/password

**Request Body:**

```json
{
  "email": "customer@example.com",
  "password": "Password123!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đăng nhập miniapp thành công",
  "data": {
    "user": {
      "id": 11,
      "display_name": "Lê Thị D",
      "email": "customer@example.com",
      "phone": "0901234567",
      "avatar_url": null
    },
    "tokens": {
      "accessToken": "...",
      "refreshToken": "..."
    }
  }
}
```

---

## 4. Refresh Token

**Endpoint:** `POST /api/v1/common/auth/refresh`

**Description:** Làm mới access token (dùng chung cho cả Dashboard & MiniApp)

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Làm mới token thành công",
  "data": {
    "accessToken": "new_access_token_here",
    "refreshToken": "new_refresh_token_here"
  }
}
```

## 5. Logout

**Endpoint:** `POST /api/v1/common/auth/logout`

**Description:** Đăng xuất thu hồi token (dùng chung cho cả Dashboard & MiniApp)

**Request Body:**

```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đăng xuất phiên hiện tại thành công"
}
```

---

## PART 2: DASHBOARD APIs

## 6. RESTAURANT MANAGEMENT

### 6.1. Get My Restaurant (xem thông tin nhà hàng)

**Endpoint:** `GET /api/v1/dashboard/restaurants/me`

**Auth Required:** ✅ Owner/Staff (cả staff và owner đều xem được thông tin)

**Request body**

```http
`GET /api/v1/dashboard/restaurants/me`
`Authorization: Bearer <access_token>`
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy thông tin nhà hàng thành công",
  "data": {
    "id": 1,
    "name": "Nhà Hàng ABC",
    "address": "123 Đường XYZ, Quận 1, TP.HCM",
    "phone": "0901234567",
    "description": "Nhà hàng chuyên về món Việt",
    "tags": "morning,lunch,dinner,vietnamese",
    "require_deposit": true,
    "default_deposit_amount": 50000,
    "is_active": true,
    "average_rating": 4.5,
    "review_count": 120,
    "favorite_count": 45,
    "invite_code": "ABC123XYZ",
    "main_image_url": "/uploads/restaurants/1/cover/image.jpg",
    "open_time": "08:00:00",
    "close_time": "22:00:00",
    "created_at": "2025-12-20 10:00:00",
    "updated_at": "2025-12-20 10:00:00"
  }
}
```

---

### 6.2. Update My Restaurant

**Endpoint:** `PATCH /api/v1/dashboard/restaurants/me`

**Auth Required:** ✅ Owner only (chỉ owner được phép dùng chức năng)

**Request Body:**

```json
{
  "name": "Nhà Hàng ABC - Chi Nhánh 1",
  "address": "456 Đường Mới, Quận 2, TP.HCM",
  "phone": "0907654321",
  "description": "Nhà hàng chuyên món Việt Nam đặc sắc",
  "tags": "morning,lunch,dinner,vietnamese,seafood",
  "open_time": "07:00",
  "close_time": "23:00",
  "require_deposit": true,
  "default_deposit_amount": 100000
}
```

> **Note:** Tất cả fields đều optional, chỉ gửi fields muốn update

**Response**

```json
{
  "success": true,
  "message": "Cập nhật thông tin nhà hàng thành công",
  "data": {
    "id": 1,
    "name": "Nhà Hàng ABC - Chi Nhánh 1",
    "address": "456 Đường Mới, Quận 2, TP.HCM"
    // ... updated fields
  }
}
```

---

## 7. TABLE MANAGEMENT

### 7.1. List Tables

**Endpoint:** `GET /api/v1/dashboard/tables`

**Auth Required:** ✅ Owner/Staff (cả staff và owner đều dùng được)

**Query Parameters:**

- `limit` - Số lượng records (default: 20, max: 100)
- `offset` - Offset for pagination (default: 0)

**Request**

```http
`GET /api/v1/dashboard/tables?limit=10&offset=0` (ví dụ limit thôi)
`Authorization: Bearer <access_token>`
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách bàn thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "restaurant_id": 1,
        "name": "Bàn 1",
        "capacity": 4,
        "location": "Tầng 1 - Gần cửa sổ",
        "status": "ACTIVE",
        "view_image_url": "/uploads/restaurants/1/tables/1/view/image.jpg",
        "view_note": "View đẹp nhìn ra vườn",
        "created_at": "2025-12-20 10:00:00"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 10,
      "offset": 0,
      "page": 1,
      "totalPages": 2
    }
  }
}
```

### 7.2. Get detail table

**Endpoint:** `GET /api/v1/dashboard/tables/:id`

**Auth Required:** ✅ Owner/Staff (cả staff và owner đều dùng được)

**Request**

```http
`GET /api/v1/dashboard/tables/1` (ví dụ muốn xem chi tiết tables_id = 1)
`Authorization: Bearer <access_token>`
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy thông tin bàn thành công",
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "name": "Bàn 1",
    "capacity": 4,
    "location": "Tầng 1 - Gần cửa sổ",
    "status": "ACTIVE",
    "view_image_url": "/uploads/restaurants/1/tables/1/view/image.jpg",
    "view_note": "View đẹp nhìn ra vườn",
    "created_at": "2025-12-20 10:00:00",
    "updated_at": "2025-12-20 10:00:00"
  }
}
```

---

### 7.3. Create Table

**Endpoint:** `POST /api/v1/dashboard/tables`

**Auth Required:** ✅ Owner only (chỉ owner được phép tạo bàn mới)

**Request Body:**

```json
{
  "name": "Bàn VIP 1",
  "capacity": 8,
  "location": "Tầng 2 - Phòng riêng",
  "status": "ACTIVE",
  "view_image_url": "/uploads/restaurants/1/tables/3/view/image.jpg",
  "view_note": "Phòng VIP có máy lạnh"
}
```

**Lưu ý: đường path của view_image_url là path sau khi đi qua API upload của server, sau đó sẽ sử dụng làm data để truyền lên lưu vào Database qua API tạo bàn**

**Response: `201 Created`**

```json
{
  "success": true,
  "message": "Tạo bàn thành công",
  "data": {
    "id": 3,
    "restaurant_id": 1,
    "name": "Bàn VIP 1",
    "capacity": 8,
    "location": "Tầng 2 - Phòng riêng",
    "status": "ACTIVE",
    "view_image_url": "/uploads/restaurants/1/tables/3/view/image.jpg",
    "view_note": "Phòng VIP có máy lạnh",
    "created_at": "2025-12-20 11:00:00"
  }
}
```

---

### 7.4. Update Table

**Endpoint:** `PATCH /api/v1/dashboard/tables/:id`

**Auth Required:** ✅ Owner only
**Request body**

```json
{
  "name": "Bàn VIP 1 (Updated)",
  "capacity": 10,
  "location": "Tầng 2 - Phòng riêng VIP",
  "view_note": "Phòng VIP có máy lạnh + karaoke"
}
```

**Response: `200 OK`**

```json
{
  "success": true,
  "message": "Cập nhật bàn thành công",
  "data": {
    "id": 3,
    "name": "Bàn VIP 1 (Updated)",
    "capacity": 10
    // ... updated fields
  }
}
```

---

### 7.5. Delete Table

**Endpoint:** `DELETE /api/v1/dashboard/tables/:id`

**Auth Required:** ✅ Owner only
**Request**

```http
`DELETE /api/v1/dashboard/tables/3`
`Authorization: Bearer <access_token>`
```

**Response : `200 OK`**

```json
{
  "success": true,
  "message": "Đặt trạng thái INACTIVE cho bàn thành công",
  "data": `model Table`
}
```

> **Note:** Soft delete - bàn vẫn còn trong DB nhưng status = INACTIVE

---

## 8. BOOKING MANAGEMENT

### 8.1. List Bookings

**Endpoint:** `GET /api/v1/dashboard/bookings`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `status` - PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
- `from_date` - YYYY-MM-DD
- `to_date` - YYYY-MM-DD
- `limit` - Default: 20
- `offset` - Default: 0

**Request**

```http
`GET /api/v1/dashboard/bookings?status=PENDING&from_date=2025-12-20&to_date=2025-12-31&limit=10`
`Authorization: Bearer <access_token>`
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách booking của nhà hàng thành công",
  "data": {
    "items": [
      {
        "id": 101,
        "restaurant_id": 1,
        "table_id": 1,
        "user_id": 10,
        "phone": "0901234567",
        "customer_name": "Nguyễn Văn C",
        "people_count": 4,
        "booking_time": "2025-12-21 19:00:00",
        "status": "PENDING",
        "deposit_amount": 50000,
        "payment_status": "PAID",
        "payment_provider": "ZALOPAY",
        "payment_reference": "PAY-101-1703123456789",
        "paid_at": "2025-12-20 15:30:00",
        "note": "Muốn ngồi gần cửa sổ",
        "created_at": "2025-12-20 15:00:00"
      }
    ],
    "pagination": {
      "total": 45,
      "limit": 10,
      "offset": 0,
      "page": 1,
      "has_next": true/false,
      "has_prev": true/false
      "next_page",
      "prev_page"
    }
  }
}
```

---

### 8.2. Search Bookings by Customer Name

**Endpoint:** `GET /api/v1/dashboard/bookings/search`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `q` - Tên khách hàng (fuzzy search)
- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /api/v1/dashboard/bookings/search?q=Nguyễn&limit=10&offset=
Authorization: Bearer <access_token>
```

**\*Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tìm kiếm booking theo tên khách hàng thành công",
  "data": {
    "items": [
      {
        "id": 101,
        "customer_name": "Nguyễn Văn C",
        "phone": "0901234567",
        "booking_time": "2025-12-21 19:00:00",
        "status": "PENDING"
        // ... other fields
      }
    ],
    "pagination": {
      "total": 3,
      "limit": 10,
      "offset": 0
      tương tự thông số của các pagination khác
    }
  }
}
```

---

### 8.3. Get Booking Detail

**Endpoint:** `GET /api/v1/dashboard/bookings/:id`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
GET /api/v1/dashboard/bookings/101
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy chi tiết booking thành công",
  "data": {
    "id": 101,
    "restaurant_id": 1,
    "table_id": 1,
    "user_id": 10,
    "phone": "0901234567",
    "customer_name": "Nguyễn Văn C",
    "people_count": 4,
    "booking_time": "2025-12-21 19:00:00",
    "status": "PENDING",
    "deposit_amount": 50000,
    "payment_status": "PAID",
    "payment_provider": "ZALOPAY",
    "payment_reference": "PAY-101-1703123456789",
    "paid_at": "2025-12-20 15:30:00",
    "note": "Muốn ngồi gần cửa sổ",
    "created_at": "2025-12-20 15:00:00",
    "updated_at": "2025-12-20 15:30:00"
  }
}
```

---

### 8.4. Confirm Booking

**Endpoint:** `PATCH /api/v1/dashboard/bookings/:id/confirm`

**Auth Required:** ✅ Owner/Staff

**Description:** Xác nhận booking (PENDING → CONFIRMED)

**Request**

```http
PATCH /api/v1/dashboard/bookings/101/confirm
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Xác nhận booking thành công",
  "data": {
    "id": 101,
    "status": "CONFIRMED",
    "updated_at": "2025-12-20 16:00:00",
    "restaurant",
    "tables",
    "user"
    ... các thông tin khác của model booking
  }
}
```

**Side Effects:**

- ✅ Gửi notification cho customer
- ✅ Update booking status

---

### 8.5. Cancel Booking

**Endpoint:** `PATCH /api/v1/dashboard/bookings/:id/cancel`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
PATCH /api/v1/dashboard/bookings/101/cancel
Authorization:  Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Huỷ booking thành công",
  "data": {
    "id": 101,
    "status": "CANCELLED",
    "payment_status": "REFUNDED",
    "refunded_at": "2025-12-20 16:30:00"
    ` giống confirmed bên trên`
  }
}
```

**Side Effects:**

- ✅ Hoàn tiền nếu đã thanh toán
- ✅ Gửi notification + email cho customer
- ✅ Updated booking status

---

### 8.6. Complete Booking (check-in)

**Endpoint:** `PATCH /api/v1/dashboard/bookings/:id/complete`

**Auth Required:** ✅ Owner/Staff

**Description:** Đánh dấu khách đã đến và hoàn thành (check-in)

**Request**

```http
PATCH /api/v1/dashboard/bookings/101/complete
Authorization:  Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đánh dấu hoàn tất booking thành công",
  "data": {
    "id": 101,
    "status": "COMPLETED",
    "updated_at": "2025-12-21 19:30:00"
    ` giống confirmed bên trên`
  }
}
```

**Side Effects:**

- ✅ Customer có thể review sau khi COMPLETED

---

### 8.7. Mark No-Show

**Endpoint:** `PATCH /api/v1/dashboard/bookings/:id/no-show`

**Auth Required:** ✅ Owner/Staff

**Discription**: Đánh dấu khách không đến

**Request**

```http
PATCH /api/v1/dashboard/bookings/102/no-show
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đánh dấu khách không đến (NO_SHOW) thành công",
  "data": {
    "id": 102,
    "status": "NO_SHOW",
    "payment_status": "PAID",
    "updated_at": "2025-12-21 20:00:00"
    ` giống confirmed trên`
  }
}
```

> **Note:** Nếu NO_SHOW → KHÔNG hoàn tiền đặt cọc

---

## 9. REVIEW MANAGEMENT

### 9.1. List Restaurant Reviews

**Endpoint:** `GET /api/v1/dashboard/reviews`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `rating` - Filter theo rating (1-5)
- `status` - VISIBLE, HIDDEN
- `from_time` - YYYY-MM-DD
- `to_time` - YYYY-MM-DD
- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /api/v1/dashboard/reviews?rating=5&limit=10
Authorization: Bearer <access_token>
```

**Response:** `200 Ok`

```json
{
  "success": true,
  "message": "Lấy danh sách review của nhà hàng (dashboard) thành công",
  "data": {
    "items": [
      {
        "id": 50,
        "booking_id": 101,
        "restaurant_id": 1,
        "user_id": 10,
        "rating": 5,
        "comment": "Món ăn ngon, phục vụ tốt! ",
        "status": "VISIBLE",
        "reply_comment": "Cảm ơn quý khách! ",
        "reply_account_id": 1,
        "reply_created_at": "2025-12-22 10:00:00",
        "created_at": "2025-12-22 08:00:00",
        "updated_at": "2025-12-22 10:00:00"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 9.2. Reply to Review

**Endpoint:** `PATCH /api/v1/dashboard/reviews/:id/reply`

**Auth Required:** ✅ Owner/Staff

**Request Body:**

```json
{
  "comment": "Cảm ơn quý khách đã tin tưởng!  Hẹn gặp lại!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Trả lời review thành công",
  "data": {
    "id": 50,
    "reply_comment": "Cảm ơn quý khách đã tin tưởng!  Hẹn gặp lại!",
    "reply_account_id": 1,
    "reply_created_at": "2025-12-22 10:30:00",
    "reply_updated_at": "2025-12-22 10:30:00",
    ... còn các trường thông tin khác của reviews
  }
}
```

**Side Effects:**

- ✅ Gửi notification cho customer

---

## 10. STAFF MANAGEMENT

### 10.1. List Staff

**Endpoint:** `GET /api/v1/dashboard/staff`

**Auth Required:** ✅ Owner only

**Query parameters:**

- `limit` -Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /api/v1/dashboard/staff?limit=10
Authorization: Bearer <owner_access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách staff thành công",
  "data": {
    "items": [
      {
        "id": 2,
        "restaurant_id": 1,
        "full_name": "Trần Thị B",
        "email": "staff@restaurant.com",
        "role": "STAFF",
        "status": "INVITED",
        "is_locked": false,
        "avatar_url": null,
        "created_at": "2025-12-20 11:00:00"
      },
      {
        "id": 3,
        "restaurant_id": 1,
        "full_name": "Lê Văn E",
        "email": "staff2@restaurant.com",
        "role": "STAFF",
        "status": "ACTIVE",
        "is_locked": false,
        "avatar_url": "/uploads/restaurant-accounts/3/avatar/image.jpg",
        "created_at": "2025-12-19 10:00:00"
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 10.2. Approve Staff

**Endpoint:** `PATCH /api/v1/dashboard/staff/:id/approve`

**Auth Required:** ✅ Owner only

**Description:** Duyệt staff (INVITED → ACTIVE)

**Request**

```http
PATCH /api/v1/dashboard/staff/2/approve
Authorization: Bearer <owner_access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Duyệt staff thành công",
  "data": {
    "id": 2,
    "status": "ACTIVE",
    "updated_at": "2025-12-20 12:00:00"
  }
}
```

---

### 10.3. Reject Staff

**Endpoint:** `PATCH /api/v1/dashboard/staff/:id/reject`

**Auth Required:** ✅ Owner only

**Description**: từ chối staff (INVITED -> REJECTED)

**Request**

```http
PATCH /api/v1/dashboard/staff/2/reject
Authorization: Bearer <owner_access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Từ chối staff thành công",
  "data": {
    "id": 2,
    "status": "REJECTED"
  }
}
```

---

### 10.4. Lock Staff

**Endpoint:** `PATCH /api/v1/dashboard/staff/:id/lock`

**Auth Required:** ✅ Owner only

**Request**

```http
PATCH /api/v1/dashboard/staff/3/lock
Authorization: Bearer <owner_access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Khoá staff thành công",
  "data": {
    "id": 3,
    "is_locked": true
  }
}
```

---

### 10.5. Unlock Staff

**Endpoint:** `PATCH /api/v1/dashboard/staff/:id/unlock`

**Auth Required:** ✅ Owner only

**Request**

```http
PATCH /api/v1/dashboard/staff/3/unlock
Authorization: Bearer <owner_access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Mở khoá staff thành công",
  "data": {
    "id": 3,
    "is_locked": false
  }
}
```

---

## 11. UPLOAD MANAGEMENT

### 11.1. Upload Restaurant Cover

**Endpoint:** `POST /api/v1/dashboard/uploads/images/restaurants/cover`

**Auth Required:** ✅ Owner/Staff

**Content-Type:** `multipart/form-data`

**Request:**

```http
POST /api/v1/dashboard/uploads/images/restaurants/cover
Authorization: Bearer <access_token>
Content-Type:  multipart/form-data

file: [binary image data]
```

- Field name: `file`
- Max size: 5MB
- Allowed: JPG, PNG

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "filename": "1703123456789-123456789. jpg",
    "originalName": "restaurant-cover.jpg",
    "mimeType": "image/jpeg",
    "size": 245678,
    "path": "/uploads/restaurants/1/cover/1703123456789-123456789.jpg",
    "url": "http://localhost:8027/uploads/restaurants/1/cover/1703123456789-123456789.jpg"
  }
}
```

**Lưu ý: dùng path để hiển thị hình, sau đó dùng path để truyền vào req.body để gọi api tạo cập nhật hình**

**Rate Limits:**

- ✅ General uploads: 20 uploads/15 phút
- ✅ Avatar uploads: 5 uploads/10 phút
- ✅ Multiple uploads: 5 requests/15 phút

---

### 11.2. Upload Restaurant Gallery

**Endpoint:** `POST /api/v1/dashboard/uploads/images/restaurants/gallery`

**Auth Required:** ✅ Owner/Staff

**Request:** Same as cover upload

**Response:** 201 Created (same format)

---

### 11.3. Upload Restaurant Galleries (Multiple)

**Endpoint:** `POST /api/v1/dashboard/uploads/images/restaurants/galleries`

**Auth Required:** ✅ Owner/Staff

**Request:**

```http
POST /api/v1/dashboard/uploads/images/restaurants/galleries
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

files: [image1. jpg]
files: [image2.jpg]
files: [image3.jpg]
```

- Field name: `files`
- Max: 10 files per request

**Response:**

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": [
    {
      "filename": "1703123456789-111. jpg",
      "originalName": "gallery1.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "path": "/uploads/restaurants/1/gallery/1703123456789-111.jpg",
      "url": "http://localhost:8027/uploads/restaurants/1/gallery/1703123456789-111.jpg"
    },
    {
      "filename": "1703123456789-222.jpg",
      "originalName": "gallery2.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "path": "/uploads/restaurants/1/gallery/1703123456789-222.jpg",
      "url": "http://localhost:8027/uploads/restaurants/1/gallery/1703123456789-222.jpg"
    }
  ]
}
```

**Note**

- ✅ Max 10 files per request
- ✅ Rate limit: 5 uploads/15 phút

---

### 11.4. Upload Menu Images

**Endpoint:** `POST /api/v1/dashboard/uploads/images/restaurants/menu`

**Auth Required:** ✅ Owner/Staff

**Request:** Same as gallery upload

**Response:** 201 Created (same format)

---

### 11.5. Upload Restaurant Menus (Multiple)

**Endpoint:** `POST /api/v1/dashboard/uploads/images/restaurants/menus`

**Auth Required:** ✅ Owner/Staff

**Request:**

```http
POST /api/v1/dashboard/uploads/images/restaurants/menus
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

files: [image1. jpg]
files: [image2.jpg]
files: [image3.jpg]
```

- Field name: `files`
- Max: 10 files per request

**Response:**

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": [
    {
      "filename": "1703123456789-111. jpg",
      "originalName": "gallery1.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "path": "/uploads/restaurants/1/menu/1703123456789-111.jpg",
      "url": "http://localhost:8027/uploads/restaurants/1/menu/1703123456789-111.jpg"
    },
    {
      "filename": "1703123456789-222.jpg",
      "originalName": "gallery2.jpg",
      "mimeType": "image/jpeg",
      "size": 245678,
      "path": "/uploads/restaurants/1/menu/1703123456789-222.jpg",
      "url": "http://localhost:8027/uploads/restaurants/1/menu/1703123456789-222.jpg"
    }
  ]
}
```

**Note**

- ✅ Max 10 files per request
- ✅ Rate limit: 5 uploads/15 phút

### 11.6. Upload Table View Image

**Endpoint:** `POST /api/v1/dashboard/uploads/images/tables/view?table_id=1`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `table_id` - Required: ID bàn

**Request:**

```http
POST /api/v1/dashboard/uploads/images/tables/view?table_id=1
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: [binary image data]
```

**Response:**

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "filename": "1703123456789-987654321.jpg",
    "path": "/uploads/restaurants/1/tables/1/view/1703123456789-987654321.jpg",
    "url": "http://localhost:8027/uploads/restaurants/1/tables/1/view/1703123456789-987654321.jpg"
  }
}
```

---

### 11.7. Upload Account Avatar

**Endpoint:** `POST /api/v1/dashboard/uploads/images/restaurant-accounts/avatar`

**Auth Required:** ✅ Owner/Staff

**Request:**

```http
POST /api/v1/dashboard/uploads/images/restaurant-accounts/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file: [binary image data]
```

**Response:**

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "filename": "1703123456789-avatar.jpg",
    "path": "/uploads/restaurant-accounts/1/avatar/1703123456789-avatar.jpg",
    "url": "http://localhost:8027/uploads/restaurant-accounts/1/avatar/1703123456789-avatar.jpg"
  }
}
```

---

## 12. RESTAURANT IMAGES

### 12.1. Create Restaurant Image

**Endpoint:** `POST /api/v1/dashboard/restaurant-images`

**Auth Required:** ✅ Owner only

**Description:** tạo record image sau khi upload

**Request Body:**

```json
{
  "file_path": "/uploads/restaurants/1/cover/1703123456789-123456789.jpg",
  "type": "COVER",
  "caption": "Hình ảnh nhà hàng ban đêm",
  "is_primary": true
}
```

**Field Definitions:**

- `file_path` - Required: Path từ upload API
- `type` - Required: COVER | GALLERY | MENU
- `caption` - Optional
- `is_primary` - Optional (cho type COVER)

**Response:**

```json
{
  "success": true,
  "message": "Tạo ảnh nhà hàng thành công",
  "data": {
    "id": 10,
    "restaurant_id": 1,
    "file_path": "/uploads/restaurants/1/cover/1703123456789-123456789.jpg",
    "type": "COVER",
    "caption": "Hình ảnh nhà hàng ban đêm",
    "is_primary": true,
    "created_at": "2025-12-20 14:00:00"
  }
}
```

**Side Effects:**

- ✅ Nếu `type=COVER` và `is_primary=true` → Update `restaurants. main_image_url`
- ✅ Các ảnh COVER khác tự động set `is_primary=false`

---

### 12.2. List Restaurant Images

**Endpoint:** `GET /api/v1/dashboard/restaurant-images`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `type` - Filter theo type (COVER, GALLERY, MENU)
- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request:**

```http
GET /api/v1/dashboard/restaurant-images?type=GALLERY&limit=10
Authorization: Bearer <access_token>
```

**Response**

```json
{
  "success": true,
  "message": "Lấy danh sách ảnh nhà hàng thành công",
  "data": {
    "items": [
      {
        "id": 11,
        "restaurant_id": 1,
        "file_path": "/uploads/restaurants/1/gallery/image1.jpg",
        "type": "GALLERY",
        "caption": "Không gian nhà hàng",
        "is_primary": false,
        "created_at": "2025-12-20 14:30:00"
      },
      {
        "id": 12,
        "restaurant_id": 1,
        "file_path": "/uploads/restaurants/1/gallery/image2.jpg",
        "type": "GALLERY",
        "caption": null,
        "is_primary": false,
        "created_at": "2025-12-20 14:35:00"
      }
    ],
    "pagination": {
      "total": 8,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 12.3. Get Image Detail

**Endpoint:** `GET /api/v1/dashboard/restaurant-images/:id`

**Auth Required:** ✅ Owner only

**Request:**

```http
GET /api/v1/dashboard/restaurant-images/11
Authorization: Bearer <access_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Lấy chi tiết ảnh thành công",
  "data": {
    "id": 11,
    "restaurant_id": 1,
    "file_path": "/uploads/restaurants/1/gallery/image1.jpg",
    "type": "GALLERY",
    "caption": "Không gian nhà hàng",
    "is_primary": false,
    "created_at": "2025-12-20 14:30:00"
  }
}
```

---

### 12.4. Delete Restaurant Image

**Endpoint:** `DELETE /api/v1/dashboard/restaurant-images/:id`

**Auth Required:** ✅ Owner only

**Request**

```http
DELETE /api/v1/dashboard/restaurant-images/11
Authorization: Bearer <owner_access_token>
```

**Response:**

```json
{
  "success": true,
  "message": "Xoá ảnh thành công"
}
```

**Side Effects:**

- ✅ Xóa file trên disk
- ✅ Auto-select new primary nếu xóa ảnh COVER primary

---

## 13. NOTIFICATIONS (Dashboard)

### 13.1. List Notifications

**Endpoint:** `GET /api/v1/dashboard/notifications`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `read_status` - Filter theo trạng thái đọc (all/read/unread)
- `type` - Kiểu thông báo
- `from_time` - Khoảng thời gian đầu
- `to_time` - cuối thời gian
- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request:**

```http
GET /api/v1/dashboard/notifications?read_status=read&from_time=2025-12-10&to_time=2025-12-20&limit=20&type=BOOKING_CREATED
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách notification thành công",
  "data": {
    "items": [
      {
        "id": 500,
        "restaurant_id": 1,
        "user_id": null,
        "type": "BOOKING_CREATED",
        "title": "Có booking mới",
        "message": "Khách Nguyễn Văn C vừa đặt bàn vào lúc 2025-12-20 15:00:00",
        "target_type": "BOOKING",
        "target_id": 101,
        "is_read": false,
        "created_at": "2025-12-20 15:00:00"
      }
    ],
    "pagination": {
      "total": 15,
      "limit": 20,
      "offset": 0
    }
  }
}
```

---

### 13.2. Get Unread Count (đếm có bao nhiêu thông báo chưa đọc)

**Endpoint:** `GET /api/v1/dashboard/notifications/unread-count`

**Auth Required:** ✅ Owner/Staff

**Request:**

```http
GET /api/v1/dashboard/notifications/unread-count
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy số lượng notification chưa đọc thành công",
  "data": {
    "unreadCount": 5
  }
}
```

---

### 13.3. Mark as Read

**Endpoint:** `PATCH /api/v1/dashboard/notifications/:id/read`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
PATCH /api/v1/dashboard/notifications/500/read
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đánh dấu notification là đã đọc thành công",
  "data": {
    "id": 500,
    "is_read": true,
    "updated_at": "2025-12-20 16:00:00"
  }
}
```

---

### 13.4. Mark All as Read

**Endpoint:** `PATCH /api/v1/dashboard/notifications/read-all`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
PATCH /api/v1/dashboard/notifications/read-all
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message":  "Đánh dấu tất cả notification là đã đọc thành công",
  "data": {
    "affected_rows": [các thông báo có is_read=true]
  }
}
```

---

### 13.5. Delete Notification

**Endpoint:** `DELETE /api/v1/dashboard/notifications/:id`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
DELETE /api/v1/dashboard/notifications/500
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Xoá notification thành công"
}
```

---

### 13.6. Delete All Read

**Endpoint:** `DELETE /api/v1/dashboard/notifications/read-all`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
DELETE /api/v1/dashboard/notifications/read-all
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Xoá tất cả notification đã đọc thành công",
  "data": {
    "deletedRows": []
  }
}
```

---

## 14. ACCOUNT MANAGEMENT (Dashboard)

### 14.1. Get My Profile

**Endpoint:** `GET /api/v1/dashboard/accounts/me`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
GET /api/v1/dashboard/accounts/me
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "id": 1,
    "restaurant_id": 1,
    "full_name": "Nguyễn Văn A",
    "email": "owner@restaurant.com",
    "role": "OWNER",
    "status": "ACTIVE",
    "is_locked": false,
    "avatar_url": "/uploads/restaurant-accounts/1/avatar/image.jpg",
    "created_at": "2025-12-20 10:00:00",
    "updated_at": "2025-12-20 10:00:00"
  }
}
```

---

### 14.2. Update My Profile

**Endpoint:** `PATCH /api/v1/dashboard/accounts/me/profile`

**Auth Required:** ✅ Owner/Staff

**Request Body:**

```json
{
  "full_name": "Nguyễn Văn A (Updated)",
  "avatar_url": "/uploads/restaurant-accounts/1/avatar/new-avatar.jpg"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Cập nhật thông tin tài khoản thành công",
  "data": {
    "id": 1,
    "full_name": "Nguyễn Văn A (Updated)",
    "avatar_url": "/uploads/restaurant-accounts/1/avatar/new-avatar.jpg",
    "updated_at": "2025-12-20 17:00:00"
  }
}
```

**Side Effects:**

- ✅ Tự động xóa avatar cũ

---

### 14.3. Change Password

**Endpoint:** `POST /api/v1/dashboard/accounts/me/change-password`

**Auth Required:** ✅ Owner/Staff

**Request Body:**

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword456!",
  "confirm_password": "NewPassword456!"
}
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công.  Vui lòng đăng nhập lại.",
  "data": {
    "id": 1
  }
}
```

**Side Effects:**

- ✅ **TẤT CẢ refresh tokens bị thu hồi** → Phải login lại tất cả thiết bị

---

## PART 3: MINIAPP APIs

## 15. RESTAURANT DISCOVERY

### 15.1. Get Top Rated Restaurants

**Endpoint:** `GET /api/v1/miniapp/restaurants/home/top-rated`

**Auth Required:** ❌ No (Public)

**Description:** Lấy top 5 nhà hàng có rating cao nhất cho trang home

**Request**

```http
GET /api/v1/miniapp/restaurants/home/top-rated
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy top nhà hàng rating cao nhất thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Nhà Hàng ABC",
        "address": "123 Đường XYZ, Quận 1, TP.HCM",
        "phone": "0901234567",
        "description": "Nhà hàng chuyên về món Việt",
        "tags": "morning,lunch,dinner,vietnamese",
        "average_rating": 4.8,
        "review_count": 150,
        "favorite_count": 68,
        "main_image_url": "/uploads/restaurants/1/cover/image.jpg",
        "open_time": "08:00:00",
        "close_time": "22:00:00",
        "is_active": true
      },
      {
        "id": 2,
        "name": "Nhà Hàng XYZ",
        "address": "456 Đường ABC, Quận 3, TP.HCM",
        "average_rating": 4.7,
        "review_count": 120,
        "favorite_count": 55,
        "main_image_url": "/uploads/restaurants/2/cover/image.jpg"
      }
    ]
  }
}
```

---

### 15.2. Get Top Favorite Restaurants

**Endpoint:** `GET /api/v1/miniapp/restaurants/home/top-favorites`

**Auth Required:** ❌ No (public)

**Description:** Lấy top 5 nhà hàng được yêu thích nhiều nhất

**Request**

```http
GET /api/v1/miniapp/restaurants/home/top-favorites
```

**Response:** `200 OK` (format tương tự top-rated)

---

### 15.3. Get Top by Tag

**Endpoint:** `GET /api/v1/miniapp/restaurants/home/top-by-tag`

**Auth Required:** ❌ No (public)

**Query parameters**

- `tag` - Optional: morning, lunch, dinner, vietnamese, seafood, etc.

**Request**

```http
GET /api/v1/miniapp/restaurants/home/top-by-tag?tag=lunch
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy top nhà hàng theo tag thành công",
  "data": {
    "items": [
      {
        "id": 3,
        "name": "Nhà Hàng Trưa Ngon",
        "tags": "lunch,vietnamese,business",
        "average_rating": 4.6,
        "review_count": 80,
        "main_image_url": "/uploads/restaurants/3/cover/image. jpg"
      }
    ]
  }
}
```

---

### 15.4. Search Restaurants

**Endpoint:** `GET /api/v1/miniapp/restaurants/search`

**Auth Required:** ❌ No (public)

**Query Parameters:**

- `q` - Từ khóa tìm kiếm
- `limit` - Default: 20
- `offset` - Default: 0

**Request**

```http
GET /api/v1/miniapp/restaurants/search?q=hải&limit=10&offser
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Tìm kiếm nhà hàng thành công",
  "data": {
    "items": [
      {
        "id": 5,
        "name": "Nhà Hàng Hải Sản Tươi",
        "address": "789 Đường Biển, Quận 7, TP.HCM",
        "tags": "seafood,lunch,dinner",
        "average_rating": 4.5,
        "review_count": 95,
        "favorite_count": 42,
        "main_image_url": "/uploads/restaurants/5/cover/image.jpg"
      }
    ],
    "pagination": {
      "total": 8,
      "limit": 10,
      "offset": 0,
      "page": 1,
      "totalPages": 1
    }
  }
}
```

---

### 15.5. Get Restaurant Detail

**Endpoint:** `GET /api/v1/miniapp/restaurants/:id`

**Auth Required:** ❌ No (public)

**Request**

```http
GET /api/v1/miniapp/restaurants/1
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy thông tin nhà hàng thành công",
  "data": {
    "id": 1,
    "name": "Nhà Hàng ABC",
    "address": "123 Đường XYZ, Quận 1, TP.HCM",
    "phone": "0901234567",
    "description": "Nhà hàng chuyên về món Việt Nam đặc sắc với hơn 10 năm kinh nghiệm",
    "tags": "morning,lunch,dinner,vietnamese",
    "require_deposit": true,
    "default_deposit_amount": 50000,
    "average_rating": 4.8,
    "review_count": 150,
    "favorite_count": 68,
    "main_image_url": "/uploads/restaurants/1/cover/image.jpg",
    "open_time": "08:00:00",
    "close_time": "22:00:00",
    "is_active": true,
    "created_at": "2025-12-20 10:00:00",
    "images": [
      {
        "id": 10,
        "type": "COVER",
        "file_path": "/uploads/restaurants/1/cover/image.jpg",
        "caption": "Hình ảnh nhà hàng ban đêm",
        "is_primary": true
      },
      {
        "id": 11,
        "type": "GALLERY",
        "file_path": "/uploads/restaurants/1/gallery/image1.jpg",
        "caption": "Không gian nhà hàng"
      },
      {
        "id": 12,
        "type": "MENU",
        "file_path": "/uploads/restaurants/1/menu/menu1.jpg",
        "caption": "Menu món chính"
      }
    ]
  }
}
```

---

### 15.6. Get Restaurant Reviews

**Endpoint:** `GET /api/v1/miniapp/restaurants/:id/reviews`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /api/v1/miniapp/restaurants/1/reviews?limit=10&offset
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách review của nhà hàng thành công",
  "data": {
    "items": [
      {
        "id": 50,
        "booking_id": 101,
        "restaurant_id": 1,
        "user_id": 10,
        "rating": 5,
        "comment": "Món ăn ngon, phục vụ tốt! ",
        "status": "VISIBLE",
        "reply_comment": "Cảm ơn quý khách! ",
        "reply_created_at": "2025-12-22 10:00:00",
        "created_at": "2025-12-22 08:00:00",
        "user": {
          "id": 10,
          "display_name": "Nguyễn Văn C",
          "avatar_url": "https://avatar.zaloapp.com/..."
        }
      }
    ],
    "pagination": {
      "total": 25,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

## 16. BOOKING FLOW

### 16.1. Get Available Tables

**Endpoint:** `GET /api/v1/miniapp/bookings/available-tables`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `restaurant_id` - Required
- `booking_date` - Required (YYYY-MM-DD)
- `booking_time` - Required (HH:mm)
- `people_count` - Required

**Request**

```http
GET /api/v1/miniapp/bookings/available-tables?restaurant_id=1&booking_date=2025-12-25&booking_time=19:00&people_count=4
Authorization: Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách bàn phù hợp thành công",
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Bàn 1",
        "capacity": 4,
        "location": "Tầng 1 - Gần cửa sổ",
        "status": "ACTIVE",
        "view_image_url": "/uploads/restaurants/1/tables/1/view/image.jpg",
        "view_note": "View đẹp nhìn ra vườn",
        "is_available": true
      },
      {
        "id": 5,
        "name": "Bàn 5",
        "capacity": 6,
        "location": "Tầng 1 - Góc trái",
        "status": "ACTIVE",
        "is_available": true
      }
    ]
  }
}
```

**Business Logic:**

- ✅ Chỉ trả về bàn có `capacity >= people_count`
- ✅ Chỉ bàn `status = ACTIVE`
- ✅ Chưa có booking trùng giờ

---

### 16.2. Create Booking

**Endpoint:** `POST /api/v1/miniapp/bookings`

**Auth Required:** ✅ Customer

**Description:** tạo booking mới

**Request Body:**

```json
{
  "restaurant_id": 1,
  "table_id": 1,
  "phone": "0901234567",
  "customer_name": "Nguyễn Văn C",
  "people_count": 4,
  "booking_date": "2025-12-25",
  "booking_time": "19:00",
  "note": "Muốn ngồi gần cửa sổ"
}
```

**Field Definitions**
`restaurant_id` - Required: ID nhà hàng
`table_id` - Required: ID bàn (từ available-tables)
`phone` - Required: SĐT liên hệ
`customer_name` - Required: Tên khách hàng
`people_count` - Required: Số người (min: 1)
`booking_date` - Required: Ngày đặt (YYYY-MM-DD)
`booking_time` - Required: Giờ đặt (HH:mm)
`note` - Optional: Ghi chú

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Tạo booking thành công",
  "data": {
    "id": 101,
    "restaurant_id": 1,
    "table_id": 1,
    "user_id": 10,
    "phone": "0901234567",
    "customer_name": "Nguyễn Văn C",
    "people_count": 4,
    "booking_time": "2025-12-25 19:00:00",
    "status": "PENDING",
    "status_label": "Chờ xác nhận",
    "deposit_amount": 50000,
    "payment_status": "PENDING",
    "payment_status_label": "Chờ thanh toán",
    "note": "Muốn ngồi gần cửa sổ",
    "created_at": "2025-12-20 15:00:00",
    "updated_at": "2025-12-20 15:00:00"
  }
}
```

**Side Effects:**

- ✅ Tự động tính deposit_amount từ restaurant. default_deposit_amount
- ✅ Set payment_status = PENDING nếu cần đặt cọc
- ✅ Set payment_status = NONE nếu không yêu cầu cọc
- ✅ Gửi notification cho customer
- ✅ Gửi notification cho restaurant (dashboard)

**Error case**

```json
// 400 - Bàn đã có người đặt
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Bàn đã được đặt ở thời điểm này, vui lòng chọn bàn hoặc thời gian khác"
  }
}

// 400 - Đặt trong quá khứ
{
  "success": false,
  "error": {
    "code":  "BAD_REQUEST",
    "message": "Không thể đặt bàn trong quá khứ"
  }
}

// 400 - Bàn không đủ chỗ
{
  "success":  false,
  "error": {
    "code": "BAD_REQUEST",
    "message":  "Bàn chỉ hỗ trợ tối đa 4 người"
  }
}
```

---

### 16.3. List My Bookings

**Endpoint:** `GET /api/v1/miniapp/bookings`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `category` - Filter theo danh mục: - "upcoming": Booking sắp tới (future + PENDING/CONFIRMED) - "history": Booking đã qua (past + COMPLETED) - "cancelled": Booking đã hủy - "all": Tất cả (default)
- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /api/v1/miniapp/bookings?category=upcoming&limit=10
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách booking của bạn thành công",
  "data": {
    "items": [
      {
        "id": 101,
        "restaurant_id": 1,
        "table_id": 1,
        "people_count": 4,
        "phone": "0901234567",
        "customer_name": "Nguyễn Văn C",
        "booking_time": "2025-12-25 19:00:00",
        "status": "PENDING",
        "status_label": "Chờ xác nhận",
        "deposit_amount": 50000,
        "payment_status": "PENDING",
        "payment_status_label": "Chờ thanh toán",
        "note": "Muốn ngồi gần cửa sổ",
        "created_at": "2025-12-20 15:00:00",
        "restaurant": {
          "id": 1,
          "name": "Nhà Hàng ABC",
          "address": "123 Đường XYZ, Quận 1, TP. HCM",
          "phone": "0901234567",
          "main_image_url": "/uploads/restaurants/1/cover/image. jpg"
        },
        "table": {
          "id": 1,
          "name": "Bàn 1",
          "capacity": 4,
          "location": "Tầng 1 - Gần cửa sổ"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 16.4. Get Booking Detail

**Endpoint:** `GET /api/v1/miniapp/bookings/:id`

**Auth Required:** ✅ Customer

**Request**

```http
GET /api/v1/miniapp/bookings/101
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```josn
{
  "success": true,
  "message": "Lấy chi tiết booking thành công",
  "data": {
    "id": 101,
    "restaurant_id": 1,
    "table_id": 1,
    "people_count":  4,
    "phone":  "0901234567",
    "customer_name": "Nguyễn Văn C",
    "booking_time": "2025-12-25 19:00:00",
    "status": "PENDING",
    "status_label": "Chờ xác nhận",
    "deposit_amount": 50000,
    "payment_status": "PENDING",
    "payment_status_label": "Chờ thanh toán",
    "payment_provider": null,
    "payment_reference": null,
    "paid_at": null,
    "refunded_at": null,
    "note": "Muốn ngồi gần cửa sổ",
    "created_at": "2025-12-20 15:00:00",
    "updated_at": "2025-12-20 15:00:00",
    "restaurant": {
      "id": 1,
      "name": "Nhà Hàng ABC",
      "address": "123 Đường XYZ, Quận 1, TP.HCM",
      "phone": "0901234567",
      "main_image_url": "/uploads/restaurants/1/cover/image. jpg"
    },
    "table": {
      "id":  1,
      "name":  "Bàn 1",
      "capacity": 4,
      "location": "Tầng 1 - Gần cửa sổ",
      "view_image_url": "/uploads/restaurants/1/tables/1/view/image.jpg"
    }
  }
}
```

---

### 16.5. Update My Booking

**Endpoint:** `PATCH /api/v1/miniapp/bookings/:id`

**Auth Required:** ✅ Customer

**Description:** Chỉ khi status = PENDING

**Request Body:** (all optional)

```json
{
  "customer_name": "Nguyễn Văn C (Updated)",
  "phone": "0907654321",
  "people_count": 5,
  "booking_date": "2025-12-25",
  "booking_time": "20:00",
  "table_id": 2,
  "note": "Muốn bàn lớn hơn"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Cập nhật booking thành công",
  "data": {
    "id": 101,
    "customer_name": "Nguyễn Văn C (Updated)",
    "phone": "0907654321",
    "people_count": 5,
    "booking_time": "2025-12-25 20:00:00",
    "table_id": 2,
    "note": "Muốn bàn lớn hơn",
    "updated_at": "2025-12-20 16:00:00"
  }
}
```

**Business Logic:**

- ✅ Chỉ cho phép update khi status = PENDING
- ✅ Nếu đổi thời gian/bàn → Check conflict
- ✅ Nếu đổi số người → Check capacity
- ✅ Gửi notification cho restaurant

**Error case**

```json
// 400 - Booking không thể sửa
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Chỉ có thể chỉnh sửa booking đang ở trạng thái PENDING"
  }
}
```

---

### 16.6. Cancel My Booking

**Endpoint:** `PATCH /api/v1/miniapp/bookings/:id/cancel`

**Auth Required:** ✅ Customer

**Description:** Hủy booking (chỉ khi status = PENDING/CONFIRMED)

**Request**

```http
PATCH /api/v1/miniapp/bookings/101/cancel
Authorization: Bearer <access_token>
```

**Response**

```json
{
  "success": true,
  "message": "Huỷ booking thành công",
  "data": {
    "id": 101,
    "status": "CANCELLED",
    "payment_status": "REFUNDED",
    "refunded_at": "2025-12-20 16:30:00",
    "updated_at": "2025-12-20 16:30:00"
  }
}
```

**Side Effects:**

- ✅ Nếu đã thanh toán → Hoàn tiền (payment_status = REFUNDED)
- ✅ Gửi notification + email cho customer
- ✅ Gửi notification cho restaurant

**Error case**

```json
// 400 - Booking không thể hủy
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Không thể huỷ booking đã hoàn tất hoặc NO_SHOW"
  }
}
```

---

## 17. PAYMENT

### 17.1. Pay Deposit

**Endpoint:** `POST /api/v1/miniapp/bookings/:id/pay-deposit`

**Auth Required:** ✅ Customer

**Description:** Thanh toán đặt cọc cho booking

**Request Body:**

```json
{
  "provider": "ZALOPAY",
  "mock_result": "SUCCESS"
}
```

**Field Definitions:**

- `provider` - Required: ZALOPAY | MOMO | VNPAY | CARD
- `mock_result` - Optional: SUCCESS | FAILED (test only)

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Thanh toán cọc cho booking thành công",
  "data": {
    "id": 101,
    "payment_status": "PAID",
    "payment_status_label": "Đã thanh toán",
    "payment_provider": "ZALOPAY",
    "payment_reference": "PAY-101-1703123456789",
    "paid_at": "2025-12-20 17:00:00",
    "deposit_amount": 50000,
    "updated_at": "2025-12-20 17:00:00"
  }
}
```

**Side Effects:**

- ✅ Update payment_status = PAID
- ✅ Lưu payment_reference (transaction ID)
- ✅ Lưu paid_at (timestamp)
- ✅ Gửi notification cho customer
- ✅ Gửi notification cho restaurant
- ✅ Gửi email xác nhận thanh toán 📧 📧

**Error case**

```json
// 400 - Booking không yêu cầu cọc
{
  "success": false,
  "error":  {
    "code": "BAD_REQUEST",
    "message": "Booking này không yêu cầu đặt cọc"
  }
}

// 400 - Đã thanh toán rồi
{
  "success":  false,
  "error": {
    "code": "BAD_REQUEST",
    "message":  "Trạng thái thanh toán hiện tại không cho phép thanh toán cọc"
  }
}
```

**Frontend Integration:**

```javascript
// Flow thanh toán thực tế (production)
async function handlePayment(bookingId) {
  try {
    // 1. Call backend để tạo payment
    const response = await fetch(
      `/api/v1/miniapp/bookings/${bookingId}/pay-deposit`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          provider: "ZALOPAY",
          mock_result: "SUCCESS", // Remove in production
        }),
      }
    );

    const data = await response.json();

    if (data.success) {
      // 2. Show success message
      showToast("Thanh toán thành công! ");

      // 3. Navigate to booking detail
      navigateTo(`/bookings/${bookingId}`);

      // 4. User sẽ nhận email trong vài giây
    }
  } catch (error) {
    showToast("Thanh toán thất bại");
  }
}
```

---

## 18. REVIEWS

### 18.1. Create Review

**Endpoint:** `POST /api/v1/miniapp/reviews/bookings/:id/comment`

**Auth Required:** ✅ Customer

**Description:** Tạo review cho booking COMPLETED

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Món ăn ngon, phục vụ tốt!  Sẽ quay lại!"
}
```

**Field definitions**
`rating` - Required: 1-5 (integer)
`comment` - Optional: Nội dung review (max 500 chars)

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Tạo review thành công",
  "data": {
    "id": 50,
    "booking_id": 101,
    "restaurant_id": 1,
    "user_id": 10,
    "rating": 5,
    "comment": "Món ăn ngon, phục vụ tốt!  Sẽ quay lại!",
    "status": "VISIBLE",
    "created_at": "2025-12-22 08:00:00"
  }
}
```

**Side Effects:**

- ✅ Update restaurant.average_rating & review_count
- ✅ Gửi notification cho restaurant

**Error case**

```json
// 400 - Booking chưa COMPLETED
{
  "success":  false,
  "error": {
    "code": "BAD_REQUEST",
    "message":  "Chỉ có thể review booking đã hoàn tất (COMPLETED)"
  }
}

// 400 - Đã review rồi
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Bạn đã review booking này rồi"
  }
}
```

---

### 18.2. List My Reviews

**Endpoint:** `GET /api/v1/miniapp/reviews/my-reviews`

**Auth Required:** ✅ Customer

**Query parameters**
`limit` - Số lượng records
`offset` - Offset for pagination

**Request**

```http
GET /api/v1/miniapp/reviews/my-reviews?limit=10
Authorization: Bearer <access_token>
```

**Response**

```json
{
  "success": true,
  "message": "Lấy danh sách review của bạn thành công",
  "data": {
    "items": [
      {
        "id": 50,
        "booking_id": 101,
        "restaurant_id": 1,
        "rating": 5,
        "comment": "Món ăn ngon, phục vụ tốt! ",
        "status": "VISIBLE",
        "reply_comment": "Cảm ơn quý khách!",
        "reply_created_at": "2025-12-22 10:00:00",
        "created_at": "2025-12-22 08:00:00",
        "restaurant": {
          "id": 1,
          "name": "Nhà Hàng ABC",
          "main_image_url": "/uploads/restaurants/1/cover/image.jpg"
        }
      }
    ],
    "pagination": {
      "total": 8,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 18.3. Delete My Review

**Endpoint:** `DELETE /api/v1/miniapp/reviews/:id`

**Auth Required:** ✅ Customer

**Request**

```http
DELETE /api/v1/miniapp/reviews/50
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Xoá review thành công"
}
```

**Side Effects:**

- ✅ Update restaurant.average_rating & review_count

---

## 19. FAVORITES

### 19.1. List My Favorites

**Endpoint:** `GET /api/v1/miniapp/favorites`

**Auth Required:** ✅ Customer

**Query parameters**
`limit` - Số lượng records
`offset` - Offset for pagination

**Request**

```http
GET /api/v1/miniapp/favorites?limit=10
Authorization:  Bearer <access_token>
```

**Response:** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách nhà hàng yêu thích thành công",
  "data": {
    "items": [
      {
        "id": 30,
        "user_id": 10,
        "restaurant_id": 1,
        "created_at": "2025-12-20 10:00:00",
        "restaurant": {
          "id": 1,
          "name": "Nhà Hàng ABC",
          "address": "123 Đường XYZ, Quận 1, TP.HCM",
          "average_rating": 4.8,
          "review_count": 150,
          "main_image_url": "/uploads/restaurants/1/cover/image.jpg"
        }
      }
    ],
    "pagination": {
      "total": 5,
      "limit": 10,
      "offset": 0
    }
  }
}
```

---

### 19.2. Check Favorite Status

**Endpoint:** `GET /api/v1/miniapp/favorites/restaurants/:id/status`

**Auth Required:** ✅ Customer

**Request**

```http
GET /api/v1/miniapp/favorites/restaurants/1/status
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Kiểm tra trạng thái yêu thích thành công",
  "data": {
    "restaurant_id": 1,
    "is_favorite": true,
    "favorite_id": 30
  }
}
```

---

### 19.3. Add to Favorites

**Endpoint:** `POST /api/v1/miniapp/favorites/restaurants/:id/add`

**Auth Required:** ✅ Customer

**Request**

```http
POST /api/v1/miniapp/favorites/restaurants/1/add
Authorization: Bearer <access_token>
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Đã thêm vào danh sách yêu thích",
  "data": {
    "id": 30,
    "user_id": 10,
    "restaurant_id": 1,
    "created_at": "2025-12-20 10:00:00"
  }
}
```

**Side Effects:**

- ✅ Update restaurant.favorite_count

---

### 19.4. Remove from Favorites

**Endpoint:** `DELETE /api/v1/miniapp/favorites/restaurants/:id/remove`

**Auth Required:** ✅ Customer

**Request**

```http
DELETE /api/v1/miniapp/favorites/restaurants/1/remove
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Đã bỏ khỏi danh sách yêu thích"
}
```

**Side Effects:**

- ✅ Update restaurant.favorite_count

---

## 20. USER PROFILE

### 20.1. Get My Profile

**Endpoint:** `GET /api/v1/miniapp/users/me`

**Auth Required:** ✅ Customer

**Request**

```http
GET /api/v1/miniapp/users/me
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Lấy thông tin tài khoản thành công",
  "data": {
    "id": 10,
    "display_name": "Nguyễn Văn C",
    "email": "customer@example.com",
    "phone": "0901234567",
    "avatar_url": "https://avatar.zaloapp.com/.. .",
    "created_at": "2025-12-15 10:00:00",
    "updated_at": "2025-12-20 10:00:00"
  }
}
```

---

### 20.2. Update My Profile

**Endpoint:** `PATCH /api/v1/miniapp/users/me`

**Auth Required:** ✅ Customer

**Request Body:** (all optional)

```json
{
  "display_name": "Nguyễn Văn C (Updated)",
  "phone": "0907654321",
  "email": "newemail@example.com",
  "avatar_url": "/uploads/users/10/avatar/new-avatar.jpg"
}
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Cập nhật thông tin tài khoản thành công",
  "data": {
    "id": 10,
    "display_name": "Nguyễn Văn C (Updated)",
    "phone": "0907654321",
    "email": "newemail@example.com",
    "avatar_url": "/uploads/users/10/avatar/new-avatar.jpg",
    "updated_at": "2025-12-20 18:00:00"
  }
}
```

**Side Effects:**

- ✅ Tự động xóa avatar cũ nếu thay đổi

---

### 20.3. Change Password

**Endpoint:** `POST /api/v1/miniapp/users/me/change-password`

**Auth Required:** ✅ Customer

**Description:** Đổi mật khẩu (chỉ cho tài khoản local)

**Request Body:**

```json
{
  "current_password": "OldPassword123! ",
  "new_password": "NewPassword456!"
}
```

**Response** `200 Ok`

```json
{
  "success": true,
  "message": "Đổi mật khẩu thành công.  Vui lòng đăng nhập lại.",
  "data": {
    "id": 10
  }
}
```

**Side Effects:**

- ✅ **TẤT CẢ refresh tokens bị thu hồi**

**Error case**

```json
// 400 - Tài khoản Zalo không có password
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Tài khoản Zalo không hỗ trợ đổi mật khẩu"
  }
}

// 401 - Mật khẩu hiện tại sai
{
  "success":  false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Mật khẩu hiện tại không đúng"
  }
}
```

---

### 20.4. Upload User Avatar

**Endpoint:** `POST /api/v1/miniapp/uploads/images/users/avatar`

**Auth Required:** ✅ Customer

**Content-Type:** `multipart/form-data`

**Request**

```http
POST /api/v1/miniapp/uploads/images/users/avatar
Authorization: Bearer <access_token>
Content-Type: multipart/form-data

file:  [binary image data]
```

**Response** `201 Created`

```json
{
  "success": true,
  "message": "Upload ảnh thành công",
  "data": {
    "filename": "1703123456789-avatar.jpg",
    "path": "/uploads/users/10/avatar/1703123456789-avatar.jpg",
    "url": "http://localhost:3000/uploads/users/10/avatar/1703123456789-avatar.jpg"
  }
}
```

- Sau khi upload mới có ảnh để gọi api update profile user

**Notes:**

- ✅ Max size: 5MB
- ✅ Rate limit: 5 uploads/10 phút
- ✅ Sau khi upload → Call PATCH /users/me để update avatar_url

---

## 21. NOTIFICATIONS (MiniApp)

### 21.1. List My Notifications

**Endpoint:** `GET /api/v1/miniapp/notifications`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `read_status` - all/read/unread
- `type` - các loại notification type bên dưới
- `from_time` - cột mốc bắt đầu (optional)
- `to_time` - cột mốc kết thúc (optional)
- `limit`
- `offset`

**Request**

```http
GET /api/v1/miniapp/notifications?read_status=all&limit=20
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Lấy danh sách notification thành công",
  "data": {
    "items": [
      {
        "id": 600,
        "user_id": 10,
        "restaurant_id": null,
        "type": "BOOKING_CREATED",
        "title": "Đặt bàn thành công",
        "message": "Bạn đã tạo booking mới tại Nhà Hàng ABC vào lúc 2025-12-20 15:00:00",
        "target_type": "BOOKING",
        "target_id": 101,
        "is_read": false,
        "created_at": "2025-12-20 15:00:00"
      },
      {
        "id": 601,
        "type": "BOOKING_PAYMENT_SUCCESS",
        "title": "Thanh toán cọc thành công",
        "message": "Bạn đã thanh toán cọc cho booking thành công",
        "is_read": false,
        "created_at": "2025-12-20 17:00:00"
      },
      {
        "id": 602,
        "type": "BOOKING_CONFIRMED",
        "title": "Booking đã được xác nhận",
        "message": "Nhà hàng đã xác nhận booking của bạn",
        "is_read": false,
        "created_at": "2025-12-20 18:00:00"
      }
    ],
    "pagination": {
      "total": 12,
      "limit": 20,
      "offset": 0
    }
  }
}
```

**Notification Types:**

- `BOOKING_CREATED` - Booking được tạo
- `BOOKING_CONFIRMED` - Booking được xác nhận
- `BOOKING_CANCELLED` - Booking bị hủy
- `BOOKING_CHECKED_IN` - Booking đã check-in
- `BOOKING_PAYMENT_SUCCESS` - Thanh toán thành công
- `BOOKING_PAYMENT_FAILED` - Thanh toán thất bại
- `BOOKING_REFUND_SUCCESS` - Hoàn tiền thành công

---

### 21.2. Get Unread Count

**Endpoint:** `GET /api/v1/miniapp/notifications/unread-count`

**Auth Required:** ✅ Customer

**Request**

```http
GET /api/v1/miniapp/notifications/unread-count
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Lấy số lượng notification chưa đọc thành công",
  "data": {
    "unreadCount": 3
  }
}
```

---

### 21.3. Mark as Read

**Endpoint:** `PATCH /v1/miniapp/notifications/:id/read`

**Auth Required:** ✅ Customer

**Request**

```htpp
PATCH /api/v1/miniapp/notifications/600/read
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Đánh dấu notification là đã đọc thành công",
  "data": {
    "id": 600,
    "is_read": true,
    "updated_at": "2025-12-20 19:00:00"
  }
}
```

---

### 21.4. Mark All as Read

**Endpoint:** `PATCH /api/v1/miniapp/notifications/read-all`

**Auth Required:** ✅ Customer

**Request**

```http
PATCH /api/v1/miniapp/notifications/read-all
Authorization: Bearer <access_token>
```

**Response** `200 OK`

```json
{
  "success": true,
  "message": "Đánh dấu tất cả notification là đã đọc thành công",
  "data": {
    "affected_rows": []
  }
}
```

---

### 21.5. Delete All Read

**Endpoint:** `DELETE /api/v1/miniapp/notifications/read-all`

**Auth Required:** ✅ Customer

**Request**

```http
DELETE /api/v1/miniapp/notifications/read-all
Authorization: Bearer <access_token>
```

**Response**

```json
{
  "success": true,
  "message": "Xoá tất cả notification đã đọc thành công",
  "data": {
    "deleted_rows": []
  }
}
```

---

## APPENDIX

## Common Error Codes

| Code             | HTTP Status | Description                               |
| ---------------- | ----------- | ----------------------------------------- |
| `UNAUTHORIZED`   | 401         | Chưa đăng nhập hoặc token hết hạn         |
| `FORBIDDEN`      | 403         | Không có quyền truy cập                   |
| `BAD_REQUEST`    | 400         | Dữ liệu gửi lên không hợp lệ              |
| `NOT_FOUND`      | 404         | Tài nguyên không tồn tại                  |
| `CONFLICT`       | 409         | Xung đột dữ liệu (email đã tồn tại, etc.) |
| `INTERNAL_ERROR` | 500         | Lỗi server                                |

---

## Status & State Definitions

### Booking Status

- `PENDING` - Chờ xác nhận
- `CONFIRMED` - Đã xác nhận
- `CANCELLED` - Đã hủy
- `COMPLETED` - Đã hoàn thành
- `NO_SHOW` - Khách không đến

### Payment Status

- `NONE` - Không yêu cầu cọc
- `PENDING` - Chờ thanh toán
- `PAID` - Đã thanh toán
- `FAILED` - Thanh toán thất bại
- `REFUNDED` - Đã hoàn tiền

### Table Status

- `ACTIVE` - Đang hoạt động
- `INACTIVE` - Không hoạt động

### Restaurant Account Status

- `INVITED` - Chờ phê duyệt (staff only)
- `ACTIVE` - Đang hoạt động
- `REJECTED` - Bị từ chối (staff only)

---

## COMMON USE CASES & FLOWS

### Flow 1: User đặt bàn lần đầu

```
1. GET /miniapp/restaurants/home/top-rated
   → Xem nhà hàng nổi bật

2. GET /miniapp/restaurants/1
   → Xem chi tiết nhà hàng

3. GET /miniapp/bookings/available-tables? restaurant_id=1&date=2025-12-25&time=19:00&people=4
   → Kiểm tra bàn trống

4. POST /miniapp/bookings
   → Tạo booking
   → Status: PENDING, Payment: PENDING

5. POST /miniapp/bookings/101/pay-deposit
   → Thanh toán đặt cọc
   → Status:  PENDING, Payment: PAID
   → Nhận email xác nhận

6. Wait for restaurant confirm...
   → Nhận notification khi restaurant confirm

7. Đến nhà hàng đúng giờ
   → Restaurant mark COMPLETED

8. POST /miniapp/reviews/bookings/101/comment
   → Review nhà hàng
```

---

### Flow 2: User thay đổi/hủy booking

```
1. GET /miniapp/bookings? category=upcoming
   → Xem booking sắp tới

2. GET /miniapp/bookings/101
   → Xem chi tiết booking

3a. PATCH /miniapp/bookings/101
    → Sửa thông tin (thời gian, số người, bàn)

3b.  PATCH /miniapp/bookings/101/cancel
    → Hủy booking
    → Hoàn tiền nếu đã thanh toán
    → Nhận email xác nhận hoàn tiền
```

---

### Flow 3: Dashboard quản lý booking

```
1. GET /dashboard/bookings? status=PENDING
   → Xem booking chờ xác nhận

2. GET /dashboard/bookings/101
   → Xem chi tiết booking

3. PATCH /dashboard/bookings/101/confirm
   → Xác nhận booking
   → Customer nhận notification

4. Khách đến nhà hàng...
   → PATCH /dashboard/bookings/101/complete
   → Mark booking là COMPLETED

5. Customer có thể review sau khi COMPLETED
```

---

## Email System

Hệ thống tự động gửi email khi:

- ✅ Thanh toán thành công → Email xác nhận thanh toán
- ✅ Thanh toán thất bại → Email thông báo thất bại
- ✅ Hoàn tiền → Email xác nhận hoàn tiền
- ✅ Nhắc nhở booking → Email nhắc nhở (24h và 2h trước)

Email sử dụng Gmail SMTP (development) hoặc SendGrid (production).

---

## Rate Limits

**Upload:**

- General: 20 uploads/15 phút
- Avatar: 5 uploads/10 phút
- Multiple: 5 requests/15 phút

**API Calls:**

- General: 100 requests/phút/IP
- Auth: 5 login attempts/phút/IP

---

## File Upload Limits

- **Max file size:** 5MB
- **Allowed types:** JPG, PNG, JPEG
- **Auto compression:** Yes (JPEG quality 80%)
- **Multiple upload:** Max 10 files/request

---

## Support

**Backend Team:**

- Email: bdat6832@gmail.com
- Slack: #backend-support

---

**Last Updated:** 2025-12-20  
**Version:** 1.0.0
