const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema({
  key: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  value: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

siteSettingsSchema.statics.get = async function (key) {
  const doc = await this.findOne({ key });
  return doc?.value ?? null;
};

siteSettingsSchema.statics.set = async function (key, value) {
  return this.findOneAndUpdate(
    { key },
    { value, updatedAt: new Date() },
    { upsert: true, new: true },
  );
};

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
