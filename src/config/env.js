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
export const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET
export const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET
export const ACCESS_TOKEN_LIFE = process.env.ACCESS_TOKEN_LIFE
export const REFRESH_TOKEN_LIFE = process.env.REFRESH_TOKEN_LIFE
