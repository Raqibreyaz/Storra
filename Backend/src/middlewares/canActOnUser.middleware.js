import ApiError from "../helpers/apiError.js";
import Role from "../constants/role.js";
import User from "../models/user.model.js";

const Limits = Object.freeze(
  Object.values(Role).reduce((acc, role, index) => {
    acc[role] = index;
    return acc;
  }, {}),
);

export default async function canActOnUser(req, res, next) {
  const loggedInUserId = req.loggedInUser.userId;
  const loggedInUserRole = req.loggedInUser.role;

  const receivedUserId = req.params.userId;
  const role = req.body?.role;
  const receivedUser = await User.findById(receivedUserId).lean();

  // skip if user is himself
  if (loggedInUserId === receivedUserId) return next();

  if (
    Limits[loggedInUserRole] < Limits[receivedUser.role] &&
    (!role || Limits[loggedInUserRole] < Limits[role])
  )
    // allow only when current user has lesser privilege limits than given role
    // (jis role se karna hai + jis role par karna hai) current user role ke under ho
    // whichever role from + whichever role to, all should be under current user's role
    return next();

  throw new ApiError(403, "You are not Authorized for this action!");
}
