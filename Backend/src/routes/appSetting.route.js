import express from "express";
import { updateAppSettings } from "../controllers/appSetting.controller.js";

const router = express.Router();

router.put("/update", updateAppSettings);

export default router;
