import "./env.js";
import connectDB from "./src/config/db.js";
import app from "./server.js";

const port = process.env.PORT || 8080;

async function handler(req, res) {
  await connectDB();
  return app(req, res);
}

if (process.env.NODE_ENV !== "production") {
  connectDB()
    .then(() => {
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
