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
assert.equal(generatedPayload.scenes.every((scene) => scene.voiceover && typeof scene.voiceover.script === "string"), true);
assert.equal(generatedPayload.audio.voiceover.rate, "+0%");
assert.equal(generatedPayload.audio.voiceover.volume, "+0%");
assert.equal(generatedPayload.video.estimatedDuration, 74);
assert.equal(generatedPayload.video.aspectRatio, "16:9");
assert.equal(generatedPayload.video.width, 1920);
assert.equal(generatedPayload.video.height, 1080);

const invalidPayload = { ...generatedPayload, version: "invalid" };
const invalidValidation = validateRenderPayload(invalidPayload);
assert.equal(invalidValidation.valid, false, "Invalid version should fail validation.");

const verticalPayload = projectToRenderPayload(project, { aspectRatio: "9:16" });
assert.equal(verticalPayload.template.id, "project-showcase-vertical-60s");
assert.equal(verticalPayload.video.aspectRatio, "9:16");
assert.equal(verticalPayload.video.width, 1080);
assert.equal(verticalPayload.video.height, 1920);
assert.equal(validateRenderPayload(verticalPayload).valid, true, "Vertical payload should be valid.");

const mismatchedVerticalPayload = {
  ...verticalPayload,
  template: {
    ...verticalPayload.template,
    id: "project-showcase-90s"
  }
};
const mismatchedValidation = validateRenderPayload(mismatchedVerticalPayload);
assert.equal(mismatchedValidation.valid, false, "Vertical payload with horizontal template should fail validation.");

const fallbackPayload = projectToRenderPayload();
assert.equal(validateRenderPayload(fallbackPayload).valid, true, "Fallback payload should remain valid.");
assert.equal(fallbackPayload.source.projectSlug, "untitled-project");

const sceneVoicePayload = projectToRenderPayload({
  ...project,
  voiceover: {
    sceneScripts: {
      intro: "Đây là phần đọc mở đầu.",
      timeline: ""
    }
  },
  milestones: project.milestones.map((milestone, index) => ({
    ...milestone,
    voiceoverScript: index === 0 ? "Đây là phần đọc cho cột mốc đầu tiên." : ""
  }))
});
assert.equal(sceneVoicePayload.scenes.find((scene) => scene.type === "intro").voiceover.script, "Đây là phần đọc mở đầu.");
assert.match(
  sceneVoicePayload.scenes.find((scene) => scene.type === "timeline").voiceover.script,
  /cột mốc đầu tiên/
);
assert.equal(validateRenderPayload(sceneVoicePayload).valid, true, "Scene-level voiceover payload should validate.");

console.log("Render payload tests passed.");
