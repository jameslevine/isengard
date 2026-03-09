import { DEFAULTS, ERROR_MESSAGES, HTTP_STATUS } from "../constants";
import {
  getDbAuditLogsByAccountId,
  getDbAuditLogsByActorId,
} from "../adapters/audit";

import { AuthenticatedRequest } from "../types";
import { Response } from "express";

export const getAccountHistory = async (
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

    const accountId = req.params.accountId as string;
    const limit =
      parseInt(req.query.limit as string) || DEFAULTS.AUDIT_PAGINATION_LIMIT;
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

    const result = await getDbAuditLogsByAccountId(
      accountId,
      limit,
      lastEvaluatedKey
    );

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching account history:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const getUserHistory = async (
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

    const userId = req.params.userId as string;
    const limit =
      parseInt(req.query.limit as string) || DEFAULTS.AUDIT_PAGINATION_LIMIT;
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

    const result = await getDbAuditLogsByActorId(
      userId,
      limit,
      lastEvaluatedKey
    );

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching user history:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};
