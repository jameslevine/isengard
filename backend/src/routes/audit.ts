import { getAccountHistory, getUserHistory } from "../controllers/audit";

import { Router } from "express";

export const router = Router();

// GET /v1/accounts/:accountId/history
router.get("/:accountId/history", getAccountHistory);

// GET /v1/users/:userId/history
router.get("/users/:userId/history", getUserHistory);
