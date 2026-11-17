"use strict";

const assert = require("node:assert/strict");
const { EventEmitter } = require("node:events");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const {
  buildVoiceoverScript,
  createEdgeTtsArgs,
  createVoiceoverCacheKey,
  estimateSpeechDurationSeconds,
  generateVoiceover,
  getVoiceoverSceneReports,
  getPlainVoiceScript,
  getSegmentVoiceId,
  normalizeVoiceoverConfig,
  parseVoiceScriptSegments,
  VOICEOVER_VOICES
} = require("../src/audio/voiceover");
const { parseSrtCues } = require("../src/audio/subtitles");
const { config } = require("../src/config");
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
assert.equal(defaultPayload.audio.voiceover.enabled, true);
assert.equal(defaultPayload.audio.voiceover.provider, "edge-tts");
assert.equal(defaultPayload.audio.voiceover.language, "vi-VN");
assert.equal(defaultPayload.audio.voiceover.rate, "+4%");
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
assert.match(generatedScript, /Codegraph là bản đồ cấu trúc/);
assert.match(generatedScript, /caller, callee và quan hệ phụ thuộc/);
assert.match(generatedScript, /không thay thế kiểm chứng/);

const sceneScriptPayload = {
  ...defaultPayload,
  audio: {
    ...defaultPayload.audio,
    voiceover: {
      ...defaultPayload.audio.voiceover,
      script: ""
    }
  },
  scenes: defaultPayload.scenes.map((scene, index) => {
    if (index === 0) {
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
assert.deepEqual(parseVoiceScriptSegments("Xin chào [en]CodeGraph[/en] và こんにちは.", "vi-VN"), [
  { language: "vi-VN", text: "Xin chào" },
  { language: "en-US", text: "CodeGraph" },
  { language: "vi-VN", text: "và" },
  { language: "ja-JP", text: "こんにちは." }
]);
assert.equal(getPlainVoiceScript("Xin chào [en]CodeGraph[/en]"), "Xin chào CodeGraph");
assert.equal(getSegmentVoiceId(normalizeVoiceoverConfig({ language: "vi-VN", voiceId: "vi-VN-NamMinhNeural" }), "en-US"), "en-US-GuyNeural");
assert.throws(() => parseVoiceScriptSegments("Xin [en]hi[/ja]"), /Mismatched/);
assert.throws(() => parseVoiceScriptSegments("Xin [en]hi"), /Unclosed/);

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
      enabled: true,
      script: ""
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
assert.notEqual(
  createVoiceoverCacheKey({ provider: "edge-tts", language: "vi-VN", voiceId: "vi-VN-HoaiMyNeural", script: "[en]Hello[/en]" }),
  createVoiceoverCacheKey({ provider: "edge-tts", language: "vi-VN", voiceId: "vi-VN-HoaiMyNeural", script: "[en]Hello[/en]", processingVersion: "multilingual-v1" })
);

async function testMixedVoiceGeneration() {
  const tempRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hvt-mixed-voice-test-"));
  const originalRoot = config.projectRoot;
  const voices = [];
  config.projectRoot = tempRoot;
  try {
    const payload = { audio: { voiceover: {
      enabled: true,
      provider: "edge-tts",
      language: "vi-VN",
      voiceId: "vi-VN-HoaiMyNeural",
      script: "Xin [en]CodeGraph[/en] こんにちは"
    } } };
    const spawn = (_command, args) => {
      const child = new EventEmitter();
      child.stdout = new EventEmitter();
      child.stderr = new EventEmitter();
      const voiceId = args[args.indexOf("--voice") + 1];
      const mediaPath = args[args.indexOf("--write-media") + 1];
      const subtitlePath = args[args.indexOf("--write-subtitles") + 1];
      const text = args[args.indexOf("--text") + 1];
      voices.push(voiceId);
      process.nextTick(() => {
        fs.writeFileSync(mediaPath, "fake audio");
        fs.writeFileSync(subtitlePath, `1\n00:00:00,000 --> 00:00:01,000\n${text}\n`);
        child.emit("close", 0);
      });
      return child;
    };
    const options = {
      spawn,
      getMediaDurationSeconds: async () => 1,
      concatAudioSegments: async ({ outputPath }) => fs.writeFileSync(outputPath, "combined audio")
    };
    const result = await generateVoiceover(payload, options);
    assert.deepEqual(voices, ["vi-VN-HoaiMyNeural", "en-US-JennyNeural", "ja-JP-NanamiNeural"]);
    assert.deepEqual(parseSrtCues(fs.readFileSync(result.subtitlePath, "utf8")).map((cue) => cue.start), [0, 1000, 2000]);
    assert.equal(result.cached, false);
    const cached = await generateVoiceover(payload, options);
    assert.equal(cached.cached, true);
    assert.equal(voices.length, 3);
  } finally {
    config.projectRoot = originalRoot;
    fs.rmSync(tempRoot, { recursive: true, force: true });
  }
}

testMixedVoiceGeneration()
  .then(() => console.log("Audio voiceover tests passed."))
  .catch((error) => { console.error(error); process.exitCode = 1; });
