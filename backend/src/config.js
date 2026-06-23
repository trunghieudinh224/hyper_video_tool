"use strict";

const path = require("node:path");

const projectRoot = path.resolve(__dirname, "../..");

const config = {
  host: process.env.HVT_HOST || "127.0.0.1",
  port: Number.parseInt(process.env.HVT_PORT || "3000", 10),
  projectRoot,
  frontendDir: path.join(projectRoot, "frontend"),
  outputsDir: path.join(projectRoot, "outputs")
};

if (!Number.isInteger(config.port) || config.port <= 0 || config.port > 65535) {
  throw new Error("HVT_PORT must be a valid TCP port.");
}

module.exports = { config };
