import {
  AuditAction,
  AuditLogEntry,
  PaginatedResponse,
  ResourceType,
} from "../types";
import { DB_PREFIX, DEFAULTS } from "../constants";
import { PutCommand, QueryCommand } from "@aws-sdk/lib-dynamodb";

import crypto from "crypto";
import dayjs from "dayjs";
import { dynamodb } from "../lib/dynamodb";

const TABLE_NAME = process.env.AUDIT_LOG_TABLE!;

export const createAuditLogEntry = async (data: {
  action: AuditAction;
  actorId: string;
  actorEmail: string;
  accountId: string;
  resourceType: ResourceType;
  resourceId: string;
  details?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
}): Promise<AuditLogEntry> => {
  const now = dayjs().toISOString();
  const auditId = crypto.randomUUID();

  const entry: AuditLogEntry = {
    pk: `${DB_PREFIX.ACCOUNT}${data.accountId}`,
    sk: `${DB_PREFIX.AUDIT}${now}#${auditId}`,
    auditId,
    action: data.action,
    actorId: data.actorId,
    actorEmail: data.actorEmail,
    accountId: data.accountId,
    resourceType: data.resourceType,
    resourceId: data.resourceId,
    details: data.details,
    ipAddress: data.ipAddress,
    userAgent: data.userAgent,
    timestamp: now,
  };

  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...entry,
      gsi1pk: `${DB_PREFIX.ACTOR}${data.actorId}`,
      gsi1sk: `${DB_PREFIX.AUDIT}${now}`,
    },
  };

  await dynamodb.send(new PutCommand(params));
  return entry;
};

export const getDbAuditLogsByAccountId = async (
  accountId: string,
  limit: number = DEFAULTS.AUDIT_PAGINATION_LIMIT,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<PaginatedResponse<AuditLogEntry>> => {
  const params = {
    TableName: TABLE_NAME,
    KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
    ExpressionAttributeValues: {
      ":pk": `${DB_PREFIX.ACCOUNT}${accountId}`,
      ":skPrefix": DB_PREFIX.AUDIT,
    },
    ScanIndexForward: false,
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  const response = await dynamodb.send(new QueryCommand(params));

  return {
    items: (response.Items || []) as AuditLogEntry[],
    nextToken: response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
          "base64"
        )
      : undefined,
  };
};

export const getDbAuditLogsByActorId = async (
  actorId: string,
  limit: number = DEFAULTS.AUDIT_PAGINATION_LIMIT,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<PaginatedResponse<AuditLogEntry>> => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: "gsi1",
    KeyConditionExpression: "gsi1pk = :gsi1pk",
    ExpressionAttributeValues: {
      ":gsi1pk": `${DB_PREFIX.ACTOR}${actorId}`,
    },
    ScanIndexForward: false,
    Limit: limit,
    ExclusiveStartKey: lastEvaluatedKey,
  };

  const response = await dynamodb.send(new QueryCommand(params));

  return {
    items: (response.Items || []) as AuditLogEntry[],
    nextToken: response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
          "base64"
        )
      : undefined,
  };
};
