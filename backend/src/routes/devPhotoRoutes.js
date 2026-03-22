const express = require("express");
const router = express.Router();
const fs = require("fs");
const path = require("path");

const PHOTO_DIR = path.join(__dirname, "../../../local-assets/gallery");
const CATEGORIES_FILE = path.join(PHOTO_DIR, "categories.json");

function loadCategories() {
  try {
    if (fs.existsSync(CATEGORIES_FILE)) {
      return JSON.parse(fs.readFileSync(CATEGORIES_FILE, "utf-8"));
    }
  } catch {}
  return {};
}

router.get("/", (req, res) => {
  try {
    if (!fs.existsSync(PHOTO_DIR)) {
      return res.json({ photos: [], total: 0, page: 1, pages: 0 });
    }

    const tagMap = loadCategories();
    const { category, page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.max(1, Math.min(100, parseInt(limit)));

    const files = fs
      .readdirSync(PHOTO_DIR)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();

    let photos = files.map((file, i) => {
      const raw = tagMap[file];
      const tags = Array.isArray(raw) ? raw : raw ? [raw] : ["uncategorized"];
      return {
        _id: `local-${i}`,
        title: "",
        description: "",
        tags,
        s3Key: `gallery/${file}`,
        thumbnailKey: `gallery/${file}`,
      };
    });

    if (category && category !== "all") {
      photos = photos.filter((p) => p.tags.includes(category));
    }

    const total = photos.length;
    const pages = Math.ceil(total / limitNum);
    const skip = (pageNum - 1) * limitNum;
    const paged = photos.slice(skip, skip + limitNum);

    res.json({ photos: paged, total, page: pageNum, pages });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get("/categories", (_req, res) => {
  try {
    const tagMap = loadCategories();
    const allTags = Object.values(tagMap).flat();
    const unique = [...new Set(allTags)].filter(Boolean).sort();
    res.json(unique);
  } catch {
    res.json([]);
  }
});

module.exports = router;
