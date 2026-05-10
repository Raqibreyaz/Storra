import mongoose from "mongoose";

const appSettingSchema = new mongoose.Schema({
  key: {
    type: String,
    unique: true,
    default: "global",
  },
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
      min: 0,
      default: null,
    },
  },
  maxFileUploadSize: {
    enabled: {
      type: Boolean,
      default: false,
    },
    bytesLimit: {
      type: Number,
      min: 0,
      default: null,
    },
  },
  fileUploadDisabled: {
    type: Boolean,
    default: false,
  },
  noOfUsersAllowed: {
    enabled: {
      type: Boolean,
      default: false,
    },
    count: {
      type: Number,
      min: 1,
      default: null,
    },
  },
  freePlanUpgradeDisabled: {
    type: Boolean,
    default: false,
  },
});

const AppSetting = mongoose.model("AppSetting", appSettingSchema);
export default AppSetting;
