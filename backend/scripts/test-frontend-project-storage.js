"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "../..");
const requests = [];
const localStore = new Map();

const context = vm.createContext({
  console,
  encodeURIComponent,
  JSON,
  CustomEvent: class CustomEvent {
    constructor(type, options = {}) {
      this.type = type;
      this.detail = options.detail || null;
    }
  },
  window: {
    location: { protocol: "http:" },
    setTimeout: (callback) => {
      callback();
      return 1;
    },
    clearTimeout: () => {},
    dispatchEvent: () => {}
  },
  localStorage: {
    getItem: (key) => localStore.get(key) || null,
    setItem: (key, value) => localStore.set(key, String(value)),
    removeItem: (key) => localStore.delete(key)
  },
  fetch: async (url, options = {}) => {
    requests.push({ url, options });
    if (url === "/api/projects/active" && !options.method) {
      return jsonResponse({
        success: true,
        data: {
          meta: { id: "proj_1", name: "Codegraph", slug: "codegraph" },
          project: {
            projectName: "Codegraph",
            projectSlug: "codegraph",
            contentType: "technical-module",
            features: [],
            assets: []
          }
        }
      });
    }
    if (url === "/api/projects/proj_1/assets" && !options.method) {
      return jsonResponse({
        success: true,
        data: {
          assets: [{ id: "asset_1", name: "Logo", type: "logo", publicUrl: "/uploads/proj_1/logo.png" }]
        }
      });
    }
    if (url === "/api/projects/proj_1" && options.method === "PUT") {
      return jsonResponse({
        success: true,
        data: {
          meta: { id: "proj_1", name: "Codegraph Updated", slug: "codegraph-updated" },
          project: JSON.parse(options.body).project
        }
      });
    }
    if (url === "/api/projects" && !options.method) {
      return jsonResponse({
        success: true,
        data: {
          projects: [{ id: "proj_1", name: "Codegraph", slug: "codegraph" }]
        }
      });
    }
    if (url === "/api/projects/proj_1/outputs" && !options.method) {
      return jsonResponse({
        success: true,
        data: {
          outputs: [{ id: "job_1", filename: "codegraph.mp4", projectId: "proj_1" }]
        }
      });
    }
    throw new Error(`Unexpected request: ${options.method || "GET"} ${url}`);
  }
});

function jsonResponse(payload) {
  return {
    ok: true,
    status: 200,
    json: async () => payload
  };
}

const constantsSource = fs.readFileSync(path.join(projectRoot, "frontend/scripts/common/constants.js"), "utf8");
const apiSource = fs.readFileSync(path.join(projectRoot, "frontend/scripts/common/api.js"), "utf8");
const storageSource = fs.readFileSync(path.join(projectRoot, "frontend/scripts/common/storage.js"), "utf8");

vm.runInContext(`
  ${constantsSource}
  const AppState = { setDirty: () => {}, setProjectData: () => {} };
  ${apiSource}
  ${storageSource}
  globalThis.__AppBackendApi = AppBackendApi;
  globalThis.__AppStorage = AppStorage;
`, context);

async function run() {
  const project = await context.__AppStorage.loadProjectData();
  assert.equal(project.projectName, "Codegraph");
  assert.equal(project.assets.length, 1);
  assert.equal(context.__AppStorage.getActiveProjectId(), "proj_1");
  assert.deepEqual(requests.map((request) => request.url), [
    "/api/projects/active",
    "/api/projects/proj_1/assets"
  ]);

  const savedProject = await context.__AppStorage.saveProjectData({
    ...project,
    projectName: "Codegraph Updated",
    projectSlug: "codegraph-updated"
  });
  assert.equal(savedProject.projectName, "Codegraph Updated");
  assert.equal(requests.at(-1).url, "/api/projects/proj_1");
  assert.equal(requests.at(-1).options.method, "PUT");

  const projects = await context.__AppStorage.loadProjectList();
  assert.equal(projects.length, 1);
  assert.equal(projects[0].id, "proj_1");

  const outputs = await context.__AppBackendApi.loadOutputs("proj_1");
  assert.equal(outputs.length, 1);
  assert.equal(outputs[0].projectId, "proj_1");
  assert.equal(requests.at(-1).url, "/api/projects/proj_1/outputs");
}

run()
  .then(() => process.stdout.write("Frontend project storage tests passed.\n"));
