"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");

const OUTPUT_FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.mp4$/;

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

function getOutputFilePath(filename) {
  if (!OUTPUT_FILENAME_PATTERN.test(filename)) {
    return null;
  }

  return path.join(config.outputsDir, filename);
}

function handleOutputs(request, response, requestUrl) {
  if (request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  if (!requestUrl.pathname.startsWith("/api/outputs/")) {
    return false;
  }

  const filename = decodeURIComponent(requestUrl.pathname.replace("/api/outputs/", ""));
  const outputPath = getOutputFilePath(filename);

  if (!outputPath) {
    sendJsonError(response, 400, "Invalid output filename.", {
      filename
    });
    return true;
  }

  fs.stat(outputPath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendJsonError(response, 404, "Output file not found.", {
        filename
      });
      return;
    }

    const headers = {
      "Content-Type": "video/mp4",
      "Content-Length": stats.size,
      "Cache-Control": "no-store"
    };

    if (requestUrl.searchParams.get("download") === "1") {
      headers["Content-Disposition"] = `attachment; filename="${filename}"`;
    }

    response.writeHead(200, headers);
    if (request.method === "HEAD") {
      response.end();
      return;
    }

    fs.createReadStream(outputPath).pipe(response);
  });

  return true;
}

module.exports = { handleOutputs };
