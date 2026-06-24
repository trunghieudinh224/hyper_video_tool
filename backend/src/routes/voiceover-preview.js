"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { generateVoiceover, estimateSpeechDurationSeconds } = require("../audio/voiceover");
const { config } = require("../config");

const MAX_BODY_BYTES = 1024 * 128;
const MAX_SCRIPT_CHARS = 3000;
const AUDIO_FILENAME_PATTERN = /^[a-f0-9]{16}\.mp3$/;

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
  if (!AUDIO_FILENAME_PATTERN.test(filename)) {
    return null;
  }

  const audioDir = path.join(config.outputsDir, "audio");
  const filePath = path.resolve(audioDir, filename);

  if (filePath !== audioDir && !filePath.startsWith(`${audioDir}${path.sep}`)) {
    return null;
  }

  return filePath;
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
          estimatedDuration: estimateSpeechDurationSeconds(result.script)
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
  handleVoiceoverPreview,
  normalizePreviewInput
};
