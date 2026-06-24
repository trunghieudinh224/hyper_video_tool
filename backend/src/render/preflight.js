"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");
const { TEMPLATE_PRESETS, validateRenderPayload } = require("./render-payload-schema");

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

function checkDynamicSamplePayload() {
  const payloadPath = path.join(config.projectRoot, "data", "dynamic-motion-payload.sample.json");

  try {
    const payload = JSON.parse(fs.readFileSync(payloadPath, "utf8"));
    const validation = validateRenderPayload(payload);
    return {
      id: "dynamic-motion-sample-payload",
      label: "Dynamic motion sample payload",
      status: validation.valid ? "ok" : "error",
      message: validation.valid ? "Dynamic sample payload is valid." : "Dynamic sample payload is invalid.",
      detail: validation.valid ? path.relative(config.projectRoot, payloadPath) : validation.errors
    };
  } catch (error) {
    return {
      id: "dynamic-motion-sample-payload",
      label: "Dynamic motion sample payload",
      status: "error",
      message: "Cannot read dynamic motion sample payload.",
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

function checkTemplateFilesForPreset(preset) {
  const templateDir = path.join(config.projectRoot, "templates", preset.templateId);
  const checks = [
    checkFileExists(path.join(templateDir, "index.html"), `${preset.templateName} index.html`),
    checkFileExists(path.join(templateDir, "style.css"), `${preset.templateName} style.css`),
    checkFileExists(path.join(templateDir, "script.js"), `${preset.templateName} script.js`),
    checkFileExists(path.join(templateDir, "vendor", "gsap.min.js"), `${preset.templateName} local GSAP`)
  ];

  const indexPath = path.join(templateDir, "index.html");
  if (fs.existsSync(indexPath)) {
    const html = fs.readFileSync(indexPath, "utf8");
    checks.push({
      id: `${preset.templateId}-composition-id`,
      label: `${preset.templateName} composition metadata`,
      status: html.includes(`data-composition-id="${preset.templateId}"`)
        && html.includes(`data-width="${preset.width}"`)
        && html.includes(`data-height="${preset.height}"`)
        && html.includes(`window.__timelines["${preset.templateId}"]`) ? "ok" : "error",
      message: "Template composition metadata checked.",
      detail: `${preset.templateId} ${preset.width}x${preset.height}`
    });
    checks.push({
      id: `${preset.templateId}-local-gsap`,
      label: `${preset.templateName} local animation runtime`,
      status: html.includes('src="vendor/gsap.min.js"') && !html.includes("cdn.jsdelivr.net/npm/gsap") ? "ok" : "error",
      message: "Template should use local GSAP instead of CDN.",
      detail: `templates/${preset.templateId}/vendor/gsap.min.js`
    });
  }

  return checks;
}

function checkTemplateFiles() {
  return Object.values(TEMPLATE_PRESETS).flatMap(checkTemplateFilesForPreset);
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
    checkDynamicSamplePayload(),
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
      "Nếu template dọc lint lỗi, chạy: node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-vertical-60s lint",
      "Nếu template dynamic lint lỗi, chạy: node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-vertical lint",
      "Nếu template dynamic ngang lint lỗi, chạy: node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-horizontal lint",
      "Nếu outputs/ không ghi được, kiểm tra quyền ghi thư mục project."
    ]
  };
}

module.exports = { getRenderPreflight };
