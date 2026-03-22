const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../helpers/authMiddleware");
const WorkShowcase = require("../models/workShowcase");
const { generateKey, getThumbnailKey, getPresignedUploadUrl, deleteImageWithThumbnail } = require("../helpers/s3Helper");

router.get("/", async (_req, res) => {
  try {
    const showcases = await WorkShowcase.find().sort({ createdAt: -1 });
    res.json(showcases);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const showcase = await WorkShowcase.findById(req.params.id);
    if (!showcase) return res.status(404).json({ message: "Not found" });
    res.json(showcase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/",
  authMiddleware,
  [
    body("title").notEmpty().withMessage("Title is required"),
    body("description").notEmpty().withMessage("Description is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, description, technologies, startDate, endDate } = req.body;
      const showcase = new WorkShowcase({
        title,
        description,
        technologies: technologies || [],
        startDate: startDate || null,
        endDate: endDate || null,
      });
      await showcase.save();
      res.status(201).json(showcase);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  "/:id/screenshots",
  authMiddleware,
  [
    body("filename").notEmpty().withMessage("Filename is required"),
    body("contentType").notEmpty().withMessage("Content type is required"),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { filename, contentType, caption } = req.body;
      const showcase = await WorkShowcase.findById(req.params.id);
      if (!showcase) return res.status(404).json({ message: "Not found" });

      const s3Key = generateKey("work", filename);
      const uploadUrl = await getPresignedUploadUrl(s3Key, contentType);

      showcase.screenshots.push({
        s3Key,
        thumbnailKey: getThumbnailKey(s3Key),
        caption: caption || "",
        order: showcase.screenshots.length,
      });
      await showcase.save();

      res.status(201).json({
        showcase,
        uploadUrl,
        screenshotIndex: showcase.screenshots.length - 1,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, technologies, startDate, endDate } = req.body;
    const showcase = await WorkShowcase.findByIdAndUpdate(
      req.params.id,
      { title, description, technologies, startDate, endDate },
      { new: true }
    );
    if (!showcase) return res.status(404).json({ message: "Not found" });
    res.json(showcase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const showcase = await WorkShowcase.findByIdAndDelete(req.params.id);
    if (!showcase) return res.status(404).json({ message: "Not found" });

    await Promise.all(
      showcase.screenshots.map((s) => deleteImageWithThumbnail(s.s3Key))
    );

    res.json({ message: "Work showcase deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch("/:id/screenshots/:screenshotId", authMiddleware, async (req, res) => {
  try {
    const showcase = await WorkShowcase.findById(req.params.id);
    if (!showcase) return res.status(404).json({ message: "Not found" });

    const screenshot = showcase.screenshots.id(req.params.screenshotId);
    if (!screenshot) return res.status(404).json({ message: "Screenshot not found" });

    if (req.body.caption !== undefined) screenshot.caption = req.body.caption;
    if (req.body.order !== undefined) screenshot.order = req.body.order;
    await showcase.save();

    res.json(showcase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id/screenshots/:screenshotId", authMiddleware, async (req, res) => {
  try {
    const showcase = await WorkShowcase.findById(req.params.id);
    if (!showcase) return res.status(404).json({ message: "Not found" });

    const screenshot = showcase.screenshots.id(req.params.screenshotId);
    if (!screenshot) return res.status(404).json({ message: "Screenshot not found" });

    await deleteImageWithThumbnail(screenshot.s3Key);
    screenshot.deleteOne();
    await showcase.save();

    res.json(showcase);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
