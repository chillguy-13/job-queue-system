const express  = require("express");
const router   = express.Router();
const JobLog   = require("../models/JobLog");
const { getQueue } = require("../queues");
const { getAllQueueStats } = require("../utils/queueStats");
const { highPriorityQueue, mediumPriorityQueue, lowPriorityQueue } = require("../queues");

router.get("/stats", async (req, res) => {
  try {
    const stats = await getAllQueueStats();
    res.json({ success: true, queues: stats });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/jobs", async (req, res) => {
  try {
    const { status, type, limit = 20, page = 1 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (type)   filter.jobType = type;
    const jobs = await JobLog.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    const total = await JobLog.countDocuments(filter);
    res.json({ success: true, total, page: parseInt(page), jobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/jobs/:jobId", async (req, res) => {
  try {
    const log = await JobLog.findOne({ jobId: req.params.jobId });
    if (!log) return res.status(404).json({ error: "Job not found" });
    res.json({ success: true, job: log });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/jobs/:jobId/retry", async (req, res) => {
  try {
    const { priority = "medium" } = req.body;
    const queue = getQueue(priority);
    const job   = await queue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found in queue" });
    await job.retry();
    res.json({ success: true, message: `Job ${req.params.jobId} retried` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete("/jobs/:jobId", async (req, res) => {
  try {
    const { priority = "medium" } = req.body;
    const queue = getQueue(priority);
    const job   = await queue.getJob(req.params.jobId);
    if (!job) return res.status(404).json({ error: "Job not found in queue" });
    await job.remove();
    await JobLog.findOneAndUpdate(
      { jobId: req.params.jobId },
      { status: "cancelled", updatedAt: new Date() }
    );
    res.json({ success: true, message: `Job ${req.params.jobId} cancelled` });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/dead", async (req, res) => {
  try {
    const deadJobs = await JobLog.find({ status: "dead" }).sort({ updatedAt: -1 });
    res.json({ success: true, total: deadJobs.length, jobs: deadJobs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/queues/:name/failed", async (req, res) => {
  try {
    const queueMap = {
      high:   highPriorityQueue,
      medium: mediumPriorityQueue,
      low:    lowPriorityQueue,
    };
    const queue = queueMap[req.params.name];
    if (!queue) return res.status(404).json({ error: "Queue not found" });
    const failed = await queue.getFailed();
    res.json({
      success: true,
      queue: req.params.name,
      total: failed.length,
      jobs: failed.map((j) => ({
        id: j.id, name: j.name, data: j.data,
        attemptsMade: j.attemptsMade, failedReason: j.failedReason, timestamp: j.timestamp,
      })),
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
