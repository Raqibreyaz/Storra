import AppSetting from "../models/appSetting.model.js";

export const getAppSettings = async () => {
  const appSettings = await AppSetting.findOne({ key: "global" }).lean();

  if (!appSettings) {
    return {
      key: "global",
      newRegistrationDisabled: false,
      globalObjectStorageCap: {
        enabled: false,
        bytesLimit: null,
      },
      maxFileUploadSize: {
        enabled: false,
        bytesLimit: null,
      },
      fileUploadDisabled: false,
      noOfUsersAllowed: {
        enabled: false,
        count: null,
      },
      freePlanUpgradeDisabled: false,
    };
  }
  return appSettings;
};
