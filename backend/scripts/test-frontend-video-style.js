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

const backgroundPayload = context.__AppRender.buildRenderPayload({
  ...project,
  videoBackground: {
    mode: "asset",
    assetId: "asset-global-bg"
  },
  assets: [
    {
      id: "asset-global-bg",
      name: "Global Background",
      type: "background",
      url: "/uploads/global-bg.png",
      useInVideo: true
    }
  ],
  features: [
    {
      id: "segment-1",
      name: "Segment 1",
      description: "Segment custom background should be ignored.",
      useInVideo: true,
      sceneTemplateId: "intro-stack",
      durationSec: 4,
      background: {
        mode: "color",
        color: "#111827"
      },
      slots: {
        title: {
          type: "text",
          text: "Segment 1"
        }
      }
    }
  ]
});

assert.equal(backgroundPayload.scenes[0].background.mode, "asset");
assert.equal(backgroundPayload.scenes[0].background.assetId, "asset-global-bg");

const colorBackgroundPayload = context.__AppRender.buildRenderPayload({
  ...project,
  videoBackground: {
    mode: "color",
    colorType: "gradient",
    color: "#05070A",
    gradientFrom: "#05070A",
    gradientTo: "#22D3EE",
    gradientDirection: "to-bottom"
  },
  features: backgroundPayload.scenes.map((scene, index) => ({
    id: `segment-color-${index + 1}`,
    name: scene.headline || "Segment",
    description: scene.body || "",
    useInVideo: true,
    sceneTemplateId: "intro-stack",
    durationSec: 4,
    background: {
      mode: "asset",
      assetId: "ignored-segment-bg"
    },
    slots: {
      title: {
        type: "text",
        text: "Segment"
      }
    }
  }))
});

assert.equal(colorBackgroundPayload.scenes[0].background.mode, "color");
assert.equal(colorBackgroundPayload.scenes[0].background.colorType, "gradient");
assert.equal(colorBackgroundPayload.scenes[0].background.gradientDirection, "to-bottom");

const deletedMusicPayload = context.__AppRender.buildRenderPayload({
  ...project,
  assets: [],
  audio: {
    ...project.audio,
    backgroundMusic: {
      enabled: true,
      assetId: "asset_deleted_music",
      source: "/api/assets/asset_deleted_music/file",
      volume: 0.2,
      ducking: true
    }
  }
});
assert.equal(deletedMusicPayload.audio.backgroundMusic.enabled, false);
assert.equal(deletedMusicPayload.audio.backgroundMusic.source, "");

assert.equal(context.__AppRender.getSceneStartTimeSec([
  { durationSec: 7 },
  { durationSec: 8 },
  { durationSec: 5 }
], 2), 15);

console.log("Frontend video style payload tests passed.");
