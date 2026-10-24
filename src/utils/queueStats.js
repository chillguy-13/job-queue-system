const { highPriorityQueue, mediumPriorityQueue, lowPriorityQueue } = require("../queues");

const getAllQueueStats = async () => {
  const queues = [
    { name: "high-priority",   queue: highPriorityQueue },
    { name: "medium-priority", queue: mediumPriorityQueue },
    { name: "low-priority",    queue: lowPriorityQueue },
  ];

  const stats = await Promise.all(
    queues.map(async ({ name, queue }) => {
      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getCompletedCount(),
        queue.getFailedCount(),
        queue.getDelayedCount(),
      ]);

      return { name, waiting, active, completed, failed, delayed };
    })
  );

  return stats;
};

module.exports = { getAllQueueStats };
