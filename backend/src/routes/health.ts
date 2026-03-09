import { Router } from "express";
import { getHealth } from "../controllers/health";

export const router = Router();

router.get("/", getHealth);
