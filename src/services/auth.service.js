// src/services/auth.service.js

import models, { sequelize } from "../models/index.js";
import { AppError } from "../utils/appError.js";
import crypto from "crypto";
import {
  SUBJECT_TYPES,
  AUTH_PROVIDERS,
  AUTH_ROLES,
  RESTAURANT_ACCOUNT_ROLE,
  RESTAURANT_ACCOUNT_STATUS,
} from "../constants/index.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
//import { fetchZaloProfile, fetchZaloPhoneNumber } from "../utils/zalo.util.js";

import { issueTokens } from "./token.service.js";

const { User, UserAuthProvider, Restaurant, RestaurantAccount } = models;

// =========================
// 1) OWNER REGISTER + TẠO RESTAURANT
// =========================

/**
 * Đăng ký tài khoản OWNER + tạo luôn nhà hàng.
 * payload:
 *  - full_name
 *  - email
 *  - password
 *  - restaurant_name
 *  - restaurant_address
 *  - restaurant_phone
 *  - restaurant_description (optional)
 */
/**

/**
 * Đăng ký OWNER cho dashboard:
 * - Tạo Restaurant
 * - Tạo RestaurantAccount (OWNER, ACTIVE)
 * - Set invite_code cho restaurant
 * - Trả về: { account, restaurant, tokens }
 */
export const registerDashboardOwner = async (payload) => {
  const {
    full_name,
    email,
    password,
    restaurant_name,
    restaurant_address,
    restaurant_phone,
    restaurant_description,
  } = payload;

  // 1. Kiểm tra email đã tồn tại chưa
  const existing = await RestaurantAccount.findOne({ where: { email } });
  if (existing) {
    throw new AppError("Email đã được sử dụng cho tài khoản khác", 409);
  }

  // 2. Mã hóa password
  const passwordHash = await hashPassword(password);

  // 3. Tạo invite_code ngẫu nhiên
  const code = crypto.randomBytes(4).toString("hex"); // 8 ký tự hex

  // 4. Tạo restaurant + account trong 1 transaction
  const { restaurant, account } = await sequelize.transaction(async (t) => {
    const restaurant = await Restaurant.create(
      {
        name: restaurant_name,
        address: restaurant_address,
        phone: restaurant_phone,
        description: restaurant_description,
        is_active: true, // Mặc định trong schema là true
        invite_code: code,
      },
      { transaction: t }
    );

    const account = await RestaurantAccount.create(
      {
        restaurant_id: restaurant.id,
        full_name,
        email,
        password_hash: passwordHash,
        role: RESTAURANT_ACCOUNT_ROLE.OWNER,
        status: RESTAURANT_ACCOUNT_STATUS.ACTIVE,
      },
      { transaction: t }
    );

    return { restaurant, account };
  });

  // 5. Tạo cặp access/refresh token cho OWNER (subject: RESTAURANT_ACCOUNT)
  const tokens = await issueTokens({
    subjectId: account.id, // chủ yếu là account.id
    subjectType: SUBJECT_TYPES.RESTAURANT_ACCOUNT,
    role: AUTH_ROLES.OWNER,
    provider: AUTH_PROVIDERS.LOCAL,
  });
  // 6. Chuẩn hóa response bằng DTO
  return { account, restaurant, tokens };
};

// =========================
// 2) STAFF REGISTER BẰNG INVITE CODE
// =========================

/**
 * Đăng ký STAFF cho nhà hàng bằng invite_code.
 * payload:
 *  - full_name
 *  - email
 *  - password
 *  - invite_code
 */
export const registerDashboardStaff = async (payload) => {
  const { full_name, email, password, invite_code } = payload;

  // 1. Tìm nhà hàng theo invite_code
  const restaurant = await Restaurant.findOne({
    where: { invite_code },
  });

  if (!restaurant) {
    throw new AppError("Mã lời mời không hợp lệ", 400);
  }

  // 2. Kiểm tra email đã tồn tại chưa
  const existing = await RestaurantAccount.findOne({ where: { email } });
  if (existing) {
    throw new AppError("Email đã được sử dụng cho tài khoản khác", 409);
  }

  // 3. Mã hóa password
  const passwordHash = await hashPassword(password);

  // 4. Tạo tài khoản STAFF với status INVITED
  const account = await RestaurantAccount.create({
    restaurant_id: restaurant.id,
    full_name,
    email,
    password_hash: passwordHash,
    role: RESTAURANT_ACCOUNT_ROLE.STAFF,
    status: RESTAURANT_ACCOUNT_STATUS.INVITED, // hoặc PENDING, tùy bạn dùng constant
  });

  // 5. Trả về thông tin tài khoản + nhà hàng (chưa có token)
  return { account, restaurant };
};

// =========================
// 3) LOGIN DASHBOARD (OWNER / STAFF)
// =========================

/**
 * Đăng nhập dashboard bằng email/password
 * payload:
 *  - email
 *  - password
 */
export const loginDashboard = async (payload) => {
  const { email, password } = payload;

  // 1. Tìm tài khoản theo email
  const account = await RestaurantAccount.findOne({
    where: { email },
  });

  // Không nói rõ "email sai hay pass sai" → tránh lộ info
  if (!account) {
    throw new AppError("Email hoặc mật khẩu không đúng", 401);
  }

  // 2. So sánh password
  const passwordMatch = await comparePassword(password, account.password_hash);
  if (!passwordMatch) {
    throw new AppError("Email hoặc mật khẩu không đúng", 401);
  }

  // 3. Kiểm tra trạng thái tài khoản
  if (account.status !== RESTAURANT_ACCOUNT_STATUS.ACTIVE) {
    throw new AppError("Tài khoản chưa được duyệt hoặc đã bị khóa", 403);
  }

  if (account.is_locked) {
    throw new AppError("Tài khoản đã bị khóa bởi chủ nhà hàng", 403);
  }

  // 4. Lấy thông tin nhà hàng (cho dashboard cần context)
  const restaurant = await Restaurant.findByPk(account.restaurant_id);

  // 5. Tạo cặp access/refresh token
  const tokens = await issueTokens({
    subjectId: account.id,
    subjectType: SUBJECT_TYPES.RESTAURANT_ACCOUNT,
    role: account.role, // OWNER / STAFF
    provider: AUTH_PROVIDERS.LOCAL,
  });

  // 6. Chuẩn hóa response bằng DTO
  return { account, restaurant, tokens };
};

// =========================
// 4) LOGIN MINIAPP BẰNG ZALO (CUSTOMER)
// =========================

/**
 * Đăng nhập Mini App bằng tài khoản Zalo.
 * payload:
 *  - accessToken: lấy từ zmp-sdk getAccessToken() phía FE
 *  - userInfo: lấy từ zmp-sdk getUserInfo() phía FE
 *  - phoneToken (optional): token từ getPhoneNumber() để decode số điện thoại
 *
 * FE flow (pseudo):
 *  - authorize(['scope.userInfo', 'scope.phone'])
 *  - const { accessToken } = await getAccessToken()
 *  - const { userInfo }   = await getUserInfo()
 *  - const phoneToken     = await getPhoneNumber() (tùy)
 *  - POST /public/auth/zalo-login { accessToken, phoneToken }
 */
export const loginWithZalo = async (payload) => {
  const { accessToken, userInfo, phone } = payload;

  if (!accessToken) {
    throw new AppError("Thiếu accessToken của Zalo", 400);
  }

  if (!userInfo) {
    throw new AppError(
      "Thiếu userInfo từ miniapp. Hãy gửi full object từ zmp.getUserInfo().",
      400
    );
  }

  // Trong miniapp, id này là định danh user trong hệ Zalo
  const zaloUserId = userInfo.id || userInfo.userId || userInfo.user_id || null;

  if (!zaloUserId) {
    throw new AppError(
      "Không tìm thấy id người dùng trong userInfo (userInfo.id / userId).",
      400
    );
  }
  // Tên / avatar: tuỳ structure thực tế của zmp-sdk
  const displayName =
    userInfo.name ||
    userInfo.displayName ||
    userInfo.display_name ||
    "Người dùng Zalo";
  const avatarUrl =
    userInfo.avatar || userInfo.avatarUrl || userInfo.avatar_url || null;

  // Nếu có
  const email = userInfo.email || null;
  const phoneNumber = phone || userInfo.phone || null;

  const { user } = await sequelize.transaction(async (t) => {
    let user;
    // 1. Tìm xem đã có link provider chưa
    let userProvider = await UserAuthProvider.findOne({
      where: {
        provider: AUTH_PROVIDERS.ZALO,
        provider_user_id: String(zaloUserId),
      },

      transaction: t,
    });
    if (userProvider) {
      // Đã có user, update info nhẹ
      user = await User.findByPk(userProvider.user_id, { transaction: t });
      if (!user) {
        // Trường hợp hiếm: link còn nhưng user bị xoá
        user = await User.create(
          {
            display_name: displayName,
            email: email || null,
            phone: phoneNumber || null,
            avatar_url: avatarUrl || null,
          },
          { transaction: t }
        );
        userProvider.user_id = user.id;
        await userProvider.save({ transaction: t });
      } else {
        // update thông tin mới nhất từ Zalo
        user.display_name = displayName || user.display_name;
        user.email = email || user.email;
        user.phone = phoneNumber || user.phone;
        user.avatar_url = avatarUrl || user.avatar_url;
        await user.save({ transaction: t });
      }
    } else {
      // 2. Chưa có, tạo mới user + link provider
      user = await User.create(
        {
          display_name: displayName,
          email: email || null,
          phone: phoneNumber || null,
          avatar_url: avatarUrl || null,
        },
        { transaction: t }
      );

      userProvider = await UserAuthProvider.create(
        {
          user_id: user.id,
          provider: AUTH_PROVIDERS.ZALO,
          provider_user_id: String(zaloUserId),
        },
        { transaction: t }
      );
    }
    return { user };
  });

  // 3. Tạo cặp access/refresh token
  const tokens = await issueTokens({
    subjectId: user.id,
    subjectType: SUBJECT_TYPES.CUSTOMER,
    role: AUTH_ROLES.CUSTOMER,
    provider: AUTH_PROVIDERS.ZALO,
  });

  // 4. Chuẩn hóa response bằng DTO
  return { user, tokens };
};
