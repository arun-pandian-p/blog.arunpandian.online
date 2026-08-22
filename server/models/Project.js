const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title: { type: String, required: true },
  problem: { type: String, required: true },
  data: { type: String, required: true },
  process: { type: String, required: true },
  insight: { type: String, required: true },
  tags: [{ type: String }],
  githubLink: { type: String },
  caseStudyLink: { type: String },
  demoLink: { type: String },
  order: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);
