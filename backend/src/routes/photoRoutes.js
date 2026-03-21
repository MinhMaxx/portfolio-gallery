const express = require("express");
const router = express.Router();
const { body, validationResult } = require("express-validator");
const authMiddleware = require("../helpers/authMiddleware");
const Photo = require("../models/photo");
const { generateKey, getThumbnailKey, getPresignedUploadUrl, deleteImageWithThumbnail } = require("../helpers/s3Helper");

router.get("/", async (req, res) => {
  try {
    const { category, page = 1, limit = 50 } = req.query;
    const filter = category && category !== "all" ? { category } : {};
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [photos, total] = await Promise.all([
      Photo.find(filter).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      Photo.countDocuments(filter),
    ]);

    res.json({ photos, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/categories", async (_req, res) => {
  try {
    const categories = await Photo.distinct("category");
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post(
  "/",
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
      const { filename, contentType, title, description, category, takenAt } = req.body;
      const s3Key = generateKey("photos", filename);
      const uploadUrl = await getPresignedUploadUrl(s3Key, contentType);

      const photo = new Photo({
        title: title || "",
        description: description || "",
        category: category || "general",
        s3Key,
        thumbnailKey: getThumbnailKey(s3Key),
        takenAt: takenAt || null,
      });
      await photo.save();

      res.status(201).json({ photo, uploadUrl });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.post(
  "/batch",
  authMiddleware,
  [body("files").isArray({ min: 1 }).withMessage("Files array is required")],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { files, category } = req.body;

      const results = await Promise.all(
        files.map(async (file) => {
          const s3Key = generateKey("photos", file.filename);
          const uploadUrl = await getPresignedUploadUrl(s3Key, file.contentType);
          const photo = new Photo({
            title: file.title || "",
            description: file.description || "",
            category: category || "general",
            s3Key,
            thumbnailKey: getThumbnailKey(s3Key),
          });
          await photo.save();
          return { photo, uploadUrl };
        })
      );

      res.status(201).json(results);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

router.put("/:id", authMiddleware, async (req, res) => {
  try {
    const { title, description, category, takenAt } = req.body;
    const photo = await Photo.findByIdAndUpdate(
      req.params.id,
      { title, description, category, takenAt },
      { new: true }
    );
    if (!photo) return res.status(404).json({ message: "Photo not found" });
    res.json(photo);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findByIdAndDelete(req.params.id);
    if (!photo) return res.status(404).json({ message: "Photo not found" });
    await deleteImageWithThumbnail(photo.s3Key);
    res.json({ message: "Photo deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
