"use strict";

const { getRenderJob, queueRenderJob } = require("../render/render-runner");

const MAX_BODY_BYTES = 1024 * 1024 * 2;

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

function createHttpError(statusCode, message, errors) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
}

function serializeJob(job) {
  return {
    id: job.id,
    status: job.status,
    templateId: job.templateId,
    aspectRatio: job.aspectRatio,
    width: job.width,
    height: job.height,
    resolution: job.resolution,
    projectName: job.projectName,
    outputPath: job.outputPath,
    outputSize: job.outputSize || null,
    audio: job.audio || null,
    progress: job.progress || 0,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    startedAt: job.startedAt,
    completedAt: job.completedAt,
    durationMs: job.durationMs,
    exitCode: job.exitCode,
    error: job.error || null,
    logs: job.logs
  };
}

async function handleRenderJobs(request, response, requestUrl, sendJson) {
  if (request.method === "POST" && requestUrl.pathname === "/api/render-jobs") {
    try {
      const payload = await readJsonBody(request);
      const job = queueRenderJob(payload);
      sendJson(response, 202, {
        success: true,
        message: "Render job queued.",
        data: {
          job: serializeJob(job)
        }
      });
    } catch (error) {
      if (error.code === "VALIDATION_FAILED") {
        sendJson(response, 422, {
          success: false,
          message: error.message,
          errors: error.validationErrors
        });
        return true;
      }

      sendJson(response, error.statusCode || 500, {
        success: false,
        message: error.message || "Render job failed.",
        errors: error.errors || null
      });
    }
    return true;
  }

  if (request.method === "GET" && requestUrl.pathname.startsWith("/api/render-jobs/")) {
    const jobId = requestUrl.pathname.replace("/api/render-jobs/", "");
    const job = getRenderJob(jobId);

    if (!job) {
      sendJson(response, 404, {
        success: false,
        message: "Render job not found.",
        errors: {
          id: jobId
        }
      });
      return true;
    }

    sendJson(response, 200, {
      success: true,
      message: "Render job found.",
      data: {
        job: serializeJob(job)
      }
    });
    return true;
  }

  return false;
}

module.exports = { handleRenderJobs };
