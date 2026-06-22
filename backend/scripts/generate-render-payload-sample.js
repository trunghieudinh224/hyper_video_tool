"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { projectToRenderPayload } = require("../src/render/project-to-render-payload");
const { validateRenderPayload } = require("../src/render/render-payload-schema");

const projectRoot = path.resolve(__dirname, "../..");
const sampleProjectPath = path.join(projectRoot, "data", "sample-project.json");
const samplePayloadPath = path.join(projectRoot, "data", "render-payload.sample.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function main() {
  const shouldWrite = process.argv.includes("--write");
  const project = readJson(sampleProjectPath);
  const payload = projectToRenderPayload(project);
  const validation = validateRenderPayload(payload);

  if (!validation.valid) {
    console.error("Render payload validation failed:");
    for (const error of validation.errors) {
      console.error(`- ${error.path}: ${error.message}`);
    }
    process.exit(1);
  }

  const output = stableJson(payload);

  if (shouldWrite) {
    fs.writeFileSync(samplePayloadPath, output);
    console.log(`Wrote ${path.relative(projectRoot, samplePayloadPath)}`);
    return;
  }

  const existing = fs.existsSync(samplePayloadPath) ? fs.readFileSync(samplePayloadPath, "utf8") : "";
  if (existing !== output) {
    console.error(`${path.relative(projectRoot, samplePayloadPath)} is stale. Run: npm --prefix backend run payload:write`);
    process.exit(1);
  }

  console.log("Render payload sample is up to date and valid.");
}

main();
