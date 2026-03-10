import {
  acknowledgeViolation,
  listAllViolations,
  listViolationsByAccount,
} from "../controllers/violations";

import { Router } from "express";

export const router = Router();

// GET /v1/violations - List all org violations
router.get("/", listAllViolations);

// GET /v1/accounts/:accountId/violations
router.get("/:accountId/violations", listViolationsByAccount);

// PATCH /v1/accounts/:accountId/violations/:violationId/acknowledge
router.patch(
  "/:accountId/violations/:violationId/acknowledge",
  acknowledgeViolation
);
