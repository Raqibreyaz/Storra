import express from "express";
import validateId from "../middlewares/validateId.middleware.js";
import {
  deleteFile,
  getFileContents,
  renameFile,
  setAllowAnyone,
  initiateFileUpload,
  completeFileUpload,
  cancelFileUpload,
} from "../controllers/file.controller.js";
import authorizeDataAccess from "../middlewares/authorizeDataAccess.middleware.js";
import checkFileAccessAllowed from "../middlewares/checkFileAccess.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  getFileSchema,
  renameFileSchema,
  setAllowAnyoneSchema,
  initiateFileUploadSchema,
} from "../validators/file.validator.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";
import { blockFileUpload } from "../middlewares/appSetting.middleware.js";

const router = express.Router();

router.param("fileId", validateId);
router.param("userId", validateId);
router.param("parentDirId", validateId);

/* for [data_owner, viewer, editor] only */
router.post(
  "/initiate/{:parentDirId}",
  applyRateLimit("WRITE"),
  validate(initiateFileUploadSchema),
  blockFileUpload,
  initiateFileUpload,
);
router.delete("/cancel/:fileId", applyRateLimit("WRITE"), cancelFileUpload);
router.post("/complete/:fileId", applyRateLimit("WRITE"), completeFileUpload);

router.get(
  "/:fileId",
  applyRateLimit("READ"),
  validate(getFileSchema),
  checkFileAccessAllowed,
  getFileContents,
);

router.patch(
  "/rename/:fileId",
  applyRateLimit("MUTATE"),
  validate(renameFileSchema),
  checkFileAccessAllowed,
  renameFile,
);

router.patch(
  "/set-access/:fileId",
  applyRateLimit("MUTATE"),
  validate(setAllowAnyoneSchema),
  checkFileAccessAllowed,
  setAllowAnyone,
);

router.delete(
  "/:fileId",
  applyRateLimit("MUTATE"),
  checkFileAccessAllowed,
  deleteFile,
);

/* for [data_owner, app_owner, admin] only */
router.post(
  "/initiate/:userId/{:parentDirId}",
  applyRateLimit("WRITE"),
  validate(initiateFileUploadSchema),
  authorizeDataAccess,
  blockFileUpload,
  initiateFileUpload,
);
router.post(
  "/complete/:userId/:fileId",
  applyRateLimit("WRITE"),
  authorizeDataAccess,
  completeFileUpload,
);

router.get(
  "/:userId/:fileId",
  applyRateLimit("READ"),
  validate(getFileSchema),
  authorizeDataAccess,
  getFileContents,
);

router.patch(
  "/rename/:userId/:fileId",
  applyRateLimit("MUTATE"),
  validate(renameFileSchema),
  authorizeDataAccess,
  renameFile,
);

router.patch(
  "/set-access/:userId/:fileId",
  applyRateLimit("MUTATE"),
  validate(setAllowAnyoneSchema),
  authorizeDataAccess,
  setAllowAnyone,
);

router.delete(
  "/:userId/:fileId",
  applyRateLimit("MUTATE"),
  authorizeDataAccess,
  deleteFile,
);

export default router;
