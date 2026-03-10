import {
  createAccountGroup,
  deleteAccountGroup,
  listAccountGroups,
} from "../controllers/account-groups";

import { Router } from "express";

export const router = Router();

router.get("/", listAccountGroups);
router.post("/", createAccountGroup);
router.delete("/:groupId", deleteAccountGroup);
