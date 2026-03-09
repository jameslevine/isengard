import { DB_PREFIX, DEFAULTS } from "../constants";
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { PaginatedResponse, Role, RoleStatus, RoleType } from "../types";

import crypto from "crypto";
import dayjs from "dayjs";
import { dynamodb } from "../lib/dynamodb";

const TABLE_NAME = process.env.ROLES_TABLE!;

export const createDbRole = async (
  accountId: string,
  data: {
    roleName: string;
    roleType: RoleType;
    description: string;
    policyArns: string[];
    allowedUsers?: string[];
    allowedGroups?: string[];
    sessionTimeout?: number;
  }
): Promise<Role> => {
  const now = dayjs().toISOString();
  const roleId = crypto.randomUUID();

  const role: Role = {
    pk: `${DB_PREFIX.ACCOUNT}${accountId}`,
    sk: `${DB_PREFIX.ROLE}${roleId}`,
    roleId,
    roleName: data.roleName,
    roleType: data.roleType,
    description: data.description,
    policyArns: data.policyArns,
    allowedUsers: data.allowedUsers || [],
    allowedGroups: data.allowedGroups || [],
    sessionTimeout: data.sessionTimeout || DEFAULTS.SESSION_TIMEOUT,
    status: RoleStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...role,
      gsi1pk: `${DB_PREFIX.ACCOUNT}${accountId}${DB_PREFIX.TYPE}${data.roleType}`,
      gsi1sk: `${DB_PREFIX.ROLE}${data.roleName}`,
    },
  };

  await dynamodb.send(new PutCommand(params));
  return role;
};

export const getDbRoleById = async (
  accountId: string,
  roleId: string
): Promise<Role | null> => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: `${DB_PREFIX.ACCOUNT}${accountId}`,
      sk: `${DB_PREFIX.ROLE}${roleId}`,
    },
  };

  const response = await dynamodb.send(new GetCommand(params));
  return (response.Item as Role) || null;
};

export const getDbRolesByAccountId = async (
  accountId: string,
  roleType?: RoleType,
  limit: number = DEFAULTS.PAGINATION_LIMIT,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<PaginatedResponse<Role>> => {
  if (roleType) {
    const params = {
      TableName: TABLE_NAME,
      IndexName: "gsi1",
      KeyConditionExpression: "gsi1pk = :gsi1pk",
      ExpressionAttributeValues: {
        ":gsi1pk": `${DB_PREFIX.ACCOUNT}${accountId}${DB_PREFIX.TYPE}${roleType}`,
      },
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    };

    const response = await dynamodb.send(new QueryCommand(params));
    return {
      items: (response.Items || []) as Role[],
      nextToken: response.LastEvaluatedKey
        ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
            "base64"
          )
        : undefined,
    };
  }

  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: {
      ":pk": `${DB_PREFIX.ACCOUNT}${accountId}`,
      ":skPrefix": DB_PREFIX.ROLE,
    },
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  const response = await dynamodb.send(new QueryCommand(params));
  return {
    items: (response.Items || []) as Role[],
    nextToken: response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
          "base64"
        )
      : undefined,
  };
};

export const updateDbRole = async (
  accountId: string,
  roleId: string,
  updates: Partial<
    Pick<
      Role,
      | "description"
      | "policyArns"
      | "allowedUsers"
      | "allowedGroups"
      | "sessionTimeout"
      | "status"
    >
  >
): Promise<Role> => {
  const now = dayjs().toISOString();

  const updateExpressions: string[] = ["#updatedAt = :updatedAt"];
  const expressionAttributeNames: Record<string, string> = {
    "#updatedAt": "updatedAt",
  };
  const expressionAttributeValues: Record<string, unknown> = {
    ":updatedAt": now,
  };

  for (const [key, value] of Object.entries(updates)) {
    if (value !== undefined) {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = value;
    }
  }

  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: `${DB_PREFIX.ACCOUNT}${accountId}`,
      sk: `${DB_PREFIX.ROLE}${roleId}`,
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: "attribute_exists(pk) AND attribute_exists(sk)",
    ReturnValues: "ALL_NEW" as const,
  };

  const response = await dynamodb.send(new UpdateCommand(params));
  return response.Attributes as Role;
};

export const deleteDbRole = async (
  accountId: string,
  roleId: string
): Promise<void> => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: `${DB_PREFIX.ACCOUNT}${accountId}`,
      sk: `${DB_PREFIX.ROLE}${roleId}`,
    },
  };

  await dynamodb.send(new DeleteCommand(params));
};
