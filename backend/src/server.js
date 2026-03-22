const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const adminRoutes = require("./routes/adminRoutes");
const certificateRoutes = require("./routes/certificateRoutes");
const contactRoutes = require("./routes/contactRoutes");
const degreeRoutes = require("./routes/degreeRoutes");
const employmentHistoryRoutes = require("./routes/employmentHistoryRoutes");
const projectRoutes = require("./routes/projectRoutes");
const photoRoutes = require("./routes/photoRoutes");
const workShowcaseRoutes = require("./routes/workShowcaseRoutes");
const resumeRoutes = require("./routes/resumeRoutes");
const siteSettingsRoutes = require("./routes/siteSettingsRoutes");
const { mongooseConnection } = require("./databaseMongo");
const configHelper = require("./helpers/configHelper");
const bodyParser = require("body-parser");

const path = require("path");

const app = express();

mongooseConnection()
  .then(() => {
    console.log("Connected to MongoDB successfully.");
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
  });

app.use(helmet());
app.use("/api/demo", (_req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("Content-Security-Policy", "frame-ancestors *");
  res.setHeader("Cross-Origin-Embedder-Policy", "unsafe-none");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
});
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.set("trust proxy", 1);

const apiRouter = express.Router();
apiRouter.use("/admin", adminRoutes);
apiRouter.use("/certificate", certificateRoutes);
apiRouter.use("/contact", contactRoutes);
apiRouter.use("/degree", degreeRoutes);
apiRouter.use("/employment", employmentHistoryRoutes);
apiRouter.use("/project", projectRoutes);
if (process.env.NODE_ENV !== "production") {
  const devPhotoRoutes = require("./routes/devPhotoRoutes");
  apiRouter.use("/photo", devPhotoRoutes);
  apiRouter.use("/local-photos", express.static(path.join(__dirname, "../../local-assets")));
  apiRouter.use("/demo/old-portfolio", express.static(path.join(__dirname, "../../demos/old-portfolio/build")));
} else {
  apiRouter.use("/photo", photoRoutes);
}
apiRouter.use("/work-showcase", workShowcaseRoutes);
apiRouter.use("/resume", resumeRoutes);
apiRouter.use("/settings", siteSettingsRoutes);

app.use("/api", apiRouter);

// Health check
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const startServer = () => {
  app.listen(configHelper.getPort(), () => {
    console.log(`Server is running on port: ${configHelper.getPort()}`);
    console.log(`Mode: ${configHelper.getMode()}`);
  });
};

if (require.main === module) {
  startServer();
}

module.exports = app;
