"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { Readable } = require("node:stream");

const testRoot = fs.mkdtempSync(path.join(os.tmpdir(), "hvt-projects-test-"));
process.env.HVT_DATABASE_PATH = path.join(testRoot, "test.sqlite");

const {
  archiveProject,
  createProjectSnapshot,
  createProject,
  duplicateProject,
  getActiveProject,
  getCurrentProject,
  getProject,
  listProjectSnapshots,
  listProjects,
  listRenderOutputs,
  restoreProjectSnapshot,
  saveProject,
  saveRenderOutput,
  setActiveProject
} = require("../src/db/database");
const { handleProjects } = require("../src/routes/projects");

function project(overrides = {}) {
  const name = overrides.projectName || "Project Alpha";
  return {
    projectName: name,
    projectSlug: overrides.projectSlug || name.toLowerCase().replaceAll(" ", "-"),
    contentType: overrides.contentType || "explainer",
    features: overrides.features || []
  };
}

function jsonRequest(method, pathname, body = null) {
  const request = Readable.from(body === null ? [] : [JSON.stringify(body)]);
  request.method = method;
  request.url = pathname;
  return request;
}

function captureResponse() {
  return {
    statusCode: 0,
    payload: null
  };
}

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.payload = payload;
}

async function run() {
  const first = getActiveProject();
  assert.equal(first.slug, "codegraph-ai-agent-intro");
  assert.equal(getCurrentProject().id, first.id);
  assert.equal(listProjects().length, 1);

  const second = createProject(project({ projectName: "Project Beta", projectSlug: "project-beta" }), { activate: true });
  assert.notEqual(second.id, first.id);
  assert.equal(second.name, "Project Beta");
  assert.equal(getActiveProject().id, second.id);
  assert.deepEqual(listProjects().map((item) => item.id), [second.id, first.id]);

  const updatedSecond = saveProject(second.id, project({
    projectName: "Project Beta Updated",
    projectSlug: "project-beta-updated",
    contentType: "launch-video",
    features: [{ id: "feature-1", title: "Feature 1" }]
  }));
  assert.equal(updatedSecond.name, "Project Beta Updated");
  assert.equal(updatedSecond.slug, "project-beta-updated");
  assert.equal(updatedSecond.contentType, "launch-video");
  assert.equal(updatedSecond.project.features.length, 1);
  assert.equal(getProject(second.id).project.features[0].title, "Feature 1");

  setActiveProject(first.id);
  assert.equal(getActiveProject().id, first.id);

  const duplicated = duplicateProject(first.id, { activate: true });
  assert.notEqual(duplicated.id, first.id);
  assert.equal(duplicated.name, `${first.name} Copy`);
  assert.equal(duplicated.slug, `${first.slug}-copy`);
  assert.equal(getActiveProject().id, duplicated.id);

  const archived = archiveProject(duplicated.id);
  assert.equal(archived.status, "archived");
  assert.ok(archived.archivedAt);
  assert.notEqual(getActiveProject().id, duplicated.id);
  assert.equal(listProjects().some((item) => item.id === duplicated.id), false);
  assert.equal(listProjects({ includeArchived: true }).some((item) => item.id === duplicated.id), true);

  assert.throws(() => setActiveProject(duplicated.id), /Cannot activate archived project/);

  const output = saveRenderOutput(first.id, {
    id: "job_1",
    filename: "codegraph.mp4",
    outputPath: "outputs/codegraph.mp4",
    templateId: "dynamic-story",
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    outputSize: 2048,
    durationMs: 12000,
    status: "succeeded",
    completedAt: "2026-06-29T00:00:00.000Z"
  });
  assert.equal(output.id, "job_1");
  assert.equal(output.projectId, first.id);
  assert.equal(output.resolution, "1080x1920");
  assert.equal(output.outputSize, 2048);
  assert.equal(listRenderOutputs(first.id).length, 1);
  assert.equal(listRenderOutputs(second.id).length, 0);

  const outputsResponse = captureResponse();
  const outputsHandled = await handleProjects(
    jsonRequest("GET", `/api/projects/${encodeURIComponent(first.id)}/outputs`),
    outputsResponse,
    new URL(`http://localhost/api/projects/${encodeURIComponent(first.id)}/outputs`),
    sendJson
  );
  assert.equal(outputsHandled, true);
  assert.equal(outputsResponse.statusCode, 200);
  assert.equal(outputsResponse.payload.data.outputs[0].id, "job_1");

  const snapshot = createProjectSnapshot(first.id, "Before rewrite");
  assert.equal(snapshot.label, "Before rewrite");
  assert.equal(snapshot.isCurrent, false);
  assert.ok(listProjectSnapshots(first.id).some((item) => item.id === snapshot.id));

  saveProject(first.id, project({
    projectName: "Project Alpha Changed",
    projectSlug: "project-alpha-changed",
    features: [{ id: "changed", title: "Changed" }]
  }));
  assert.equal(getProject(first.id).name, "Project Alpha Changed");
  const restored = restoreProjectSnapshot(first.id, snapshot.id);
  assert.equal(restored.name, first.name);
  assert.equal(restored.slug, first.slug);

  const snapshotsResponse = captureResponse();
  const snapshotsHandled = await handleProjects(
    jsonRequest("GET", `/api/projects/${encodeURIComponent(first.id)}/snapshots`),
    snapshotsResponse,
    new URL(`http://localhost/api/projects/${encodeURIComponent(first.id)}/snapshots`),
    sendJson
  );
  assert.equal(snapshotsHandled, true);
  assert.equal(snapshotsResponse.statusCode, 200);
  assert.ok(snapshotsResponse.payload.data.snapshots.length >= 2);

  const createSnapshotResponse = captureResponse();
  const createSnapshotHandled = await handleProjects(
    jsonRequest("POST", `/api/projects/${encodeURIComponent(first.id)}/snapshots`, { label: "Route snapshot" }),
    createSnapshotResponse,
    new URL(`http://localhost/api/projects/${encodeURIComponent(first.id)}/snapshots`),
    sendJson
  );
  assert.equal(createSnapshotHandled, true);
  assert.equal(createSnapshotResponse.statusCode, 201);
  assert.equal(createSnapshotResponse.payload.data.snapshot.label, "Route snapshot");

  saveProject(first.id, project({
    projectName: "Project Alpha Route Changed",
    projectSlug: "project-alpha-route-changed"
  }));
  const restoreSnapshotResponse = captureResponse();
  const restoreSnapshotHandled = await handleProjects(
    jsonRequest("POST", `/api/projects/${encodeURIComponent(first.id)}/snapshots/${encodeURIComponent(createSnapshotResponse.payload.data.snapshot.id)}/restore`),
    restoreSnapshotResponse,
    new URL(`http://localhost/api/projects/${encodeURIComponent(first.id)}/snapshots/${encodeURIComponent(createSnapshotResponse.payload.data.snapshot.id)}/restore`),
    sendJson
  );
  assert.equal(restoreSnapshotHandled, true);
  assert.equal(restoreSnapshotResponse.statusCode, 200);
  assert.equal(restoreSnapshotResponse.payload.data.meta.name, first.name);

  const response = captureResponse();
  const handled = await handleProjects(
    jsonRequest("POST", "/api/projects"),
    response,
    new URL("http://localhost/api/projects"),
    sendJson
  );
  assert.equal(handled, true);
  assert.equal(response.statusCode, 201);
  assert.equal(response.payload.data.meta.slug, "codegraph-ai-agent-intro");
}

run()
  .then(() => {
  process.stdout.write("Project persistence tests passed.\n");
  })
  .finally(() => fs.rmSync(testRoot, { recursive: true, force: true }));
