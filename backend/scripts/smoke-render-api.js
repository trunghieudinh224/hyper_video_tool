"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

const projectRoot = path.resolve(__dirname, "../..");
const samplePayloadPath = path.join(projectRoot, "data", "render-payload.sample.json");
const baseUrl = (process.env.HVT_SMOKE_BASE_URL || "http://127.0.0.1:3000").replace(/\/$/, "");
const timeoutMs = Number.parseInt(process.env.HVT_SMOKE_TIMEOUT_MS || "120000", 10);
const pollIntervalMs = Number.parseInt(process.env.HVT_SMOKE_POLL_MS || "2000", 10);

function readSamplePayload() {
  return fs.readFileSync(samplePayloadPath, "utf8");
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function readJsonResponse(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (_error) {
    throw new Error(`Expected JSON response from ${response.url}, got: ${text.slice(0, 200)}`);
  }
}

async function createRenderJob() {
  const response = await fetch(`${baseUrl}/api/render-jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: readSamplePayload()
  });
  const body = await readJsonResponse(response);

  assert.equal(response.status, 202, "POST /api/render-jobs should return 202.");
  assert.equal(body.success, true, "Render job creation should succeed.");
  assert.ok(body.data && body.data.job && body.data.job.id, "Response should include job id.");

  return body.data.job;
}

async function pollRenderJob(jobId) {
  const deadline = Date.now() + timeoutMs;
  let lastJob = null;

  while (Date.now() < deadline) {
    const response = await fetch(`${baseUrl}/api/render-jobs/${encodeURIComponent(jobId)}`);
    const body = await readJsonResponse(response);

    assert.equal(response.status, 200, "GET /api/render-jobs/:id should return 200.");
    assert.equal(body.success, true, "Render job poll should succeed.");
    lastJob = body.data.job;

    process.stdout.write(`poll ${lastJob.status} ${lastJob.progress || 0}%\n`);

    if (lastJob.status === "succeeded") {
      return lastJob;
    }

    if (lastJob.status === "failed") {
      throw new Error(lastJob.error || "Render job failed.");
    }

    await sleep(pollIntervalMs);
  }

  throw new Error(`Render job did not finish in ${timeoutMs}ms. Last status: ${lastJob && lastJob.status}`);
}

async function verifyOutput(job) {
  assert.ok(job.outputPath, "Succeeded job should include outputPath.");
  const filename = path.basename(job.outputPath);

  const headResponse = await fetch(`${baseUrl}/api/outputs/${encodeURIComponent(filename)}`, {
    method: "HEAD"
  });
  assert.equal(headResponse.status, 200, "Output MP4 HEAD should return 200.");
  assert.equal(headResponse.headers.get("content-type"), "video/mp4", "Output content-type should be video/mp4.");

  const listResponse = await fetch(`${baseUrl}/api/outputs`);
  const listBody = await readJsonResponse(listResponse);
  assert.equal(listResponse.status, 200, "GET /api/outputs should return 200.");
  assert.equal(listBody.success, true, "Output list should succeed.");
  assert.ok(
    listBody.data.outputs.some((output) => output.jobId === job.id || output.filename === filename),
    "Output manifest should include rendered job."
  );

  return filename;
}

async function main() {
  console.log(`Smoke render API against ${baseUrl}`);
  const queuedJob = await createRenderJob();
  console.log(`queued ${queuedJob.id}`);

  const completedJob = await pollRenderJob(queuedJob.id);
  const filename = await verifyOutput(completedJob);

  console.log(JSON.stringify({
    success: true,
    jobId: completedJob.id,
    filename,
    outputPath: completedJob.outputPath,
    outputSize: completedJob.outputSize,
    durationMs: completedJob.durationMs
  }, null, 2));
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
