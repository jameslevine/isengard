import {
  createDbRole,
  deleteDbRole,
  getDbRoleById,
  getDbRolesByAccountId,
  updateDbRole,
} from "../../adapters/roles";
import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from "../../controllers/roles";

import { AuthenticatedRequest } from "../../types";
import { Response } from "express";

jest.mock("../../adapters/roles", () => ({
  createDbRole: jest.fn(),
  getDbRoleById: jest.fn(),
  getDbRolesByAccountId: jest.fn(),
  updateDbRole: jest.fn(),
  deleteDbRole: jest.fn(),
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

const mockRole = {
  pk: "ACCOUNT#123456789012",
  sk: "ROLE#role-uuid",
  roleId: "role-uuid",
  roleName: "Admin",
  roleType: "CONSOLE",
  description: "Full administrative access",
  policyArns: ["arn:aws:iam::aws:policy/AdministratorAccess"],
  allowedUsers: ["test-user-id"],
  allowedGroups: [],
  sessionTimeout: 3600,
  status: "ACTIVE",
  createdAt: "2026-03-09T10:00:00.000Z",
  updatedAt: "2026-03-09T10:00:00.000Z",
};

describe("Roles Controller", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockReq = {
      user: mockUser,
      body: {},
      params: { accountId: "123456789012" },
      query: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
  });

  describe("listRoles", () => {
    it("should return 401 if not authenticated", async () => {
      mockReq.user = undefined;
      await listRoles(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should return roles for account", async () => {
      (getDbRolesByAccountId as jest.Mock).mockResolvedValue({
        items: [mockRole],
      });
      await listRoles(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith({ items: [mockRole] });
    });
  });

  describe("createRole", () => {
    it("should return 401 if not authenticated", async () => {
      mockReq.user = undefined;
      await createRole(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(401);
    });

    it("should create role and return 201", async () => {
      mockReq.body = {
        roleName: "Admin",
        roleType: "CONSOLE",
        description: "Full admin access",
        policyArns: ["arn:aws:iam::aws:policy/AdministratorAccess"],
      };
      (createDbRole as jest.Mock).mockResolvedValue(mockRole);

      await createRole(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          roleId: "role-uuid",
          roleName: "Admin",
        })
      );
    });
  });

  describe("getRole", () => {
    it("should return 404 if role not found", async () => {
      mockReq.params = { accountId: "123456789012", roleId: "missing" };
      (getDbRoleById as jest.Mock).mockResolvedValue(null);

      await getRole(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should return role data", async () => {
      mockReq.params = {
        accountId: "123456789012",
        roleId: "role-uuid",
      };
      (getDbRoleById as jest.Mock).mockResolvedValue(mockRole);

      await getRole(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(mockRole);
    });
  });

  describe("updateRole", () => {
    it("should return 404 if role not found", async () => {
      mockReq.params = {
        accountId: "123456789012",
        roleId: "missing",
      };
      mockReq.body = { description: "Updated" };
      (getDbRoleById as jest.Mock).mockResolvedValue(null);

      await updateRole(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should update role and return 200", async () => {
      mockReq.params = {
        accountId: "123456789012",
        roleId: "role-uuid",
      };
      mockReq.body = { description: "Updated description" };
      (getDbRoleById as jest.Mock).mockResolvedValue(mockRole);
      (updateDbRole as jest.Mock).mockResolvedValue({
        ...mockRole,
        description: "Updated description",
      });

      await updateRole(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });

  describe("deleteRole", () => {
    it("should return 404 if role not found", async () => {
      mockReq.params = {
        accountId: "123456789012",
        roleId: "missing",
      };
      (getDbRoleById as jest.Mock).mockResolvedValue(null);

      await deleteRole(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it("should delete role and return 200", async () => {
      mockReq.params = {
        accountId: "123456789012",
        roleId: "role-uuid",
      };
      (getDbRoleById as jest.Mock).mockResolvedValue(mockRole);
      (deleteDbRole as jest.Mock).mockResolvedValue(undefined);

      await deleteRole(mockReq as AuthenticatedRequest, mockRes as Response);
      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
