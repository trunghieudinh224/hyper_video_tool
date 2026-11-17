"use strict";

const { listOutputRecords } = require("../render/output-manifest");

const {
  archiveProject,
  createProjectSnapshot,
  createProject,
  duplicateProject,
  ensureCurrentProject,
  getActiveProject,
  getProject,
  listProjectSnapshots,
  listRenderOutputs,
  listProjects,
  readDefaultProject,
  restoreProjectSnapshot,
  saveCurrentProject,
  saveProject,
  setActiveProject
} = require("../db/database");

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

function readOptionalJsonBody(request) {
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
        resolve(null);
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

function getProjectMeta(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    contentType: row.contentType || "",
    status: row.status || "draft",
    thumbnailUrl: row.thumbnailUrl || "",
    lastRenderedOutputId: row.lastRenderedOutputId || "",
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    archivedAt: row.archivedAt || null
  };
}

function sendProject(sendJson, response, row, message = "Project loaded.") {
  sendJson(response, 200, {
    success: true,
    message,
    data: {
      project: row.project,
      meta: getProjectMeta(row)
    }
  });
}

function parseProjectIdFromPath(pathname) {
  const match = pathname.match(/^\/api\/projects\/([^/]+)(?:\/(archive|duplicate|outputs))?$/);
  if (!match) {
    return null;
  }
  return {
    id: decodeURIComponent(match[1]),
    action: match[2] || ""
  };
}

function parseSnapshotPath(pathname) {
  const match = pathname.match(/^\/api\/projects\/([^/]+)\/snapshots(?:\/([^/]+)\/restore)?$/);
  if (!match) {
    return null;
  }

  return {
    projectId: decodeURIComponent(match[1]),
    snapshotId: match[2] ? decodeURIComponent(match[2]) : ""
  };
}

async function handleProjects(request, response, requestUrl, sendJson) {
  if (!requestUrl.pathname.startsWith("/api/projects")) {
    return false;
  }

  if (requestUrl.pathname === "/api/projects/current" && request.method === "GET") {
    const row = ensureCurrentProject();
    sendProject(sendJson, response, row, "Current project loaded.");
    return true;
  }

  if (requestUrl.pathname === "/api/projects/current" && request.method === "PUT") {
    try {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object" || Array.isArray(body) || !body.project || typeof body.project !== "object" || Array.isArray(body.project)) {
        throw createHttpError(422, "Request body must include project object.", {
          project: "required_object"
        });
      }

      const row = saveCurrentProject(body.project);
      sendProject(sendJson, response, row, "Current project saved.");
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot save current project.",
        errors: error.errors || null
      });
    }
    return true;
  }

  if (requestUrl.pathname === "/api/projects/active" && request.method === "GET") {
    const row = getActiveProject();
    sendProject(sendJson, response, row, "Active project loaded.");
    return true;
  }

  if (requestUrl.pathname === "/api/projects/active" && request.method === "PUT") {
    try {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object" || Array.isArray(body) || typeof body.projectId !== "string" || !body.projectId.trim()) {
        throw createHttpError(422, "Request body must include projectId.", {
          projectId: "required_string"
        });
      }
      const row = setActiveProject(body.projectId.trim());
      sendProject(sendJson, response, row, "Active project changed.");
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot change active project.",
        errors: error.errors || null
      });
    }
    return true;
  }

  if (requestUrl.pathname === "/api/projects" && request.method === "GET") {
    const projects = listProjects({
      includeArchived: requestUrl.searchParams.get("includeArchived") === "1"
    });
    sendJson(response, 200, {
      success: true,
      message: "Projects loaded.",
      data: {
        projects
      }
    });
    return true;
  }

  if (requestUrl.pathname === "/api/projects" && request.method === "POST") {
    try {
      const body = await readOptionalJsonBody(request);
      const project = body && body.project && typeof body.project === "object" && !Array.isArray(body.project)
        ? body.project
        : readDefaultProject();
      const row = createProject(project, { activate: body && body.activate !== false });
      sendJson(response, 201, {
        success: true,
        message: "Project created.",
        data: {
          project: row.project,
          meta: getProjectMeta(row)
        }
      });
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot create project.",
        errors: error.errors || null
      });
    }
    return true;
  }

  const snapshotPath = parseSnapshotPath(requestUrl.pathname);
  if (snapshotPath && !snapshotPath.snapshotId && request.method === "GET") {
    const row = getProject(snapshotPath.projectId);
    if (!row) {
      sendJson(response, 404, {
        success: false,
        message: "Project not found.",
        errors: {
          projectId: "not_found"
        }
      });
      return true;
    }

    sendJson(response, 200, {
      success: true,
      message: "Project snapshots loaded.",
      data: {
        snapshots: listProjectSnapshots(snapshotPath.projectId)
      }
    });
    return true;
  }

  if (snapshotPath && !snapshotPath.snapshotId && request.method === "POST") {
    try {
      const body = await readOptionalJsonBody(request);
      const snapshot = createProjectSnapshot(snapshotPath.projectId, body && body.label);
      sendJson(response, 201, {
        success: true,
        message: "Project snapshot created.",
        data: {
          snapshot
        }
      });
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot create project snapshot.",
        errors: error.errors || null
      });
    }
    return true;
  }

  if (snapshotPath && snapshotPath.snapshotId && request.method === "POST") {
    try {
      const row = restoreProjectSnapshot(snapshotPath.projectId, snapshotPath.snapshotId);
      sendProject(sendJson, response, row, "Project snapshot restored.");
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot restore project snapshot.",
        errors: error.errors || null
      });
    }
    return true;
  }

  const projectPath = parseProjectIdFromPath(requestUrl.pathname);
  if (projectPath && projectPath.action === "" && request.method === "GET") {
    const row = getProject(projectPath.id);
    if (!row) {
      sendJson(response, 404, {
        success: false,
        message: "Project not found.",
        errors: {
          projectId: "not_found"
        }
      });
      return true;
    }
    sendProject(sendJson, response, row, "Project loaded.");
    return true;
  }

  if (projectPath && projectPath.action === "outputs" && request.method === "GET") {
    const row = getProject(projectPath.id);
    if (!row) {
      sendJson(response, 404, {
        success: false,
        message: "Project not found.",
        errors: {
          projectId: "not_found"
        }
      });
      return true;
    }

    const manifestByJobId = new Map(listOutputRecords().map((output) => [output.jobId, output]));
    const outputs = listRenderOutputs(projectPath.id).map((output) => {
      const manifestRecord = manifestByJobId.get(output.jobId || output.id);
      return {
        ...output,
        subtitles: manifestRecord && manifestRecord.filename === output.filename
          ? manifestRecord.subtitles
          : null
      };
    });
    sendJson(response, 200, {
      success: true,
      message: "Project outputs loaded.",
      data: {
        outputs
      }
    });
    return true;
  }

  if (projectPath && projectPath.action === "" && request.method === "PUT") {
    try {
      const body = await readJsonBody(request);
      if (!body || typeof body !== "object" || Array.isArray(body) || !body.project || typeof body.project !== "object" || Array.isArray(body.project)) {
        throw createHttpError(422, "Request body must include project object.", {
          project: "required_object"
        });
      }
      const row = saveProject(projectPath.id, body.project);
      sendProject(sendJson, response, row, "Project saved.");
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot save project.",
        errors: error.errors || null
      });
    }
    return true;
  }

  if (projectPath && projectPath.action === "archive" && request.method === "POST") {
    try {
      const row = archiveProject(projectPath.id);
      sendProject(sendJson, response, row, "Project archived.");
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot archive project.",
        errors: error.errors || null
      });
    }
    return true;
  }

  if (projectPath && projectPath.action === "duplicate" && request.method === "POST") {
    try {
      const row = duplicateProject(projectPath.id, { activate: true });
      sendJson(response, 201, {
        success: true,
        message: "Project duplicated.",
        data: {
          project: row.project,
          meta: getProjectMeta(row)
        }
      });
    } catch (error) {
      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Cannot duplicate project.",
        errors: error.errors || null
      });
    }
    return true;
  }

  sendMethodNotAllowed(sendJson, response);
  return true;
}

module.exports = { handleProjects };
