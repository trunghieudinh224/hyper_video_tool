"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { projectToRenderPayload } = require("../src/render/project-to-render-payload");
const { validateRenderPayload } = require("../src/render/render-payload-schema");
const { createMuxAudioTracksArgs } = require("../src/render/media");

const projectRoot = path.resolve(__dirname, "../..");
const sampleProjectPath = path.join(projectRoot, "data", "sample-project.json");
const samplePayloadPath = path.join(projectRoot, "data", "render-payload.sample.json");
const dynamicSamplePayloadPath = path.join(projectRoot, "data", "dynamic-motion-payload.sample.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

const project = readJson(sampleProjectPath);
const expectedPayload = readJson(samplePayloadPath);
const generatedPayload = projectToRenderPayload(project);

const validation = validateRenderPayload(generatedPayload);
assert.equal(validation.valid, true, `Payload should be valid: ${JSON.stringify(validation.errors)}`);

if (generatedPayload.version === "dynamic-motion-1.0.0") {
  assert.equal(generatedPayload.source.projectSlug, "codegraph-ai-agent-intro");
  assert.equal(generatedPayload.template.id, "dynamic-story-vertical");
  assert.equal(generatedPayload.video.aspectRatio, "9:16");
  assert.equal(generatedPayload.video.width, 1080);
  assert.equal(generatedPayload.video.height, 1920);
  assert.equal(generatedPayload.template.config.videoStyle.id, "dark-tech");
  assert.equal(generatedPayload.scenes.length, 7);
  assert.equal(generatedPayload.scenes.every((scene) => scene.type === "slot"), true);
  assert.equal(generatedPayload.scenes.every((scene) => scene.duration && scene.duration.mode === "fixed"), true);
  assert.equal(generatedPayload.scenes[0].sceneTemplate.name, "Short-form dev intro");
  assert.equal(generatedPayload.scenes[0].sceneTemplate.slots.length, 4);
  assert.equal(generatedPayload.scenes[0].sceneTemplate.slots[0].layout.width, 42);
  assert.equal(generatedPayload.scenes[0].slots.title.text, "CHO AI AGENT");
  assert.equal(generatedPayload.scenes[1].sceneTemplate.name, "Short-form problem hook");
  assert.equal(generatedPayload.scenes[1].slots.title.text, "KHÔNG HIỂU FLOW");
  const captionProject = {
    ...project,
    features: project.features.map((feature, index) => index === 0
      ? { ...feature, subtitles: { enabled: true, mode: "custom", style: "minimal", text: "Câu mở đầu" } }
      : feature)
  };
  const captionPayload = projectToRenderPayload(captionProject);
  assert.equal(captionPayload.scenes[0].captions.text, "Câu mở đầu");
  assert.equal(validateRenderPayload(captionPayload).valid, true);
  const mixedVoiceProject = {
    ...project,
    audio: { ...project.audio, voiceover: { ...project.audio.voiceover, enabled: true, script: "" } },
    features: project.features.map((feature, index) => index === 0
      ? { ...feature, voiceoverScript: "Xin chào [en]CodeGraph[/en]" }
      : feature)
  };
  const mixedVoicePayload = projectToRenderPayload(mixedVoiceProject);
  assert.match(mixedVoicePayload.audio.voiceover.script, /\[en\]CodeGraph\[\/en\]/);
  assert.equal(validateRenderPayload(mixedVoicePayload).valid, true);
  const invalidCaptionPayload = {
    ...captionPayload,
    scenes: captionPayload.scenes.map((scene, index) => index === 0
      ? { ...scene, captions: { enabled: true, mode: "srt", style: "minimal", text: "wrong" } }
      : scene)
  };
  assert.equal(validateRenderPayload(invalidCaptionPayload).valid, false);
} else {
  assert.deepEqual(generatedPayload, expectedPayload, "Generated payload must match data/render-payload.sample.json.");

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
}

const invalidPayload = { ...generatedPayload, version: "invalid" };
const invalidValidation = validateRenderPayload(invalidPayload);
assert.equal(invalidValidation.valid, false, "Invalid version should fail validation.");

const verticalPayload = projectToRenderPayload(project, { aspectRatio: "9:16" });
assert.equal(verticalPayload.template.id, "project-showcase-vertical-60s");
assert.equal(verticalPayload.video.aspectRatio, "9:16");
assert.equal(verticalPayload.video.width, 1080);
assert.equal(verticalPayload.video.height, 1920);
assert.equal(validateRenderPayload(verticalPayload).valid, true, "Vertical payload should be valid.");

const backgroundMusicPayload = projectToRenderPayload({
  ...project,
  assets: [
    ...(project.assets || []),
    {
      id: "asset_background_music",
      name: "background-music.mp3",
      type: "audio",
      url: "/api/assets/asset_background_music/file",
      useInVideo: true
    }
  ],
  audio: {
    ...(project.audio || {}),
    backgroundMusic: {
      enabled: true,
      assetId: "asset_background_music",
      volume: 0.35,
      ducking: true
    }
  }
});
assert.equal(backgroundMusicPayload.audio.backgroundMusic.enabled, true);
assert.equal(backgroundMusicPayload.audio.backgroundMusic.source, "/api/assets/asset_background_music/file");
assert.equal(backgroundMusicPayload.audio.backgroundMusic.volume, 0.35);
assert.equal(validateRenderPayload(backgroundMusicPayload).valid, true, "Background music payload should be valid.");

const deletedBackgroundMusicPayload = projectToRenderPayload({
  ...project,
  assets: project.assets || [],
  audio: {
    ...(project.audio || {}),
    backgroundMusic: {
      enabled: true,
      assetId: "asset_deleted_music",
      source: "/api/assets/asset_deleted_music/file",
      volume: 0.2,
      ducking: true
    }
  }
});
assert.equal(deletedBackgroundMusicPayload.audio.backgroundMusic.enabled, false);
assert.equal(deletedBackgroundMusicPayload.audio.backgroundMusic.source, "");

const muxAudioArgs = createMuxAudioTracksArgs({
  videoPath: "/tmp/video.mp4",
  voiceoverPath: "/tmp/voice.mp3",
  backgroundMusicPath: "/tmp/music.mp3",
  backgroundMusicVolume: 0.35,
  outputPath: "/tmp/output.mp4"
});
assert.ok(muxAudioArgs.includes("-filter_complex"), "Voiceover + music mux should use filter_complex.");
assert.ok(muxAudioArgs.includes("-stream_loop"), "Background music mux should loop the music source.");
assert.ok(muxAudioArgs.join(" ").includes("volume=0.35"), "Background music volume should be applied.");

const mismatchedVerticalPayload = {
  ...verticalPayload,
  template: {
    ...verticalPayload.template,
    id: "project-showcase-90s"
  }
};
const mismatchedValidation = validateRenderPayload(mismatchedVerticalPayload);
assert.equal(mismatchedValidation.valid, false, "Vertical payload with horizontal template should fail validation.");

const dynamicPayload = readJson(dynamicSamplePayloadPath);
const dynamicValidation = validateRenderPayload(dynamicPayload);
assert.equal(dynamicValidation.valid, true, `Dynamic payload should be valid: ${JSON.stringify(dynamicValidation.errors)}`);
assert.equal(dynamicPayload.version, "dynamic-motion-1.0.0");
assert.equal(dynamicPayload.template.id, "dynamic-story-vertical");
assert.equal(dynamicPayload.video.aspectRatio, "9:16");
assert.equal(dynamicPayload.video.width, 1080);
assert.equal(dynamicPayload.video.height, 1920);
assert.deepEqual(
  dynamicPayload.scenes.map((scene) => scene.type),
  ["title", "text", "media", "cards", "steps", "outro"],
  "Dynamic scene order must match MVP flow."
);

const mismatchedDynamicPayload = {
  ...dynamicPayload,
  video: {
    ...dynamicPayload.video,
    aspectRatio: "16:9",
    width: 1920,
    height: 1080
  }
};
const mismatchedDynamicValidation = validateRenderPayload(mismatchedDynamicPayload);
assert.equal(mismatchedDynamicValidation.valid, false, "Dynamic vertical payload with horizontal video settings should fail validation.");

const dynamicHorizontalPayload = {
  ...dynamicPayload,
  template: {
    ...dynamicPayload.template,
    id: "dynamic-story-horizontal"
  },
  video: {
    ...dynamicPayload.video,
    aspectRatio: "16:9",
    width: 1920,
    height: 1080
  }
};
const dynamicHorizontalValidation = validateRenderPayload(dynamicHorizontalPayload);
assert.equal(
  dynamicHorizontalValidation.valid,
  true,
  `Dynamic horizontal payload should be valid: ${JSON.stringify(dynamicHorizontalValidation.errors)}`
);

const dynamicSlotPayload = {
  ...dynamicPayload,
  scenes: [
    {
      id: "scene-slot-test",
      type: "slot",
      headline: "Slot scene",
      body: "Generated from template segment slots.",
      duration: {
        mode: "fixed",
        min: 4,
        max: 4
      },
      background: {
        type: "color",
        color: "#111827"
      },
      sceneTemplate: {
        id: "intro-stack",
        name: "Intro Stack",
        slots: []
      },
      slots: [
        {
          id: "slot-title",
          type: "text",
          label: "Title",
          value: "Slot Title",
          layout: {
            x: 8,
            y: 10,
            width: 84,
            height: 20
          }
        }
      ]
    }
  ]
};
const dynamicSlotValidation = validateRenderPayload(dynamicSlotPayload);
assert.equal(dynamicSlotValidation.valid, true, `Dynamic slot payload should be valid: ${JSON.stringify(dynamicSlotValidation.errors)}`);

const globalBackgroundPayload = projectToRenderPayload({
  projectName: "Global background",
  projectSlug: "global-background",
  templateId: "dynamic-story-vertical",
  videoStyleId: "dark-tech",
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
assert.equal(globalBackgroundPayload.scenes[0].background.mode, "asset");
assert.equal(globalBackgroundPayload.scenes[0].background.assetId, "asset-global-bg");
assert.equal(validateRenderPayload(globalBackgroundPayload).valid, true, "Global background payload should validate.");

const globalColorBackgroundPayload = projectToRenderPayload({
  projectName: "Global color background",
  projectSlug: "global-color-background",
  templateId: "dynamic-story-vertical",
  videoStyleId: "dark-tech",
  videoBackground: {
    mode: "color",
    colorType: "gradient",
    color: "#05070A",
    gradientFrom: "#05070A",
    gradientTo: "#22D3EE",
    gradientDirection: "to-bottom"
  },
  features: [
    {
      id: "segment-1",
      name: "Segment 1",
      description: "Segment custom background should be ignored.",
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
          text: "Segment 1"
        }
      }
    }
  ]
});
assert.equal(globalColorBackgroundPayload.scenes[0].background.mode, "color");
assert.equal(globalColorBackgroundPayload.scenes[0].background.colorType, "gradient");
assert.equal(globalColorBackgroundPayload.scenes[0].background.gradientDirection, "to-bottom");
assert.equal(validateRenderPayload(globalColorBackgroundPayload).valid, true, "Global color background payload should validate.");

const fallbackPayload = projectToRenderPayload();
assert.equal(validateRenderPayload(fallbackPayload).valid, true, "Fallback payload should remain valid.");
assert.equal(fallbackPayload.source.projectSlug, "untitled-project");

const sceneVoicePayload = projectToRenderPayload(
  {
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
  },
  { aspectRatio: "16:9" }
);
assert.equal(sceneVoicePayload.scenes.find((scene) => scene.type === "intro").voiceover.script, "Đây là phần đọc mở đầu.");
assert.match(
  sceneVoicePayload.scenes.find((scene) => scene.type === "timeline").voiceover.script,
  /cột mốc đầu tiên/
);
assert.equal(validateRenderPayload(sceneVoicePayload).valid, true, "Scene-level voiceover payload should validate.");

console.log("Render payload tests passed.");
