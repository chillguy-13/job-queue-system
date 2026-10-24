const express = require("express");
const router  = express.Router();
const { addEmailJob, addImageJob, addNotificationJob } = require("../jobs/producer");

// POST /api/jobs/email
router.post("/email", async (req, res) => {
  try {
    const job = await addEmailJob(req.body);
    res.status(201).json({ jobId: job.id, type: "email", status: "queued" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/image
router.post("/image", async (req, res) => {
  try {
    const job = await addImageJob(req.body);
    res.status(201).json({ jobId: job.id, type: "image_processing", status: "queued" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/jobs/notification
router.post("/notification", async (req, res) => {
  try {
    const job = await addNotificationJob(req.body);
    res.status(201).json({ jobId: job.id, type: "notification", status: "queued" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
