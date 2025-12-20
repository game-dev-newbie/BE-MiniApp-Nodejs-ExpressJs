# 📚 RESTAURANT BOOKING SYSTEM - API DOCUMENTATION

**Base URL:** `http://localhost:8027/api`  
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
- [3. MiniApp Authentication](#3-miniapp-authentication)
  - [3.1. Login with Zalo](#31-login-with-zalo)
  - [3.2. Register Local](#32-register-local)
  - [3.3. Login Local](#33-login-local)
  - [3.4. Refresh Token](#34-refresh-token)
  - [3.5. Logout](#35-logout)

### PART 2: DASHBOARD APIs

- [4. Restaurant Management](#4-restaurant-management)
- [5. Table Management](#5-table-management)
- [6. Booking Management](#6-booking-management)
- [7. Review Management](#7-review-management)
- [8. Staff Management](#8-staff-management)
- [9. Upload Management](#9-upload-management)
- [10. Restaurant Images](#10-restaurant-images)
- [11. Notifications (Dashboard)](#11-notifications-dashboard)
- [12. Account Management (Dashboard)](#12-account-management-dashboard)

### PART 3: MINIAPP APIs

- [13. Restaurant Discovery](#13-restaurant-discovery)
- [14. Booking Flow](#14-booking-flow)
- [15. Payment](#15-payment)
- [16. Reviews](#16-reviews)
- [17. Favorites](#17-favorites)
- [18. User Profile](#18-user-profile)
- [19. Notifications (MiniApp)](#19-notifications-miniapp)

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

**Endpoint:** `POST /v1/dashboard/auth/register/owner`

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

**Endpoint:** `POST /v1/dashboard/auth/register/staff`

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

**Endpoint:** `POST /v1/dashboard/auth/login`

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

**Endpoint:** `POST /v1/miniapp/auth/zalo/login`

**Description:** Đăng nhập MiniApp bằng tài khoản Zalo

**Frontend Flow:**

```javascript
// 1. Get access token from Zalo
import { getAccessToken, getUserInfo } from "zmp-sdk";

const { accessToken } = await getAccessToken();
const { userInfo } = await getUserInfo();

// Miniapp tự gọi api của zalo hỗ trợ và lấy thông tin, sau đó truyền vào req.body gửi lên cho server. Đây là giả lập code
// 2. Call API
const response = await fetch("${base_URL}/v1/miniapp/auth/zalo/login", {
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

**Endpoint:** `POST /v1/miniapp/auth/register`

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

**Endpoint:** `POST /v1/miniapp/auth/login`

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

### 3.4. Refresh Token

**Endpoint:** `POST /v1/common/auth/refresh`

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

### 3.5. Logout

**Endpoint:** `POST /v1/common/auth/logout`

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

## 4. RESTAURANT MANAGEMENT

### 4.1. Get My Restaurant (xem thông tin nhà hàng)

**Endpoint:** `GET /v1/dashboard/restaurants/me`

**Auth Required:** ✅ Owner/Staff (cả staff và owner đều xem được thông tin)

**Request body**

```http
`GET /v1/dashboard/restaurants/me`
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

### 4.2. Update My Restaurant

**Endpoint:** `PATCH /v1/dashboard/restaurants/me`

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

## 5. TABLE MANAGEMENT

### 5.1. List Tables

**Endpoint:** `GET /v1/dashboard/tables`

**Auth Required:** ✅ Owner/Staff (cả staff và owner đều dùng được)

**Query Parameters:**

- `limit` - Số lượng records (default: 20, max: 100)
- `offset` - Offset for pagination (default: 0)

**Request**

```http
`GET /v1/dashboard/tables?limit=10&offset=0` (ví dụ limit thôi)
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

### 5.2. Get detail table

**Endpoint:** `GET /v1/dashboard/tables/:id`

**Auth Required:** ✅ Owner/Staff (cả staff và owner đều dùng được)

**Request**

```http
`GET /v1/dashboard/tables/1` (ví dụ muốn xem chi tiết tables_id = 1)
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

### 5.3. Create Table

**Endpoint:** `POST /v1/dashboard/tables`

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

### 5.4. Update Table

**Endpoint:** `PATCH /v1/dashboard/tables/:id`

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

### 5.5. Delete Table

**Endpoint:** `DELETE /v1/dashboard/tables/:id`

**Auth Required:** ✅ Owner only
**Request**

```http
`DELETE /v1/dashboard/tables/3`
`Authorization: Bearer <access_token>`
```

**Response : `200 OK`**

```json
{
  "success": true,
  "message": "Xoá bàn thành công"
}
```

> **Note:** Soft delete - bàn vẫn còn trong DB nhưng status = INACTIVE

---

## 6. BOOKING MANAGEMENT

### 6.1. List Bookings

**Endpoint:** `GET /v1/dashboard/bookings`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `status` - PENDING, CONFIRMED, CANCELLED, COMPLETED, NO_SHOW
- `from_date` - YYYY-MM-DD
- `to_date` - YYYY-MM-DD
- `limit` - Default: 20
- `offset` - Default: 0

**Request**

```http
`GET /v1/dashboard/bookings?status=PENDING&from_date=2025-12-20&to_date=2025-12-31&limit=10`
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
      "offset": 0
    }
  }
}
```

---

### 6.2. Search Bookings by Customer Name

**Endpoint:** `GET /v1/dashboard/bookings/search`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `q` - Tên khách hàng (fuzzy search)
- `limit` - Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /v1/dashboard/bookings/search?q=Nguyễn&limit=10&offset=
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
    }
  }
}
```

---

### 6.3. Get Booking Detail

**Endpoint:** `GET /v1/dashboard/bookings/:id`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
GET /v1/dashboard/bookings/101
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

### 6.4. Confirm Booking

**Endpoint:** `PATCH /v1/dashboard/bookings/:id/confirm`

**Auth Required:** ✅ Owner/Staff

**Description:** Xác nhận booking (PENDING → CONFIRMED)

**Request**

```http
PATCH /v1/dashboard/bookings/101/confirm
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
    "updated_at": "2025-12-20 16:00:00"
  }
}
```

**Side Effects:**

- ✅ Gửi notification cho customer
- ✅ Update booking status

---

### 6.5. Cancel Booking

**Endpoint:** `PATCH /v1/dashboard/bookings/:id/cancel`

**Auth Required:** ✅ Owner/Staff

**Request**

```http
PATCH /v1/dashboard/bookings/101/cancel
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
  }
}
```

**Side Effects:**

- ✅ Hoàn tiền nếu đã thanh toán
- ✅ Gửi notification + email cho customer
- ✅ Updated booking status

---

### 6.6. Complete Booking (check-in)

**Endpoint:** `PATCH /v1/dashboard/bookings/:id/complete`

**Auth Required:** ✅ Owner/Staff

**Description:** Đánh dấu khách đã đến và hoàn thành (check-in)

**Request**

```http
PATCH /v1/dashboard/bookings/101/complete
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
  }
}
```

**Side Effects:**

- ✅ Customer có thể review sau khi COMPLETED

---

### 6.7. Mark No-Show

**Endpoint:** `PATCH /v1/dashboard/bookings/:id/no-show`

**Auth Required:** ✅ Owner/Staff

**Discription**: Đánh dấu khách không đến

**Request**

```http
PATCH /v1/dashboard/bookings/102/no-show
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
  }
}
```

> **Note:** Nếu NO_SHOW → KHÔNG hoàn tiền đặt cọc

---

## 7. REVIEW MANAGEMENT

### 7.1. List Restaurant Reviews

**Endpoint:** `GET /v1/dashboard/reviews`

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
GET /v1/dashboard/reviews?rating=5&limit=10
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

### 7.2. Reply to Review

**Endpoint:** `PATCH /v1/dashboard/reviews/:id/reply`

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
    "reply_updated_at": "2025-12-22 10:30:00"
  }
}
```

**Side Effects:**

- ✅ Gửi notification cho customer

---

## 8. STAFF MANAGEMENT

### 8.1. List Staff

**Endpoint:** `GET /v1/dashboard/staff`

**Auth Required:** ✅ Owner only

**Query parameters:**

- `limit` -Số lượng records
- `offset` - Offset for pagination

**Request**

```http
GET /v1/dashboard/staff?limit=10
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

### 8.2. Approve Staff

**Endpoint:** `PATCH /v1/dashboard/staff/:id/approve`

**Auth Required:** ✅ Owner only

**Description:** Duyệt staff (INVITED → ACTIVE)

**Request**

```http
PATCH /v1/dashboard/staff/2/approve
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

### 8.3. Reject Staff

**Endpoint:** `PATCH /v1/dashboard/staff/:id/reject`

**Auth Required:** ✅ Owner only

**Description**: từ chối staff (INVITED -> REJECTED)

**Request**

```http
PATCH /v1/dashboard/staff/2/reject
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

### 8.4. Lock Staff

**Endpoint:** `PATCH /v1/dashboard/staff/:id/lock`

**Auth Required:** ✅ Owner only

**Request**

```http
PATCH /v1/dashboard/staff/3/lock
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

### 8.5. Unlock Staff

**Endpoint:** `PATCH /v1/dashboard/staff/:id/unlock`

**Auth Required:** ✅ Owner only

**Request**

```http
PATCH /v1/dashboard/staff/3/unlock
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

## 9. UPLOAD MANAGEMENT

### 9.1. Upload Restaurant Cover

**Endpoint:** `POST /v1/dashboard/uploads/images/restaurants/cover`

**Auth Required:** ✅ Owner/Staff

**Content-Type:** `multipart/form-data`

**Request:**

```http
POST /v1/dashboard/uploads/images/restaurants/cover
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
    "url": "http://localhost:3000/uploads/restaurants/1/cover/1703123456789-123456789.jpg"
  }
}
```

**Rate Limits:**

- ✅ General uploads: 20 uploads/15 phút
- ✅ Avatar uploads: 5 uploads/10 phút
- ✅ Multiple uploads: 5 requests/15 phút

---

### 9.2. Upload Restaurant Gallery

**Endpoint:** `POST /v1/dashboard/uploads/images/restaurants/gallery`

**Auth Required:** ✅ Owner/Staff

---

### 9.3. Upload Restaurant Galleries (Multiple)

**Endpoint:** `POST /v1/dashboard/uploads/images/restaurants/galleries`

**Auth Required:** ✅ Owner/Staff

**Request:**

- Field name: `files`
- Max: 10 files per request

---

### 9.4. Upload Menu Images

**Endpoint:** `POST /v1/dashboard/uploads/images/restaurants/menu`

**Auth Required:** ✅ Owner/Staff

---

### 9.5. Upload Table View Image

**Endpoint:** `POST /v1/dashboard/uploads/images/tables/view? table_id=1`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `table_id` - Required

---

### 9.6. Upload Account Avatar

**Endpoint:** `POST /v1/dashboard/uploads/images/restaurant-accounts/avatar`

**Auth Required:** ✅ Owner/Staff

---

## 10. RESTAURANT IMAGES

### 10.1. Create Restaurant Image

**Endpoint:** `POST /v1/dashboard/restaurant-images`

**Auth Required:** ✅ Owner only

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

**Side Effects:**

- ✅ Nếu `type=COVER` và `is_primary=true` → Update `restaurants. main_image_url`
- ✅ Các ảnh COVER khác tự động set `is_primary=false`

---

### 10.2. List Restaurant Images

**Endpoint:** `GET /v1/dashboard/restaurant-images`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `type` - COVER, GALLERY, MENU

---

### 10.3. Delete Restaurant Image

**Endpoint:** `DELETE /v1/dashboard/restaurant-images/:id`

**Auth Required:** ✅ Owner only

**Side Effects:**

- ✅ Xóa file trên disk
- ✅ Auto-select new primary nếu xóa ảnh COVER primary

---

## 11. NOTIFICATIONS (Dashboard)

### 11.1. List Notifications

**Endpoint:** `GET /v1/dashboard/notifications`

**Auth Required:** ✅ Owner/Staff

**Query Parameters:**

- `is_read` - true/false

---

### 11.2. Get Unread Count

**Endpoint:** `GET /v1/dashboard/notifications/unread-count`

**Auth Required:** ✅ Owner/Staff

---

### 11.3. Mark as Read

**Endpoint:** `PATCH /v1/dashboard/notifications/: id/read`

**Auth Required:** ✅ Owner/Staff

---

### 11.4. Mark All as Read

**Endpoint:** `PATCH /v1/dashboard/notifications/read-all`

**Auth Required:** ✅ Owner/Staff

---

### 11.5. Delete Notification

**Endpoint:** `DELETE /v1/dashboard/notifications/:id`

**Auth Required:** ✅ Owner/Staff

---

### 11.6. Delete All Read

**Endpoint:** `DELETE /v1/dashboard/notifications/read-all`

**Auth Required:** ✅ Owner/Staff

---

## 12. ACCOUNT MANAGEMENT (Dashboard)

### 12.1. Get My Profile

**Endpoint:** `GET /v1/dashboard/accounts/me`

**Auth Required:** ✅ Owner/Staff

---

### 12.2. Update My Profile

**Endpoint:** `PATCH /v1/dashboard/accounts/me/profile`

**Auth Required:** ✅ Owner/Staff

**Request Body:**

```json
{
  "full_name": "Nguyễn Văn A (Updated)",
  "avatar_url": "/uploads/restaurant-accounts/1/avatar/new-avatar.jpg"
}
```

**Side Effects:**

- ✅ Tự động xóa avatar cũ

---

### 12.3. Change Password

**Endpoint:** `POST /v1/dashboard/accounts/me/change-password`

**Auth Required:** ✅ Owner/Staff

**Request Body:**

```json
{
  "current_password": "OldPassword123!",
  "new_password": "NewPassword456!"
}
```

**Side Effects:**

- ✅ **TẤT CẢ refresh tokens bị thu hồi** → Phải login lại tất cả thiết bị

---

## PART 3: MINIAPP APIs

## 13. RESTAURANT DISCOVERY

### 13.1. Get Top Rated Restaurants

**Endpoint:** `GET /v1/miniapp/restaurants/home/top-rated`

**Auth Required:** ❌ No (Public)

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
        "average_rating": 4.8,
        "review_count": 150,
        "favorite_count": 68,
        "main_image_url": "/uploads/restaurants/1/cover/image.jpg"
      }
    ]
  }
}
```

---

### 13.2. Get Top Favorite Restaurants

**Endpoint:** `GET /v1/miniapp/restaurants/home/top-favorites`

**Auth Required:** ❌ No

---

### 13.3. Get Top by Tag

**Endpoint:** `GET /v1/miniapp/restaurants/home/top-by-tag? tag=lunch`

**Auth Required:** ❌ No

---

### 13.4. Search Restaurants

**Endpoint:** `GET /v1/miniapp/restaurants/search`

**Auth Required:** ❌ No

**Query Parameters:**

- `q` - Từ khóa tìm kiếm
- `tag` - Filter theo tag
- `min_rating` - Rating tối thiểu (1-5)
- `limit` - Default: 20
- `offset` - Default: 0

---

### 13.5. Get Restaurant Detail

**Endpoint:** `GET /v1/miniapp/restaurants/: id`

**Auth Required:** ❌ No

**Response:** Includes restaurant info + images + tables

---

### 13.6. Get Restaurant Reviews

**Endpoint:** `GET /v1/miniapp/restaurants/: id/reviews`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `rating` - Filter (1-5)

---

## 14. BOOKING FLOW

### 14.1. Get Available Tables

**Endpoint:** `GET /v1/miniapp/bookings/available-tables`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `restaurant_id` - Required
- `booking_date` - Required (YYYY-MM-DD)
- `booking_time` - Required (HH:mm)
- `people_count` - Required

**Business Logic:**

- ✅ Chỉ trả về bàn có `capacity >= people_count`
- ✅ Chỉ bàn `status = ACTIVE`
- ✅ Chưa có booking trùng giờ

---

### 14.2. Create Booking

**Endpoint:** `POST /v1/miniapp/bookings`

**Auth Required:** ✅ Customer

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

**Response:** `201 Created`

```json
{
  "success": true,
  "message": "Tạo booking thành công",
  "data": {
    "id": 101,
    "status": "PENDING",
    "status_label": "Chờ xác nhận",
    "deposit_amount": 50000,
    "payment_status": "PENDING",
    "payment_status_label": "Chờ thanh toán",
    "created_at": "2025-12-20 15:00:00"
  }
}
```

**Side Effects:**

- ✅ Auto tính `deposit_amount` từ restaurant config
- ✅ Gửi notification cho customer & restaurant

---

### 14.3. List My Bookings

**Endpoint:** `GET /v1/miniapp/bookings`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `category` - upcoming | history | cancelled | all

---

### 14.4. Get Booking Detail

**Endpoint:** `GET /v1/miniapp/bookings/:id`

**Auth Required:** ✅ Customer

---

### 14.5. Update My Booking

**Endpoint:** `PATCH /v1/miniapp/bookings/:id`

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

---

### 14.6. Cancel My Booking

**Endpoint:** `PATCH /v1/miniapp/bookings/:id/cancel`

**Auth Required:** ✅ Customer

**Side Effects:**

- ✅ Hoàn tiền nếu đã thanh toán
- ✅ Gửi notification + email

---

## 15. PAYMENT

### 15.1. Pay Deposit

**Endpoint:** `POST /v1/miniapp/bookings/:id/pay-deposit`

**Auth Required:** ✅ Customer

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
    "payment_provider": "ZALOPAY",
    "payment_reference": "PAY-101-1703123456789",
    "paid_at": "2025-12-20 17:00:00",
    "deposit_amount": 50000
  }
}
```

**Side Effects:**

- ✅ Update payment_status = PAID
- ✅ Lưu payment_reference & paid_at
- ✅ Gửi notification
- ✅ **Gửi email xác nhận** 📧

**Frontend Integration:**

```javascript
async function handlePayment(bookingId) {
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
        // mock_result: 'SUCCESS' // Remove in production
      }),
    }
  );

  if (response.ok) {
    showToast("Thanh toán thành công! ");
    // User sẽ nhận email trong vài giây
  }
}
```

---

## 16. REVIEWS

### 16.1. Create Review

**Endpoint:** `POST /v1/miniapp/reviews/bookings/:id/comment`

**Auth Required:** ✅ Customer

**Description:** Tạo review cho booking COMPLETED

**Request Body:**

```json
{
  "rating": 5,
  "comment": "Món ăn ngon, phục vụ tốt!  Sẽ quay lại!"
}
```

**Side Effects:**

- ✅ Update restaurant. average_rating & review_count
- ✅ Gửi notification cho restaurant

---

### 16.2. List My Reviews

**Endpoint:** `GET /v1/miniapp/reviews/my-reviews`

**Auth Required:** ✅ Customer

---

### 16.3. Delete My Review

**Endpoint:** `DELETE /v1/miniapp/reviews/:id`

**Auth Required:** ✅ Customer

---

## 17. FAVORITES

### 17.1. List My Favorites

**Endpoint:** `GET /v1/miniapp/favorites`

**Auth Required:** ✅ Customer

---

### 17.2. Check Favorite Status

**Endpoint:** `GET /v1/miniapp/favorites/restaurants/:id/status`

**Auth Required:** ✅ Customer

---

### 17.3. Add to Favorites

**Endpoint:** `POST /v1/miniapp/favorites/restaurants/:id/add`

**Auth Required:** ✅ Customer

**Side Effects:**

- ✅ Update restaurant.favorite_count

---

### 17.4. Remove from Favorites

**Endpoint:** `DELETE /v1/miniapp/favorites/restaurants/:id/remove`

**Auth Required:** ✅ Customer

---

## 18. USER PROFILE

### 18.1. Get My Profile

**Endpoint:** `GET /v1/miniapp/users/me`

**Auth Required:** ✅ Customer

---

### 18.2. Update My Profile

**Endpoint:** `PATCH /v1/miniapp/users/me`

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

---

### 18.3. Change Password

**Endpoint:** `POST /v1/miniapp/users/me/change-password`

**Auth Required:** ✅ Customer

**Request Body:**

```json
{
  "current_password": "OldPassword123! ",
  "new_password": "NewPassword456!"
}
```

**Side Effects:**

- ✅ **TẤT CẢ refresh tokens bị thu hồi**

---

### 18.4. Upload User Avatar

**Endpoint:** `POST /v1/miniapp/uploads/images/users/avatar`

**Auth Required:** ✅ Customer

**Content-Type:** `multipart/form-data`

---

## 19. NOTIFICATIONS (MiniApp)

### 19.1. List My Notifications

**Endpoint:** `GET /v1/miniapp/notifications`

**Auth Required:** ✅ Customer

**Query Parameters:**

- `is_read` - true/false

**Notification Types:**

- `BOOKING_CREATED` - Booking được tạo
- `BOOKING_CONFIRMED` - Booking được xác nhận
- `BOOKING_CANCELLED` - Booking bị hủy
- `BOOKING_PAYMENT_SUCCESS` - Thanh toán thành công
- `BOOKING_PAYMENT_FAILED` - Thanh toán thất bại
- `BOOKING_REFUND_SUCCESS` - Hoàn tiền thành công
- `BOOKING_REMINDER` - Nhắc nhở booking sắp tới

---

### 19.2. Get Unread Count

**Endpoint:** `GET /v1/miniapp/notifications/unread-count`

**Auth Required:** ✅ Customer

---

### 19.3. Mark as Read

**Endpoint:** `PATCH /v1/miniapp/notifications/:id/read`

**Auth Required:** ✅ Customer

---

### 19.4. Mark All as Read

**Endpoint:** `PATCH /v1/miniapp/notifications/read-all`

**Auth Required:** ✅ Customer

---

### 19.5. Delete Notification

**Endpoint:** `DELETE /v1/miniapp/notifications/:id`

**Auth Required:** ✅ Customer

---

### 19.6. Delete All Read

**Endpoint:** `DELETE /v1/miniapp/notifications/read-all`

**Auth Required:** ✅ Customer

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

## Common Use Cases

### Flow 1: User đặt bàn lần đầu

```
1. GET /miniapp/restaurants/home/top-rated
   → Xem nhà hàng nổi bật

2. GET /miniapp/restaurants/1
   → Xem chi tiết

3. GET /miniapp/bookings/available-tables
   → Kiểm tra bàn trống

4. POST /miniapp/bookings
   → Tạo booking (PENDING)

5. POST /miniapp/bookings/101/pay-deposit
   → Thanh toán (PAID)
   → Nhận email

6. Wait for confirm...
   → Restaurant confirm

7. Đến nhà hàng
   → Restaurant mark COMPLETED

8. POST /miniapp/reviews/bookings/101/comment
   → Review
```

---

### Flow 2: Dashboard quản lý booking

```
1. GET /dashboard/bookings? status=PENDING
   → Xem booking chờ

2. PATCH /dashboard/bookings/101/confirm
   → Xác nhận

3. Khách đến...
   → PATCH /dashboard/bookings/101/complete

4. Customer review
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

- Email: backend@restaurant-booking.com
- Slack: #backend-support

**API Status:**

- https://status.restaurant-booking.com

---

**Last Updated:** 2025-12-20  
**Version:** 1.0.0
