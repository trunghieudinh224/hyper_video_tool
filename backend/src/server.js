"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { config } = require("./config");
const { handleOutputs } = require("./routes/outputs");
const { handleRenderPreflight } = require("./routes/render-preflight");
const { handleRenderJobs } = require("./routes/render-jobs");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};

function sendJson(response, statusCode, payload) {
  const body = JSON.stringify(payload);
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(body)
  });
  response.end(body);
}

function sendText(response, statusCode, message) {
  response.writeHead(statusCode, {
    "Content-Type": "text/plain; charset=utf-8"
  });
  response.end(message);
}

function getSafeStaticPath(requestPath) {
  const decodedPath = decodeURIComponent(requestPath);
  const normalizedPath = decodedPath === "/" ? "/index.html" : decodedPath;
  const filePath = path.resolve(config.frontendDir, `.${normalizedPath}`);

  if (filePath !== config.frontendDir && !filePath.startsWith(`${config.frontendDir}${path.sep}`)) {
    return null;
  }

  return filePath;
}

function serveStatic(request, response) {
  let filePath;

  try {
    filePath = getSafeStaticPath(new URL(request.url, `http://${request.headers.host || "localhost"}`).pathname);
  } catch (_error) {
    sendText(response, 400, "Bad request.");
    return;
  }

  if (!filePath) {
    sendText(response, 403, "Forbidden.");
    return;
  }

  fs.stat(filePath, (statError, stats) => {
    if (statError || !stats.isFile()) {
      sendText(response, 404, "Not found.");
      return;
    }

    const contentType = MIME_TYPES[path.extname(filePath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, { "Content-Type": contentType });
    if (request.method === "HEAD") {
      response.end();
      return;
    }
    fs.createReadStream(filePath).pipe(response);
  });
}

async function requestHandler(request, response) {
  const requestUrl = new URL(request.url, `http://${request.headers.host || "localhost"}`);

  if (request.method === "GET" && requestUrl.pathname === "/api/health") {
    sendJson(response, 200, {
      success: true,
      message: "Backend is healthy.",
      data: {
        service: "hyper-video-tool-backend",
        status: "ok",
        staticUi: true
      }
    });
    return;
  }

  if (requestUrl.pathname === "/api/render-preflight") {
    const handled = handleRenderPreflight(request, response, requestUrl, sendJson);
    if (handled) {
      return;
    }
  }

  if (requestUrl.pathname.startsWith("/api/render-jobs")) {
    const handled = await handleRenderJobs(request, response, requestUrl, sendJson);
    if (handled) {
      return;
    }
  }

  if (requestUrl.pathname === "/api/outputs" || requestUrl.pathname.startsWith("/api/outputs/")) {
    const handled = handleOutputs(request, response, requestUrl, sendJson);
    if (handled) {
      return;
    }
  }

  if (requestUrl.pathname.startsWith("/api/")) {
    sendJson(response, 404, {
      success: false,
      message: "API endpoint not found.",
      errors: {
        path: requestUrl.pathname
      }
    });
    return;
  }

  if (request.method !== "GET" && request.method !== "HEAD") {
    sendText(response, 405, "Method not allowed.");
    return;
  }

  serveStatic(request, response);
}

function createServer() {
  return http.createServer((request, response) => {
    requestHandler(request, response).catch((error) => {
      sendJson(response, 500, {
        success: false,
        message: error.message || "Internal server error.",
        errors: null
      });
    });
  });
}

if (require.main === module) {
  const server = createServer();

  server.listen(config.port, config.host, () => {
    console.log(`Hyper Video Tool backend running at http://${config.host}:${config.port}`);
  });
}

module.exports = { createServer };
