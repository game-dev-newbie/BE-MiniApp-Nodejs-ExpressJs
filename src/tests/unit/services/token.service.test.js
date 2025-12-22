// src/tests/unit/services/token.service.test.js


import {
  issueTokens,
  verifyAndRotateRefreshToken,
} from "../../../services/token.service.js";
import { SUBJECT_TYPES, AUTH_ROLES } from "../../../constants/index.js";
import models from "../../../models/index.js";

jest.mock("../../../models/index. js");

describe("Token Service", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("issueTokens", () => {
    it("should generate access and refresh tokens", async () => {
      const mockCreate = jest.fn().mockResolvedValue({
        id: 1,
        token_id: "mock-token-id",
      });

      models.AuthToken = {
        create: mockCreate,
      };

      const params = {
        subjectId: 1,
        subjectType: SUBJECT_TYPES.CUSTOMER,
        role: AUTH_ROLES.CUSTOMER,
        provider: "LOCAL",
      };

      const result = await issueTokens(params);

      expect(result).toHaveProperty("accessToken");
      expect(result).toHaveProperty("refreshToken");
      expect(typeof result.accessToken).toBe("string");
      expect(typeof result.refreshToken).toBe("string");
      expect(mockCreate).toHaveBeenCalled();
    });

    it("should throw error if subjectId is missing", async () => {
      const params = {
        subjectType: SUBJECT_TYPES.CUSTOMER,
        role: AUTH_ROLES.CUSTOMER,
      };

      await expect(issueTokens(params)).rejects.toThrow();
    });

    it("should throw error if subjectType is missing", async () => {
      const params = {
        subjectId: 1,
        role: AUTH_ROLES.CUSTOMER,
      };

      await expect(issueTokens(params)).rejects.toThrow();
    });
  });
});
