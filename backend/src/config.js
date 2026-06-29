"use strict";

const path = require("node:path");

const projectRoot = path.resolve(__dirname, "../..");

const config = {
  host: process.env.HVT_HOST || "127.0.0.1",
  port: Number.parseInt(process.env.HVT_PORT || "3000", 10),
  projectRoot,
  frontendDir: path.join(projectRoot, "frontend"),
  databasePath: process.env.HVT_DATABASE_PATH || path.join(projectRoot, "data", "hyper-video-tool.sqlite"),
  sqliteBin: process.env.HVT_SQLITE_BIN || "sqlite3",
  uploadsDir: process.env.HVT_UPLOADS_DIR || path.join(projectRoot, "uploads"),
  uploadImageMaxBytes: Number.parseInt(process.env.HVT_UPLOAD_IMAGE_MAX_MB || "15", 10) * 1024 * 1024,
  uploadVideoMaxBytes: Number.parseInt(process.env.HVT_UPLOAD_VIDEO_MAX_MB || "300", 10) * 1024 * 1024,
  uploadAudioMaxBytes: Number.parseInt(process.env.HVT_UPLOAD_AUDIO_MAX_MB || "50", 10) * 1024 * 1024,
  outputsDir: path.join(projectRoot, "outputs"),
  audioCacheMaxBytes: Number.parseInt(process.env.HVT_AUDIO_CACHE_MAX_MB || "200", 10) * 1024 * 1024,
  audioCacheMaxAgeDays: Number.parseInt(process.env.HVT_AUDIO_CACHE_MAX_AGE_DAYS || "7", 10)
};

if (!Number.isInteger(config.port) || config.port <= 0 || config.port > 65535) {
  throw new Error("HVT_PORT must be a valid TCP port.");
}

if (!Number.isFinite(config.audioCacheMaxBytes) || config.audioCacheMaxBytes < 0) {
  throw new Error("HVT_AUDIO_CACHE_MAX_MB must be a non-negative number.");
}

if (!Number.isFinite(config.audioCacheMaxAgeDays) || config.audioCacheMaxAgeDays < 0) {
  throw new Error("HVT_AUDIO_CACHE_MAX_AGE_DAYS must be a non-negative number.");
}

if (!Number.isFinite(config.uploadImageMaxBytes) || config.uploadImageMaxBytes <= 0) {
  throw new Error("HVT_UPLOAD_IMAGE_MAX_MB must be a positive number.");
}

if (!Number.isFinite(config.uploadVideoMaxBytes) || config.uploadVideoMaxBytes <= 0) {
  throw new Error("HVT_UPLOAD_VIDEO_MAX_MB must be a positive number.");
}

if (!Number.isFinite(config.uploadAudioMaxBytes) || config.uploadAudioMaxBytes <= 0) {
  throw new Error("HVT_UPLOAD_AUDIO_MAX_MB must be a positive number.");
}

module.exports = { config };
