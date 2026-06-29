"use strict";

const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");

const MIME_CONFIG = {
  "image/png": { extension: ".png", kind: "image", matches: (buffer) => buffer.subarray(0, 8).equals(Buffer.from("89504e470d0a1a0a", "hex")) },
  "image/jpeg": { extension: ".jpg", kind: "image", matches: (buffer) => buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff },
  "image/webp": { extension: ".webp", kind: "image", matches: (buffer) => buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WEBP" },
  "image/gif": { extension: ".gif", kind: "image", matches: (buffer) => ["GIF87a", "GIF89a"].includes(buffer.toString("ascii", 0, 6)) },
  "video/mp4": { extension: ".mp4", kind: "video", matches: (buffer) => buffer.toString("ascii", 4, 8) === "ftyp" },
  "video/quicktime": { extension: ".mov", kind: "video", matches: (buffer) => buffer.toString("ascii", 4, 8) === "ftyp" },
  "video/webm": { extension: ".webm", kind: "video", matches: (buffer) => buffer.subarray(0, 4).equals(Buffer.from("1a45dfa3", "hex")) },
  "audio/mpeg": { extension: ".mp3", kind: "audio", matches: (buffer) => buffer.toString("ascii", 0, 3) === "ID3" || (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) },
  "audio/wav": { extension: ".wav", kind: "audio", matches: (buffer) => buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WAVE" },
  "audio/x-wav": { extension: ".wav", kind: "audio", matches: (buffer) => buffer.toString("ascii", 0, 4) === "RIFF" && buffer.toString("ascii", 8, 12) === "WAVE" },
  "audio/mp4": { extension: ".m4a", kind: "audio", matches: (buffer) => buffer.toString("ascii", 4, 8) === "ftyp" },
  "audio/ogg": { extension: ".ogg", kind: "audio", matches: (buffer) => buffer.toString("ascii", 0, 4) === "OggS" }
};

function createHttpError(statusCode, message, errors = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
}

function resolveUploadPath(filePath) {
  const rootDir = path.resolve(config.uploadsDir);
  const resolvedPath = path.resolve(String(filePath || ""));
  if (resolvedPath === rootDir || !resolvedPath.startsWith(`${rootDir}${path.sep}`)) {
    throw createHttpError(400, "Asset path is outside uploads directory.", { filePath });
  }
  return resolvedPath;
}

function getAssetType(mimeType, requestedType = "") {
  const kind = MIME_CONFIG[mimeType].kind;
  if (requestedType && ["logo", "background", "image", "video", "screenshot", "audio"].includes(requestedType)) {
    if (requestedType === "video" && kind !== "video") {
      throw createHttpError(422, "Selected asset type video requires a video file.", { type: "mime_mismatch" });
    }
    if (requestedType === "audio" && kind !== "audio") {
      throw createHttpError(422, "Selected asset type audio requires an audio file.", { type: "mime_mismatch" });
    }
    if (["logo", "background", "image", "screenshot"].includes(requestedType) && kind !== "image") {
      throw createHttpError(422, "Selected image asset type requires an image file.", { type: "mime_mismatch" });
    }
    return requestedType;
  }
  return kind;
}

function sanitizeFilename(filename) {
  const base = path.parse(String(filename || "asset")).name
    .normalize("NFKD")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "asset";
  return base.toLowerCase();
}

function getSafeUploadDir(projectId) {
  const safeProjectId = String(projectId || "current").replace(/[^\w.-]+/g, "-") || "current";
  const uploadDir = path.resolve(config.uploadsDir, safeProjectId);
  resolveUploadPath(uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
  return uploadDir;
}

function createStagedAsset({ filename, mimeType, projectId }) {
  if (!filename || !MIME_CONFIG[mimeType]) {
    throw createHttpError(415, "Only PNG, JPEG, WebP, GIF, MP4, MOV, WebM, MP3, WAV, M4A and OGG uploads are supported.", { mimeType });
  }
  const assetId = `asset_${Date.now()}_${crypto.randomBytes(4).toString("hex")}`;
  const uploadDir = getSafeUploadDir(projectId);
  const finalPath = path.join(uploadDir, `${assetId}_${sanitizeFilename(filename)}${MIME_CONFIG[mimeType].extension}`);
  const tempPath = `${finalPath}.uploading`;
  return { assetId, filename, mimeType, projectId, finalPath, tempPath };
}

function finalizeStagedAsset(staged, requestedType = "") {
  const tempPath = resolveUploadPath(staged.tempPath);
  const stats = fs.statSync(tempPath);
  const mimeConfig = MIME_CONFIG[staged.mimeType];
  const maxBytes = mimeConfig.kind === "video"
    ? config.uploadVideoMaxBytes
    : mimeConfig.kind === "audio"
      ? config.uploadAudioMaxBytes
      : config.uploadImageMaxBytes;
  if (stats.size > maxBytes) {
    throw createHttpError(413, "Uploaded asset is too large.", { maxBytes, sizeBytes: stats.size });
  }
  const descriptor = fs.openSync(tempPath, "r");
  const header = Buffer.alloc(16);
  const bytesRead = fs.readSync(descriptor, header, 0, header.length, 0);
  fs.closeSync(descriptor);
  if (!mimeConfig.matches(header.subarray(0, bytesRead))) {
    throw createHttpError(415, "Uploaded file content does not match its declared MIME type.", { mimeType: staged.mimeType });
  }
  fs.renameSync(tempPath, resolveUploadPath(staged.finalPath));
  return {
    id: staged.assetId,
    projectId: staged.projectId,
    name: staged.filename,
    type: getAssetType(staged.mimeType, requestedType),
    mimeType: staged.mimeType,
    sizeBytes: stats.size,
    filePath: staged.finalPath,
    publicUrl: `/api/assets/${encodeURIComponent(staged.assetId)}/file`,
    useInVideo: true
  };
}

function deleteAssetFile(filePath) {
  fs.rmSync(resolveUploadPath(filePath), { force: true });
}

function stageAssetDeletion(filePath) {
  const resolvedPath = resolveUploadPath(filePath);
  if (!fs.existsSync(resolvedPath)) {
    throw createHttpError(404, "Asset file not found.", { filePath });
  }
  const stagedPath = `${resolvedPath}.deleting`;
  fs.renameSync(resolvedPath, stagedPath);
  return stagedPath;
}

function rollbackAssetDeletion(stagedPath, originalPath) {
  if (fs.existsSync(resolveUploadPath(stagedPath))) {
    fs.renameSync(resolveUploadPath(stagedPath), resolveUploadPath(originalPath));
  }
}

function isSafeAssetFile(filePath) {
  try {
    const resolvedPath = resolveUploadPath(filePath);
    return fs.existsSync(resolvedPath) && fs.statSync(resolvedPath).isFile();
  } catch (_error) {
    return false;
  }
}

module.exports = {
  createHttpError,
  createStagedAsset,
  deleteAssetFile,
  finalizeStagedAsset,
  isSafeAssetFile,
  resolveUploadPath,
  rollbackAssetDeletion,
  stageAssetDeletion
};
