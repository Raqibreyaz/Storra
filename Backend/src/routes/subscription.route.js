import express from "express";
import {
  cancelSubscription,
  createSubscription,
  getSubscription,
  razorpayWebhook,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import checkAuthentication from "../middlewares/authenticate.middleware.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  cancelSubscriptionSchema,
  createOrUpdateSubscriptionSchema,
} from "../validators/subscription.validator.js";
import { blockFreePlanUpgrade } from "../middlewares/appSetting.middleware.js";

const router = express.Router();

router.post(
  "/events",
  express.json({
    verify(req, res, buf) {
      req.rawBody = buf.toString("utf-8");
    },
  }),
  razorpayWebhook,
);

router.use(express.json());

router.post(
  "/",
  applyRateLimit("WRITE"),
  validate(createOrUpdateSubscriptionSchema),
  blockFreePlanUpgrade, //conditionally blocking upgrade from free plan
  checkAuthentication,
  createSubscription,
);

router.get("/", applyRateLimit("READ"), checkAuthentication, getSubscription);

router.put(
  "/cancel",
  applyRateLimit("MUTATE"),
  validate(cancelSubscriptionSchema),
  checkAuthentication,
  cancelSubscription,
);

router.put(
  "/update",
  applyRateLimit("MUTATE"),
  validate(createOrUpdateSubscriptionSchema),
  checkAuthentication,
  updateSubscription,
);

export default router;
