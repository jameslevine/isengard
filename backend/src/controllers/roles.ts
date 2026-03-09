import { AuthenticatedRequest, RoleType } from "../types";
import { ERROR_MESSAGES, HTTP_STATUS } from "../constants";
import {
  createDbRole,
  deleteDbRole,
  getDbRoleById,
  getDbRolesByAccountId,
  updateDbRole,
} from "../adapters/roles";

import { Response } from "express";

export const listRoles = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const accountId = req.params.accountId as string;
    const roleType = req.query.roleType as RoleType | undefined;

    const result = await getDbRolesByAccountId(accountId, roleType);

    res.status(HTTP_STATUS.OK).json(result);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error listing roles:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const createRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const accountId = req.params.accountId as string;

    const role = await createDbRole(accountId, req.body);

    res.status(HTTP_STATUS.CREATED).json({
      roleId: role.roleId,
      roleName: role.roleName,
      roleArn: `arn:aws:iam::${accountId}:role/${role.roleName}`,
      message: "Role created successfully",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error creating role:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const getRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const accountId = req.params.accountId as string;
    const roleId = req.params.roleId as string;

    const role = await getDbRoleById(accountId, roleId);
    if (!role) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ROLE_NOT_FOUND });
      return;
    }

    res.status(HTTP_STATUS.OK).json(role);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error fetching role:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const updateRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const accountId = req.params.accountId as string;
    const roleId = req.params.roleId as string;

    const existing = await getDbRoleById(accountId, roleId);
    if (!existing) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ROLE_NOT_FOUND });
      return;
    }

    await updateDbRole(accountId, roleId, req.body);

    res.status(HTTP_STATUS.OK).json({
      roleId,
      message: "Role updated successfully",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error updating role:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};

export const deleteRole = async (req: AuthenticatedRequest, res: Response) => {
  try {
    if (!req.user) {
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED });
      return;
    }

    const accountId = req.params.accountId as string;
    const roleId = req.params.roleId as string;

    const existing = await getDbRoleById(accountId, roleId);
    if (!existing) {
      res
        .status(HTTP_STATUS.NOT_FOUND)
        .json({ message: ERROR_MESSAGES.ROLE_NOT_FOUND });
      return;
    }

    await deleteDbRole(accountId, roleId);

    res.status(HTTP_STATUS.OK).json({
      roleId,
      message: "Role deleted successfully",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting role:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ message: ERROR_MESSAGES.INTERNAL_ERROR });
  }
};
