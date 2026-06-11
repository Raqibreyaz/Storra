/*
- does this file allowed globally to be viwed/edited?
- does this file belongs to the logged-in user?
- does this file shared with the logged-in user?
*/

import Role from "../constants/role.js";
import ApiError from "../helpers/apiError.js";
import checkAuthentication from "../helpers/checkAuthentication.js";
import File from "../models/file.model.js";
import FileShare from "../models/fileShare.model.js";

export default async function resolveFileAction(req, res, next) {
  const fileId = req.params.fileId;

  const file = await File.findById(fileId).lean();
  if (!file) throw new ApiError(404, "File not found!");

  req.fileDoc = file;

  // allow the file viewer due to global allowance
  if (file.allowAnyoneAccess === "View" && req.method === "GET") return next();

  // allow the file editor due to global allowance
  if (file.allowAnyoneAccess === "Edit") return next();

  // only authenticated user will be allowed from here
  await checkAuthentication(req);
  const loggedInUserId = req.loggedInUser?.userId;
  if (!loggedInUserId) {
    throw new ApiError(
      401,
      "You are not authenticated to perform this action!",
    );
  }

  // allow for app owner, file owner or admin(GET Access)
  const loggedInUserRole = req.loggedInUser.role;
  if (file.user.equals(loggedInUserId)) return next();
  if (loggedInUserRole === Role.OWNER) return next();
  if (loggedInUserRole === Role.ADMIN && req.method === "GET") return next();

  // find if the file shared to that user
  const fileShare = await FileShare.findOne({
    file: fileId,
    user: loggedInUserId,
  }).lean();

  if (fileShare) {
    // allow the file editor
    if (fileShare.permission === "Edit") return next();

    // allow the file viewer to view
    if (fileShare.permission === "View" && req.method === "GET") return next();
  }

  throw new ApiError(403, "You are not authorized to access this data!");
}
