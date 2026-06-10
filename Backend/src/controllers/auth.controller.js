import crypto from "crypto";
import axios from "axios";
import User from "../models/user.model.js";
import ApiError from "../helpers/apiError.js";
import createCookie from "../helpers/createCookie.js";
import verifyIdToken from "../services/google.service.js";
import createUserWithEssentials from "../services/user.service.js";
import sendOtpService from "../services/otp.service.js";
import { createSessionWithLimit } from "../services/session.service.js";
import Role from "../constants/role.js";
import Provider from "../constants/provider.js";

/**
 * Shared guard for existing OAuth users (Google / GitHub).
 * Validates the user is active and matches the expected providerId,
 * then creates a session and sets the auth cookie.
 */
async function handleExistingOAuthLogin(user, providerId, res) {
  if (user.isDeleted)
    throw new ApiError(
      403,
      "Your account is flagged as deleted, Contact App Owner for further details!",
    );

  if (user.providerId !== String(providerId))
    throw new ApiError(
      400,
      `User already exists as a ${user.authProvider} user`,
    );

  const sessionId = await createSessionWithLimit(user._id);
  createCookie(res, sessionId);
}


export const registerUser = async (req, res, next) => {
  if (!req.body) throw new ApiError(400, "No data received!");

  const { name, password, email } = req.body;
  if (!name || !password || !email)
    throw new ApiError(400, "Name,Password and Email all are Required!");

  const { userId, sessionId } = await createUserWithEssentials({
    name,
    email,
    password,
    role: Role.USER,
    authProvider: Provider.LOCAL,
  });

  createCookie(res, sessionId);
  res.status(200).json({ message: "User registered!" });
};

export const loginUser = async (req, res, next) => {
  if (!req.body) throw new ApiError(400, "No data received!");

  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is Required!");

  const user = await User.findOne({ email }).select("_id").lean();

  const sessionId = await createSessionWithLimit(user._id);
  createCookie(res, sessionId);
  res.status(200).json({ message: "User logged in!" });
};

export const loginWithGoogle = async (req, res, next) => {
  if (!req.body) throw new ApiError(400, "No data received!");

  const { idToken } = req.body;
  const userData = await verifyIdToken(idToken);
  const userDoc = await User.findOne({ email: userData.email });

  // create the user with directory and session
  if (!userDoc) {
    const { userId, sessionId } = await createUserWithEssentials({
      name: userData.name,
      email: userData.email,
      authProvider: Provider.GOOGLE,
      role: Role.USER,
      password: null,
      picture: userData.picture,
      providerId: userData.sub,
    });

    createCookie(res, sessionId);
  }

  // when user exists then create a new session + limit the no of sessions
  if (userDoc) {
    await handleExistingOAuthLogin(userDoc, userData.sub, res);
  }

  res.status(200).json({ message: "User logged in!" });
};

export const loginWithGithub = async (req, res, next) => {
  const { code, state } = req.query;

  // 1. Validate state (CSRF protection)
  const savedState = req.signedCookies.oauth_state;

  if (!savedState || savedState !== state) {
    throw new ApiError(401, "Invalid OAuth state");
  }
  res.clearCookie("oauth_state");

  const params = new URLSearchParams({
    client_id: process.env.GITHUB_CLIENT_ID,
    client_secret: process.env.GITHUB_CLIENT_SECRET,
    redirect_uri: process.env.GITHUB_REDIRECT_URI,
    code,
  });

  // Wrap GitHub API calls with error handling
  let access_token;
  try {
    const { data: tokenData } = await axios.post(
      `https://github.com/login/oauth/access_token?${params.toString()}`,
      undefined,
      { headers: { Accept: "application/json" } },
    );

    access_token = tokenData.access_token;
    if (!access_token)
      throw new Error(
        tokenData.error_description || "Failed to get access token",
      );
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, "GitHub authentication failed");
  }

  let githubId, name, avatar_url, primaryEmail;
  try {
    const { data: userData } = await axios.get("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    githubId = userData.id;
    name = userData.name;
    avatar_url = userData.avatar_url;

    const { data: emails } = await axios.get(
      "https://api.github.com/user/emails",
      {
        headers: { Authorization: `Bearer ${access_token}` },
      },
    );

    primaryEmail = emails.find(({ primary }) => primary)?.email;
    if (!primaryEmail)
      throw new Error("No primary email found on GitHub account");
  } catch (err) {
    if (err instanceof ApiError) throw err;
    throw new ApiError(502, "Failed to retrieve GitHub profile");
  }

  const user = await User.findOne({ email: primaryEmail }).lean();

  if (!user) {
    // create the user with directory and session
    const { userId, sessionId } = await createUserWithEssentials({
      name,
      email: primaryEmail,
      authProvider: Provider.Github,
      role: Role.USER,
      password: null,
      picture: avatar_url,
      providerId: String(githubId),
    });

    createCookie(res, sessionId);
  }

  // when user exists then create a new session + limit the no of sessions
  if (user) {
    await handleExistingOAuthLogin(user, githubId, res);
  }

  res.redirect(`${process.env.FRONTEND_URI}/callback`);
};

export const sendOtp = async (req, res, next) => {
  if (!req.body) throw new ApiError(400, "No data received!");

  const { email } = req.body;
  if (!email) throw new ApiError(400, "Email is required!");

  const result = await sendOtpService(email);
  res.status(200).json(result);
};

export const githubAuth = async (req, res, next) => {
  const client_id = process.env.GITHUB_CLIENT_ID;
  const redirect_uri = process.env.GITHUB_REDIRECT_URI;
  const github_scope = process.env.GITHUB_SCOPE;
  const state = crypto.randomBytes(32).toString("hex");

  // const domain = process.env.SITE_DOMAIN || ".local.com";

  // Store state in signed cookie (or Redis)
  res.cookie("oauth_state", state, {
    httpOnly: true,
    sameSite: "none",
    signed: true,
    secure: process.env.NODE_ENV !== "DEVELOPMENT",
  });

  const params = new URLSearchParams({
    client_id,
    redirect_uri,
    scope: github_scope,
    state,
  });

  res.redirect(`https://github.com/login/oauth/authorize?${params.toString()}`);
};

export const updateUserPassword = async (req, res, next) => {
  const { email, newPassword } = req.body;

  const user = await User.findOne({ email });
  user.password = newPassword;
  await user.save();

  res.status(200).json({ message: "Password updated successfully!" });
};
