const mongoose = require("mongoose");

const photoSchema = new mongoose.Schema({
  title: { type: String, trim: true, default: "" },
  description: { type: String, trim: true, default: "" },
  category: { type: String, trim: true, default: "general" },
  s3Key: { type: String, required: true },
  thumbnailKey: { type: String, default: "" },
  width: { type: Number, default: 0 },
  height: { type: Number, default: 0 },
  takenAt: { type: Date },
  createdAt: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("Photo", photoSchema);
