"use strict";

const fs = require("node:fs");
const Busboy = require("busboy");
const { CURRENT_PROJECT_ID, deleteAsset, getAsset, listAssets, saveAsset } = require("../db/database");
const { config } = require("../config");
const {
  createHttpError,
  createStagedAsset,
  deleteAssetFile,
  finalizeStagedAsset,
  isSafeAssetFile,
  rollbackAssetDeletion,
  stageAssetDeletion
} = require("../storage/asset-store");

const MAX_UPLOAD_FILES = 20;

function sendMethodNotAllowed(sendJson, response) {
  sendJson(response, 405, { success: false, message: "Method not allowed.", errors: null });
}

function cleanupFiles(filePaths) {
  filePaths.forEach((filePath) => {
    try {
      deleteAssetFile(filePath);
    } catch (_error) {}
  });
}

function toPublicAsset(asset) {
  if (!asset) return asset;
  const { filePath: _filePath, ...publicAsset } = asset;
  return publicAsset;
}

function readMultipart(request, projectId) {
  return new Promise((resolve, reject) => {
    let parser;
    try {
      parser = Busboy({
        headers: request.headers,
        limits: {
          fileSize: Math.max(config.uploadImageMaxBytes, config.uploadVideoMaxBytes, config.uploadAudioMaxBytes),
          files: MAX_UPLOAD_FILES,
          fields: 10,
          parts: MAX_UPLOAD_FILES + 10
        }
      });
    } catch (error) {
      reject(createHttpError(400, error.message || "Invalid multipart request."));
      return;
    }

    const stagedFiles = [];
    const writes = [];
    const fields = {};
    let uploadError = null;

    const fail = (error) => {
      if (!uploadError) uploadError = error;
    };

    parser.on("field", (name, value) => {
      fields[name] = value;
    });
    parser.on("file", (_name, stream, info) => {
      let staged;
      try {
        staged = createStagedAsset({
          filename: info.filename,
          mimeType: info.mimeType,
          projectId
        });
      } catch (error) {
        fail(error);
        stream.resume();
        return;
      }

      stagedFiles.push(staged);
      const output = fs.createWriteStream(staged.tempPath, { flags: "wx" });
      const writeDone = new Promise((resolveWrite) => {
        output.on("close", resolveWrite);
        output.on("error", (error) => {
          fail(error);
          resolveWrite();
        });
      });
      writes.push(writeDone);
      stream.on("limit", () => fail(createHttpError(413, "Uploaded asset is too large.")));
      stream.on("error", fail);
      stream.pipe(output);
    });
    parser.on("filesLimit", () => fail(createHttpError(413, `A maximum of ${MAX_UPLOAD_FILES} files is allowed per upload.`)));
    parser.on("partsLimit", () => fail(createHttpError(413, "Multipart request has too many parts.")));
    parser.on("error", fail);
    parser.on("close", async () => {
      await Promise.all(writes);
      if (uploadError) {
        cleanupFiles(stagedFiles.map((file) => file.tempPath));
        reject(uploadError);
        return;
      }
      resolve({ fields, stagedFiles });
    });
    request.on("aborted", () => fail(createHttpError(400, "Upload was aborted.")));
    request.pipe(parser);
  });
}

function sendAssetFile(request, response, asset) {
  if (!asset || !isSafeAssetFile(asset.filePath)) {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Asset file not found.");
    return;
  }
  const stats = fs.statSync(asset.filePath);
  response.writeHead(200, {
    "Content-Type": asset.mimeType || "application/octet-stream",
    "Content-Length": stats.size,
    "Cache-Control": "no-store",
    "X-Content-Type-Options": "nosniff"
  });
  if (request.method === "HEAD") {
    response.end();
    return;
  }
  fs.createReadStream(asset.filePath).pipe(response);
}

async function uploadAssets(request, projectId) {
  const { fields, stagedFiles } = await readMultipart(request, projectId);
  if (!stagedFiles.length) {
    throw createHttpError(422, "Upload must include at least one file.", { file: "required" });
  }

  const finalized = [];
  const saved = [];
  try {
    for (const staged of stagedFiles) {
      const asset = finalizeStagedAsset(staged, String(fields.type || "").trim());
      finalized.push(asset);
      saved.push(saveAsset(asset));
    }
    return saved.map(toPublicAsset);
  } catch (error) {
    saved.forEach((asset) => deleteAsset(asset.id, projectId));
    cleanupFiles([
      ...stagedFiles.map((file) => file.tempPath),
      ...finalized.map((asset) => asset.filePath)
    ]);
    throw error;
  }
}

async function handleAssets(request, response, requestUrl, sendJson) {
  const fileMatch = requestUrl.pathname.match(/^\/api\/assets\/([^/]+)\/file$/);
  if (fileMatch) {
    if (request.method !== "GET" && request.method !== "HEAD") {
      sendMethodNotAllowed(sendJson, response);
      return true;
    }
    sendAssetFile(request, response, getAsset(decodeURIComponent(fileMatch[1])));
    return true;
  }

  const match = requestUrl.pathname.match(/^\/api\/projects\/([^/]+)\/assets(?:\/([^/]+))?$/);
  if (!match) return false;
  const projectId = decodeURIComponent(match[1] || CURRENT_PROJECT_ID);
  const assetId = match[2] ? decodeURIComponent(match[2]) : "";

  if (request.method === "GET" && !assetId) {
    sendJson(response, 200, { success: true, message: "Assets loaded.", data: { assets: listAssets(projectId).map(toPublicAsset) } });
    return true;
  }

  if (request.method === "POST" && !assetId) {
    try {
      const assets = await uploadAssets(request, projectId);
      sendJson(response, 201, { success: true, message: "Assets uploaded.", data: { assets } });
    } catch (error) {
      sendJson(response, error.statusCode || 500, { success: false, message: error.message || "Cannot upload asset.", errors: error.errors || null });
    }
    return true;
  }

  if (request.method === "DELETE" && assetId) {
    try {
      const asset = getAsset(assetId, projectId);
      if (!asset) {
        sendJson(response, 404, { success: false, message: "Asset not found.", errors: { assetId } });
        return true;
      }
      const stagedPath = stageAssetDeletion(asset.filePath);
      try {
        deleteAsset(assetId, projectId);
      } catch (error) {
        rollbackAssetDeletion(stagedPath, asset.filePath);
        throw error;
      }
      deleteAssetFile(stagedPath);
      sendJson(response, 200, {
        success: true,
        message: "Asset deleted.",
        data: {
          assets: listAssets(projectId).map(toPublicAsset),
          deletedAsset: toPublicAsset(asset)
        }
      });
    } catch (error) {
      sendJson(response, error.statusCode || 500, { success: false, message: error.message || "Cannot delete asset.", errors: error.errors || null });
    }
    return true;
  }

  sendMethodNotAllowed(sendJson, response);
  return true;
}

module.exports = { handleAssets, uploadAssets };
