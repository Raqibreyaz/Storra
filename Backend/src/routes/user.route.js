import express from "express";
import requireRole from "../middlewares/requireRole.middleware.js";
import canActOnUser from "../middlewares/canActOnUser.middleware.js";
import validateId from "../middlewares/validateId.middleware.js";
import Role from "../constants/role.js";
import {
  getUser,
  deleteUser,
  getAllUsers,
  logoutUser,
  forceLogout,
  logoutUserFromAllDevices,
  recoverUser,
  changeUserRole,
} from "../controllers/user.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
  deleteUserSchema,
  changeUserRoleSchema,
} from "../validators/user.validator.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";

const router = express.Router();

router.param("userId", validateId);

// only authenticated users will be allowed
router.get("/", applyRateLimit("READ"), getUser);

// allow only authenticated users to logout
router.post("/logout", applyRateLimit("LOGOUT"), logoutUser);
router.post(
  "/logout/all",
  applyRateLimit("LOGOUT_ALL"),
  logoutUserFromAllDevices,
);

// only non-regular users will be allowed
router.get(
  "/all",
  applyRateLimit("READ"),
  requireRole([Role.OWNER, Role.ADMIN]),
  getAllUsers,
);

// only owner and admin will be allowed to delete user
// only can delete users which are under them
router.delete(
  "/:userId",
  applyRateLimit("ADMIN"),
  validate(deleteUserSchema),
  requireRole([Role.OWNER, Role.ADMIN]),
  canActOnUser,
  deleteUser,
);

// only non-regular users will be allowed
// only can logout users which are under them
router.post(
  "/logout/:userId",
  applyRateLimit("ADMIN"),
  requireRole([Role.OWNER, Role.ADMIN]),
  canActOnUser,
  forceLogout,
);

router.patch(
  "/recover/:userId",
  applyRateLimit("ADMIN"),
  requireRole([Role.OWNER]),
  recoverUser,
);

// only non-regular users will go forward
// a user can only change role for which he is allowed
router.patch(
  "/role/:userId",
  applyRateLimit("ADMIN"),
  validate(changeUserRoleSchema),
  requireRole([Role.OWNER, Role.ADMIN]),
  canActOnUser,
  changeUserRole,
);

export default router;
