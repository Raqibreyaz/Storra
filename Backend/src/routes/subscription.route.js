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
  checkAuthentication,
  applyRateLimit("WRITE"),
  validate(createOrUpdateSubscriptionSchema),
  blockFreePlanUpgrade, //conditionally blocking upgrade from free plan
  createSubscription,
);

router.get("/", checkAuthentication, applyRateLimit("READ"), getSubscription);

router.put(
  "/pause",
  checkAuthentication,
  applyRateLimit("MUTATE"),
  pauseSubscription,
);

router.put(
  "/resume",
  checkAuthentication,
  applyRateLimit("MUTATE"),
  resumeSubscription,
);

router.put(
  "/cancel",
  checkAuthentication,
  applyRateLimit("MUTATE"),
  validate(cancelSubscriptionSchema),
  cancelSubscription,
);

router.put(
  "/update",
  checkAuthentication,
  applyRateLimit("MUTATE"),
  validate(createOrUpdateSubscriptionSchema),
  updateSubscription,
);

export default router;
