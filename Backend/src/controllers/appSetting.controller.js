import AppSetting from "../models/appSetting.model.js";

export const getAppSettings = async (req, res, next) => {
  const appSettings = req.appSettings;
  res.json({ message: "App settings fetched successfully!", appSettings });
};

export const updateAppSettings = async (req, res, next) => {
  // update the settings, whatever comes to be updated
  await AppSetting.updateOne(
    { key: "global" },
    { $set: req.body },
    { upsert: true },
  );
  res.json({ message: "App settings updated successfully!" });
};
