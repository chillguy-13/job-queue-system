const { getQueue } = require("../queues");
const { JOB_TYPES, JOB_DEFAULTS } = require("./jobTypes");

const addJob = async (type, data, priorityLevel = "medium") => {
  const queue   = getQueue(priorityLevel);
  const options = JOB_DEFAULTS[type] || {};

  const job = await queue.add(type, data, options);

  console.log(`📥 Job added | type=${type} id=${job.id} priority=${priorityLevel}`);
  return job;
};

// Convenience producers
const addEmailJob = (data) =>
  addJob(JOB_TYPES.EMAIL, data, "high");

const addImageJob = (data) =>
  addJob(JOB_TYPES.IMAGE, data, "low");

const addNotificationJob = (data) =>
  addJob(JOB_TYPES.NOTIFICATION, data, "medium");

module.exports = { addJob, addEmailJob, addImageJob, addNotificationJob };
