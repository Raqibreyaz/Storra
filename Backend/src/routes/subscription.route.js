import express from "express";
import {
  cancelSubscription,
  createSubscription,
  getSubscription,
  pauseSubscription,
  razorpayWebhook,
  resumeSubscription,
  updateSubscription,
} from "../controllers/subscription.controller.js";
import allowOnlyAuthenticatedUser from "../middlewares/authenticate.middleware.js";
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
  allowOnlyAuthenticatedUser,
  applyRateLimit("WRITE"),
  validate(createOrUpdateSubscriptionSchema),
  blockFreePlanUpgrade, //conditionally blocking upgrade from free plan
  createSubscription,
);

router.get(
  "/",
  allowOnlyAuthenticatedUser,
  applyRateLimit("READ"),
  getSubscription,
);

router.put(
  "/pause",
  allowOnlyAuthenticatedUser,
  applyRateLimit("MUTATE"),
  pauseSubscription,
);

router.put(
  "/resume",
  allowOnlyAuthenticatedUser,
  applyRateLimit("MUTATE"),
  resumeSubscription,
);

router.put(
  "/cancel",
  allowOnlyAuthenticatedUser,
  applyRateLimit("MUTATE"),
  validate(cancelSubscriptionSchema),
  cancelSubscription,
);

router.put(
  "/update",
  allowOnlyAuthenticatedUser,
  applyRateLimit("MUTATE"),
  validate(createOrUpdateSubscriptionSchema),
  updateSubscription,
);

export default router;
