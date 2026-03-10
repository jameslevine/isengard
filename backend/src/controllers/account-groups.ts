import { ERROR_MESSAGES, HTTP_STATUS } from "../constants";
import {
  createDbAccountGroup,
  deleteDbAccountGroup,
  getDbAccountGroups,
} from "../adapters/account-groups";

import { AuthenticatedRequest } from "../types";
import { Response } from "express";

export const listAccountGroups = async (
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
    const groups = await getDbAccountGroups(orgId);
    res.status(HTTP_STATUS.OK).json({ items: groups });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing account groups:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const createAccountGroup = async (
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
    const group = await createDbAccountGroup(orgId, req.body);
    res.status(HTTP_STATUS.CREATED).json({
      groupId: group.groupId,
      groupName: group.groupName,
      message: "Account group created successfully",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating account group:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const deleteAccountGroup = async (
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
    const groupId = req.params.groupId as string;
    await deleteDbAccountGroup(orgId, groupId);
    res
      .status(HTTP_STATUS.OK)
      .json({ groupId, message: "Account group deleted" });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting account group:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};
