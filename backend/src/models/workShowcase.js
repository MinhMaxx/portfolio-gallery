const mongoose = require("mongoose");

const screenshotSchema = new mongoose.Schema({
  s3Key: { type: String, required: true },
  thumbnailKey: { type: String, default: "" },
  caption: { type: String, trim: true, default: "" },
  order: { type: Number, default: 0 },
});

const workShowcaseSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true, trim: true },
  technologies: [{ type: String, trim: true }],
  screenshots: [screenshotSchema],
  startDate: { type: Date },
  endDate: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("WorkShowcase", workShowcaseSchema);
