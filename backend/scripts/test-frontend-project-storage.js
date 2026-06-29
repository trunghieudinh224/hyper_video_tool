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
    if (url === "/api/projects/proj_1/snapshots" && !options.method) {
      return jsonResponse({
        success: true,
        data: {
          snapshots: [
            { id: "snap_current", projectId: "proj_1", version: 1, label: "Current", isCurrent: true },
            { id: "snap_2", projectId: "proj_1", version: 2, label: "Before edit", isCurrent: false }
          ]
        }
      });
    }
    if (url === "/api/projects/proj_1/snapshots" && options.method === "POST") {
      return jsonResponse({
        success: true,
        data: {
          snapshot: { id: "snap_3", projectId: "proj_1", version: 3, label: JSON.parse(options.body).label, isCurrent: false }
        }
      });
    }
    if (url === "/api/projects/proj_1/snapshots/snap_2/restore" && options.method === "POST") {
      return jsonResponse({
        success: true,
        data: {
          meta: { id: "proj_1", name: "Codegraph Restored", slug: "codegraph-restored" },
          project: {
            projectName: "Codegraph Restored",
            projectSlug: "codegraph-restored",
            contentType: "technical-module",
            features: [],
            assets: []
          }
        }
      });
    }
    if (url === "/api/projects/proj_1/duplicate" && options.method === "POST") {
      return jsonResponse({
        success: true,
        data: {
          meta: { id: "proj_2", name: "Codegraph Copy", slug: "codegraph-copy" },
          project: {
            projectName: "Codegraph Copy",
            projectSlug: "codegraph-copy",
            contentType: "technical-module",
            features: [],
            assets: []
          }
        }
      });
    }
    if (url === "/api/projects/proj_2/archive" && options.method === "POST") {
      return jsonResponse({
        success: true,
        data: {
          meta: { id: "proj_2", name: "Codegraph Copy", slug: "codegraph-copy", status: "archived" },
          project: {
            projectName: "Codegraph Copy",
            projectSlug: "codegraph-copy",
            features: [],
            assets: []
          }
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
  localStore.set("hyper_video_project", JSON.stringify({
    projectName: "Internal Analytics Dashboard",
    projectSlug: "internal-analytics-dashboard",
    features: [],
    assets: []
  }));

  const project = await context.__AppStorage.loadProjectData();
  assert.equal(project.projectName, "Codegraph");
  assert.equal(project.assets.length, 1);
  assert.equal(context.__AppStorage.getActiveProjectId(), "proj_1");
  assert.equal(JSON.parse(localStore.get("hyper_video_project")).projectName, "Codegraph");
  assert.deepEqual(requests.map((request) => request.url), [
    "/api/projects/active",
    "/api/projects/proj_1/assets"
  ]);

  const cleanedProject = context.__AppStorage.removeAssetReferences({
    ...project,
    primaryAssetId: "asset_music",
    videoBackground: { mode: "asset", assetId: "asset_music" },
    audio: {
      ...(project.audio || {}),
      backgroundMusic: {
        enabled: true,
        assetId: "asset_music",
        source: "/api/assets/asset_music/file",
        volume: 0.2,
        ducking: true
      }
    }
  }, ["asset_music"]);
  assert.equal(cleanedProject.primaryAssetId, "");
  assert.equal(cleanedProject.videoBackground.mode, "none");
  assert.equal(cleanedProject.videoBackground.assetId, "");
  assert.equal(cleanedProject.audio.backgroundMusic.enabled, false);
  assert.equal(cleanedProject.audio.backgroundMusic.assetId, "");
  assert.equal(cleanedProject.audio.backgroundMusic.source, "");

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

  const snapshots = await context.__AppStorage.loadProjectSnapshots("proj_1");
  assert.equal(snapshots.length, 2);
  assert.equal(snapshots[1].label, "Before edit");
  assert.equal(requests.at(-1).url, "/api/projects/proj_1/snapshots");

  const snapshot = await context.__AppStorage.createProjectSnapshot("Before restore");
  assert.equal(snapshot.label, "Before restore");
  assert.equal(requests.at(-1).url, "/api/projects/proj_1/snapshots");

  const restored = await context.__AppStorage.restoreProjectSnapshot("snap_2");
  assert.equal(restored.projectName, "Codegraph Restored");
  assert.equal(context.__AppStorage.getActiveProjectId(), "proj_1");
  assert.equal(requests.at(-1).url, "/api/projects/proj_1/snapshots/snap_2/restore");

  const duplicated = await context.__AppStorage.duplicateProjectData("proj_1");
  assert.equal(duplicated.projectName, "Codegraph Copy");
  assert.equal(context.__AppStorage.getActiveProjectId(), "proj_2");
  assert.equal(requests.at(-1).url, "/api/projects/proj_1/duplicate");

  const archivedActive = await context.__AppStorage.archiveProjectData("proj_2");
  assert.equal(archivedActive.projectName, "Codegraph");
  assert.equal(requests.at(-2).url, "/api/projects/proj_2/archive");
  assert.equal(requests.at(-1).url, "/api/projects/active");
}

run()
  .then(() => process.stdout.write("Frontend project storage tests passed.\n"));
