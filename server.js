require("dotenv").config();
const { createBullBoard } = require('@bull-board/api');
const { BullAdapter }     = require('@bull-board/api/bullAdapter');
const { ExpressAdapter }  = require('@bull-board/express');
const express = require("express");
const connectDB = require("./src/config/database");
const { redisClient } = require("./src/config/redis");

const app = express();
app.use(express.json());
app.use('/api/jobs', require('./src/routes/jobs'));
app.use('/api/monitor', require('./src/routes/monitor'));
const { highPriorityQueue, mediumPriorityQueue, lowPriorityQueue } = require('./src/queues');
const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');
createBullBoard({
  queues: [
    new BullAdapter(highPriorityQueue),
    new BullAdapter(mediumPriorityQueue),
    new BullAdapter(lowPriorityQueue),
  ],
  serverAdapter,
});
app.use('/admin/queues', serverAdapter.getRouter());

// Health check
app.get("/health", async (req, res) => {
  const redisPing = await redisClient.ping();
  res.json({
    status: "ok",
    redis: redisPing === "PONG" ? "connected" : "unreachable",
    mongo: require("mongoose").connection.readyState === 1 ? "connected" : "disconnected",
    uptime: process.uptime(),
  });
});

const start = async () => {
  await connectDB();
  app.listen(process.env.PORT, () => {
    console.log(`🚀 Server running on port ${process.env.PORT}`);
  });
};

start();
