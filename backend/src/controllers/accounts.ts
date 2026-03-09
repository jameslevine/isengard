import { DEFAULTS, ERROR_MESSAGES, HTTP_STATUS } from "../constants";
import {
  createDbAccount,
  getDbAccountByAwsAccountId,
  getDbAccountById,
  getDbAccountsByOrgId,
  updateDbAccount,
} from "../adapters/accounts";

import { AuthenticatedRequest } from "../types";
import { Response } from "express";

export const registerAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const orgId = req.user["custom:orgId"] || req.user.sub;
    const {
      accountId,
      accountName,
      email,
      description,
      accountType,
      classification,
      dataSensitivity,
      groupId,
      tags,
    } = req.body;

    // Check if account already exists
    const existing = await getDbAccountByAwsAccountId(accountId);
    if (existing) {
      res
        .status(HTTP_STATUS.CONFLICT)
        .json({ message: ERROR_MESSAGES.ACCOUNT_ALREADY_EXISTS });
      return;
    }

    const account = await createDbAccount(orgId, {
      accountId,
      accountName,
      email,
      description,
      accountType,
      classification,
      dataSensitivity,
      primaryOwnerId: req.user.sub,
      groupId,
      tags,
    });

    res.status(HTTP_STATUS.CREATED).json({
      accountId: account.accountId,
      accountName: account.accountName,
      controlRoleStatus: account.controlRoleStatus,
      status: account.status,
      message: "Account registered. Control role deployment in progress.",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error registering account:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const getAccount = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const orgId = req.user["custom:orgId"] || req.user.sub;
    const accountId = req.params.accountId as string;

    const account = await getDbAccountById(orgId, accountId);
    if (!account) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND });
      return;
    }

    res.status(HTTP_STATUS.OK).json(account);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching account:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const listAccounts = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const orgId = req.user["custom:orgId"] || req.user.sub;
    const limit =
      parseInt(req.query.limit as string) || DEFAULTS.PAGINATION_LIMIT;
    const nextToken = req.query.nextToken as string | undefined;

    let lastEvaluatedKey: Record<string, unknown> | undefined;
    if (nextToken) {
      try {
        lastEvaluatedKey = JSON.parse(
          Buffer.from(nextToken, "base64").toString("utf-8")
        );
      } catch {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ message: "Invalid pagination token" });
        return;
      }
    }

    const result = await getDbAccountsByOrgId(orgId, limit, lastEvaluatedKey);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing accounts:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const updateAccount = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const orgId = req.user["custom:orgId"] || req.user.sub;
    const accountId = req.params.accountId as string;

    // Verify account exists
    const existing = await getDbAccountById(orgId, accountId);
    if (!existing) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND });
      return;
    }

    await updateDbAccount(orgId, accountId, req.body);

    res.status(HTTP_STATUS.OK).json({
      accountId,
      message: "Account updated successfully",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating account:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const updateClassification = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const orgId = req.user["custom:orgId"] || req.user.sub;
    const accountId = req.params.accountId as string;
    const { classification, dataSensitivity } = req.body;

    const existing = await getDbAccountById(orgId, accountId);
    if (!existing) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND });
      return;
    }

    await updateDbAccount(orgId, accountId, {
      classification,
      dataSensitivity,
    });

    res.status(HTTP_STATUS.OK).json({
      accountId,
      classification,
      message: "Classification updated successfully",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating classification:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const updateOwnership = async (
  req: AuthenticatedRequest,
  res: Response
) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const orgId = req.user["custom:orgId"] || req.user.sub;
    const accountId = req.params.accountId as string;

    const existing = await getDbAccountById(orgId, accountId);
    if (!existing) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ACCOUNT_NOT_FOUND });
      return;
    }

    await updateDbAccount(orgId, accountId, req.body);

    res.status(HTTP_STATUS.OK).json({
      accountId,
      message: "Ownership updated successfully",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating ownership:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};
