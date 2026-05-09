import { rateLimit, ipKeyGenerator } from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import redisClient from "../config/redis.js";
import { RATE_LIMIT_PRESETS } from "../config/rateLimit.config.js";

// ─── Key generators ──────────────────────────────────────────────────────────

/** Authenticated routes: identify by user-id, fall back to IP */
export const userKeyGenerator = (req) =>
  req.session?.user?._id?.toString() || ipKeyGenerator(req.ip);

/** Pre-auth routes (login, register, OTP): identify by IP only */
export const ipOnlyKeyGenerator = (req) => ipKeyGenerator(req.ip);

// ─── Factory ─────────────────────────────────────────────────────────────────

/**
 * Internal helper to create a rate limiter with Redis store.
 */
function createLimiter({ windowMs, limit, errorMsg, prefix, keyGenerator }) {
  return rateLimit({
    windowMs,
    limit,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    message: { error: errorMsg, errorCode: "RATE_LIMITED" },
    store: new RedisStore({
      sendCommand: (...args) => redisClient.sendCommand(args.map(String)),
      prefix: `rl:${prefix}:`,
    }),
    ...(keyGenerator && { keyGenerator }),
  });
}

// ─── Global Protection ───────────────────────────────────────────────────────

/** Global rate limiter — general protection for all routes */
export const globalLimiter = createLimiter({
  windowMs: 15 * 60 * 1000,
  limit: 500,
  prefix: "global",
  errorMsg: "Too many requests from this IP, please try again after 15 minutes",
});

// ─── Named Rate Limiting ─────────────────────────────────────────────────────

/**
 * Middleware factory — accepts a preset name and returns a rate limiter.
 * Standardizes rate limiting across the app using presets.
 *
 * @param {string} presetName — key into RATE_LIMIT_PRESETS
 */
export const applyRateLimit = (presetName) => {
  const preset = RATE_LIMIT_PRESETS[presetName];
  if (!preset) {
    throw new Error(`Unknown rate limit preset: "${presetName}"`);
  }

  const { limit, windowMin, identifyBy } = preset;
  const keyGenerator = identifyBy === "ip" ? ipOnlyKeyGenerator : userKeyGenerator;

  return createLimiter({
    windowMs: windowMin * 60 * 1000,
    limit,
    prefix: `preset:${presetName.toLowerCase()}`,
    errorMsg: `Too many requests. Please try again after ${windowMin} minutes.`,
    keyGenerator,
  });
};

