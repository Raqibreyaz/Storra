import ApiError from "../helpers/apiError.js";
import formatSize from "../helpers/formatSize.js";
import User from "../models/user.model.js";

/*
1. block based on registration disabled flag
2. block based on no of users
*/
export const blockNewRegistration = async (req, res, next) => {
  const appSettings = req.appSettings;
  if (!appSettings || !appSettings.newRegistrationDisabled) return next();

  const noOfUsers = await User.countDocuments();
  if (
    !appSettings.noOfUsersAllowed.enabled ||
    appSettings.noOfUsersAllowed.count > noOfUsers
  )
    return next();

  throw new ApiError(403, "New User registration is temporarily blocked!");
};

/*
1. block when file upload is disabled
2. block when filesize is more than the allowed file size
3. TODO: block when global capped storage is hitting
*/
export const blockFileUpload = (req, res, next) => {
  const appSettings = req.appSettings;

  // allow if no app settings available or this is a non-file route
  if (!appSettings || req.body.fileSize == null) return next();

  // dont allow is file upload is disabled
  if (appSettings.fileUploadDisabled)
    throw new ApiError(403, "File Uploads are temporarily disabled!");

  // dont allow if file size is more than the allowed size
  if (
    appSettings.maxFileUploadSize.enabled &&
    req.body.fileSize > appSettings.maxFileUploadSize.bytesLimit
  )
    throw new ApiError(
      403,
      `Files larger than ${formatSize(appSettings.maxFileUploadSize.bytesLimit)} are temporarily not allowed!`,
    );

  // TODO: find globally used storage status
  // dont allow when global hard-capped storage is not enough to store the file
  //   const totalUsedStorage = 0;
  //   const storageAfterUpload = totalUsedStorage + req.body.fileSize;
  //   if (
  //     appSettings.globalObjectStorageCap.enabled &&
  //     appSettings.globalObjectStorageCap.bytesLimit < storageAfterUpload
  //   ) {
  //     const diff =
  //       appSettings.globalObjectStorageCap.bytesLimit - totalUsedStorage;
  //     throw new ApiError(
  //       500,
  //       `Max ${formatSize(diff)} size file can be uploaded only!`,
  //     );
  //   }
  return next();
};

export const blockFreePlanUpgrade = (req, res, next) => {
  const appSettings = req.appSettings;
  // allow on non-subscription route
  if (!appSettings || !req.body.planKey) return next();

  throw new ApiError(403, "Free Plan upgrading is temporarily not available!");
};
