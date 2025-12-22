// src/tests/unit/utils/password.util.test.js


import { hashPassword, comparePassword } from "../../../utils/password.util.js";

describe("Password Utility", () => {
  describe("hashPassword", () => {
    it("should hash a password successfully", async () => {
      const password = "TestPassword123!";
      const hash = await hashPassword(password);

      expect(hash).toBeDefined();
      expect(hash).not.toBe(password);
      expect(hash.length).toBeGreaterThan(50);
      expect(hash).toMatch(/^\$2[ab]\$/); // bcrypt format
    });

    it("should generate different hashes for same password", async () => {
      const password = "TestPassword123!";
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2); // Salts should be different
    });

    it("should throw error for empty password", async () => {
      await expect(hashPassword("")).rejects.toThrow();
    });
  });

  describe("comparePassword", () => {
    it("should return true for matching password", async () => {
      const password = "TestPassword123! ";
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(password, hash);

      expect(isMatch).toBe(true);
    });

    it("should return false for non-matching password", async () => {
      const password = "TestPassword123!";
      const wrongPassword = "WrongPassword456!";
      const hash = await hashPassword(password);
      const isMatch = await comparePassword(wrongPassword, hash);

      expect(isMatch).toBe(false);
    });

    it("should return false for null hash", async () => {
      const password = "TestPassword123! ";
      const isMatch = await comparePassword(password, null);

      expect(isMatch).toBe(false);
    });
  });
});
