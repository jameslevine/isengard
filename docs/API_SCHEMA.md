# Isengard — API Schema

## Base URL

```
Production: https://api.isengard.example.com/v1
Development: http://localhost:3000/v1
```

## Versioning Strategy

API versioning is done via URL path prefix (`/v1`). Breaking changes will increment the version number.

## Authentication

All API endpoints (except health check) require a valid **Cognito JWT** token in the `Authorization` header:

```
Authorization: Bearer <cognito-jwt-token>
```

The backend validates the token using `aws-jwt-verify` against the configured Cognito User Pool.

## Error Response Format

All errors follow a consistent structure:

```json
{
  "message": "Human-readable error description",
  "details": "Optional additional context"
}
```

### Standard Error Codes

| Status Code | Meaning |
|-------------|---------|
| 400 | Bad Request — Validation error |
| 401 | Unauthorized — Missing or invalid token |
| 403 | Forbidden — Insufficient permissions |
| 404 | Not Found — Resource doesn't exist |
| 409 | Conflict — Resource already exists |
| 429 | Too Many Requests — Rate limit exceeded |
| 500 | Internal Server Error |

## Pagination

List endpoints support cursor-based pagination:

```
GET /v1/accounts?limit=20&nextToken=<base64-encoded-key>
```

Response includes:

```json
{
  "items": [...],
  "nextToken": "base64-encoded-key-or-null"
}
```

---

## Endpoints

### Health Check

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/health` | No | Service health check |

**Response** `200 OK`:
```json
{
  "status": "healthy",
  "timestamp": "2026-03-09T10:00:00.000Z"
}
```

---

### Accounts

#### List Accounts

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/accounts` | Yes | List all accounts for the user's organization |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Max results (default 20, max 100) |
| nextToken | string | No | Pagination token |
| classification | string | No | Filter: `PRODUCTION` or `NON_PRODUCTION` |
| status | string | No | Filter: `ACTIVE` or `SUSPENDED` |
| groupId | string | No | Filter by account group |
| search | string | No | Search by name, ID, or email |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "accountId": "123456789012",
      "accountName": "Production API",
      "email": "prod-api@company.com",
      "description": "Production API service account",
      "accountType": "SERVICE",
      "classification": "PRODUCTION",
      "dataSensitivity": {
        "customerData": true,
        "customerMetadata": false,
        "businessData": true
      },
      "primaryOwnerId": "user-uuid-1",
      "secondaryOwnerIds": ["user-uuid-2"],
      "groupOwnerId": "group-uuid-1",
      "controlRoleStatus": "ACTIVE",
      "status": "ACTIVE",
      "groupId": "folder-uuid-1",
      "createdAt": "2026-03-09T10:00:00.000Z",
      "updatedAt": "2026-03-09T10:00:00.000Z"
    }
  ],
  "nextToken": null
}
```

#### Get Account

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/accounts/:accountId` | Yes | Get account details |

**Path Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| accountId | string | Yes | AWS Account ID (12-digit) |

**Response** `200 OK`:
```json
{
  "accountId": "123456789012",
  "accountName": "Production API",
  "email": "prod-api@company.com",
  "description": "Production API service account",
  "accountType": "SERVICE",
  "classification": "PRODUCTION",
  "dataSensitivity": {
    "customerData": true,
    "customerMetadata": false,
    "businessData": true
  },
  "primaryOwnerId": "user-uuid-1",
  "secondaryOwnerIds": ["user-uuid-2"],
  "groupOwnerId": "group-uuid-1",
  "externalId": "IsengardExternalId-abc123",
  "controlRoleArn": "arn:aws:iam::123456789012:role/IsengardControlRole",
  "controlRoleStatus": "ACTIVE",
  "status": "ACTIVE",
  "groupId": "folder-uuid-1",
  "tags": { "environment": "production", "team": "platform" },
  "createdAt": "2026-03-09T10:00:00.000Z",
  "updatedAt": "2026-03-09T10:00:00.000Z"
}
```

#### Register Account

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/accounts` | Yes | Register an existing AWS account |

**Request Body**:
```json
{
  "accountId": "123456789012",
  "accountName": "Production API",
  "email": "prod-api@company.com",
  "description": "Production API service account for our main product",
  "accountType": "SERVICE",
  "classification": "NON_PRODUCTION",
  "dataSensitivity": {
    "customerData": false,
    "customerMetadata": false,
    "businessData": false
  },
  "groupId": "folder-uuid-1"
}
```

**Validation Rules**:
- `accountId`: Required, 12-digit string
- `accountName`: Required, string, min 3 chars
- `email`: Required, valid email
- `description`: Required, string, min 20 chars
- `accountType`: Required, `PERSONAL` or `SERVICE`
- `classification`: Required, `PRODUCTION` or `NON_PRODUCTION`
- `dataSensitivity`: Required object with boolean fields
- `groupId`: Optional, valid group UUID

**Response** `201 Created`:
```json
{
  "accountId": "123456789012",
  "accountName": "Production API",
  "controlRoleStatus": "PENDING",
  "status": "ACTIVE",
  "message": "Account registered. Control role deployment in progress."
}
```

#### Update Account

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/accounts/:accountId` | Yes | Update account metadata |

**Request Body** (all fields optional):
```json
{
  "accountName": "Updated Name",
  "email": "new-email@company.com",
  "description": "Updated description for the account",
  "accountType": "SERVICE",
  "classification": "PRODUCTION",
  "dataSensitivity": {
    "customerData": true,
    "customerMetadata": false,
    "businessData": true
  },
  "groupId": "folder-uuid-2",
  "tags": { "environment": "production" }
}
```

**Response** `200 OK`:
```json
{
  "accountId": "123456789012",
  "message": "Account updated successfully"
}
```

#### Update Account Classification

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/accounts/:accountId/classification` | Yes | Change production/non-production classification |

**Request Body**:
```json
{
  "classification": "PRODUCTION",
  "dataSensitivity": {
    "customerData": true,
    "customerMetadata": false,
    "businessData": true
  }
}
```

**Business Rules**:
- Upgrading to `PRODUCTION` requires `accountType: SERVICE` and a valid group owner
- Downgrading to `NON_PRODUCTION` requires `ADMIN` role

**Response** `200 OK`:
```json
{
  "accountId": "123456789012",
  "classification": "PRODUCTION",
  "message": "Classification updated successfully"
}
```

---

### Account Ownership

#### Update Ownership

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/accounts/:accountId/ownership` | Yes | Update account owners |

**Request Body**:
```json
{
  "primaryOwnerId": "user-uuid-1",
  "secondaryOwnerIds": ["user-uuid-2", "user-uuid-3"],
  "groupOwnerId": "group-uuid-1"
}
```

**Business Rules**:
- Must have at least 1 secondary owner
- Group owner must have ≤ 64 members
- Only current owners or ADMINs can change ownership

**Response** `200 OK`:
```json
{
  "accountId": "123456789012",
  "message": "Ownership updated successfully"
}
```

---

### Account Groups (Folders)

#### List Account Groups

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/account-groups` | Yes | List all account groups/folders |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "groupId": "folder-uuid-1",
      "groupName": "Production Accounts",
      "description": "All production service accounts",
      "accountCount": 5,
      "createdAt": "2026-03-09T10:00:00.000Z"
    }
  ]
}
```

#### Create Account Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/account-groups` | Yes | Create a new account group/folder |

**Request Body**:
```json
{
  "groupName": "Production Accounts",
  "description": "All production service accounts"
}
```

**Response** `201 Created`:
```json
{
  "groupId": "folder-uuid-1",
  "groupName": "Production Accounts",
  "message": "Account group created successfully"
}
```

#### Update Account Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/account-groups/:groupId` | Yes | Update account group |

#### Delete Account Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/v1/account-groups/:groupId` | Yes | Delete account group (accounts are ungrouped) |

---

### Roles

#### List Roles for Account

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/accounts/:accountId/roles` | Yes | List all roles for an account |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| roleType | string | No | Filter: `CONSOLE`, `APPLICATION`, `DELEGATED` |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "roleId": "role-uuid-1",
      "roleName": "Admin",
      "roleType": "CONSOLE",
      "roleArn": "arn:aws:iam::123456789012:role/Admin",
      "description": "Full administrative access",
      "policyArns": ["arn:aws:iam::aws:policy/AdministratorAccess"],
      "allowedUsers": ["user-uuid-1"],
      "allowedGroups": ["group-uuid-1"],
      "sessionTimeout": 3600,
      "status": "ACTIVE",
      "createdAt": "2026-03-09T10:00:00.000Z"
    }
  ]
}
```

#### Create Role

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/accounts/:accountId/roles` | Yes | Create a new IAM role in the account |

**Request Body**:
```json
{
  "roleName": "Admin",
  "roleType": "CONSOLE",
  "description": "Full administrative access",
  "policyArns": ["arn:aws:iam::aws:policy/AdministratorAccess"],
  "allowedUsers": ["user-uuid-1"],
  "allowedGroups": ["group-uuid-1"],
  "sessionTimeout": 3600
}
```

**Validation Rules**:
- `roleName`: Required, string, alphanumeric + hyphens, max 64 chars
- `roleType`: Required, `CONSOLE`, `APPLICATION`, or `DELEGATED`
- `description`: Required, string, min 10 chars
- `policyArns`: Required, array of valid ARN strings (min 1)
- `allowedUsers`: Optional, array of user UUIDs
- `allowedGroups`: Optional, array of group UUIDs
- `sessionTimeout`: Optional, number, 900-43200 seconds (default 3600)

**Response** `201 Created`:
```json
{
  "roleId": "role-uuid-1",
  "roleName": "Admin",
  "roleArn": "arn:aws:iam::123456789012:role/Admin",
  "message": "Role created successfully"
}
```

#### Update Role

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/accounts/:accountId/roles/:roleId` | Yes | Update role configuration |

**Request Body** (all fields optional):
```json
{
  "description": "Updated description",
  "policyArns": ["arn:aws:iam::aws:policy/ReadOnlyAccess"],
  "allowedUsers": ["user-uuid-1", "user-uuid-2"],
  "allowedGroups": ["group-uuid-1"],
  "sessionTimeout": 7200
}
```

**Response** `200 OK`:
```json
{
  "roleId": "role-uuid-1",
  "message": "Role updated successfully"
}
```

#### Delete Role

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/v1/accounts/:accountId/roles/:roleId` | Yes | Delete a role |

**Response** `200 OK`:
```json
{
  "roleId": "role-uuid-1",
  "message": "Role deleted successfully"
}
```

#### Grant User Permission to Role

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/accounts/:accountId/roles/:roleId/permissions` | Yes | Grant user/group access to a role |

**Request Body**:
```json
{
  "userId": "user-uuid-2",
  "groupId": null
}
```

**Response** `200 OK`:
```json
{
  "message": "Permission granted successfully"
}
```

#### Revoke User Permission from Role

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/v1/accounts/:accountId/roles/:roleId/permissions/:userId` | Yes | Revoke user access from a role |

---

### Federation

#### Federate to Console

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/accounts/:accountId/roles/:roleId/federate` | Yes | Get a federation URL for AWS Console access |

**Request Body** (optional):
```json
{
  "destination": "/ec2/v2/home?region=us-west-2#Instances:",
  "sessionDuration": 3600
}
```

- `destination`: Optional, URL-encoded path to a specific console page
- `sessionDuration`: Optional, override session duration (max: role's sessionTimeout)

**Response** `200 OK`:
```json
{
  "federationUrl": "https://signin.aws.amazon.com/federation?Action=login&SigninToken=...",
  "expiresAt": "2026-03-09T11:00:00.000Z"
}
```

#### Get Temporary Credentials

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/accounts/:accountId/roles/:roleId/credentials` | Yes | Get temporary AWS credentials for CLI/SDK use |

**Request Body** (optional):
```json
{
  "sessionDuration": 3600
}
```

**Response** `200 OK`:
```json
{
  "credentials": {
    "accessKeyId": "ASIAXXXXXXXXXXX",
    "secretAccessKey": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "sessionToken": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
    "expiration": "2026-03-09T11:00:00.000Z"
  },
  "accountId": "123456789012",
  "roleName": "Admin",
  "environment": {
    "bash": "export AWS_ACCESS_KEY_ID=\"ASIAXXXXXXXXXXX\"\nexport AWS_SECRET_ACCESS_KEY=\"xxx\"\nexport AWS_SESSION_TOKEN=\"xxx\"",
    "powershell": "$env:AWS_ACCESS_KEY_ID=\"ASIAXXXXXXXXXXX\"\n$env:AWS_SECRET_ACCESS_KEY=\"xxx\"\n$env:AWS_SESSION_TOKEN=\"xxx\""
  }
}
```

---

### Console Access (Aggregated View)

#### List Console Access

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/console-access` | Yes | List all accounts/roles the user can federate to |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "accountId": "123456789012",
      "accountName": "Production API",
      "classification": "PRODUCTION",
      "roles": [
        {
          "roleId": "role-uuid-1",
          "roleName": "Admin",
          "roleType": "CONSOLE",
          "federateUrl": "/v1/accounts/123456789012/roles/role-uuid-1/federate"
        },
        {
          "roleId": "role-uuid-2",
          "roleName": "ReadOnly",
          "roleType": "CONSOLE",
          "federateUrl": "/v1/accounts/123456789012/roles/role-uuid-2/federate"
        }
      ]
    }
  ]
}
```

---

### Groups (Teams)

#### List Groups

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/groups` | Yes | List all groups in the organization |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "groupId": "group-uuid-1",
      "groupName": "Platform Team",
      "description": "Platform engineering team",
      "memberCount": 5,
      "maxMembers": 64,
      "createdAt": "2026-03-09T10:00:00.000Z"
    }
  ]
}
```

#### Create Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/groups` | Yes | Create a new group |

**Request Body**:
```json
{
  "groupName": "Platform Team",
  "description": "Platform engineering team",
  "memberIds": ["user-uuid-1", "user-uuid-2"]
}
```

**Validation Rules**:
- `groupName`: Required, string, min 3 chars, max 64 chars
- `description`: Required, string, min 10 chars
- `memberIds`: Optional, array of user UUIDs (max 64)

**Response** `201 Created`:
```json
{
  "groupId": "group-uuid-1",
  "groupName": "Platform Team",
  "message": "Group created successfully"
}
```

#### Get Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/groups/:groupId` | Yes | Get group details with members |

**Response** `200 OK`:
```json
{
  "groupId": "group-uuid-1",
  "groupName": "Platform Team",
  "description": "Platform engineering team",
  "members": [
    {
      "userId": "user-uuid-1",
      "email": "alice@company.com",
      "firstName": "Alice",
      "lastName": "Smith"
    }
  ],
  "maxMembers": 64,
  "createdAt": "2026-03-09T10:00:00.000Z",
  "updatedAt": "2026-03-09T10:00:00.000Z"
}
```

#### Update Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/groups/:groupId` | Yes | Update group details |

#### Add Member to Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/groups/:groupId/members` | Yes | Add a user to the group |

**Request Body**:
```json
{
  "userId": "user-uuid-3"
}
```

**Response** `200 OK`:
```json
{
  "message": "Member added successfully"
}
```

#### Remove Member from Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/v1/groups/:groupId/members/:userId` | Yes | Remove a user from the group |

#### Delete Group

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/v1/groups/:groupId` | Yes | Delete a group |

---

### Users

#### List Users

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/users` | Yes | List all users in the organization |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| search | string | No | Search by name or email |
| role | string | No | Filter: `ADMIN`, `MEMBER`, `VIEWER` |
| status | string | No | Filter: `ACTIVE`, `INACTIVE` |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "userId": "user-uuid-1",
      "email": "alice@company.com",
      "firstName": "Alice",
      "lastName": "Smith",
      "role": "ADMIN",
      "status": "ACTIVE",
      "lastLoginAt": "2026-03-09T09:00:00.000Z",
      "createdAt": "2026-01-15T10:00:00.000Z"
    }
  ]
}
```

#### Get Current User

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/users/me` | Yes | Get the authenticated user's profile |

#### Update User Role

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/users/:userId/role` | Yes (Admin) | Update a user's platform role |

**Request Body**:
```json
{
  "role": "MEMBER"
}
```

---

### Audit Log

#### List Account Audit History

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/accounts/:accountId/history` | Yes | Get audit history for an account |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| limit | number | No | Max results (default 50) |
| nextToken | string | No | Pagination token |
| action | string | No | Filter by action type |
| startDate | string | No | ISO 8601 start date |
| endDate | string | No | ISO 8601 end date |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "auditId": "audit-uuid-1",
      "action": "FEDERATE",
      "actorId": "user-uuid-1",
      "actorEmail": "alice@company.com",
      "accountId": "123456789012",
      "resourceType": "ROLE",
      "resourceId": "role-uuid-1",
      "details": {
        "roleName": "Admin",
        "sessionDuration": 3600
      },
      "ipAddress": "192.168.1.1",
      "timestamp": "2026-03-09T10:30:00.000Z"
    }
  ],
  "nextToken": null
}
```

#### List User Audit History

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/users/:userId/history` | Yes | Get audit history for a user |

---

### Violations

#### List Violations for Account

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/accounts/:accountId/violations` | Yes | Get security violations for an account |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter: `OPEN`, `ACKNOWLEDGED`, `RESOLVED` |
| severity | string | No | Filter: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "violationId": "violation-uuid-1",
      "violationType": "ROOT_ACCESS_KEYS",
      "severity": "CRITICAL",
      "description": "Root access keys are active on this account",
      "resourceArn": "arn:aws:iam::123456789012:root",
      "status": "OPEN",
      "detectedAt": "2026-03-09T08:00:00.000Z",
      "resolvedAt": null
    }
  ]
}
```

#### List All Violations (Organization-wide)

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/violations` | Yes | Get all violations across all accounts |

**Query Parameters**:
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| status | string | No | Filter: `OPEN`, `ACKNOWLEDGED`, `RESOLVED` |
| severity | string | No | Filter: `CRITICAL`, `HIGH`, `MEDIUM`, `LOW` |
| limit | number | No | Max results (default 50) |
| nextToken | string | No | Pagination token |

#### Acknowledge Violation

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/accounts/:accountId/violations/:violationId/acknowledge` | Yes | Acknowledge a violation |

**Response** `200 OK`:
```json
{
  "violationId": "violation-uuid-1",
  "status": "ACKNOWLEDGED",
  "message": "Violation acknowledged"
}
```

---

### Policy Templates

#### List Policy Templates

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/policy-templates` | Yes | List available policy templates |

**Response** `200 OK`:
```json
{
  "items": [
    {
      "policyId": "policy-uuid-1",
      "policyName": "AdministratorAccess",
      "description": "Full administrative access",
      "isGlobal": true,
      "version": 1,
      "createdAt": "2026-03-09T10:00:00.000Z"
    }
  ]
}
```

#### Create Policy Template

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/v1/policy-templates` | Yes (Admin) | Create a custom policy template |

**Request Body**:
```json
{
  "policyName": "S3ReadOnly",
  "description": "Read-only access to S3 buckets",
  "policyDocument": "{\"Version\":\"2012-10-17\",\"Statement\":[{\"Effect\":\"Allow\",\"Action\":[\"s3:Get*\",\"s3:List*\"],\"Resource\":\"*\"}]}"
}
```

#### Get Policy Template

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/policy-templates/:policyId` | Yes | Get policy template details |

#### Update Policy Template

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| PATCH | `/v1/policy-templates/:policyId` | Yes (Admin) | Update a policy template |

#### Delete Policy Template

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| DELETE | `/v1/policy-templates/:policyId` | Yes (Admin) | Delete a policy template |

---

### Dashboard

#### Get Dashboard Summary

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/v1/dashboard` | Yes | Get aggregated dashboard data |

**Response** `200 OK`:
```json
{
  "accounts": {
    "total": 25,
    "production": 10,
    "nonProduction": 15,
    "active": 23,
    "suspended": 2
  },
  "violations": {
    "total": 8,
    "critical": 2,
    "high": 3,
    "medium": 2,
    "low": 1
  },
  "recentActivity": [
    {
      "auditId": "audit-uuid-1",
      "action": "FEDERATE",
      "actorEmail": "alice@company.com",
      "accountId": "123456789012",
      "accountName": "Production API",
      "timestamp": "2026-03-09T10:30:00.000Z"
    }
  ],
  "users": {
    "total": 12,
    "active": 10,
    "inactive": 2
  }
}
```

---

## Rate Limiting

API Gateway enforces the following rate limits:

| Tier | Requests/second | Burst |
|------|-----------------|-------|
| Default | 10 | 50 |
| Federation | 5 | 20 |
| Admin operations | 5 | 20 |

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 10
X-RateLimit-Remaining: 9
X-RateLimit-Reset: 1709978400
```
