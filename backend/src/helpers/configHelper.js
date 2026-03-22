const fs = require("fs");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../../.env") });

const env = process.env.NODE_ENV || "develop";

let currentConfig = null;

const configFile = path.join(__dirname, "../config", `${env}.json`);
try {
  const rawData = fs.readFileSync(configFile, "utf-8");
  const configData = JSON.parse(rawData);
  currentConfig = configData[env];
} catch (err) {
  if (err.code === "ENOENT") {
    const exampleFile = path.join(__dirname, "../config/develop.example.json");
    const hasExample = fs.existsSync(exampleFile);
    console.warn(
      `\n⚠  Config file not found: config/${env}.json\n` +
        `   The backend will fall back to environment variables.\n` +
        (hasExample
          ? `   To create a config file, run:\n     cp backend/src/config/develop.example.json backend/src/config/develop.json\n   Then fill in your credentials.\n`
          : `   See .env.example for the required variables.\n`)
    );
  } else {
    console.error(`Failed to parse config/${env}.json:`, err.message);
  }
}

function get(envVar, configPath) {
  if (process.env[envVar]) return process.env[envVar];
  if (!currentConfig) return undefined;
  return configPath.split(".").reduce((obj, key) => obj?.[key], currentConfig);
}

module.exports = {
  getAppName: () => get("NAME", "name"),
  getPort: () => get("PORT", "port") || 3000,
  getMode: () => get("MODE", "mode") || env,
  getProtocol: () => get("PROTOCOL", "protocol") || "http",
  getServerUrl: () => get("SERVER_URL", "serverUrl"),
  getServerWebUrlLink: () =>
    get("SERVER_URL_WEB_URL_LINK", "serverUrlWebUrlLink"),
  getMongoConfig: () => ({
    host: get("MONGO_HOST", "mongo.host"),
    port: get("MONGO_PORT", "mongo.port"),
    user: get("MONGO_USER", "mongo.user"),
    password: get("MONGO_PASSWORD", "mongo.password"),
    database: get("MONGO_DATABASE", "mongo.database"),
    additionalParameters: get(
      "MONGO_ADDITIONAL_PARAMETERS",
      "mongo.additionalParameters"
    ),
  }),
  getAdminCredentials: () => ({
    username: get("ADMIN_USERNAME", "admin.username"),
    password: get("ADMIN_PASSWORD", "admin.password"),
  }),
  getNotifyEmailAccount: () => ({
    service: get("NOTIFY_EMAIL_SERVICE", "notifyEmailAccount.service"),
    email: get("NOTIFY_EMAIL", "notifyEmailAccount.email"),
    password: get("NOTIFY_EMAIL_PASSWORD", "notifyEmailAccount.password"),
  }),
  getContactEmail: () => get("CONTACT_EMAIL", "contactEmail"),
  getJwtSecret: () => get("JWT_SECRET", "jwtSecret"),
  getFrontendWebUrlLink: () =>
    get("FRONTEND_URL_WEB_URL_LINK", "frontendUrlWebUrlLink"),
  getPrivateEmailService: () => ({
    enabled: get("PRIVATE_EMAIL_ENABLED", "privateEmail.enabled"),
    host: get("PRIVATE_EMAIL_HOST", "privateEmail.host"),
    port: get("PRIVATE_EMAIL_PORT", "privateEmail.port"),
    user: get("PRIVATE_EMAIL_USER", "privateEmail.user"),
    password: get("PRIVATE_EMAIL_PASSWORD", "privateEmail.password"),
    secure: get("PRIVATE_EMAIL_SECURE", "privateEmail.secure"),
  }),
};
