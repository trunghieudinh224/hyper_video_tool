"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");
const { TEMPLATE_PRESETS } = require("./render-payload-schema");

const MANIFEST_FILENAME = "manifest.json";
const MANIFEST_VERSION = "1.0.0";
const OUTPUT_FILENAME_PATTERN = /^[a-zA-Z0-9_-]+\.mp4$/;

function getManifestPath() {
  return path.join(config.outputsDir, MANIFEST_FILENAME);
}

function readOutputManifest() {
  try {
    const raw = fs.readFileSync(getManifestPath(), "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed.outputs) ? parsed.outputs : [];
  } catch (_error) {
    return [];
  }
}

function writeOutputManifest(outputs) {
  fs.mkdirSync(config.outputsDir, { recursive: true });
  fs.writeFileSync(
    getManifestPath(),
    `${JSON.stringify({
      version: MANIFEST_VERSION,
      updatedAt: new Date().toISOString(),
      outputs
    }, null, 2)}\n`
  );
}

function formatDateTime(value) {
  const date = value ? new Date(value) : new Date();
  if (Number.isNaN(date.getTime())) {
    return new Date().toISOString().replace("T", " ").substring(0, 19);
  }

  return date.toISOString().replace("T", " ").substring(0, 19);
}

function getTemplateName(templateId) {
  const preset = TEMPLATE_PRESETS[templateId];
  return preset ? preset.templateName : templateId;
}

function normalizeOutputRecord(record) {
  if (!record || !OUTPUT_FILENAME_PATTERN.test(record.filename || "")) {
    return null;
  }

  const outputPath = path.join(config.outputsDir, record.filename);
  if (!fs.existsSync(outputPath)) {
    return null;
  }

  let outputSize = record.outputSize || null;
  try {
    outputSize = fs.statSync(outputPath).size;
  } catch (_error) {
    return null;
  }

  return {
    id: record.id || record.jobId,
    jobId: record.jobId || record.id,
    filename: record.filename,
    outputPath: `outputs/${record.filename}`,
    templateId: record.templateId,
    template: record.template || getTemplateName(record.templateId),
    aspectRatio: record.aspectRatio || null,
    width: record.width || null,
    height: record.height || null,
    resolution: record.resolution || (record.width && record.height ? `${record.width}x${record.height}` : ""),
    projectName: record.projectName || "",
    audio: record.audio || null,
    status: record.status || "succeeded",
    outputSize,
    durationMs: record.durationMs || null,
    createdAt: record.createdAt || null,
    completedAt: record.completedAt || null,
    dateCreated: record.dateCreated || formatDateTime(record.completedAt || record.createdAt),
    source: "backend"
  };
}

function listOutputRecords() {
  const normalized = readOutputManifest()
    .map(normalizeOutputRecord)
    .filter(Boolean);

  return normalized.sort((left, right) => {
    const leftTime = Date.parse(left.completedAt || left.createdAt || 0);
    const rightTime = Date.parse(right.completedAt || right.createdAt || 0);
    return rightTime - leftTime;
  });
}

function upsertOutputRecord(job) {
  const filename = job.outputPath ? path.basename(job.outputPath) : `${job.id}.mp4`;
  const record = normalizeOutputRecord({
    id: job.id,
    jobId: job.id,
    filename,
    outputPath: `outputs/${filename}`,
    templateId: job.templateId,
    template: getTemplateName(job.templateId),
    aspectRatio: job.aspectRatio,
    width: job.width,
    height: job.height,
    resolution: job.resolution,
    projectName: job.projectName,
    audio: job.audio || null,
    status: job.status,
    outputSize: job.outputSize || null,
    durationMs: job.durationMs || null,
    createdAt: job.createdAt,
    completedAt: job.completedAt,
    dateCreated: formatDateTime(job.completedAt || job.createdAt),
    source: "backend"
  });

  if (!record) {
    return null;
  }

  const existing = readOutputManifest().filter((item) => {
    return item && item.id !== record.id && item.filename !== record.filename;
  });
  const outputs = [record, ...existing].slice(0, 100);
  writeOutputManifest(outputs);

  return record;
}

module.exports = {
  listOutputRecords,
  upsertOutputRecord
};
