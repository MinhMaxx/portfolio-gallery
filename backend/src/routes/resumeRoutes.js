const express = require("express");
const router = express.Router();
const authenticateAdmin = require("../helpers/authMiddleware");
const SiteSettings = require("../models/siteSettings");
const { generateKey, getPresignedUploadUrl, deleteS3Object } = require("../helpers/s3Helper");

const RESUME_KEY = "resumeFileKey";

router.get("/", async (_req, res) => {
  try {
    const fileKey = await SiteSettings.get(RESUME_KEY);
    res.json({ fileKey: fileKey || null });
  } catch (err) {
    res.status(500).json({ error: "Error fetching resume" });
  }
});

router.post("/upload", authenticateAdmin, async (req, res) => {
  try {
    const { filename, contentType } = req.body;
    if (!filename || !contentType) {
      return res.status(400).json({ error: "filename and contentType are required" });
    }

    const key = `resume/${filename}`;
    const uploadUrl = await getPresignedUploadUrl(key, contentType);

    const oldKey = await SiteSettings.get(RESUME_KEY);
    if (oldKey) {
      await deleteS3Object(oldKey).catch(() => {});
    }

    await SiteSettings.set(RESUME_KEY, key);

    res.json({ uploadUrl, fileKey: key });
  } catch (err) {
    res.status(500).json({ error: "Error generating upload URL" });
  }
});

module.exports = router;
