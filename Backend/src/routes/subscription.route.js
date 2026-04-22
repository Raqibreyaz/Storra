import express from "express";
import {
  createSubscription,
  getSubscription,
  razorpayWebhook,
} from "../controllers/subscription.controller.js";
import checkAuthentication from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.post("/", checkAuthentication, createSubscription);

router.get("/", checkAuthentication, getSubscription);

router.post("/events", razorpayWebhook);

export default router;
