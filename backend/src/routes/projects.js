"use strict";

const { ensureCurrentProject, saveCurrentProject } = require("../db/database");

const MAX_BODY_BYTES = 1024 * 1024 * 8;

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

function sendMethodNotAllowed(sendJson, response) {
  sendJson(response, 405, {
    success: false,
    message: "Method not allowed.",
    errors: null
  });
}

async function handleProjects(request, response, requestUrl, sendJson) {
  if (requestUrl.pathname !== "/api/projects/current") {
    return false;
  }

  if (request.method === "GET") {
    const row = ensureCurrentProject();
    sendJson(response, 200, {
      success: true,
      message: "Current project loaded.",
      data: {
        project: row.project,
        meta: {
          id: row.id,
          name: row.name,
          slug: row.slug,
          createdAt: row.createdAt,
          updatedAt: row.updatedAt
        }
      }
    });
    return true;
  }

  if (request.method === "PUT") {
    try {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object" || Array.isArray(body) || !body.project || typeof body.project !== "object" || Array.isArray(body.project)) {
        throw createHttpError(422, "Request body must include project object.", {
          project: "required_object"
        });
      }

      const row = saveCurrentProject(body.project);
      sendJson(response, 200, {
        success: true,
        message: "Current project saved.",
        data: {
          project: row.project,
          meta: {
            id: row.id,
            name: row.name,
            slug: row.slug,
            createdAt: row.createdAt,
            updatedAt: row.updatedAt
          }
        }
      });
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot save current project.",
        errors: error.errors || null
      });
    }
    return true;
  }

  sendMethodNotAllowed(sendJson, response);
  return true;
}

module.exports = { handleProjects };
