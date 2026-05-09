import express from "express";
import validateId from "../middlewares/validateId.middleware.js";
import authorizeDataAccess from "../middlewares/authorizeDataAccess.middleware.js";
import {
  createDirectory,
  deleteDirectory,
  getDirectoryContents,
  updateDirectoryName,
  countDescendantDirsAndFiles,
} from "../controllers/directory.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
  createDirectorySchema,
  renameDirectorySchema,
} from "../validators/directory.validator.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.param("dirId", validateId);
router.param("userId", validateId);
router.param("parentDirId", validateId);

/* for [data_owner] only currently*/
router.get(
  "/{:dirId}",
  applyRateLimit("READ"),
  getDirectoryContents,
);

router.get(
  "/:dirId/descendants/count",
  applyRateLimit("READ"),
  countDescendantDirsAndFiles,
);

router.post(
  "/{:parentDirId}",
  applyRateLimit("WRITE"),
  validate(createDirectorySchema),
  createDirectory,
);

router.patch(
  "/:dirId",
  applyRateLimit("MUTATE"),
  validate(renameDirectorySchema),
  updateDirectoryName,
);

router.delete(
  "/:dirId",
  applyRateLimit("MUTATE"),
  deleteDirectory,
);

/* for [data_owner, app_owner, admin] only */
router.get(
  "/:userId/{:dirId}",
  applyRateLimit("READ"),
  authorizeDataAccess,
  getDirectoryContents,
);

router.post(
  "/:userId/:parentDirId",
  applyRateLimit("WRITE"),
  validate(createDirectorySchema),
  authorizeDataAccess,
  createDirectory,
);

router.patch(
  "/:userId/:dirId",
  applyRateLimit("MUTATE"),
  validate(renameDirectorySchema),
  authorizeDataAccess,
  updateDirectoryName,
);

router.delete(
  "/:userId/:dirId",
  applyRateLimit("MUTATE"),
  authorizeDataAccess,
  deleteDirectory,
);

export default router;
