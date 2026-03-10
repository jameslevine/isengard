import { ERROR_MESSAGES, HTTP_STATUS } from "../constants";
import {
  acknowledgeDbViolation,
  getDbViolationsByAccountId,
  getDbViolationsByOrg,
} from "../adapters/violations";

import { AuthenticatedRequest } from "../types";
import { Response } from "express";
import { ViolationStatus } from "../types";

export const listViolationsByAccount = async (
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
    const result = await getDbViolationsByAccountId(accountId);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing violations:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const listAllViolations = async (
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
    const status =
      (req.query.status as ViolationStatus) || ViolationStatus.OPEN;
    const result = await getDbViolationsByOrg(orgId, status);
    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing all violations:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const acknowledgeViolation = async (
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
    const violationId = req.params.violationId as string;
    const violation = await acknowledgeDbViolation(
      accountId,
      violationId,
      req.user.sub
    );
    res.status(HTTP_STATUS.OK).json({
      violationId: violation.violationId,
      status: violation.status,
      message: "Violation acknowledged",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error acknowledging violation:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};
