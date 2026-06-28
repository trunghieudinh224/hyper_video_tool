"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "../..");
const context = vm.createContext({
  console,
  encodeURIComponent,
  fetch: async () => {
    throw new Error("Network access is not expected in payload tests.");
  },
  window: {}
});

const constantsSource = fs.readFileSync(path.join(projectRoot, "frontend/scripts/common/constants.js"), "utf8");
const renderSource = fs.readFileSync(path.join(projectRoot, "frontend/scripts/common/render-preview.js"), "utf8");
vm.runInContext(`${constantsSource}\n${renderSource}\nglobalThis.__AppRender = AppRender;`, context);

const project = {
  projectName: "Video style regression",
  projectSlug: "video-style-regression",
  videoStyleId: "clean-report",
  videoStyleOverrides: {
    "clean-report": {
      colorTheme: {
        border: "#ABCDEF"
      }
    }
  },
  video: {
    formatId: "dynamic-story-vertical",
    fps: 30,
    outputFilename: "video-style-regression.mp4"
  },
  templateConfig: {},
  audio: {
    voiceover: {
      enabled: false,
      provider: "edge-tts",
      language: "vi-VN",
      voiceId: "vi-VN-HoaiMyNeural",
      rate: "+0%",
      volume: "+0%",
      script: "",
      outputPath: ""
    }
  },
  assets: [],
  features: [],
  milestones: []
};

const payload = context.__AppRender.buildRenderPayload(project);

assert.equal(payload.template.config.videoStyle.id, "clean-report");
assert.equal(payload.template.config.videoStyle.colorTheme.background, "#F8FAFC");
assert.equal(payload.template.config.videoStyle.colorTheme.surface, "#FFFFFF");
assert.equal(payload.template.config.videoStyle.colorTheme.surfaceAlt, "#EEF2F7");
assert.equal(payload.template.config.videoStyle.colorTheme.text, "#111827");
assert.equal(payload.template.config.videoStyle.colorTheme.mutedText, "#64748B");
assert.equal(payload.template.config.videoStyle.colorTheme.accent, "#1F4FD8");
assert.equal(payload.template.config.videoStyle.colorTheme.accentSoft, "#E8EEFC");
assert.equal(payload.template.config.videoStyle.colorTheme.border, "#ABCDEF");
assert.equal(payload.template.config.videoStyle.colorTheme.glow, "rgba(31, 79, 216, 0.16)");
assert.equal(payload.template.config.videoStyle.motionStyle, "minimal");
assert.equal(payload.template.config.videoStyle.backgroundStyle, "clean-surface");

console.log("Frontend video style payload tests passed.");
