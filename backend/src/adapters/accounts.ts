import {
  Account,
  AccountClassification,
  AccountStatus,
  AccountType,
  ControlRoleStatus,
  DataSensitivity,
  PaginatedResponse,
} from "../types";
import { CONTROL_ROLE, DB_PREFIX, DEFAULTS } from "../constants";
import {
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";

import crypto from "crypto";
import dayjs from "dayjs";
import { dynamodb } from "../lib/dynamodb";

const TABLE_NAME = process.env.ACCOUNTS_TABLE!;

const createPK = (orgId: string): string => `${DB_PREFIX.ORG}${orgId}`;
const createSK = (accountId: string): string =>
  `${DB_PREFIX.ACCOUNT}${accountId}`;
const createGSI1PK = (ownerId: string): string =>
  `${DB_PREFIX.OWNER}${ownerId}`;
const createGSI2PK = (accountId: string): string =>
  `${DB_PREFIX.ACCOUNT_ID}${accountId}`;

export const createDbAccount = async (
  orgId: string,
  data: {
    accountId: string;
    accountName: string;
    email: string;
    description: string;
    accountType: AccountType;
    classification: AccountClassification;
    dataSensitivity: DataSensitivity;
    primaryOwnerId: string;
    groupId?: string;
    tags?: Record<string, string>;
  }
): Promise<Account> => {
  const now = dayjs().toISOString();
  const externalId = `${CONTROL_ROLE.EXTERNAL_ID_PREFIX}${crypto.randomUUID()}`;

  const account: Account = {
    pk: createPK(orgId),
    sk: createSK(data.accountId),
    accountId: data.accountId,
    accountName: data.accountName,
    email: data.email,
    description: data.description,
    accountType: data.accountType,
    classification: data.classification,
    dataSensitivity: data.dataSensitivity,
    primaryOwnerId: data.primaryOwnerId,
    secondaryOwnerIds: [],
    externalId,
    controlRoleStatus: ControlRoleStatus.PENDING,
    status: AccountStatus.ACTIVE,
    groupId: data.groupId,
    tags: data.tags,
    createdAt: now,
    updatedAt: now,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...account,
      gsi1pk: createGSI1PK(data.primaryOwnerId),
      gsi1sk: createSK(data.accountId),
      gsi2pk: createGSI2PK(data.accountId),
      gsi2sk: createPK(orgId),
    },
    ConditionExpression:
      "attribute_not_exists(pk) AND attribute_not_exists(sk)",
  };

  await dynamodb.send(new PutCommand(params));
  return account;
};

export const getDbAccountById = async (
  orgId: string,
  accountId: string
): Promise<Account | null> => {
  const params = {
    TableName: TABLE_NAME,
    Key: {
      pk: createPK(orgId),
      sk: createSK(accountId),
    },
  };

  const response = await dynamodb.send(new GetCommand(params));
  return (response.Item as Account) || null;
};

export const getDbAccountByAwsAccountId = async (
  accountId: string
): Promise<Account | null> => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: "gsi2",
    KeyConditionExpression: "gsi2pk = :gsi2pk",
    ExpressionAttributeValues: {
      ":gsi2pk": createGSI2PK(accountId),
    },
    Limit: 1,
  };

  const response = await dynamodb.send(new QueryCommand(params));
  return (response.Items?.[0] as Account) || null;
};

export const getDbAccountsByOrgId = async (
  orgId: string,
  limit: number = DEFAULTS.PAGINATION_LIMIT,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<PaginatedResponse<Account>> => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: {
      ":pk": createPK(orgId),
      ":skPrefix": DB_PREFIX.ACCOUNT,
    },
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  const response = await dynamodb.send(new QueryCommand(params));

  return {
    items: (response.Items || []) as Account[],
    nextToken: response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
          "base64"
        )
      : undefined,
  };
};

export const getDbAccountsByOwnerId = async (
  ownerId: string,
  limit: number = DEFAULTS.PAGINATION_LIMIT,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<PaginatedResponse<Account>> => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: "gsi1",
    KeyConditionExpression: "gsi1pk = :gsi1pk",
    ExpressionAttributeValues: {
      ":gsi1pk": createGSI1PK(ownerId),
    },
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  const response = await dynamodb.send(new QueryCommand(params));

  return {
    items: (response.Items || []) as Account[],
    nextToken: response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
          "base64"
        )
      : undefined,
  };
};

export const updateDbAccount = async (
  orgId: string,
  accountId: string,
  updates: Partial<
    Pick<
      Account,
      | "accountName"
      | "email"
      | "description"
      | "accountType"
      | "classification"
      | "dataSensitivity"
      | "primaryOwnerId"
      | "secondaryOwnerIds"
      | "groupOwnerId"
      | "controlRoleArn"
      | "controlRoleStatus"
      | "status"
      | "groupId"
      | "tags"
    >
  >
): Promise<Account> => {
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
      pk: createPK(orgId),
      sk: createSK(accountId),
    },
    UpdateExpression: `SET ${updateExpressions.join(", ")}`,
    ExpressionAttributeNames: expressionAttributeNames,
    ExpressionAttributeValues: expressionAttributeValues,
    ConditionExpression: "attribute_exists(pk) AND attribute_exists(sk)",
    ReturnValues: "ALL_NEW" as const,
  };

  const response = await dynamodb.send(new UpdateCommand(params));
  return response.Attributes as Account;
};
