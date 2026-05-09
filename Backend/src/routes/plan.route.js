import express from "express";
import { getPlans } from "../controllers/plan.controller.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.get("/", applyRateLimit("READ"), getPlans);

export default router;
