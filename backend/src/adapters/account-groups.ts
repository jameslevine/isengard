import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

import { DB_PREFIX } from "../constants";
import crypto from "crypto";
import dayjs from "dayjs";
import { dynamodb } from "../lib/dynamodb";

const TABLE_NAME = process.env.GROUPS_TABLE!;

export interface AccountGroup {
  pk: string;
  sk: string;
  groupId: string;
  groupName: string;
  description: string;
  createdAt: string;
  updatedAt: string;
}

export const createDbAccountGroup = async (
  orgId: string,
  data: { groupName: string; description: string }
): Promise<AccountGroup> => {
  const now = dayjs().toISOString();
  const groupId = crypto.randomUUID();

  const group: AccountGroup = {
    pk: `${DB_PREFIX.ORG}${orgId}`,
    sk: `${DB_PREFIX.GROUP}${groupId}`,
    groupId,
    groupName: data.groupName,
    description: data.description,
    createdAt: now,
    updatedAt: now,
  };

  await dynamodb.send(new PutCommand({ TableName: TABLE_NAME, Item: group }));
  return group;
};

export const getDbAccountGroups = async (
  orgId: string
): Promise<AccountGroup[]> => {
  const response = await dynamodb.send(
    new QueryCommand({
      TableName: TABLE_NAME,
      KeyConditionExpression: "pk = :pk AND begins_with(sk, :skPrefix)",
      ExpressionAttributeValues: {
        ":pk": `${DB_PREFIX.ORG}${orgId}`,
        ":skPrefix": DB_PREFIX.GROUP,
      },
    })
  );
  return (response.Items || []) as AccountGroup[];
};

export const getDbAccountGroupById = async (
  orgId: string,
  groupId: string
): Promise<AccountGroup | null> => {
  const response = await dynamodb.send(
    new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${DB_PREFIX.ORG}${orgId}`,
        sk: `${DB_PREFIX.GROUP}${groupId}`,
      },
    })
  );
  return (response.Item as AccountGroup) || null;
};

export const deleteDbAccountGroup = async (
  orgId: string,
  groupId: string
): Promise<void> => {
  await dynamodb.send(
    new DeleteCommand({
      TableName: TABLE_NAME,
      Key: {
        pk: `${DB_PREFIX.ORG}${orgId}`,
        sk: `${DB_PREFIX.GROUP}${groupId}`,
      },
    })
  );
};
