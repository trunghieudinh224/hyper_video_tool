"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  buildVoiceoverScript,
  createEdgeTtsArgs,
  createVoiceoverCacheKey,
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
assert.equal(defaultPayload.audio.backgroundMusic.enabled, false);
assert.equal(defaultPayload.audio.soundEffects.enabled, false);
assert.equal(validateRenderPayload(defaultPayload).valid, true, "Default audio contract should validate.");

const englishPayload = projectToRenderPayload({
  ...sampleProject,
  audio: {
    voiceover: {
      enabled: true,
      language: "en-US",
      script: "This is the English narration."
    }
  }
});
assert.equal(englishPayload.audio.voiceover.voiceId, "en-US-JennyNeural");
assert.equal(validateRenderPayload(englishPayload).valid, true, "Enabled English voiceover should validate.");
assert.equal(buildVoiceoverScript(englishPayload), "This is the English narration.");

const generatedScript = buildVoiceoverScript(defaultPayload);
assert.match(generatedScript, /Internal Analytics Dashboard/);
assert.match(generatedScript, /Dữ liệu tiến độ nằm rải rác nhiều nguồn/);
assert.match(generatedScript, /Giảm 70% thời gian/);

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
  mediaPath: "/tmp/voice.mp3",
  subtitlePath: "/tmp/voice.srt"
});
assert.deepEqual(edgeArgs, [
  "-m",
  "edge_tts",
  "--voice",
  "vi-VN-HoaiMyNeural",
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
