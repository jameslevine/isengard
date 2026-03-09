// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// DynamoDB Key Prefixes
export const DB_PREFIX = {
  ORG: "ORG#",
  ACCOUNT: "ACCOUNT#",
  ACCOUNT_ID: "ACCOUNT_ID#",
  ROLE: "ROLE#",
  USER: "USER#",
  GROUP: "GROUP#",
  OWNER: "OWNER#",
  EMAIL: "EMAIL#",
  AUDIT: "AUDIT#",
  ACTOR: "ACTOR#",
  POLICY: "POLICY#",
  VIOLATION: "VIOLATION#",
  STATUS: "STATUS#",
  SEVERITY: "SEVERITY#",
  TYPE: "TYPE#",
} as const;

// Default Values
export const DEFAULTS = {
  SESSION_TIMEOUT: 3600,
  MIN_SESSION_TIMEOUT: 900,
  MAX_SESSION_TIMEOUT: 43200,
  MAX_GROUP_MEMBERS: 64,
  MIN_DESCRIPTION_LENGTH: 20,
  MIN_ACCOUNT_NAME_LENGTH: 3,
  ACCOUNT_ID_LENGTH: 12,
  PAGINATION_LIMIT: 20,
  MAX_PAGINATION_LIMIT: 100,
  AUDIT_PAGINATION_LIMIT: 50,
} as const;

// Isengard Control Role
export const CONTROL_ROLE = {
  NAME: "IsengardControlRole",
  EXTERNAL_ID_PREFIX: "IsengardExternalId-",
} as const;

// Federation
export const FEDERATION = {
  SIGNIN_URL: "https://signin.aws.amazon.com/federation",
  CONSOLE_URL: "https://console.aws.amazon.com/",
  ISSUER: "isengard",
} as const;

// Error Messages
export const ERROR_MESSAGES = {
  UNAUTHORIZED: "Unauthorized - User not authenticated",
  FORBIDDEN: "Forbidden - Insufficient permissions",
  ACCOUNT_NOT_FOUND: "Account not found",
  ROLE_NOT_FOUND: "Role not found",
  USER_NOT_FOUND: "User not found",
  GROUP_NOT_FOUND: "Group not found",
  ACCOUNT_ALREADY_EXISTS: "Account already registered",
  ROLE_ALREADY_EXISTS: "Role with this name already exists",
  GROUP_FULL: "Group has reached maximum member limit",
  CONTROL_ROLE_NOT_ACTIVE: "Control role is not active for this account",
  VALIDATION_ERROR: "Validation error",
  INTERNAL_ERROR: "Internal server error",
} as const;
