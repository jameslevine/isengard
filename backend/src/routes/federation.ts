import {
  federateToConsole,
  getTemporaryCredentials,
} from "../controllers/federation";

import { Router } from "express";

export const router = Router();

// POST /v1/accounts/:accountId/roles/:roleId/federate
router.post("/:accountId/roles/:roleId/federate", federateToConsole);

// POST /v1/accounts/:accountId/roles/:roleId/credentials
router.post("/:accountId/roles/:roleId/credentials", getTemporaryCredentials);
