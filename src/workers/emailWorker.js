const { highPriorityQueue } = require("../queues");
const { JOB_TYPES } = require("../jobs/jobTypes");
const JobLog = require("../models/JobLog");

const CONCURRENCY = parseInt(process.env.HIGH_CONCURRENCY) || 5;

highPriorityQueue.process(JOB_TYPES.EMAIL, CONCURRENCY, async (job) => {
  console.log(`📧 Processing email job ${job.id}`, job.data);

  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "active", attempts: job.attemptsMade + 1, updatedAt: new Date() },
    { upsert: true }
  );

  // Simulate email sending (replace with real provider e.g. SendGrid)
  await new Promise((res) => setTimeout(res, 500));

  // Simulate occasional failure for retry demo (fails on attempt 1)
  if (job.attemptsMade === 0 && job.data.simulateFail) {
    throw new Error("Email provider temporarily unavailable");
  }

  const result = { sent: true, to: job.data.to, timestamp: new Date() };

  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "completed", result, updatedAt: new Date() }
  );

  console.log(`✅ Email job ${job.id} completed`);
  return result;
});

highPriorityQueue.on("failed", async (job, err) => {
  console.error(`❌ Email job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "failed", error: err.message, updatedAt: new Date() }
  );
});

highPriorityQueue.on("completed", (job) => {
  console.log(`🎉 Email job ${job.id} done`);
});

console.log(`👷 Email worker started (concurrency: ${CONCURRENCY})`);
