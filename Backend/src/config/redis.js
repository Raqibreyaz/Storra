import { createClient } from "redis";

const redisUrl = process.env.REDIS_URI;

const redisClient = createClient({ url: redisUrl });

redisClient.on("error", (error) => {
  console.error("Redis client error:", error.message);
});

redisClient.on("reconnecting", () => {
  console.warn("Redis: attempting to reconnect...");
});

redisClient.on("ready", () => {
  console.log("Redis: connection ready.");
});

await redisClient.connect();
console.log("Memory Store Connected!");

process.on("SIGINT", async () => {
  await redisClient.quit();
  process.exit(0);
});

export default redisClient;
