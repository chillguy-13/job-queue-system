const { highPriorityQueue, mediumPriorityQueue, lowPriorityQueue } = require("../queues");
const JobLog = require("../models/JobLog");

const queues = [highPriorityQueue, mediumPriorityQueue, lowPriorityQueue];

queues.forEach((queue) => {
  queue.on("failed", async (job, err) => {
    const isLastAttempt = job.attemptsMade >= job.opts.attempts;

    if (isLastAttempt) {
      console.error(`💀 Job ${job.id} (${job.name}) moved to dead-letter after ${job.attemptsMade} attempts`);

      await JobLog.findOneAndUpdate(
        { jobId: String(job.id) },
        {
          status:     "dead",
          error:      err.message,
          attempts:   job.attemptsMade,
          updatedAt:  new Date(),
        },
        { upsert: true }
      );
    }
  });
});

console.log("💀 Dead-letter queue monitor started");
