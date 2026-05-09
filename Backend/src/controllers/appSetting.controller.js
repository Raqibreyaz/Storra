import AppSetting from "../models/appSetting.model.js";

export const updateAppSettings = async (req, res, next) => {
  await AppSetting.updateOne({}, { $set: {} }, { upsert: true });
};
