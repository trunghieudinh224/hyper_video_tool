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
const DEFAULT_RATE = "+0%";
const DEFAULT_VOLUME = "+0%";
const EDGE_TTS_VENV_DIR = path.join(config.projectRoot, ".cache", "edge-tts-venv");
const EDGE_TTS_BASE_WORDS_PER_MINUTE = 185;

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function normalizePercent(value, fallback = "+0%") {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value >= 0 ? "+" : ""}${Math.trunc(value)}%`;
  }

  const normalized = normalizeText(value);
  if (/^[+-]\d+%$/.test(normalized)) {
    return normalized;
  }

  return fallback;
}

function estimateSpeechDurationSeconds(value) {
  const text = normalizeText(value);
  if (!text) {
    return 0;
  }

  const wordCount = text.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil((wordCount / EDGE_TTS_BASE_WORDS_PER_MINUTE) * 60));
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
    rate: normalizePercent(input.rate, DEFAULT_RATE),
    volume: normalizePercent(input.volume, DEFAULT_VOLUME),
    script: normalizeText(input.script),
    outputPath: normalizeText(input.outputPath)
  };
}

function createScriptLine(scene) {
  const content = scene && scene.content && typeof scene.content === "object" ? scene.content : {};
  const voiceover = scene && scene.voiceover && typeof scene.voiceover === "object" ? scene.voiceover : {};
  const configuredScript = normalizeText(voiceover.script);
  if (configuredScript) {
    return configuredScript;
  }

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

function getVoiceoverSceneReports(payload = {}) {
  const scenes = Array.isArray(payload.scenes) ? payload.scenes : [];
  return scenes.map((scene) => {
    const script = createScriptLine(scene);
    const estimatedDuration = estimateSpeechDurationSeconds(script);
    const duration = Number.isFinite(scene.duration) ? scene.duration : 0;

    return {
      sceneId: scene.id || "",
      type: scene.type || "",
      title: scene.title || "",
      duration,
      estimatedDuration,
      script,
      fits: !script || estimatedDuration <= duration
    };
  });
}

function createVoiceoverCacheKey({ provider, language, voiceId, rate, volume, script }) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify({ provider, language, voiceId, rate, volume, script }))
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

function createEdgeTtsArgs({ text, voiceId, rate = DEFAULT_RATE, volume = DEFAULT_VOLUME, mediaPath, subtitlePath }) {
  return [
    "-m",
    "edge_tts",
    "--voice",
    voiceId,
    "--rate",
    normalizePercent(rate, DEFAULT_RATE),
    "--volume",
    normalizePercent(volume, DEFAULT_VOLUME),
    "--text",
    text,
    "--write-media",
    mediaPath,
    "--write-subtitles",
    subtitlePath
  ];
}

function getDefaultPythonCommand() {
  if (process.env.HVT_PYTHON) {
    return process.env.HVT_PYTHON;
  }

  const venvPython = process.platform === "win32"
    ? path.join(EDGE_TTS_VENV_DIR, "Scripts", "python.exe")
    : path.join(EDGE_TTS_VENV_DIR, "bin", "python");

  return fs.existsSync(venvPython) ? venvPython : "python3";
}

function runEdgeTts(args, options = {}) {
  const pythonCommand = options.pythonCommand || getDefaultPythonCommand();
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
        `edge-tts failed with exit code ${exitCode}. Install it with: npm --prefix backend run audio:setup`
      );
      error.code = "EDGE_TTS_FAILED";
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function runEdgeTtsWithRetry(args, mediaPath, options = {}) {
  const maxAttempts = options.maxAttempts || 3;
  let lastError = null;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    fs.rmSync(mediaPath, { force: true });

    try {
      const result = await runEdgeTts(args, options);
      if (fs.existsSync(mediaPath) && fs.statSync(mediaPath).size > 0) {
        return result;
      }
      throw new Error("edge-tts produced an empty audio file.");
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await wait(800 * attempt);
      }
    }
  }

  throw lastError;
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
      rate: voiceover.rate,
      volume: voiceover.volume,
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
    rate: voiceover.rate,
    volume: voiceover.volume,
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
      rate: voiceover.rate,
      volume: voiceover.volume,
      script,
      mediaPath: paths.mediaPath,
      subtitlePath: fs.existsSync(paths.subtitlePath) ? paths.subtitlePath : "",
      cached: true
    };
  }

  await runEdgeTtsWithRetry(createEdgeTtsArgs({
    text: script,
    voiceId: voiceover.voiceId,
    rate: voiceover.rate,
    volume: voiceover.volume,
    mediaPath: paths.mediaPath,
    subtitlePath: paths.subtitlePath
  }), paths.mediaPath, options);

  return {
    enabled: true,
    provider: voiceover.provider,
    language: voiceover.language,
    voiceId: voiceover.voiceId,
    rate: voiceover.rate,
    volume: voiceover.volume,
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
  estimateSpeechDurationSeconds,
  generateVoiceover,
  getDefaultPythonCommand,
  getVoiceoverSceneReports,
  getVoiceoverOutputPaths,
  normalizeVoiceoverConfig
};
