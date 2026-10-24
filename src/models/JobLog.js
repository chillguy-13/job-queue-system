const mongoose = require("mongoose");

const jobLogSchema = new mongoose.Schema({
  jobId:       { type: String, required: true },
  jobType:     { type: String, required: true },
  queue:       { type: String, required: true },
  status:      { type: String, enum: ["queued","active","completed","failed","dead","cancelled"], default: "queued" },
  data:        { type: mongoose.Schema.Types.Mixed },
  result:      { type: mongoose.Schema.Types.Mixed },
  error:       { type: String },
  attempts:    { type: Number, default: 0 },
  maxAttempts: { type: Number },
  createdAt:   { type: Date, default: Date.now },
  updatedAt:   { type: Date, default: Date.now },
}, { timestamps: true });

jobLogSchema.index({ jobId: 1 });
jobLogSchema.index({ status: 1 });
jobLogSchema.index({ jobType: 1 });

module.exports = mongoose.model("JobLog", jobLogSchema);
