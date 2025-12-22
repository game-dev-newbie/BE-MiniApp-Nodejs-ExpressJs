// src/tests/setup/testSetup.js

/**
 * Global test setup
 * Runs before all tests
 */

// Set test environment
process.env.NODE_ENV = "test";
process.env.ACCESS_TOKEN_SECRET = "test-access-secret-key";
process.env.REFRESH_TOKEN_SECRET = "test-refresh-secret-key";
process.env.ACCESS_TOKEN_MINUTES = "30";
process.env.REFRESH_TOKEN_DAYS = "7";

// Mock console to reduce noise
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Increase timeout for integration tests
jest.setTimeout(10000);

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
});
// Close DB connection after all tests
afterAll(async () => {
  const { sequelize } = await import("../../models/index.js");
  await sequelize.close();
});