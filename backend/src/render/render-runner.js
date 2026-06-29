"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const crypto = require("node:crypto");
const { config } = require("../config");
const { getActiveProject, getAsset, saveRenderOutput } = require("../db/database");
const { isSafeAssetFile } = require("../storage/asset-store");
const { generateVoiceover } = require("../audio/voiceover");
const { muxAudioTracksIntoVideo } = require("./media");
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

function normalizeOutputFilename(value, fallbackId) {
  const fallback = `${fallbackId}.mp4`;
  const raw = String(value || "").trim();
  if (!raw) {
    return fallback;
  }

  const withoutExtension = raw.replace(/\.mp4$/i, "");
  const safeName = withoutExtension
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);

  return safeName ? `${safeName}.mp4` : fallback;
}

function getPayloadOutputPath(jobId, payload) {
  const filename = normalizeOutputFilename(payload && payload.video && payload.video.outputFilename, jobId);
  return path.join(config.projectRoot, "outputs", filename);
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

function createJobRecord(payload, projectId) {
  const jobId = crypto.randomUUID();
  const now = new Date().toISOString();
  const outputPath = getPayloadOutputPath(jobId, payload);

  return {
    id: jobId,
    status: "queued",
    templateId: payload.template.id,
    aspectRatio: payload.video.aspectRatio,
    width: payload.video.width,
    height: payload.video.height,
    resolution: `${payload.video.width}x${payload.video.height}`,
    projectId,
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

function localizeRenderAssets(payload, compositionDir) {
  const localizedPayload = JSON.parse(JSON.stringify(payload));
  const localizedById = new Map();
  const localizedBySource = new Map();
  const assetDir = path.join(compositionDir, "assets");

  const localize = (asset) => {
    if (!asset || !asset.id) return asset;
    if (localizedById.has(asset.id)) {
      return { ...asset, url: localizedById.get(asset.id) };
    }
    const storedAsset = getAsset(asset.id);
    if (!storedAsset || !isSafeAssetFile(storedAsset.filePath)) {
      return asset;
    }
    ensureDirectory(assetDir);
    const safeId = String(storedAsset.id).replace(/[^a-zA-Z0-9_-]+/g, "-");
    const filename = `${safeId}${path.extname(storedAsset.filePath)}`;
    fs.copyFileSync(storedAsset.filePath, path.join(assetDir, filename));
    const localUrl = `assets/${filename}`;
    localizedById.set(asset.id, localUrl);
    if (asset.url) {
      localizedBySource.set(asset.url, localUrl);
    }
    return { ...asset, url: localUrl };
  };

  if (localizedPayload.assets) {
    localizedPayload.assets.logo = localize(localizedPayload.assets.logo);
    ["screenshots", "videos", "all"].forEach((key) => {
      if (Array.isArray(localizedPayload.assets[key])) {
        localizedPayload.assets[key] = localizedPayload.assets[key].map(localize);
      }
    });
  }
  const backgroundMusic = localizedPayload.audio && localizedPayload.audio.backgroundMusic;
  if (backgroundMusic && backgroundMusic.source && localizedBySource.has(backgroundMusic.source)) {
    backgroundMusic.source = localizedBySource.get(backgroundMusic.source);
  }
  return localizedPayload;
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
  const localizedPayload = localizeRenderAssets(payload, compositionDir);
  fs.writeFileSync(path.join(compositionDir, "render-payload.json"), stableJson(localizedPayload));

  return { compositionDir, localizedPayload };
}

function resolveCompositionMediaPath(compositionDir, source = "") {
  const normalizedSource = String(source || "").trim();
  if (!normalizedSource) return "";
  const resolvedCompositionDir = path.resolve(compositionDir);
  const resolvedSource = path.resolve(resolvedCompositionDir, normalizedSource);
  if (!resolvedSource.startsWith(`${resolvedCompositionDir}${path.sep}`)) {
    throw new Error("Background music must resolve inside the composition directory.");
  }
  return resolvedSource;
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
  const outputPath = getPayloadOutputPath(job.id, payload);
  const voiceoverEnabled = Boolean(payload.audio && payload.audio.voiceover && payload.audio.voiceover.enabled);
  const backgroundMusicRequested = Boolean(payload.audio && payload.audio.backgroundMusic && payload.audio.backgroundMusic.enabled && payload.audio.backgroundMusic.source);
  const needsAudioMux = voiceoverEnabled || backgroundMusicRequested;
  const renderOutputPath = needsAudioMux ? getVideoOnlyOutputPath(job.id) : outputPath;
  const startedAt = Date.now();
  job.status = "running";
  job.progress = 15;
  job.startedAt = new Date(startedAt).toISOString();
  job.updatedAt = job.startedAt;
  appendLog(job, "INITIALIZING", "Render worker started.");

  try {
    ensureDirectory(path.dirname(outputPath));
    const { compositionDir, localizedPayload } = prepareWorkDir(job.id, payload);
    const backgroundMusic = localizedPayload.audio && localizedPayload.audio.backgroundMusic || {};
    const backgroundMusicPath = backgroundMusic.enabled
      ? resolveCompositionMediaPath(compositionDir, backgroundMusic.source)
      : "";
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

    if (needsAudioMux) {
      appendLog(job, "INFO", voiceoverEnabled && backgroundMusicPath ? "Muxing voiceover and background music into MP4 output." : voiceoverEnabled ? "Muxing voiceover into MP4 output." : "Muxing background music into MP4 output.");
      await muxAudioTracksIntoVideo({
        videoPath: renderOutputPath,
        voiceoverPath: voiceoverEnabled ? path.join(config.projectRoot, job.audio.voiceover.outputPath) : "",
        backgroundMusicPath,
        backgroundMusicVolume: Number.isFinite(backgroundMusic.volume) ? backgroundMusic.volume : 0.12,
        backgroundMusicDucking: backgroundMusic.ducking !== false,
        outputPath
      });
      appendLog(job, "SUCCESS", voiceoverEnabled && backgroundMusicPath ? "Voiceover and background music audio tracks attached." : voiceoverEnabled ? "Voiceover audio track attached." : "Background music audio track attached.");
    }

    const stats = fs.statSync(outputPath);
    job.status = "succeeded";
    job.progress = 100;
    job.outputSize = stats.size;
    job.completedAt = new Date().toISOString();
    job.updatedAt = job.completedAt;
    job.durationMs = Date.now() - startedAt;
    job.outputRecord = upsertOutputRecord(job);
    if (job.projectId && job.outputRecord) {
      job.outputRecord = saveRenderOutput(job.projectId, {
        ...job.outputRecord,
        templateId: job.templateId,
        aspectRatio: job.aspectRatio,
        width: job.width,
        height: job.height,
        outputSize: job.outputSize,
        durationMs: job.durationMs,
        status: job.status,
        completedAt: job.completedAt
      }) || job.outputRecord;
    }
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

  const activeProject = getActiveProject();
  const job = createJobRecord(payload, activeProject.id);
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
  localizeRenderAssets,
  resolveCompositionMediaPath,
  queueRenderJob
};
