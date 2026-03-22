const express = require("express");
const router = express.Router();
const authenticateAdmin = require("../helpers/authMiddleware");
const Project = require("../models/project");
const { body, validationResult } = require("express-validator");
const {
  generateKey,
  getThumbnailKey,
  getPresignedUploadUrl,
  deleteImageWithThumbnail,
} = require("../helpers/s3Helper");

const projectValidation = [
  body("name")
    .isString()
    .withMessage("Name must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Name is required"),
  body("description")
    .isString()
    .withMessage("Description must be a string")
    .trim()
    .isLength({ min: 1 })
    .withMessage("Description is required"),
  body("startDate").isDate().withMessage("Start Date must be a valid date"),
  body("endDate")
    .optional({ checkFalsy: true })
    .isDate()
    .withMessage("End Date must be a valid date"),
  body("technologiesUsed")
    .optional()
    .isArray()
    .withMessage("Technologies Used must be an array of strings"),
  body("link")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Link must be a valid URL"),
  body("githubLink")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("GitHub link must be a valid URL"),
  body("demoLink")
    .optional({ checkFalsy: true })
    .isURL()
    .withMessage("Demo link must be a valid URL"),
];

// Fetch all projects
router.get("/", async (req, res) => {
  try {
    const projects = await Project.find().sort({ startDate: -1 }); // Sorting by startDate in descending order
    res.json(projects);
  } catch (err) {
    res.status(500).send("Error fetching projects");
  }
});

// Fetch a specific project by ID
router.get("/:id", async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).send("Project not found");
    res.json(project);
  } catch (err) {
    res.status(500).send("Error fetching the project");
  }
});

// Add a new project
router.post("", authenticateAdmin, projectValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const project = new Project(req.body);
  try {
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(500).send("Error saving the project");
  }
});

// Update an existing project by ID
router.put("/:id", authenticateAdmin, projectValidation, async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedProject) return res.status(404).send("Project not found");
    res.json(updatedProject);
  } catch (err) {
    res.status(500).send("Error updating the project");
  }
});

// Delete a project by ID
router.delete("/:id", authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).send("Project not found");

    if (project.screenshots && project.screenshots.length > 0) {
      await Promise.all(
        project.screenshots.map((s) => deleteImageWithThumbnail(s.s3Key))
      );
    }

    res.json({ message: `Deleted project ${req.params.id}` });
  } catch (err) {
    res.status(500).send("Error deleting the project");
  }
});

// Upload a screenshot to a project
router.post(
  "/:id/screenshots",
  authenticateAdmin,
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
      const project = await Project.findById(req.params.id);
      if (!project) return res.status(404).json({ message: "Project not found" });

      const s3Key = generateKey("projects", filename);
      const uploadUrl = await getPresignedUploadUrl(s3Key, contentType);

      project.screenshots.push({
        s3Key,
        thumbnailKey: getThumbnailKey(s3Key),
        caption: caption || "",
        order: project.screenshots.length,
      });
      await project.save();

      res.status(201).json({
        project,
        uploadUrl,
        screenshotIndex: project.screenshots.length - 1,
      });
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

// Update a screenshot caption
router.patch("/:id/screenshots/:screenshotId", authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const screenshot = project.screenshots.id(req.params.screenshotId);
    if (!screenshot) return res.status(404).json({ message: "Screenshot not found" });

    if (req.body.caption !== undefined) screenshot.caption = req.body.caption;
    if (req.body.order !== undefined) screenshot.order = req.body.order;
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete a screenshot from a project
router.delete("/:id/screenshots/:screenshotId", authenticateAdmin, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const screenshot = project.screenshots.id(req.params.screenshotId);
    if (!screenshot) return res.status(404).json({ message: "Screenshot not found" });

    await deleteImageWithThumbnail(screenshot.s3Key);
    screenshot.deleteOne();
    await project.save();

    res.json(project);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
