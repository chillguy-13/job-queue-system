const JOB_TYPES = {
  EMAIL:        "email",
  IMAGE:        "image_processing",
  NOTIFICATION: "notification",
};

const JOB_PRIORITIES = {
  HIGH:   1,
  MEDIUM: 5,
  LOW:    10,
};

// Default options per job type
const JOB_DEFAULTS = {
  [JOB_TYPES.EMAIL]: {
    priority: JOB_PRIORITIES.HIGH,
    attempts: 5,
    backoff: { type: "exponential", delay: 2000 },
  },
  [JOB_TYPES.IMAGE]: {
    priority: JOB_PRIORITIES.LOW,
    attempts: 3,
    backoff: { type: "exponential", delay: 5000 },
  },
  [JOB_TYPES.NOTIFICATION]: {
    priority: JOB_PRIORITIES.MEDIUM,
    attempts: 4,
    backoff: { type: "exponential", delay: 3000 },
  },
};

module.exports = { JOB_TYPES, JOB_PRIORITIES, JOB_DEFAULTS };
