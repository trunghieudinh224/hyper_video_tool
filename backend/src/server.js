"use strict";

const fs = require("node:fs");
const http = require("node:http");
const path = require("node:path");
const { config } = require("./config");
const { handleAssets } = require("./routes/assets");
const { handleOutputs } = require("./routes/outputs");
const { handleProjects } = require("./routes/projects");
const { handleRenderPreflight } = require("./routes/render-preflight");
const { handleRenderJobs } = require("./routes/render-jobs");
const { handleSettings } = require("./routes/settings");
const { handleVoiceoverPreview } = require("./routes/voiceover-preview");

const MIME_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".ico": "image/x-icon",
  ".webp": "image/webp"
};
const LOOPBACK_HOST_HEADER = /^(?:127\.0\.0\.1|localhost|\[::1\])(?::(\d{1,5}))?$/i;

function isLocalRequest(request) {
  const headers = request.headers || {};
  const host = String(headers.host || "");
  const hostMatch = LOOPBACK_HOST_HEADER.exec(host);
  if (!hostMatch || (hostMatch[1] && Number(hostMatch[1]) !== config.port)) {
    return false;
  }

  if (headers["sec-fetch-site"] === "cross-site"
    && request.method !== "GET" && request.method !== "HEAD") {
    return false;
  }

  if (headers.origin) {
    const expectedOrigin = new URL(`http://${host}`).origin;
    if (headers.origin !== expectedOrigin) {
      return false;
    }
  }

  return true;
}

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
  if (!isLocalRequest(request)) {
    sendText(response, 403, "Local requests only.");
    return;
  }

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

  if (requestUrl.pathname.startsWith("/api/assets/") || /^\/api\/projects\/[^/]+\/assets/.test(requestUrl.pathname)) {
    const handled = await handleAssets(request, response, requestUrl, sendJson);
    if (handled) {
      return;
    }
  }

  if (requestUrl.pathname.startsWith("/api/projects")) {
    const handled = await handleProjects(request, response, requestUrl, sendJson);
    if (handled) {
      return;
    }
  }

  if (requestUrl.pathname === "/api/settings") {
    const handled = await handleSettings(request, response, requestUrl, sendJson);
    if (handled) {
      return;
    }
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

  if (requestUrl.pathname === "/api/voiceover-preview" || requestUrl.pathname.startsWith("/api/voiceover-preview/")) {
    const handled = await handleVoiceoverPreview(request, response, requestUrl, sendJson);
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
    const displayHost = config.host.includes(":") ? `[${config.host}]` : config.host;
    console.log(`Hyper Video Tool backend running at http://${displayHost}:${config.port}`);
  });
}

module.exports = { createServer, requestHandler };
