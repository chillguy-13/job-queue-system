const express = require("express");
const router  = express.Router();
const mongoose = require("mongoose");
const { redisClient } = require("../config/redis");
const { getAllQueueStats } = require("../utils/queueStats");

router.get("/", async (req, res) => {
  try {
    const redisPing  = await redisClient.ping();
    const mongoState = mongoose.connection.readyState === 1;
    const queueStats = await getAllQueueStats();

    const totalWaiting   = queueStats.reduce((sum, q) => sum + q.waiting, 0);
    const totalActive    = queueStats.reduce((sum, q) => sum + q.active, 0);
    const totalCompleted = queueStats.reduce((sum, q) => sum + q.completed, 0);
    const totalFailed    = queueStats.reduce((sum, q) => sum + q.failed, 0);

    res.json({
      status:  "ok",
      uptime:  process.uptime(),
      redis:   redisPing === "PONG" ? "connected" : "unreachable",
      mongo:   mongoState ? "connected" : "disconnected",
      queues:  queueStats,
      summary: { totalWaiting, totalActive, totalCompleted, totalFailed },
    });
  } catch (err) {
    res.status(503).json({ status: "unhealthy", error: err.message });
  }
});

module.exports = router;
