"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  buildVoiceoverScript,
  createEdgeTtsArgs,
  createVoiceoverCacheKey,
  estimateSpeechDurationSeconds,
  getVoiceoverSceneReports,
  normalizeVoiceoverConfig,
  VOICEOVER_VOICES
} = require("../src/audio/voiceover");
const { projectToRenderPayload } = require("../src/render/project-to-render-payload");
const { validateRenderPayload } = require("../src/render/render-payload-schema");

const projectRoot = path.resolve(__dirname, "../..");
const sampleProjectPath = path.join(projectRoot, "data", "sample-project.json");

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

assert.deepEqual(
  Object.keys(VOICEOVER_VOICES).sort(),
  ["en-US", "ja-JP", "vi-VN"],
  "Voiceover MVP should support Vietnamese, English, and Japanese."
);

assert.equal(normalizeVoiceoverConfig({ language: "vi-VN" }).voiceId, "vi-VN-HoaiMyNeural");
assert.equal(normalizeVoiceoverConfig({ language: "en-US" }).voiceId, "en-US-JennyNeural");
assert.equal(normalizeVoiceoverConfig({ language: "ja-JP" }).voiceId, "ja-JP-NanamiNeural");
assert.equal(
  normalizeVoiceoverConfig({ language: "xx-XX", voiceId: "unknown" }).language,
  "vi-VN",
  "Unsupported language should fall back to Vietnamese."
);

const sampleProject = readJson(sampleProjectPath);
const defaultPayload = projectToRenderPayload(sampleProject);
assert.equal(defaultPayload.audio.voiceover.enabled, false);
assert.equal(defaultPayload.audio.voiceover.provider, "edge-tts");
assert.equal(defaultPayload.audio.voiceover.language, "vi-VN");
assert.equal(defaultPayload.audio.voiceover.rate, "+0%");
assert.equal(defaultPayload.audio.voiceover.volume, "+0%");
assert.equal(defaultPayload.audio.backgroundMusic.enabled, false);
assert.equal(defaultPayload.audio.soundEffects.enabled, false);
assert.equal(validateRenderPayload(defaultPayload).valid, true, "Default audio contract should validate.");

const englishPayload = projectToRenderPayload({
  ...sampleProject,
  audio: {
    voiceover: {
      enabled: true,
      language: "en-US",
      rate: "+15%",
      volume: "-10%",
      script: "This is the English narration."
    }
  }
});
assert.equal(englishPayload.audio.voiceover.voiceId, "en-US-JennyNeural");
assert.equal(englishPayload.audio.voiceover.rate, "+15%");
assert.equal(englishPayload.audio.voiceover.volume, "-10%");
assert.equal(validateRenderPayload(englishPayload).valid, true, "Enabled English voiceover should validate.");
assert.equal(buildVoiceoverScript(englishPayload), "This is the English narration.");

const generatedScript = buildVoiceoverScript(defaultPayload);
assert.match(generatedScript, /Internal Analytics Dashboard/);
assert.match(generatedScript, /Dữ liệu tiến độ nằm rải rác nhiều nguồn/);
assert.match(generatedScript, /Giảm 70% thời gian/);

const sceneScriptPayload = {
  ...defaultPayload,
  scenes: defaultPayload.scenes.map((scene) => {
    if (scene.type === "problem") {
      return {
        ...scene,
        voiceover: {
          script: "Đây là voice riêng cho cảnh vấn đề.",
          estimatedDuration: 3,
          fits: true
        }
      };
    }
    return scene;
  })
};
assert.match(buildVoiceoverScript(sceneScriptPayload), /Đây là voice riêng cho cảnh vấn đề/);
assert.doesNotMatch(buildVoiceoverScript(sceneScriptPayload), /Dữ liệu tiến độ nằm rải rác nhiều nguồn/);

const longSceneScript = Array.from({ length: 80 }, () => "nội dung").join(" ");
const reports = getVoiceoverSceneReports({
  scenes: [
    {
      id: "scene-problem",
      type: "problem",
      title: "Bối cảnh và vấn đề",
      duration: 10,
      content: {},
      voiceover: {
        script: longSceneScript
      }
    }
  ]
});
assert.equal(reports[0].fits, false, "Long scene voiceover should be flagged as too long.");
assert.equal(estimateSpeechDurationSeconds("Xin chào"), 1);

const invalidLanguagePayload = {
  ...defaultPayload,
  audio: {
    ...defaultPayload.audio,
    voiceover: {
      ...defaultPayload.audio.voiceover,
      language: "fr-FR"
    }
  }
};
assert.equal(validateRenderPayload(invalidLanguagePayload).valid, false, "Unsupported voice language should fail.");

const missingScriptPayload = {
  ...defaultPayload,
  audio: {
    ...defaultPayload.audio,
    voiceover: {
      ...defaultPayload.audio.voiceover,
      enabled: true
    }
  }
};
const missingScriptValidation = validateRenderPayload(missingScriptPayload);
assert.equal(missingScriptValidation.valid, false, "Enabled voiceover without explicit script should fail contract.");
assert.equal(missingScriptValidation.errors.some((error) => error.path === "audio.voiceover.script"), true);

const edgeArgs = createEdgeTtsArgs({
  text: "Xin chào.",
  voiceId: "vi-VN-HoaiMyNeural",
  rate: "+10%",
  volume: "-5%",
  mediaPath: "/tmp/voice.mp3",
  subtitlePath: "/tmp/voice.srt"
});
assert.deepEqual(edgeArgs, [
  "-m",
  "edge_tts",
  "--voice",
  "vi-VN-HoaiMyNeural",
  "--rate",
  "+10%",
  "--volume",
  "-5%",
  "--text",
  "Xin chào.",
  "--write-media",
  "/tmp/voice.mp3",
  "--write-subtitles",
  "/tmp/voice.srt"
]);

assert.equal(
  createVoiceoverCacheKey({
    provider: "edge-tts",
    language: "vi-VN",
    voiceId: "vi-VN-HoaiMyNeural",
    script: "Xin chào."
  }),
  createVoiceoverCacheKey({
    provider: "edge-tts",
    language: "vi-VN",
    voiceId: "vi-VN-HoaiMyNeural",
    script: "Xin chào."
  }),
  "Voiceover cache key should be stable."
);

console.log("Audio voiceover tests passed.");
