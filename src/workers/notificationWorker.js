const { mediumPriorityQueue } = require("../queues");
const { JOB_TYPES } = require("../jobs/jobTypes");
const JobLog = require("../models/JobLog");

const CONCURRENCY = parseInt(process.env.MEDIUM_CONCURRENCY) || 3;

mediumPriorityQueue.process(JOB_TYPES.NOTIFICATION, CONCURRENCY, async (job) => {
  console.log(`🔔 Processing notification job ${job.id}`, job.data);

  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "active", attempts: job.attemptsMade + 1, updatedAt: new Date() },
    { upsert: true }
  );

  await new Promise((res) => setTimeout(res, 200));

  const result = {
    delivered: true,
    userId: job.data.userId,
    channel: job.data.channel,
    timestamp: new Date(),
  };

  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "completed", result, updatedAt: new Date() }
  );

  console.log(`✅ Notification job ${job.id} completed`);
  return result;
});

mediumPriorityQueue.on("failed", async (job, err) => {
  console.error(`❌ Notification job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "failed", error: err.message, updatedAt: new Date() }
  );
});

console.log(`👷 Notification worker started (concurrency: ${CONCURRENCY})`);
