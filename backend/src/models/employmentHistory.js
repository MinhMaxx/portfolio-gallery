const mongoose = require("mongoose");

const employmentHistorySchema = new mongoose.Schema({
  company: {
    type: String,
    required: true,
  },
  companyDescription: {
    type: String,
    trim: true,
  },
  position: {
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
  description: {
    type: String,
  },
  highlights: {
    type: [String],
    default: [],
  },
  techStack: {
    type: [String],
    default: [],
  },
});

const EmploymentHistory = mongoose.model(
  "EmploymentHistory",
  employmentHistorySchema
);

module.exports = EmploymentHistory;
