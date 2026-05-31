import "./env.js";
import connectDB from "./src/config/db.js";

// add database access
try {
  await connectDB();
} catch (error) {
  console.log(error);
  process.exit(1);
}

import app from "./server.js";

const port = process.env.PORT || 8080;
app.listen(port, "0.0.0.0", () =>
  console.log(`server is running at port ${port}`),
);
