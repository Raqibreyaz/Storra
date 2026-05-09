import express from "express";
import validateId from "../middlewares/validateId.middleware.js";
import authorizeDataAccess from "../middlewares/authorizeDataAccess.middleware.js";
import {
  filesSharedWithMe,
  listUsersHavingTheFile,
  revokeAccess,
  shareFile,
} from "../controllers/fileShare.controller.js";
import checkFileAccessAllowed from "../middlewares/checkFileAccess.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  revokeFileAccessSchema,
  shareFileSchema,
} from "../validators/fileShare.validator.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();
router.param("fileId", validateId);
router.param("userId", validateId);

// I can only see what files are shared with me
router.get(
  "/",
  applyRateLimit("READ"),
  filesSharedWithMe,
);

// me,editor can only see users who access this file
router.get(
  "/:fileId",
  applyRateLimit("READ"),
  checkFileAccessAllowed,
  listUsersHavingTheFile,
);

// me,editor can only share the file
router.post(
  "/:fileId",
  applyRateLimit("MUTATE"),
  validate(shareFileSchema),
  checkFileAccessAllowed,
  shareFile,
);

// me,editor can only revoke access of the file from other users
router.delete(
  "/:fileId",
  applyRateLimit("MUTATE"),
  validate(revokeFileAccessSchema),
  checkFileAccessAllowed,
  revokeAccess,
);

// file_owner,owner,admin can only see what files are shared with file_owner
router.get(
  "/:userId",
  applyRateLimit("READ"),
  authorizeDataAccess,
  filesSharedWithMe,
);

// file_owner,owner,admin can only see users who access this file
router.get(
  "/:userId/:fileId",
  applyRateLimit("READ"),
  authorizeDataAccess,
  listUsersHavingTheFile,
);

// file_owner,owner can only share the file
router.post(
  "/:userId/:fileId",
  applyRateLimit("MUTATE"),
  validate(shareFileSchema),
  authorizeDataAccess,
  shareFile,
);

// file_owner,owner can only revoke access of the file from other users
router.delete(
  "/:userId/:fileId",
  applyRateLimit("MUTATE"),
  validate(revokeFileAccessSchema),
  authorizeDataAccess,
  revokeAccess,
);

export default router;
