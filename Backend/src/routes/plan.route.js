import express from "express";
import { getPlans } from "../controllers/plan.controller.js";

const router = express.Router();

router.get("/", getPlans);

export default router;
