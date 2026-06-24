"use strict";

const path = require("node:path");

const projectRoot = path.resolve(__dirname, "../..");

const config = {
  host: process.env.HVT_HOST || "127.0.0.1",
  port: Number.parseInt(process.env.HVT_PORT || "3000", 10),
  projectRoot,
  frontendDir: path.join(projectRoot, "frontend"),
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

module.exports = { config };
