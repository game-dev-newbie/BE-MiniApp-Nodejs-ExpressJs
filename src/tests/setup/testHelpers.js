// src/tests/setup/testHelpers.js

import jwt from "jsonwebtoken";
import {
  ACCESS_TOKEN_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../../config/env.js";

/**
 * Generate test JWT token
 */
export const generateTestToken = (payload, type = "access") => {
  const secret = type === "access" ? ACCESS_TOKEN_SECRET : REFRESH_TOKEN_SECRET;
  const expiresIn = type === "access" ? "30m" : "7d";

  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Create mock request object
 */
export const mockRequest = (options = {}) => {
  return {
    body: options.body || {},
    query: options.query || {},
    params: options.params || {},
    headers: options.headers || {},
    user: options.user || null,
    auth: options.auth || null,
    restaurantAccount: options.restaurantAccount || null,
    restaurant: options.restaurant || null,
    ...options,
  };
};

/**
 * Create mock response object
 */
export const mockResponse = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  return res;
};

/**
 * Create mock next function
 */
export const mockNext = () => jest.fn();

/**
 * Mock Sequelize model
 */
export const mockModel = (mockData = {}) => {
  return {
    findAll: jest.fn().mockResolvedValue(mockData.findAll || []),
    findOne: jest.fn().mockResolvedValue(mockData.findOne || null),
    findByPk: jest.fn().mockResolvedValue(mockData.findByPk || null),
    findAndCountAll: jest
      .fn()
      .mockResolvedValue(mockData.findAndCountAll || { rows: [], count: 0 }),
    create: jest.fn().mockResolvedValue(mockData.create || {}),
    update: jest.fn().mockResolvedValue(mockData.update || [1]),
    destroy: jest.fn().mockResolvedValue(mockData.destroy || 1),
    count: jest.fn().mockResolvedValue(mockData.count || 0),
    increment: jest.fn().mockResolvedValue(mockData.increment || [1]),
    decrement: jest.fn().mockResolvedValue(mockData.decrement || [1]),
  };
};
