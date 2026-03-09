import {
  createRole,
  deleteRole,
  getRole,
  listRoles,
  updateRole,
} from "../controllers/roles";
import {
  createRoleBodySchema,
  roleParamsSchema,
  updateRoleBodySchema,
} from "../models/roles";
import { validateBody, validateParams } from "../middleware/validation";

import { Router } from "express";

export const router = Router();

// GET /v1/accounts/:accountId/roles
router.get("/:accountId/roles", listRoles);

// POST /v1/accounts/:accountId/roles
router.post(
  "/:accountId/roles",
  validateBody(createRoleBodySchema),
  createRole
);

// GET /v1/accounts/:accountId/roles/:roleId
router.get(
  "/:accountId/roles/:roleId",
  validateParams(roleParamsSchema),
  getRole
);

// PATCH /v1/accounts/:accountId/roles/:roleId
router.patch(
  "/:accountId/roles/:roleId",
  validateParams(roleParamsSchema),
  validateBody(updateRoleBodySchema),
  updateRole
);

// DELETE /v1/accounts/:accountId/roles/:roleId
router.delete(
  "/:accountId/roles/:roleId",
  validateParams(roleParamsSchema),
  deleteRole
);
