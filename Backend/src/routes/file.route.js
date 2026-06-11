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
import guardAdminDataOperation from "../middlewares/guardAdminDataOperation.js";
import resolveFileAction from "../middlewares/resolveFileAction.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import {
  getFileSchema,
  renameFileSchema,
  setAllowAnyoneSchema,
  initiateFileUploadSchema,
} from "../validators/file.validator.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";
import { blockFileUpload } from "../middlewares/appSetting.middleware.js";
import blockFileUploadOnInactiveSubscription from "../middlewares/blockFileUploadOnInactiveSubscription.middleware.js";
import allowOnlyAuthenticatedUser from "../middlewares/authenticate.middleware.js";

const router = express.Router();

router.param("fileId", validateId);
router.param("userId", validateId);
router.param("parentDirId", validateId);

router.get(
  "/:fileId",
  applyRateLimit("READ"),
  validate(getFileSchema),
  resolveFileAction,
  getFileContents,
);

router.patch(
  "/rename/:fileId",
  applyRateLimit("MUTATE"),
  validate(renameFileSchema),
  resolveFileAction,
  renameFile,
);

router.patch(
  "/set-access/:fileId",
  applyRateLimit("MUTATE"),
  validate(setAllowAnyoneSchema),
  resolveFileAction,
  setAllowAnyone,
);

router.delete(
  "/:fileId",
  applyRateLimit("MUTATE"),
  resolveFileAction,
  deleteFile,
);

// user must log in for further actions
router.use(allowOnlyAuthenticatedUser);

/* for [data_owner, viewer, editor] only */
router.post(
  "/initiate/{:parentDirId}",
  applyRateLimit("WRITE"),
  validate(initiateFileUploadSchema),
  blockFileUpload,
  blockFileUploadOnInactiveSubscription,
  initiateFileUpload,
);
router.delete("/cancel/:fileId", applyRateLimit("WRITE"), cancelFileUpload);
router.post("/complete/:fileId", applyRateLimit("WRITE"), completeFileUpload);

/* for [data_owner, app_owner, admin] only */
router.post(
  "/initiate/:userId/:parentDirId",
  applyRateLimit("WRITE"),
  validate(initiateFileUploadSchema),
  guardAdminDataOperation,
  blockFileUpload,
  blockFileUploadOnInactiveSubscription,
  initiateFileUpload,
);
router.post(
  "/complete/:userId/:fileId",
  applyRateLimit("WRITE"),
  guardAdminDataOperation,
  completeFileUpload,
);

router.get(
  "/:userId/:fileId",
  applyRateLimit("READ"),
  validate(getFileSchema),
  guardAdminDataOperation,
  getFileContents,
);

router.patch(
  "/rename/:userId/:fileId",
  applyRateLimit("MUTATE"),
  validate(renameFileSchema),
  guardAdminDataOperation,
  renameFile,
);

router.patch(
  "/set-access/:userId/:fileId",
  applyRateLimit("MUTATE"),
  validate(setAllowAnyoneSchema),
  guardAdminDataOperation,
  setAllowAnyone,
);

router.delete(
  "/:userId/:fileId",
  applyRateLimit("MUTATE"),
  guardAdminDataOperation,
  deleteFile,
);

export default router;
