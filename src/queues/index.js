const Bull = require("bull");
const { redisConfig } = require("../config/redis");

const queueOptions = {
  redis: redisConfig,
  defaultJobOptions: {
    removeOnComplete: 100,  // Keep last 100 completed jobs
    removeOnFail: 200,      // Keep last 200 failed jobs
  },
};

const highPriorityQueue   = new Bull("high-priority", queueOptions);
const mediumPriorityQueue = new Bull("medium-priority", queueOptions);
const lowPriorityQueue    = new Bull("low-priority", queueOptions);

const getQueue = (priority = "medium") => {
  const map = {
    high:   highPriorityQueue,
    medium: mediumPriorityQueue,
    low:    lowPriorityQueue,
  };
  return map[priority] || mediumPriorityQueue;
};

module.exports = { highPriorityQueue, mediumPriorityQueue, lowPriorityQueue, getQueue };
