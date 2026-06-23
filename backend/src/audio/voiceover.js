"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { config } = require("../config");

const VOICEOVER_VOICES = {
  "vi-VN": [
    { id: "vi-VN-HoaiMyNeural", label: "Hoai My", gender: "female" },
    { id: "vi-VN-NamMinhNeural", label: "Nam Minh", gender: "male" }
  ],
  "en-US": [
    { id: "en-US-JennyNeural", label: "Jenny", gender: "female" },
    { id: "en-US-GuyNeural", label: "Guy", gender: "male" }
  ],
  "ja-JP": [
    { id: "ja-JP-NanamiNeural", label: "Nanami", gender: "female" },
    { id: "ja-JP-KeitaNeural", label: "Keita", gender: "male" }
  ]
};

const DEFAULT_LANGUAGE = "vi-VN";
const DEFAULT_PROVIDER = "edge-tts";

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function getVoiceByLanguage(language) {
  return VOICEOVER_VOICES[language] || VOICEOVER_VOICES[DEFAULT_LANGUAGE];
}

function normalizeVoiceoverConfig(input = {}) {
  const requestedLanguage = normalizeText(input.language);
  const language = VOICEOVER_VOICES[requestedLanguage] ? requestedLanguage : DEFAULT_LANGUAGE;
  const voices = getVoiceByLanguage(language);
  const requestedVoiceId = normalizeText(input.voiceId);
  const voice = voices.find((item) => item.id === requestedVoiceId) || voices[0];

  return {
    enabled: Boolean(input.enabled),
    provider: normalizeText(input.provider) || DEFAULT_PROVIDER,
    language,
    voiceId: voice.id,
    script: normalizeText(input.script),
    outputPath: normalizeText(input.outputPath)
  };
}

function createScriptLine(scene) {
  const content = scene && scene.content && typeof scene.content === "object" ? scene.content : {};
  const parts = [
    scene && scene.title,
    content.projectName,
    content.tagline,
    content.summary,
    content.problem,
    content.solution,
    content.keyHighlight,
    content.resultImpact,
    content.endingNote
  ];
  const items = Array.isArray(content.items) ? content.items : [];
  items.slice(0, 4).forEach((item) => {
    parts.push(item && item.title, item && item.description, item && item.benefit);
  });

  return normalizeText(parts.filter(Boolean).join(". "));
}

function buildVoiceoverScript(payload = {}) {
  const configuredScript = normalizeText(payload.audio && payload.audio.voiceover && payload.audio.voiceover.script);
  if (configuredScript) {
    return configuredScript;
  }

  const scenes = Array.isArray(payload.scenes) ? payload.scenes : [];
  return scenes.map(createScriptLine).filter(Boolean).join("\n");
}

function createVoiceoverCacheKey({ provider, language, voiceId, script }) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ provider, language, voiceId, script }))
    .digest("hex")
    .slice(0, 16);
}

function getVoiceoverOutputPaths(cacheKey) {
  const audioDir = path.join(config.projectRoot, "outputs", "audio");
  return {
    audioDir,
    mediaPath: path.join(audioDir, `${cacheKey}.mp3`),
    subtitlePath: path.join(audioDir, `${cacheKey}.srt`)
  };
}

function createEdgeTtsArgs({ text, voiceId, mediaPath, subtitlePath }) {
  return [
    "-m",
    "edge_tts",
    "--voice",
    voiceId,
    "--text",
    text,
    "--write-media",
    mediaPath,
    "--write-subtitles",
    subtitlePath
  ];
}

function runEdgeTts(args, options = {}) {
  const pythonCommand = options.pythonCommand || process.env.HVT_PYTHON || "python3";
  const spawnImpl = options.spawn || spawn;

  return new Promise((resolve, reject) => {
    const child = spawnImpl(pythonCommand, args, {
      cwd: config.projectRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const error = new Error(
        `edge-tts failed with exit code ${exitCode}. Install it with: python3 -m pip install edge-tts`
      );
      error.code = "EDGE_TTS_FAILED";
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

async function generateVoiceover(payload = {}, options = {}) {
  const voiceover = normalizeVoiceoverConfig(payload.audio && payload.audio.voiceover);
  const script = buildVoiceoverScript(payload);

  if (!voiceover.enabled) {
    return {
      enabled: false,
      provider: voiceover.provider,
      language: voiceover.language,
      voiceId: voiceover.voiceId,
      script,
      mediaPath: "",
      subtitlePath: "",
      cached: false
    };
  }

  if (!script) {
    throw new Error("Cannot generate voiceover without script text.");
  }

  if (voiceover.provider !== DEFAULT_PROVIDER) {
    throw new Error(`Unsupported local voiceover provider: ${voiceover.provider}.`);
  }

  const cacheKey = createVoiceoverCacheKey({
    provider: voiceover.provider,
    language: voiceover.language,
    voiceId: voiceover.voiceId,
    script
  });
  const paths = getVoiceoverOutputPaths(cacheKey);
  ensureDirectory(paths.audioDir);

  if (fs.existsSync(paths.mediaPath) && fs.statSync(paths.mediaPath).size > 0) {
    return {
      enabled: true,
      provider: voiceover.provider,
      language: voiceover.language,
      voiceId: voiceover.voiceId,
      script,
      mediaPath: paths.mediaPath,
      subtitlePath: fs.existsSync(paths.subtitlePath) ? paths.subtitlePath : "",
      cached: true
    };
  }

  await runEdgeTts(createEdgeTtsArgs({
    text: script,
    voiceId: voiceover.voiceId,
    mediaPath: paths.mediaPath,
    subtitlePath: paths.subtitlePath
  }), options);

  return {
    enabled: true,
    provider: voiceover.provider,
    language: voiceover.language,
    voiceId: voiceover.voiceId,
    script,
    mediaPath: paths.mediaPath,
    subtitlePath: fs.existsSync(paths.subtitlePath) ? paths.subtitlePath : "",
    cached: false
  };
}

module.exports = {
  VOICEOVER_VOICES,
  buildVoiceoverScript,
  createEdgeTtsArgs,
  createVoiceoverCacheKey,
  generateVoiceover,
  getVoiceoverOutputPaths,
  normalizeVoiceoverConfig
};
