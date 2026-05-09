import mongoose from "mongoose";

const appSettingSchema = new mongoose.Schema({
  newRegistrationDisabled: {
    type: Boolean,
    default: false,
  },
  globalObjectStorageCap: {
    enabled: {
      type: Boolean,
      default: false,
    },
    bytesLimit: {
      type: Number,
      default: Infinity,
    },
  },
  maxFileUploadSize: {
    enabled: {
      type: Boolean,
      default: false,
    },
    bytesLimit: {
      type: Number,
      default: Infinity,
    },
  },
  fileUploadDisabled: {
    type: Boolean,
    default: false,
  },
  freePlanUpgradeDisabled: {
    type: Boolean,
    default: false,
  },
});

const AppSetting = mongoose.model("AppSetting", appSettingSchema);
export default AppSetting;
