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
  TOKEN_TYPES,
} from "../constants/index.js";
import { hashPassword, comparePassword } from "../utils/password.util.js";
import {
  _safeNotify,
  notifyStaffRegistered,
} from "../utils/notificationHelper.util.js";
//import { fetchZaloProfile, fetchZaloPhoneNumber } from "../utils/zalo.util.js";

import {
  issueTokens,
  refreshTokens,
  revokeTokenById,
} from "./token.service.js";
import { verifyRefreshToken } from "../utils/jwt.js";
import { buildRestaurantSearchFields } from "../utils/search.util.js";

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

  const searchFields = buildRestaurantSearchFields({
    restaurant_name,
    restaurant_address,
  });

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
        ...searchFields,
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

  _safeNotify(() => notifyStaffRegistered(account, restaurant));

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
// =========================
// 5) MINIAPP LOCAL REGISTER (email + password)
// =========================

/**
 * Đăng ký tài khoản khách hàng cho miniapp (local account)
 * - Tạo user với password_hash
 * - Không phụ thuộc Zalo
 * - Trả về user + tokens như Zalo login
 */
export const registerMiniAppLocal = async (payload) => {
  const { display_name, email, password, phone } = payload;

  // 1. Kiểm tra email đã tồn tại chưa
  const existing = await User.findOne({ where: { email } });
  if (existing) {
    // Có thể refine sau: nếu existing.password_hash = null thì cho phép "set password"
    throw new AppError("Email đã được sử dụng cho tài khoản khác", 409);
  }

  // 2. Hash mật khẩu
  const passwordHash = await hashPassword(password);

  // 3. Tạo user mới
  const user = await User.create({
    display_name,
    email,
    phone: phone || null,
    password_hash: passwordHash,
  });

  // 4. Cấp token cho miniapp
  const tokens = await issueTokens({
    subjectId: user.id,
    subjectType: SUBJECT_TYPES.CUSTOMER,
    role: AUTH_ROLES.CUSTOMER,
    provider: AUTH_PROVIDERS.LOCAL,
  });

  return { user, tokens };
};

// =========================
// 6) MINIAPP LOCAL LOGIN (email + password)
// =========================

/**
 * Đăng nhập miniapp bằng email + password (local)
 * - Tìm user theo email
 * - Check đã có password_hash chưa
 * - So sánh mật khẩu
 * - Trả về user + tokens
 */
export const loginMiniAppLocal = async (payload) => {
  const { email, password } = payload;

  // 1. Tìm user theo email
  const user = await User.findOne({ where: { email } });

  // 2. Email không tồn tại hoặc chưa có password_hash → không cho login local
  if (!user || !user.password_hash) {
    throw new AppError("Email hoặc mật khẩu không chính xác", 401);
  }

  // 3. So sánh mật khẩu
  const isMatch = await comparePassword(password, user.password_hash);
  if (!isMatch) {
    throw new AppError("Email hoặc mật khẩu không chính xác", 401);
  }

  // 4. Cấp token
  const tokens = await issueTokens({
    subjectId: user.id,
    subjectType: SUBJECT_TYPES.CUSTOMER,
    role: AUTH_ROLES.CUSTOMER,
    provider: AUTH_PROVIDERS.LOCAL,
  });

  return { user, tokens };
};

// =========================
// 7) REFRESH TOKEN CHUNG (MINIAPP + DASHBOARD)
// =========================

/**
 * Làm mới cặp accessToken + refreshToken.
 * Dùng chung cho:
 *  - CUSTOMER (miniapp, SUBJECT_TYPES.CUSTOMER)
 *  - RESTAURANT_ACCOUNT (dashboard)
 *
 * @param {string} refreshToken
 * @returns {Promise<{ tokens, user?, account?, restaurant? }>}
 */
export const refreshAuthTokens = async (refreshToken) => {
  // Dùng hàm refreshTokens của token.service để:
  // - verify JWT refresh
  // - check record trong bảng auth_tokens
  // - rotate token (revoke cũ, tạo mới)
  // - load lại principal (user hoặc restaurant_account)
  const {
    accessToken,
    refreshToken: newRefreshToken,
    principal,
  } = await refreshTokens(refreshToken, async (sub, subType) => {
    // Hàm này định nghĩa "principal" tuỳ theo loại subject
    if (subType === SUBJECT_TYPES.CUSTOMER) {
      const user = await User.findByPk(sub);
      if (!user) return null;

      return {
        subjectType: SUBJECT_TYPES.CUSTOMER,
        model: user, // giữ model để controller dùng DTO
        role: AUTH_ROLES.CUSTOMER,
        provider: AUTH_PROVIDERS.ZALO,
      };
    }

    if (subType === SUBJECT_TYPES.RESTAURANT_ACCOUNT) {
      const account = await RestaurantAccount.findByPk(sub);
      if (!account) return null;

      return {
        subjectType: SUBJECT_TYPES.RESTAURANT_ACCOUNT,
        model: account,
        role: account.role, // OWNER / STAFF
        provider: AUTH_PROVIDERS.LOCAL,
      };
    }

    return null;
  });

  // Chuẩn hoá kết quả trả về cho controller
  const result = {
    tokens: {
      accessToken,
      refreshToken: newRefreshToken,
    },
  };

  if (!principal) {
    return result;
  }

  // Case miniapp: CUSTOMER
  if (principal.subjectType === SUBJECT_TYPES.CUSTOMER) {
    result.user = principal.model;
  }

  // Case dashboard: RESTAURANT_ACCOUNT
  if (principal.subjectType === SUBJECT_TYPES.RESTAURANT_ACCOUNT) {
    const account = principal.model;
    const restaurant = await Restaurant.findByPk(account.restaurant_id);

    result.account = account;
    result.restaurant = restaurant;
  }

  return result;
};

// =========================
// 8) LOGOUT 1 PHIÊN (dùng refreshToken)
// =========================

/**
 * Logout 1 session hiện tại:
 *  - Verify refreshToken
 *  - Lấy tid (token_id) từ payload
 *  - Revoke record tương ứng trong auth_tokens
 *
 * Không quan trọng subject là customer hay restaurant_account.
 */
export const logoutSession = async (refreshToken) => {
  if (!refreshToken) {
    throw new AppError("Thiếu refreshToken trong request", 400);
  }

  let payload;
  try {
    payload = verifyRefreshToken(refreshToken);
  } catch (err) {
    err.statusCode = 401;
    throw err;
  }

  const { tid, type } = payload;

  if (type !== TOKEN_TYPES.REFRESH) {
    throw new AppError("Token không phải loại refresh hợp lệ", 400);
  }

  if (!tid) {
    throw new AppError("Refresh token không chứa token_id (tid) hợp lệ", 400);
  }

  // Revoke đúng 1 refresh token (tức 1 session)
  await revokeTokenById(tid);
};
