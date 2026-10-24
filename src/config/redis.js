const Redis = require("ioredis");

const redisConfig = {
  host: process.env.REDIS_HOST || "localhost",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null,   // Required by Bull
  enableReadyCheck: false,
};

const redisClient = new Redis(redisConfig);

redisClient.on("connect", () => console.log("✅ Redis connected"));
redisClient.on("error", (err) => console.error("❌ Redis error:", err.message));

module.exports = { redisClient, redisConfig };
