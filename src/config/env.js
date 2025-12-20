// src/config/env.js
import dotenv from "dotenv";

dotenv.config();

// Server configuration
export const PORT = process.env.PORT || 3000;
export const HOST = process.env.HOST_NAME || "0.0.0.0";
export const NODE_ENV = process.env.NODE_ENV || "development";
export const ENV_PROD = process.env.ENV_PROD || "production";

// Database configuration
export const DB_HOST = process.env.DB_HOST || "localhost";
export const DB_PORT = Number(process.env.DB_PORT || 3306);
export const DB_NAME = process.env.DB_NAME || "restaurant_booking";
export const DB_USER = process.env.DB_USER || "root";
export const DB_PASSWORD = process.env.DB_PASSWORD || null;

// JWT configuration
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET;
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET;
export const ACCESS_TOKEN_MINUTES =
  Number.parseInt(process.env.ACCESS_TOKEN_MINUTES) || 5;
export const REFRESH_TOKEN_DAYS =
  Number.parseInt(process.env.REFRESH_TOKEN_DAYS) || 7;
export const ACCESS_EXPIRES_AT = `${ACCESS_TOKEN_MINUTES}m`;
export const REFRESH_EXPIRES_AT = `${REFRESH_TOKEN_DAYS}d`;

// Zalo configuration
export const ZALO_APP_ID = process.env.ZALO_APP_ID || "";
export const ZALO_APP_SECRET = process.env.ZALO_APP_SECRET || "";
export const ZALO_MINI_APP_ID = process.env.ZALO_MINI_APP_ID || "";
export const ZALO_GRAPH_API_URL =
  process.env.ZALO_GRAPH_API_URL || "https://graph.zalo.me/v2.0/me";

// Gmail SMTP configuration
export const SMTP_HOST = process.env.SMTP_HOST || "smtp.gmail.com";
export const SMTP_PORT = parseInt(process.env.SMTP_PORT) || 587;
export const SMTP_SECURE = process.env.SMTP_SECURE === "true";
export const SMTP_USER = process.env.SMTP_USER;
export const SMTP_PASS = process.env.SMTP_PASS;
export const SMTP_FROM = process.env.SMTP_FROM || "noreply@example.com";
export const SMTP_FROM_NAME =
  process.env.SMTP_FROM_NAME || "Restaurant Booking";
export const EMAIL_ENABLED = process.env.EMAIL_ENABLED !== "false";
export const EMAIL_DEBUG = process.env.EMAIL_DEBUG === "true";
