import { DB_PREFIX, DEFAULTS } from "../constants";
import {
  PaginatedResponse,
  Violation,
  ViolationSeverity,
  ViolationStatus,
  ViolationType,
} from "../types";
import { PutCommand, QueryCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";

import crypto from "crypto";
import dayjs from "dayjs";
import { dynamodb } from "../lib/dynamodb";

const TABLE_NAME = process.env.VIOLATIONS_TABLE!;

export const createDbViolation = async (
  orgId: string,
  data: {
    accountId: string;
    violationType: ViolationType;
    severity: ViolationSeverity;
    description: string;
    resourceArn?: string;
  }
): Promise<Violation> => {
  const now = dayjs().toISOString();
  const violationId = crypto.randomUUID();

  const violation: Violation = {
    pk: `${DB_PREFIX.ACCOUNT}${data.accountId}`,
    sk: `${DB_PREFIX.VIOLATION}${violationId}`,
    violationId,
    violationType: data.violationType,
    severity: data.severity,
    description: data.description,
    resourceArn: data.resourceArn,
    status: ViolationStatus.OPEN,
    detectedAt: now,
  };

  await dynamodb.send(
    new PutCommand({
      TableName: TABLE_NAME,
      Item: {
        ...violation,
        gsi1pk: `${DB_PREFIX.ORG}${orgId}${DB_PREFIX.STATUS}${ViolationStatus.OPEN}`,
        gsi1sk: `${DB_PREFIX.SEVERITY}${data.severity}#${now}`,
      },
    })
  );
  return violation;
};

export const getDbViolationsByAccountId = async (
  accountId: string,
  limit: number = DEFAULTS.PAGINATION_LIMIT,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<PaginatedResponse<Violation>> => {
  const response = await dynamodb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": `${DB_PREFIX.ACCOUNT}${accountId}`,
        ":skPrefix": DB_PREFIX.VIOLATION,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    })
  );

  return {
    items: (response.Items || []) as Violation[],
    nextToken: response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
          "base64"
        )
      : undefined,
  };
};

export const getDbViolationsByOrg = async (
  orgId: string,
  status: ViolationStatus = ViolationStatus.OPEN,
  limit: number = DEFAULTS.PAGINATION_LIMIT,
  lastEvaluatedKey?: Record<string, unknown>
): Promise<PaginatedResponse<Violation>> => {
  const response = await dynamodb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: "gsi1",
      KeyConditionExpression: "gsi1pk = :gsi1pk",
      ExpressionAttributeValues: {
        ":gsi1pk": `${DB_PREFIX.ORG}${orgId}${DB_PREFIX.STATUS}${status}`,
      },
      ScanIndexForward: false,
      Limit: limit,
      ExclusiveStartKey: lastEvaluatedKey,
    })
  );

  return {
    items: (response.Items || []) as Violation[],
    nextToken: response.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(response.LastEvaluatedKey)).toString(
          "base64"
        )
      : undefined,
  };
};

export const acknowledgeDbViolation = async (
  accountId: string,
  violationId: string,
  userId: string
): Promise<Violation> => {
  const now = dayjs().toISOString();
  const response = await dynamodb.send(
    new UpdateCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${DB_PREFIX.ACCOUNT}${accountId}`,
        sk: `${DB_PREFIX.VIOLATION}${violationId}`,
      },
      UpdateExpression:
        "SET #status = :status, #acknowledgedBy = :userId, #resolvedAt = :now",
      ExpressionAttributeNames: {
        "#status": "status",
        "#acknowledgedBy": "acknowledgedBy",
        "#resolvedAt": "resolvedAt",
      },
      ExpressionAttributeValues: {
        ":status": ViolationStatus.ACKNOWLEDGED,
        ":userId": userId,
        ":now": now,
      },
      ReturnValues: "ALL_NEW",
    })
  );
  return response.Attributes as Violation;
};
