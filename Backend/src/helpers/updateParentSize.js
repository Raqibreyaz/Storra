import Directory from "../models/directory.model.js";

export default async function updateParentSize(
  parentId,
  size,
  session = undefined,
) {
  if (!parentId) {
    console.log("parent id should not be null!!");
    return;
  }

  const sessionObj = session ? { session } : {};

  const parentDir = await Directory.findById(parentId, null, sessionObj).lean();
  if (!parentDir) throw new ApiError(404, "Parent directory not found");

  const path = [...parentDir.path, parentId];

  // increase size of each directory in the path
  await Directory.updateMany(
    { _id: { $in: path } },
    { $inc: { size: size } },
    sessionObj,
  );
}
