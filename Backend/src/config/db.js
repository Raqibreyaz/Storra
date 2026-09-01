import mongoose from "mongoose";

const globalForMongoose = globalThis;

const cached = globalForMongoose.mongoose ?? {
  connection: null,
  promise: null,
};

globalForMongoose.mongoose = cached;

export default async function connectDB() {
  if (cached.connection) return cached.connection;

  const mongodbUri = process.env.MONGODB_URI;
  if (!mongodbUri) {
    throw new Error("MONGODB_URI is not configured");
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(mongodbUri, {
      serverSelectionTimeoutMS: 10_000,
    });
  }

  try {
    cached.connection = await cached.promise;
    console.log("Database connected");
    return cached.connection;
  } catch (error) {
    // Permit a later invocation to retry after a transient connection failure.
    cached.promise = null;
    throw error;
  }
}

process.on("SIGINT", async () => {
  await mongoose.disconnect();
  console.log("Client Disconnected!");
  process.exit(0);
});
