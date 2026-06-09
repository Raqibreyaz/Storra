import express from "express";
import {
  getAppSettings,
  updateAppSettings,
} from "../controllers/appSetting.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { appSettingSchema } from "../validators/appSetting.validator.js";
import requireRole from "../middlewares/requireRole.middleware.js";
import Role from "../constants/role.js";

const router = express.Router();

router.get("/", requireRole([Role.OWNER, Role.ADMIN]), getAppSettings);
router.put(
  "/",
  requireRole([Role.OWNER, Role.ADMIN]),
  validate(appSettingSchema),
  updateAppSettings,
);

export default router;
