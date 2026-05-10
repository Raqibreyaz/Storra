import { getAppSettings } from "../services/appSetting.service.js";

export default async function attachAppSettings(req, res, next) {
  req.appSettings = await getAppSettings()
  next();
}
