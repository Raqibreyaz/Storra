import "./env.js";
import connectDB from "./src/config/db.js";

const port = process.env.PORT || 8080;
let appPromise;

function getApp() {
  if (!appPromise) {
    appPromise = import("./server.js")
      .then(({ default: app }) => app)
      .catch((error) => {
        appPromise = null;
        throw error;
      });
  }

  return appPromise;
}

async function handler(req, res) {
  // Keep a lightweight deployment health check independent of MongoDB and Redis.
  if (req.method === "GET" && req.url?.split("?")[0] === "/health") {
    return res.json({ message: "Server working as expected!" });
  }

  try {
    await connectDB();
    const app = await getApp();
    return app(req, res);
  } catch (error) {
    console.error("Service dependency initialization failed:", error);
    return res.status(503).json({
      error: "Service temporarily unavailable",
      errorCode: "SERVICE_UNAVAILABLE",
    });
  }
}

if (process.env.NODE_ENV !== "production") {
  Promise.all([connectDB(), getApp()])
    .then(([, app]) => {
      app.listen(port, "0.0.0.0", () =>
        console.log(`server is running at port ${port}`),
      );
    })
    .catch((error) => {
      console.error("Database connection failed:", error);
      process.exitCode = 1;
    });
}

export default handler;
