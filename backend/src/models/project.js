const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema({
  s3Key: { type: String, required: true },
  thumbnailKey: { type: String, default: "" },
  caption: { type: String, trim: true, default: "" },
  order: { type: Number, default: 0 },
});

const projectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  startDate: {
    type: Date,
    required: true,
    index: true,
  },
  endDate: {
    type: Date,
  },
  technologiesUsed: {
    type: [String],
  },
  link: {
    type: String,
    trim: true,
  },
  githubLink: {
    type: String,
    trim: true,
  },
  demoLink: {
    type: String,
    trim: true,
  },
  screenshots: [screenshotSchema],
});

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;
