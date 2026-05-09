import express from "express";
import validate from "../middlewares/validate.middleware.js";
import { bulkDeleteSchema } from "../validators/item.validator.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";
import { bulkDelete } from "../controllers/item.controller.js";

const router = express.Router();

// Delete files and directories in bulk
router.delete(
  "/bulk-delete",
  applyRateLimit("MUTATE"),
  validate(bulkDeleteSchema),
  bulkDelete
);

export default router;
