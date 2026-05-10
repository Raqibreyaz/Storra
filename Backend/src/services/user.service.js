import { ObjectId } from "mongodb";
import mongoose from "mongoose";
import User from "../models/user.model.js";
import Directory from "../models/directory.model.js";
import Session from "../models/session.model.js";
import { getAppSettings } from "../services/appSetting.service.js";
import ApiError from "../helpers/apiError.js";

export default async function createUserWithEssentials({
  name,
  email,
  password,
  authProvider,
  providerId,
  picture,
  role,
}) {
  // stop when user registration is not allowed
  const appSettings = await getAppSettings();
  if (appSettings) {
    const noOfUsers = await User.countDocuments();
    if (
      appSettings.newRegistrationDisabled ||
      (appSettings.noOfUsersAllowed.enabled &&
        appSettings.noOfUsersAllowed.count <= noOfUsers)
    )
      throw new ApiError(403, "User registration temporarily not available!");
  }

  const storageDirId = new ObjectId();
  const userId = new ObjectId();

  let userSession = null;
  const session = await mongoose.startSession();
  try {
    await session.withTransaction(async () => {
      // create user's root dir with user as null(currently)
      await Directory.insertOne(
        {
          _id: storageDirId,
          name: `root-${email}`,
          user: userId,
          parentDir: null,
        },
        { session },
      );

      // create the user with the root dir created
      await User.insertOne(
        {
          _id: userId,
          name,
          password,
          email,
          authProvider,
          providerId,
          picture,
          role,
          storageDir: storageDirId,
        },
        { session },
      );

      userSession = await Session.insertOne(
        {
          user: userId,
          expiresAt: new Date((Date.now() / 1000 + 86400) * 1000),
        },
        { session },
      );
    });
    return { userId: userId.toString(), sessionId: userSession.id };
  } finally {
    await session.endSession();
  }
}
