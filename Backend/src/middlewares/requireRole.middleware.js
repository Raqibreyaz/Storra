import ApiError from "../helpers/apiError.js";

export default function requireRole(allowedUserRoles) {
  return (req, res, next) => {
    const loggedInUser = req.loggedInUser;
    if (allowedUserRoles.includes(loggedInUser.role)) return next();
    throw new ApiError(403, "You are not Authorized for this action!");
  };
}
