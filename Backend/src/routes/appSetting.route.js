import express from "express";
import {
  getAppSettings,
  updateAppSettings,
} from "../controllers/appSetting.controller.js";
import validate from "../middlewares/validate.middleware.js";
import { appSettingSchema } from "../validators/appSetting.validator.js";

const router = express.Router();

router.get("/", getAppSettings);
router.put("/", validate(appSettingSchema), updateAppSettings);

export default router;
