"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const { config } = require("../config");
const { generateVoiceover } = require("../audio/voiceover");
const { muxVoiceoverIntoVideo } = require("./media");
const { upsertOutputRecord } = require("./output-manifest");
const { SUPPORTED_TEMPLATE_IDS, validateRenderPayload } = require("./render-payload-schema");

const jobs = new Map();
const jobQueue = [];
let activeJobId = null;

function stableJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function relativePath(filePath) {
  return path.relative(config.projectRoot, filePath);
}

function sanitizeLog(value) {
  return String(value || "").replaceAll(config.projectRoot, ".");
}

function ensureDirectory(directoryPath) {
  fs.mkdirSync(directoryPath, { recursive: true });
}

function getOutputPath(jobId) {
  return path.join(config.projectRoot, "outputs", `${jobId}.mp4`);
}

function getWorkDir(jobId) {
  return path.join(config.projectRoot, ".cache", "render-jobs", jobId);
}

function getVideoOnlyOutputPath(jobId) {
  return path.join(getWorkDir(jobId), `${jobId}.video-only.mp4`);
}

function getRunnerScriptPath() {
  return path.join(config.projectRoot, "backend", "scripts", "run-hyperframes-local.js");
}

function createInitialAudioState(payload) {
  const voiceover = payload.audio && payload.audio.voiceover ? payload.audio.voiceover : {};

  return {
    voiceover: {
      enabled: Boolean(voiceover.enabled),
      provider: voiceover.provider || null,
      language: voiceover.language || null,
      voiceId: voiceover.voiceId || null,
      outputPath: null,
      subtitlePath: null,
      cached: false
    }
  };
}

function createRelativeAudioResult(voiceoverResult) {
  if (!voiceoverResult || !voiceoverResult.enabled) {
    return createInitialAudioState({ audio: { voiceover: voiceoverResult || {} } }).voiceover;
  }

  return {
    enabled: true,
    provider: voiceoverResult.provider,
    language: voiceoverResult.language,
    voiceId: voiceoverResult.voiceId,
    outputPath: relativePath(voiceoverResult.mediaPath),
    subtitlePath: voiceoverResult.subtitlePath ? relativePath(voiceoverResult.subtitlePath) : null,
    cached: Boolean(voiceoverResult.cached)
  };
}

function createJobRecord(payload) {
  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();
  const outputPath = getOutputPath(jobId);

  return {
    id: jobId,
    status: "queued",
    templateId: payload.template.id,
    aspectRatio: payload.video.aspectRatio,
    width: payload.video.width,
    height: payload.video.height,
    resolution: `${payload.video.width}x${payload.video.height}`,
    projectName: payload.source.projectName,
    outputPath: relativePath(outputPath),
    audio: createInitialAudioState(payload),
    createdAt: now,
    updatedAt: now,
    startedAt: null,
    completedAt: null,
    durationMs: null,
    exitCode: null,
    progress: 5,
    logs: []
  };
}

function validateJobPayload(payload) {
  const validation = validateRenderPayload(payload);
  if (!validation.valid) {
    return validation;
  }

  if (!SUPPORTED_TEMPLATE_IDS.has(payload.template.id)) {
    return {
      valid: false,
      errors: [
        {
          path: "template.id",
          message: `Template id must be one of: ${Array.from(SUPPORTED_TEMPLATE_IDS).join(", ")}.`
        }
      ]
    };
  }

  return { valid: true, errors: [] };
}

function prepareWorkDir(jobId, payload) {
  const templateDir = path.join(config.projectRoot, "templates", payload.template.id);
  const sharedTemplateDir = path.join(config.projectRoot, "templates", "shared");
  const workDir = getWorkDir(jobId);
  const compositionDir = path.join(workDir, "composition");
  const sharedWorkDir = path.join(workDir, "shared");

  fs.rmSync(workDir, { recursive: true, force: true });
  ensureDirectory(workDir);
  fs.cpSync(templateDir, compositionDir, { recursive: true });
  if (fs.existsSync(sharedTemplateDir)) {
    fs.cpSync(sharedTemplateDir, sharedWorkDir, { recursive: true });
  }
  fs.writeFileSync(path.join(compositionDir, "render-payload.json"), stableJson(payload));

  return compositionDir;
}

function appendLog(job, type, message) {
  job.logs.push({
    type,
    message: sanitizeLog(message),
    timestamp: new Date().toISOString()
  });

  if (job.logs.length > 80) {
    job.logs = job.logs.slice(-80);
  }
}

function runHyperFramesRender(compositionDir, outputPath, job) {
  return new Promise((resolve, reject) => {
    const child = spawn(
      process.execPath,
      [
        getRunnerScriptPath(),
        "--cwd",
        compositionDir,
        "render",
        "--output",
        outputPath
      ],
      {
        cwd: config.projectRoot,
        stdio: ["ignore", "pipe", "pipe"]
      }
    );

    child.stdout.on("data", (chunk) => {
      appendLog(job, "INFO", chunk.toString());
    });

    child.stderr.on("data", (chunk) => {
      appendLog(job, "INFO", chunk.toString());
    });

    child.on("error", reject);
    child.on("close", (exitCode) => resolve({ status: exitCode }));
  });
}

async function executeRenderJob(job, payload) {
  const outputPath = getOutputPath(job.id);
  const voiceoverEnabled = Boolean(payload.audio && payload.audio.voiceover && payload.audio.voiceover.enabled);
  const renderOutputPath = voiceoverEnabled ? getVideoOnlyOutputPath(job.id) : outputPath;
  const startedAt = Date.now();
  job.status = "running";
  job.progress = 15;
  job.startedAt = new Date(startedAt).toISOString();
  job.updatedAt = job.startedAt;
  appendLog(job, "INITIALIZING", "Render worker started.");

  try {
    ensureDirectory(path.dirname(outputPath));
    const compositionDir = prepareWorkDir(job.id, payload);
    appendLog(job, "INFO", `Prepared composition workdir: ${relativePath(compositionDir)}.`);
    if (voiceoverEnabled) {
      appendLog(job, "INFO", "Generating voiceover audio.");
      const voiceoverResult = await generateVoiceover(payload);
      job.audio.voiceover = createRelativeAudioResult(voiceoverResult);
      appendLog(
        job,
        "SUCCESS",
        `Voiceover ready: ${job.audio.voiceover.outputPath}${job.audio.voiceover.cached ? " (cached)" : ""}.`
      );
    }

    const progressTimer = setInterval(() => {
      if (job.status !== "running") {
        clearInterval(progressTimer);
        return;
      }

      const elapsedMs = Date.now() - startedAt;
      job.progress = Math.min(92, 15 + Math.floor(elapsedMs / 1000));
      job.updatedAt = new Date().toISOString();
    }, 1000);

    let result;
    try {
      result = await runHyperFramesRender(compositionDir, renderOutputPath, job);
    } finally {
      clearInterval(progressTimer);
    }
    job.exitCode = result.status;

    if (result.status !== 0) {
      const error = new Error(`HyperFrames render failed with exit code ${result.status}.`);
      error.code = "RENDER_FAILED";
      throw error;
    }

    if (voiceoverEnabled) {
      appendLog(job, "INFO", "Muxing voiceover into MP4 output.");
      await muxVoiceoverIntoVideo({
        videoPath: renderOutputPath,
        audioPath: path.join(config.projectRoot, job.audio.voiceover.outputPath),
        outputPath
      });
      appendLog(job, "SUCCESS", "Voiceover audio track attached.");
    }

    const stats = fs.statSync(outputPath);
    job.status = "succeeded";
    job.progress = 100;
    job.outputSize = stats.size;
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    job.durationMs = Date.now() - startedAt;
    job.outputRecord = upsertOutputRecord(job);
    appendLog(job, "SUCCESS", `Render completed: ${job.outputPath}.`);
    return job;
  } catch (error) {
    job.status = "failed";
    job.progress = 0;
    job.error = error.message;
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    job.durationMs = Date.now() - startedAt;
    appendLog(job, "ERROR", error.message);
    return job;
  }
}

async function processNextJob() {
  if (activeJobId || jobQueue.length === 0) {
    return;
  }

  const next = jobQueue.shift();
  activeJobId = next.job.id;

  try {
    await executeRenderJob(next.job, next.payload);
  } finally {
    activeJobId = null;
    setImmediate(processNextJob);
  }
}

function queueRenderJob(payload) {
  const validation = validateJobPayload(payload);
  if (!validation.valid) {
    const error = new Error("Render payload validation failed.");
    error.code = "VALIDATION_FAILED";
    error.validationErrors = validation.errors;
    throw error;
  }

  const job = createJobRecord(payload);
  appendLog(job, "INFO", "Render job queued.");
  jobs.set(job.id, job);
  jobQueue.push({ job, payload });
  setImmediate(processNextJob);

  return job;
}

function getRenderJob(jobId) {
  return jobs.get(jobId) || null;
}

module.exports = {
  SUPPORTED_TEMPLATE_IDS,
  getRenderJob,
  queueRenderJob
};
