"use strict";

const assert = require("node:assert/strict");
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

const project = readJson(sampleProjectPath);
const expectedPayload = readJson(samplePayloadPath);
const generatedPayload = projectToRenderPayload(project);

assert.deepEqual(generatedPayload, expectedPayload, "Generated payload must match data/render-payload.sample.json.");

const validation = validateRenderPayload(generatedPayload);
assert.equal(validation.valid, true, `Payload should be valid: ${JSON.stringify(validation.errors)}`);

assert.deepEqual(
  generatedPayload.scenes.map((scene) => scene.type),
  ["intro", "problem", "solution", "features", "timeline", "impact", "outro"],
  "Scene order must match MVP video flow."
);

assert.equal(generatedPayload.scenes.find((scene) => scene.type === "features").content.items.length, 4);
assert.equal(generatedPayload.scenes.find((scene) => scene.type === "timeline").content.milestones.length, 5);
assert.equal(generatedPayload.video.estimatedDuration, 74);

const invalidPayload = { ...generatedPayload, version: "invalid" };
const invalidValidation = validateRenderPayload(invalidPayload);
assert.equal(invalidValidation.valid, false, "Invalid version should fail validation.");

const fallbackPayload = projectToRenderPayload();
assert.equal(validateRenderPayload(fallbackPayload).valid, true, "Fallback payload should remain valid.");
assert.equal(fallbackPayload.source.projectSlug, "untitled-project");

console.log("Render payload tests passed.");
