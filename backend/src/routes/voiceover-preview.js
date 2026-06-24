"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { generateVoiceover, estimateSpeechDurationSeconds } = require("../audio/voiceover");
const { config } = require("../config");

const MAX_BODY_BYTES = 1024 * 128;
const MAX_SCRIPT_CHARS = 3000;
const CACHE_FILE_PATTERN = /^[a-f0-9]{16}\.(mp3|srt)$/;

function createHttpError(statusCode, message, errors = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
}

function normalizeText(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function readJsonBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";

    request.on("data", (chunk) => {
      body += chunk;
      if (Buffer.byteLength(body) > MAX_BODY_BYTES) {
        reject(createHttpError(413, "Request body is too large."));
        request.destroy();
      }
    });

    request.on("end", () => {
      if (!body.trim()) {
        reject(createHttpError(400, "Request body must be valid JSON."));
        return;
      }

      try {
        resolve(JSON.parse(body));
      } catch (_error) {
        reject(createHttpError(400, "Request body must be valid JSON."));
      }
    });

    request.on("error", reject);
  });
}

function normalizePreviewInput(input = {}) {
  const script = normalizeText(input.script || input.text);

  if (!script) {
    throw createHttpError(422, "Voice script is required.", {
      script: "required"
    });
  }

  if (script.length > MAX_SCRIPT_CHARS) {
    throw createHttpError(422, `Voice script must be ${MAX_SCRIPT_CHARS} characters or fewer.`, {
      script: "too_long",
      maxChars: MAX_SCRIPT_CHARS
    });
  }

  return {
    enabled: true,
    provider: normalizeText(input.provider) || "edge-tts",
    language: normalizeText(input.language) || "vi-VN",
    voiceId: normalizeText(input.voiceId) || "vi-VN-HoaiMyNeural",
    rate: normalizeText(input.rate) || "+0%",
    volume: normalizeText(input.volume) || "+0%",
    script
  };
}

function getAudioFilePath(filename) {
  if (!/^[a-f0-9]{16}\.mp3$/.test(filename)) {
    return null;
  }

  const audioDir = path.join(config.outputsDir, "audio");
  const filePath = path.resolve(audioDir, filename);

  if (filePath !== audioDir && !filePath.startsWith(`${audioDir}${path.sep}`)) {
    return null;
  }

  return filePath;
}

function cleanupAudioCache(audioDir, options = {}) {
  if (!fs.existsSync(audioDir)) {
    return {
      deletedFiles: 0,
      deletedBytes: 0,
      remainingBytes: 0
    };
  }

  const now = Number.isFinite(options.now) ? options.now : Date.now();
  const maxAgeMs = Number.isFinite(options.maxAgeMs) ? options.maxAgeMs : config.audioCacheMaxAgeDays * 24 * 60 * 60 * 1000;
  const maxBytes = Number.isFinite(options.maxBytes) ? options.maxBytes : config.audioCacheMaxBytes;
  const excludePaths = new Set((options.excludePaths || []).map((filePath) => path.resolve(filePath)));
  let deletedFiles = 0;
  let deletedBytes = 0;

  const cacheFiles = fs.readdirSync(audioDir)
    .filter((filename) => CACHE_FILE_PATTERN.test(filename))
    .map((filename) => {
      const filePath = path.resolve(audioDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        filePath,
        isFile: stats.isFile(),
        mtimeMs: stats.mtimeMs,
        size: stats.size
      };
    })
    .filter((entry) => entry.isFile)
    .filter((entry) => !excludePaths.has(entry.filePath));

  const deleteEntry = (entry) => {
    fs.rmSync(entry.filePath, { force: true });
    deletedFiles += 1;
    deletedBytes += entry.size;
  };

  cacheFiles
    .filter((entry) => maxAgeMs > 0 && now - entry.mtimeMs > maxAgeMs)
    .forEach(deleteEntry);

  const remainingFiles = fs.readdirSync(audioDir)
    .filter((filename) => CACHE_FILE_PATTERN.test(filename))
    .map((filename) => {
      const filePath = path.resolve(audioDir, filename);
      const stats = fs.statSync(filePath);
      return {
        filename,
        filePath,
        isFile: stats.isFile(),
        mtimeMs: stats.mtimeMs,
        size: stats.size
      };
    })
    .filter((entry) => entry.isFile)
    .filter((entry) => !excludePaths.has(entry.filePath))
    .sort((a, b) => a.mtimeMs - b.mtimeMs);

  let remainingBytes = remainingFiles.reduce((total, entry) => total + entry.size, 0);
  if (maxBytes > 0) {
    for (const entry of remainingFiles) {
      if (remainingBytes <= maxBytes) {
        break;
      }
      deleteEntry(entry);
      remainingBytes -= entry.size;
    }
  }

  return {
    deletedFiles,
    deletedBytes,
    remainingBytes
  };
}

function sendJsonError(response, statusCode, message, errors = null) {
  const body = JSON.stringify({
    success: false,
    message,
    errors
  });

  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
}

function servePreviewAudio(request, response, requestUrl) {
  const filename = decodeURIComponent(requestUrl.pathname.replace("/api/voiceover-preview/audio/", ""));
  const filePath = getAudioFilePath(filename);

  if (!filePath) {
    sendJsonError(response, 400, "Invalid audio filename.", {
      filename
    });
    return true;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJsonError(response, 404, "Audio preview not found.", {
        filename
      });
      return;
    }

    response.writeHead(200, {
      "Content-Type": "audio/mpeg",
      "Content-Length": stats.size,
      "Cache-Control": "no-store"
    });

    if (request.method === "HEAD") {
      response.end();
      return;
    }

    fs.createReadStream(filePath).pipe(response);
  });

  return true;
}

async function createPreview(request, response, sendJson) {
  try {
    const input = normalizePreviewInput(await readJsonBody(request));
    const result = await generateVoiceover({
      audio: {
        voiceover: input
      },
      scenes: []
    });
    const filename = path.basename(result.mediaPath);
    const cleanup = cleanupAudioCache(path.dirname(result.mediaPath), {
      excludePaths: [result.mediaPath, result.subtitlePath].filter(Boolean)
    });

    sendJson(response, 200, {
      success: true,
      message: result.cached ? "Voiceover preview loaded from cache." : "Voiceover preview generated.",
      data: {
        preview: {
          filename,
          audioUrl: `/api/voiceover-preview/audio/${encodeURIComponent(filename)}`,
          cached: result.cached,
          provider: result.provider,
          language: result.language,
          voiceId: result.voiceId,
          rate: result.rate,
          volume: result.volume,
          estimatedDuration: estimateSpeechDurationSeconds(result.script),
          cacheCleanup: cleanup
        }
      }
    });
  } catch (error) {
    sendJson(response, error.statusCode || 500, {
      success: false,
      message: error.message || "Cannot generate voiceover preview.",
      errors: error.errors || null
    });
  }

  return true;
}

async function handleVoiceoverPreview(request, response, requestUrl, sendJson) {
  if ((request.method === "GET" || request.method === "HEAD") && requestUrl.pathname.startsWith("/api/voiceover-preview/audio/")) {
    return servePreviewAudio(request, response, requestUrl);
  }

  if (request.method === "POST" && requestUrl.pathname === "/api/voiceover-preview") {
    return createPreview(request, response, sendJson);
  }

  return false;
}

module.exports = {
  cleanupAudioCache,
  handleVoiceoverPreview,
  normalizePreviewInput
};
