import {
  createDbAccount,
  getDbAccountByAwsAccountId,
  getDbAccountById,
  getDbAccountsByOrgId,
  updateDbAccount,
} from "../../adapters/accounts";
import {
  getAccount,
  listAccounts,
  registerAccount,
  updateAccount,
} from "../../controllers/accounts";

import { AuthenticatedRequest } from "../../types";
import { Response } from "express";

// Mock the adapters
jest.mock("../../adapters/accounts", () => ({
  createDbAccount: jest.fn(),
  getDbAccountById: jest.fn(),
  getDbAccountsByOrgId: jest.fn(),
  getDbAccountByAwsAccountId: jest.fn(),
  updateDbAccount: jest.fn(),
}));

const mockUser = {
  sub: "test-user-id",
  email: "test@example.com",
  "cognito:username": "testuser",
  "custom:orgId": "test-org",
  token_use: "access",
  auth_time: Date.now(),
  iss: "test",
  exp: Date.now() + 3600000,
  iat: Date.now(),
};

const mockAccount = {
  pk: "ORG#test-org",
  sk: "ACCOUNT#123456789012",
  accountId: "123456789012",
  accountName: "Test Account",
  email: "test@company.com",
  description: "A test account for testing purposes",
  accountType: "SERVICE",
  classification: "NON_PRODUCTION",
  dataSensitivity: {
    customerData: false,
    customerMetadata: false,
    businessData: false,
  },
  primaryOwnerId: "test-user-id",
  secondaryOwnerIds: [],
  externalId: "IsengardExternalId-test-uuid",
  controlRoleStatus: "PENDING",
  status: "ACTIVE",
  createdAt: "2026-03-09T10:00:00.000Z",
  updatedAt: "2026-03-09T10:00:00.000Z",
};

describe("Accounts Controller", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: mockUser,
      body: {},
      params: {},
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("registerAccount", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;

      await registerAccount(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 409 if account already exists", async () => {
      mockReq.body = {
        accountId: "123456789012",
        accountName: "Test",
        email: "test@test.com",
        description: "Test account description here",
        accountType: "SERVICE",
        classification: "NON_PRODUCTION",
        dataSensitivity: {
          customerData: false,
          customerMetadata: false,
          businessData: false,
        },
      };
      (getDbAccountByAwsAccountId as jest.Mock).mockResolvedValue(mockAccount);

      await registerAccount(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(409);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: "Account already registered",
        })
      );
    });

    it("should create account and return 201", async () => {
      mockReq.body = {
        accountId: "123456789012",
        accountName: "Test Account",
        email: "test@company.com",
        description: "A test account for testing purposes",
        accountType: "SERVICE",
        classification: "NON_PRODUCTION",
        dataSensitivity: {
          customerData: false,
          customerMetadata: false,
          businessData: false,
        },
      };
      (getDbAccountByAwsAccountId as jest.Mock).mockResolvedValue(null);
      (createDbAccount as jest.Mock).mockResolvedValue(mockAccount);

      await registerAccount(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: "123456789012",
          accountName: "Test Account",
          controlRoleStatus: "PENDING",
          status: "ACTIVE",
        })
      );
    });
  });

  describe("getAccount", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;

      await getAccount(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 404 if account not found", async () => {
      mockReq.params = { accountId: "123456789012" };
      (getDbAccountById as jest.Mock).mockResolvedValue(null);

      await getAccount(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return account data", async () => {
      mockReq.params = { accountId: "123456789012" };
      (getDbAccountById as jest.Mock).mockResolvedValue(mockAccount);

      await getAccount(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockAccount);
    });
  });

  describe("listAccounts", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;

      await listAccounts(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return paginated accounts", async () => {
      const paginatedResult = {
        items: [mockAccount],
        nextToken: undefined,
      };
      (getDbAccountsByOrgId as jest.Mock).mockResolvedValue(paginatedResult);

      await listAccounts(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(paginatedResult);
    });

    it("should handle invalid pagination token", async () => {
      mockReq.query = { nextToken: "invalid-base64" };

      await listAccounts(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(400);
    });
  });

  describe("updateAccount", () => {
    it("should return 401 if user is not authenticated", async () => {
      mockReq.user = undefined;

      await updateAccount(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return 404 if account not found", async () => {
      mockReq.params = { accountId: "123456789012" };
      mockReq.body = { accountName: "Updated Name" };
      (getDbAccountById as jest.Mock).mockResolvedValue(null);

      await updateAccount(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should update account and return 200", async () => {
      mockReq.params = { accountId: "123456789012" };
      mockReq.body = { accountName: "Updated Name" };
      (getDbAccountById as jest.Mock).mockResolvedValue(mockAccount);
      (updateDbAccount as jest.Mock).mockResolvedValue({
        ...mockAccount,
        accountName: "Updated Name",
      });

      await updateAccount(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accountId: "123456789012",
          message: "Account updated successfully",
        })
      );
    });
  });
});
