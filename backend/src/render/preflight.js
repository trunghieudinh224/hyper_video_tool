"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");
const { validateRenderPayload } = require("./render-payload-schema");

function checkFileExists(filePath, label) {
  const exists = fs.existsSync(filePath) && fs.statSync(filePath).isFile();
  return {
    id: label,
    label,
    status: exists ? "ok" : "error",
    message: exists ? "File exists." : "Required file is missing.",
    detail: path.relative(config.projectRoot, filePath)
  };
}

function checkSamplePayload() {
  const payloadPath = path.join(config.projectRoot, "data", "render-payload.sample.json");

  try {
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
    const validation = validateRenderPayload(payload);
    return {
      id: "sample-payload",
      label: "Render payload sample",
      status: validation.valid ? "ok" : "error",
      message: validation.valid ? "Sample payload is valid." : "Sample payload is invalid.",
      detail: validation.valid ? path.relative(config.projectRoot, payloadPath) : validation.errors
    };
  } catch (error) {
    return {
      id: "sample-payload",
      label: "Render payload sample",
      status: "error",
      message: "Cannot read render payload sample.",
      detail: error.message
    };
  }
}

function checkOutputsDirectory() {
  try {
    fs.mkdirSync(config.outputsDir, { recursive: true });
    fs.accessSync(config.outputsDir, fs.constants.W_OK);
    return {
      id: "outputs-dir",
      label: "Outputs directory",
      status: "ok",
      message: "Outputs directory is writable.",
      detail: path.relative(config.projectRoot, config.outputsDir)
    };
  } catch (error) {
    return {
      id: "outputs-dir",
      label: "Outputs directory",
      status: "error",
      message: "Outputs directory is not writable.",
      detail: error.message
    };
  }
}

function checkTemplateFiles() {
  const templateDir = path.join(config.projectRoot, "templates", "project-showcase-90s");
  const checks = [
    checkFileExists(path.join(templateDir, "index.html"), "Template index.html"),
    checkFileExists(path.join(templateDir, "style.css"), "Template style.css"),
    checkFileExists(path.join(templateDir, "script.js"), "Template script.js")
  ];

  const indexPath = path.join(templateDir, "index.html");
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, "utf8");
    checks.push({
      id: "template-composition-id",
      label: "Template composition metadata",
      status: html.includes('data-composition-id="project-showcase-90s"') && html.includes('window.__timelines["project-showcase-90s"]') ? "ok" : "error",
      message: "Template composition metadata checked.",
      detail: "project-showcase-90s"
    });
  }

  return checks;
}

function checkRunnerFiles() {
  const runnerDir = path.join(config.projectRoot, ".cache", "hyperframes-runner");
  const required = [
    {
      id: "runner-node",
      label: "Local Node runtime",
      filePath: path.join(runnerDir, "node_modules", "node", "bin", "node")
    },
    {
      id: "runner-hyperframes",
      label: "HyperFrames CLI",
      filePath: path.join(runnerDir, "node_modules", "hyperframes", "dist", "cli.js")
    },
    {
      id: "runner-ffmpeg",
      label: "FFmpeg binary",
      filePath: path.join(runnerDir, "bin", "ffmpeg")
    },
    {
      id: "runner-ffprobe",
      label: "FFprobe binary",
      filePath: path.join(runnerDir, "bin", "ffprobe")
    }
  ];

  return required.map((item) => {
    const exists = fs.existsSync(item.filePath);
    return {
      id: item.id,
      label: item.label,
      status: exists ? "ok" : "warning",
      message: exists ? "Runner dependency is present." : "Runner dependency is missing. Run: npm --prefix backend run hf:setup",
      detail: path.relative(config.projectRoot, item.filePath)
    };
  });
}

function getRenderPreflight() {
  const checks = [
    checkSamplePayload(),
    ...checkTemplateFiles(),
    checkOutputsDirectory(),
    ...checkRunnerFiles()
  ];

  const hasError = checks.some((check) => check.status === "error");
  const hasWarning = checks.some((check) => check.status === "warning");

  return {
    ready: !hasError,
    status: hasError ? "error" : hasWarning ? "warning" : "ok",
    checkedAt: new Date().toISOString(),
    checks,
    actions: [
      "Nếu runner dependency bị thiếu, chạy: npm --prefix backend run hf:setup",
      "Nếu template lint lỗi, chạy: node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint",
      "Nếu outputs/ không ghi được, kiểm tra quyền ghi thư mục project."
    ]
  };
}

module.exports = { getRenderPreflight };
