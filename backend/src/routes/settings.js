"use strict";

const { ensureSettings, saveSettings } = require("../db/database");

const MAX_BODY_BYTES = 1024 * 128;

function createHttpError(statusCode, message, errors = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
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

function serializeSettingsRow(row) {
  return {
    settings: row.settings,
    meta: {
      key: row.key,
      updatedAt: row.updatedAt
    }
  };
}

async function handleSettings(request, response, requestUrl, sendJson) {
  if (requestUrl.pathname !== "/api/settings") {
    return false;
  }

  if (request.method === "GET") {
    const row = ensureSettings();
    sendJson(response, 200, {
      success: true,
      message: "Settings loaded.",
      data: serializeSettingsRow(row)
    });
    return true;
  }

  if (request.method === "PUT") {
    try {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object" || Array.isArray(body) || !body.settings || typeof body.settings !== "object" || Array.isArray(body.settings)) {
        throw createHttpError(422, "Request body must include settings object.", {
          settings: "required_object"
        });
      }

      const row = saveSettings(body.settings);
      sendJson(response, 200, {
        success: true,
        message: "Settings saved.",
        data: serializeSettingsRow(row)
      });
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot save settings.",
        errors: error.errors || null
      });
    }
    return true;
  }

  sendJson(response, 405, {
    success: false,
    message: "Method not allowed.",
    errors: null
  });
  return true;
}

module.exports = { handleSettings };
