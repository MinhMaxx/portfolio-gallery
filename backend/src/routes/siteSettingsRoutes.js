const express = require("express");
const router = express.Router();
const authenticateAdmin = require("../helpers/authMiddleware");
const SiteSettings = require("../models/siteSettings");

const PUBLIC_KEYS = ["location", "heroTechStack", "heroLayout", "socialLinks"];

router.get("/:key", async (req, res) => {
  try {
    const { key } = req.params;
    if (!PUBLIC_KEYS.includes(key)) {
      return res.status(403).json({ error: "Not accessible" });
    }
    const value = await SiteSettings.get(key);
    res.json({ key, value });
  } catch (err) {
    res.status(500).json({ error: "Error fetching setting" });
  }
});

router.put("/:key", authenticateAdmin, async (req, res) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    if (value === undefined) {
      return res.status(400).json({ error: "value is required" });
    }
    const doc = await SiteSettings.set(key, value);
    res.json({ key: doc.key, value: doc.value });
  } catch (err) {
    res.status(500).json({ error: "Error updating setting" });
  }
});

module.exports = router;
