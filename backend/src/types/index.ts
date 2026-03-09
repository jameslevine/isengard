import { Request } from "express";

export interface AuthenticatedRequest extends Request {
  user?: CognitoJwtPayload;
}

export interface CognitoJwtPayload {
  sub: string;
  email: string;
  "cognito:username": string;
  "custom:orgId"?: string;
  token_use: string;
  auth_time: number;
  iss: string;
  exp: number;
  iat: number;
}

// Account Types
export enum AccountType {
  PERSONAL = "PERSONAL",
  SERVICE = "SERVICE",
}

export enum AccountClassification {
  PRODUCTION = "PRODUCTION",
  NON_PRODUCTION = "NON_PRODUCTION",
}

export enum AccountStatus {
  ACTIVE = "ACTIVE",
  SUSPENDED = "SUSPENDED",
}

export enum ControlRoleStatus {
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  FAILED = "FAILED",
}

export interface DataSensitivity {
  customerData: boolean;
  customerMetadata: boolean;
  businessData: boolean;
}

export interface Account {
  pk: string;
  sk: string;
  accountId: string;
  accountName: string;
  email: string;
  description: string;
  accountType: AccountType;
  classification: AccountClassification;
  dataSensitivity: DataSensitivity;
  primaryOwnerId: string;
  secondaryOwnerIds: string[];
  groupOwnerId?: string;
  externalId: string;
  controlRoleArn?: string;
  controlRoleStatus: ControlRoleStatus;
  status: AccountStatus;
  groupId?: string;
  tags?: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

// Role Types
export enum RoleType {
  CONSOLE = "CONSOLE",
  APPLICATION = "APPLICATION",
  DELEGATED = "DELEGATED",
}

export enum RoleStatus {
  ACTIVE = "ACTIVE",
  ORPHANED = "ORPHANED",
  DELETED = "DELETED",
}

export interface Role {
  pk: string;
  sk: string;
  roleId: string;
  roleName: string;
  roleType: RoleType;
  roleArn?: string;
  description: string;
  policyArns: string[];
  policyTemplateIds?: string[];
  allowedUsers: string[];
  allowedGroups: string[];
  sessionTimeout: number;
  externalId?: string;
  status: RoleStatus;
  createdAt: string;
  updatedAt: string;
}

// User Types
export enum UserRole {
  ADMIN = "ADMIN",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

export enum UserStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}

export interface User {
  pk: string;
  sk: string;
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  cognitoSub: string;
  role: UserRole;
  groupIds: string[];
  status: UserStatus;
  lastLoginAt?: string;
  createdAt: string;
}

// Group Types
export interface Group {
  pk: string;
  sk: string;
  groupId: string;
  groupName: string;
  description: string;
  memberIds: string[];
  maxMembers: number;
  createdAt: string;
  updatedAt: string;
}

// Audit Types
export enum AuditAction {
  REGISTER_ACCOUNT = "REGISTER_ACCOUNT",
  UPDATE_ACCOUNT = "UPDATE_ACCOUNT",
  UPDATE_CLASSIFICATION = "UPDATE_CLASSIFICATION",
  UPDATE_OWNERSHIP = "UPDATE_OWNERSHIP",
  CREATE_ROLE = "CREATE_ROLE",
  UPDATE_ROLE = "UPDATE_ROLE",
  DELETE_ROLE = "DELETE_ROLE",
  GRANT_PERMISSION = "GRANT_PERMISSION",
  REVOKE_PERMISSION = "REVOKE_PERMISSION",
  FEDERATE = "FEDERATE",
  GET_CREDENTIALS = "GET_CREDENTIALS",
  CREATE_GROUP = "CREATE_GROUP",
  UPDATE_GROUP = "UPDATE_GROUP",
  DELETE_GROUP = "DELETE_GROUP",
  ADD_GROUP_MEMBER = "ADD_GROUP_MEMBER",
  REMOVE_GROUP_MEMBER = "REMOVE_GROUP_MEMBER",
}

export enum ResourceType {
  ACCOUNT = "ACCOUNT",
  ROLE = "ROLE",
  USER = "USER",
  GROUP = "GROUP",
}

export interface AuditLogEntry {
  pk: string;
  sk: string;
  auditId: string;
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  accountId: string;
  resourceType: ResourceType;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  timestamp: string;
}

// Violation Types
export enum ViolationType {
  UNMANAGED_IAM_USER = "UNMANAGED_IAM_USER",
  ROOT_ACCESS_KEYS = "ROOT_ACCESS_KEYS",
  S3_BPA_DISABLED = "S3_BPA_DISABLED",
  PASSWORD_LOGIN_ENABLED = "PASSWORD_LOGIN_ENABLED",
  NO_SECONDARY_OWNER = "NO_SECONDARY_OWNER",
  MISSING_DATA_CLASSIFICATION = "MISSING_DATA_CLASSIFICATION",
  INVALID_CTI = "INVALID_CTI",
}

export enum ViolationSeverity {
  CRITICAL = "CRITICAL",
  HIGH = "HIGH",
  MEDIUM = "MEDIUM",
  LOW = "LOW",
}

export enum ViolationStatus {
  OPEN = "OPEN",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  RESOLVED = "RESOLVED",
}

export interface Violation {
  pk: string;
  sk: string;
  violationId: string;
  violationType: ViolationType;
  severity: ViolationSeverity;
  description: string;
  resourceArn?: string;
  status: ViolationStatus;
  detectedAt: string;
  resolvedAt?: string;
  acknowledgedBy?: string;
}

// Pagination
export interface PaginatedResponse<T> {
  items: T[];
  nextToken?: string;
}
