const { lowPriorityQueue } = require("../queues");
const { JOB_TYPES } = require("../jobs/jobTypes");
const JobLog = require("../models/JobLog");

const CONCURRENCY = parseInt(process.env.LOW_CONCURRENCY) || 1;

lowPriorityQueue.process(JOB_TYPES.IMAGE, CONCURRENCY, async (job) => {
  console.log(`🖼️  Processing image job ${job.id}`, job.data);

  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "active", attempts: job.attemptsMade + 1, updatedAt: new Date() },
    { upsert: true }
  );

  // Simulate image processing steps
  for (const op of (job.data.operations || [])) {
    console.log(`  ⚙️  Applying operation: ${op}`);
    await new Promise((res) => setTimeout(res, 300));
    await job.progress(
      Math.round(((job.data.operations.indexOf(op) + 1) / job.data.operations.length) * 100)
    );
  }

  const result = {
    processed: true,
    operations: job.data.operations,
    outputUrl: `https://cdn.example.com/processed/${Date.now()}.jpg`,
  };

  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "completed", result, updatedAt: new Date() }
  );

  console.log(`✅ Image job ${job.id} completed`);
  return result;
});

lowPriorityQueue.on("failed", async (job, err) => {
  console.error(`❌ Image job ${job.id} failed (attempt ${job.attemptsMade}): ${err.message}`);
  await JobLog.findOneAndUpdate(
    { jobId: String(job.id) },
    { status: "failed", error: err.message, updatedAt: new Date() }
  );
});

console.log(`👷 Image worker started (concurrency: ${CONCURRENCY})`);
