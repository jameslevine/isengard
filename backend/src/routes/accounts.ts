import {
  accountParamsSchema,
  listAccountsQuerySchema,
  registerAccountBodySchema,
  updateAccountBodySchema,
  updateClassificationBodySchema,
  updateOwnershipBodySchema,
} from "../models/accounts";
import {
  getAccount,
  listAccounts,
  registerAccount,
  updateAccount,
  updateClassification,
  updateOwnership,
} from "../controllers/accounts";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../middleware/validation";

import { Router } from "express";

export const router = Router();

// GET /v1/accounts - List all accounts
router.get("/", validateQuery(listAccountsQuerySchema), listAccounts);

// POST /v1/accounts - Register a new account
router.post("/", validateBody(registerAccountBodySchema), registerAccount);

// GET /v1/accounts/:accountId - Get account details
router.get("/:accountId", validateParams(accountParamsSchema), getAccount);

// PATCH /v1/accounts/:accountId - Update account
router.patch(
  "/:accountId",
  validateParams(accountParamsSchema),
  validateBody(updateAccountBodySchema),
  updateAccount
);

// PATCH /v1/accounts/:accountId/classification - Update classification
router.patch(
  "/:accountId/classification",
  validateParams(accountParamsSchema),
  validateBody(updateClassificationBodySchema),
  updateClassification
);

// PATCH /v1/accounts/:accountId/ownership - Update ownership
router.patch(
  "/:accountId/ownership",
  validateParams(accountParamsSchema),
  validateBody(updateOwnershipBodySchema),
  updateOwnership
);
