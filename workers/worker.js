require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const path = require("path");
const connectDB = require("../src/config/database");

const start = async () => {
  await connectDB();

  require("../src/workers/emailWorker");
  require("../src/workers/imageWorker");
  require("../src/workers/notificationWorker");
  require("../src/workers/deadLetterWorker");

  console.log("🚀 All workers running");
};

start();

// Graceful shutdown
const shutdown = async () => {
  console.log("⚠️  Shutting down worker gracefully...");
  const { highPriorityQueue, mediumPriorityQueue, lowPriorityQueue } = require("../src/queues");
  await Promise.all([
    highPriorityQueue.close(),
    mediumPriorityQueue.close(),
    lowPriorityQueue.close(),
  ]);
  console.log("✅ Worker shut down cleanly");
  process.exit(0);
};

process.on("SIGTERM", shutdown);
process.on("SIGINT",  shutdown);
