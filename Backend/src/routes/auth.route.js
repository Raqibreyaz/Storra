import express from "express";
import checkUserNotExist from "../middlewares/checkUserNotExist.middleware.js";
import verifyUserPassword from "../middlewares/verifyUserPassword.middleware.js";
import verifyOtp from "../middlewares/verifyOtp.middleware.js";
import {
  registerUser,
  loginUser,
  loginWithGoogle,
  loginWithGithub,
  sendOtp,
  githubAuth,
  updateUserPassword,
} from "../controllers/auth.controller.js";
import validate from "../middlewares/validate.middleware.js";
import {
  checkUserAndSendOTPSchema,
  verifyOTPAndRegisterSchema,
  verifyOTPAndLoginSchema,
  googleLoginSchema,
  githubLoginSchema,
  checkUserWithPasswordAndSendOTPSchema,
  updatePasswordSchema,
} from "../validators/auth.validator.js";
import { applyRateLimit } from "../middlewares/rateLimiter.middleware.js";
import checkUserExist from "../middlewares/checkUserExist.middleware.js";
import allowLocalUsersOnly from "../middlewares/allowLocalUsersOnly.middleware.js";
import { blockNewRegistration } from "../middlewares/appSetting.middleware.js";

const router = express.Router();

// OTP routes
router.post(
  "/register/send-otp",
  applyRateLimit("OTP"),
  validate(checkUserAndSendOTPSchema),
  blockNewRegistration,
  checkUserNotExist,
  sendOtp,
);
router.post(
  "/login/send-otp",
  applyRateLimit("OTP"),
  validate(checkUserWithPasswordAndSendOTPSchema),
  checkUserExist,
  allowLocalUsersOnly,
  verifyUserPassword,
  sendOtp,
);

router.post(
  "/update-password/send-otp",
  applyRateLimit("OTP"),
  validate(checkUserAndSendOTPSchema),
  checkUserExist,
  allowLocalUsersOnly,
  sendOtp,
);

// user must verify otp before registering/logging-in
router.post(
  "/register",
  applyRateLimit("AUTH"),
  validate(verifyOTPAndRegisterSchema),
  verifyOtp,
  registerUser,
);
router.post(
  "/login",
  applyRateLimit("AUTH"),
  validate(verifyOTPAndLoginSchema),
  verifyOtp,
  loginUser,
);

// 3rd party login
router.post(
  "/login/google",
  applyRateLimit("OAUTH"),
  validate(googleLoginSchema),
  loginWithGoogle,
);
router.get("/github", applyRateLimit("OAUTH"), githubAuth);
router.get(
  "/login/github",
  applyRateLimit("OAUTH"),
  validate(githubLoginSchema),
  loginWithGithub,
);

router.patch(
  "/update-password",
  applyRateLimit("ADMIN"),
  validate(updatePasswordSchema),
  verifyOtp,
  updateUserPassword,
);

export default router;
