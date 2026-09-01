import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fileRoutes from "./src/routes/file.route.js";
import directoryRoutes from "./src/routes/directory.route.js";
import userRoutes from "./src/routes/user.route.js";
import authRoutes from "./src/routes/auth.route.js";
import fileShareRoutes from "./src/routes/fileShare.route.js";
import itemRoutes from "./src/routes/item.route.js";
import subscriptionRoutes from "./src/routes/subscription.route.js";
import planRoutes from "./src/routes/plan.route.js";
import appSettingRoutes from "./src/routes/appSetting.route.js";
import allowOnlyAuthenticatedUser from "./src/middlewares/authenticate.middleware.js";
import { globalErrorHandler } from "./src/middlewares/errorHandler.middleware.js";
import { globalLimiter } from "./src/middlewares/rateLimiter.middleware.js";

import "./src/services/taskScheduler.service.js";
import preventCsrf from "./src/middlewares/preventCsrf.middleware.js";
import attachAppSettings from "./src/middlewares/attachAppSettings.middleware.js";

const app = express();

// Trust the first proxy (necessary for accurate IP detection behind Nginx/Cloudflare)
// 1 means we know we are exactly behind 1 proxy
app.set("trust proxy", 1);

// Apply global rate limiting to all routes
app.use(globalLimiter);

app.use(
  cors({
    origin: [process.env.FRONTEND_URI],
    credentials: true,
    allowedHeaders: ["Content-Type", "X-CSRF-Token"],
  }),
);

app.use(preventCsrf); //preventing CSRF, helpful when cors by-passed

const cookieSecret = process.env.COOKIE_PARSER_KEY?.trim();

const parseCookies = cookieParser(cookieSecret);
app.use((req, res, next) => {
  // Vercel can populate req.cookies before Express middleware runs.
  // cookie-parser then returns early and never sets req.secret or
  // req.signedCookies, which breaks signed cookie creation and verification.
  if (req.cookies) delete req.cookies;
  parseCookies(req, res, next);
});

/** Webhooks */
// body should be passed as raw to webhook
app.use("/subscriptions", subscriptionRoutes);

// attach the whole app settings to each route
app.use(attachAppSettings);

app.use(express.json());
app.use("/file", fileRoutes);
app.use("/plans", planRoutes);
app.use("/auth", authRoutes);
app.use("/directory", allowOnlyAuthenticatedUser, directoryRoutes);
app.use("/share", allowOnlyAuthenticatedUser, fileShareRoutes);
app.use("/user", allowOnlyAuthenticatedUser, userRoutes);
app.use("/item", allowOnlyAuthenticatedUser, itemRoutes);
app.use("/app-setting", allowOnlyAuthenticatedUser, appSettingRoutes);

app.get("/health", (req, res) =>
  res.json({ message: "Server working as expected!" }),
);

// global error handler — consistent { error, errorCode } response
app.use(globalErrorHandler);

export default app;
