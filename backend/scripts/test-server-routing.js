"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Readable } = require("node:stream");

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hvt-server-routing-test-"));
process.env.HVT_DATABASE_PATH = path.join(testRoot, "test.sqlite");
process.env.HVT_UPLOADS_DIR = path.join(testRoot, "uploads");
process.env.HVT_PORT = "3000";

const { getActiveProject } = require("../src/db/database");
const { requestHandler } = require("../src/server");

function createRequest(pathname) {
  const request = Readable.from([]);
  request.method = "GET";
  request.url = pathname;
  request.headers = {
    host: "localhost"
  };
  return request;
}

function send(pathname) {
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
    requestHandler(createRequest(pathname), response).catch(reject);
  });
}

async function run() {
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
}

run()
  .then(() => process.stdout.write("Server routing tests passed.\n"))
  .finally(() => fs.rmSync(testRoot, { recursive: true, force: true }));
