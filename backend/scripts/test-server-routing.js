"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { spawnSync } = require("node:child_process");
const { Readable } = require("node:stream");

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hvt-server-routing-test-"));
process.env.HVT_DATABASE_PATH = path.join(testRoot, "test.sqlite");
process.env.HVT_UPLOADS_DIR = path.join(testRoot, "uploads");
process.env.HVT_PORT = "3000";

const { config } = require("../src/config");
config.outputsDir = path.join(testRoot, "outputs");
const { getActiveProject } = require("../src/db/database");
const { requestHandler } = require("../src/server");
const { upsertOutputRecord } = require("../src/render/output-manifest");

const exposedHost = spawnSync(process.execPath, ["-e", "require('./src/config')"], {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, HVT_HOST: "0.0.0.0" },
  encoding: "utf8"
});
assert.notEqual(exposedHost.status, 0);
assert.match(exposedHost.stderr, /HVT_HOST must be a loopback address/);
const invalidPort = spawnSync(process.execPath, ["-e", "require('./src/config')"], {
  cwd: path.join(__dirname, ".."),
  env: { ...process.env, HVT_HOST: "127.0.0.1", HVT_PORT: "3000oops" },
  encoding: "utf8"
});
assert.notEqual(invalidPort.status, 0);
assert.match(invalidPort.stderr, /HVT_PORT must be a valid TCP port/);

function createRequest(pathname, method = "GET", headers = {}) {
  const request = Readable.from([]);
  request.method = method;
  request.url = pathname;
  request.headers = {
    host: "localhost:3000",
    ...headers
  };
  return request;
}

function send(pathname, method = "GET", headers = {}) {
  return new Promise((resolve, reject) => {
    const response = {
      statusCode: 0,
      headers: {},
      body: "",
      writeHead(statusCode, headers = {}) {
        this.statusCode = statusCode;
        this.headers = headers;
      },
      end(chunk = "") {
        this.body += chunk ? String(chunk) : "";
        resolve(this);
      }
    };
    requestHandler(createRequest(pathname, method, headers), response).catch(reject);
  });
}

async function run() {
  assert.equal((await send("/api/health", "GET", { host: "evil.example:3000" })).statusCode, 403);
  assert.equal((await send("/api/health", "GET", { host: "127.0.0.1:3001" })).statusCode, 403);
  assert.equal((await send("/api/health", "GET", { "sec-fetch-site": "cross-site" })).statusCode, 200);
  assert.equal((await send("/api/projects", "POST", { "sec-fetch-site": "cross-site" })).statusCode, 403);
  assert.equal((await send("/api/projects", "POST", { origin: "https://evil.example" })).statusCode, 403);
  assert.equal((await send("/api/health", "GET", { host: "127.0.0.1:3000" })).statusCode, 200);
  assert.equal((await send("/api/does-not-exist", "POST", { origin: "http://localhost:3000" })).statusCode, 404);

  const project = getActiveProject();

  const assetsResponse = await send(`/api/projects/${encodeURIComponent(project.id)}/assets`);
  const assetsBody = JSON.parse(assetsResponse.body);
  assert.equal(assetsResponse.statusCode, 200);
  assert.equal(assetsBody.success, true);
  assert.deepEqual(assetsBody.data.assets, []);

  const outputsResponse = await send(`/api/projects/${encodeURIComponent(project.id)}/outputs`);
  const outputsBody = JSON.parse(outputsResponse.body);
  assert.equal(outputsResponse.statusCode, 200);
  assert.equal(outputsBody.success, true);
  assert.deepEqual(outputsBody.data.outputs, []);

  fs.mkdirSync(config.outputsDir, { recursive: true });
  fs.writeFileSync(path.join(config.outputsDir, "caption-test.mp4"), "video");
  fs.writeFileSync(path.join(config.outputsDir, "caption-test.srt"), "1\n00:00:00,000 --> 00:00:01,000\nTest\n");
  const output = upsertOutputRecord({
    id: "caption-job",
    outputPath: "outputs/caption-test.mp4",
    templateId: "dynamic-story-vertical",
    status: "succeeded",
    subtitles: { enabled: true, cueCount: 1, outputPath: "outputs/caption-test.srt" }
  });
  assert.equal(output.subtitles.outputPath, "outputs/caption-test.srt");
  const subtitleHead = await send("/api/outputs/caption-test.srt", "HEAD");
  assert.equal(subtitleHead.statusCode, 200);
  assert.equal(subtitleHead.headers["Content-Type"], "application/x-subrip; charset=utf-8");
  const invalidSubtitle = await send("/api/outputs/..%2Fsecret.srt", "HEAD");
  assert.equal(invalidSubtitle.statusCode, 400);
}

run()
  .then(() => process.stdout.write("Server routing tests passed.\n"))
  .finally(() => fs.rmSync(testRoot, { recursive: true, force: true }));
