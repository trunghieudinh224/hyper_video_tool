"use strict";

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");

const CURRENT_PROJECT_ID = "current";
const DEFAULT_SETTINGS_KEY = "default";
const SCHEMA_PATH = path.join(__dirname, "schema.sql");
const DEFAULT_PROJECT_PATH = path.join(config.projectRoot, "data", "sample-project.json");
const DEFAULT_SETTINGS = {
  theme: "light",
  renderFolder: "outputs/",
  uploadFolder: "uploads/",
  validation: {
    warnMaxActiveScriptSegments: false,
    maxActiveScriptSegments: 6
  }
};

function ensureDatabaseDirectory() {
  fs.mkdirSync(path.dirname(config.databasePath), { recursive: true });
}

function runSql(sql, options = {}) {
  ensureDatabaseDirectory();
  const args = ["-batch"];
  if (options.json) {
    args.push("-json");
  }
  args.push(config.databasePath);

  const result = childProcess.spawnSync(config.sqliteBin, args, {
    input: sql,
    encoding: "utf8",
    maxBuffer: 1024 * 1024 * 16
  });

  if (result.error) {
    if (result.error.code === "ENOENT") {
      throw new Error(`SQLite CLI not found: ${config.sqliteBin}. Install sqlite3 or set HVT_SQLITE_BIN to a valid sqlite3 binary.`);
    }
    throw result.error;
  }

  if (result.status !== 0) {
    throw new Error((result.stderr || "SQLite command failed.").trim());
  }

  return result.stdout || "";
}

function sqlString(value) {
  return `'${String(value).replaceAll("'", "''")}'`;
}

function initDatabase() {
  const schemaSql = fs.readFileSync(SCHEMA_PATH, "utf8");
  runSql(schemaSql);
  runSql(`
    INSERT INTO app_meta (key, value, updated_at)
    VALUES ('schema_version', '1', ${sqlString(new Date().toISOString())})
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at;
  `);
}

function readDefaultProject() {
  return JSON.parse(fs.readFileSync(DEFAULT_PROJECT_PATH, "utf8"));
}

function normalizeProject(project) {
  if (!project || typeof project !== "object" || Array.isArray(project)) {
    throw new Error("Project payload must be an object.");
  }

  return project;
}

function normalizeSettings(settings) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) {
    throw new Error("Settings payload must be an object.");
  }

  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    validation: {
      ...DEFAULT_SETTINGS.validation,
      ...(settings.validation || {})
    }
  };
}

function serializeProjectRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    project: JSON.parse(row.payload_json),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function serializeSettingsRow(row) {
  if (!row) {
    return null;
  }

  return {
    key: row.key,
    settings: normalizeSettings(JSON.parse(row.value_json)),
    updatedAt: row.updated_at
  };
}

function serializeAssetRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    projectId: row.project_id,
    name: row.name,
    type: row.type,
    mimeType: row.mime_type,
    sizeBytes: Number(row.size_bytes) || 0,
    size: formatBytes(Number(row.size_bytes) || 0),
    filePath: row.file_path,
    publicUrl: row.public_url,
    url: row.public_url,
    useInVideo: row.use_in_video === 1 || row.use_in_video === true,
    dateAdded: String(row.created_at || "").slice(0, 10),
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) {
    return "0 B";
  }
  if (bytes < 1024 * 1024) {
    return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  }
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

function getProjectName(project) {
  const name = String(project.projectName || project.name || "").trim();
  return name || "Untitled Project";
}

function getProjectSlug(project) {
  const slug = String(project.projectSlug || project.slug || "").trim();
  return slug || "untitled-project";
}

function saveCurrentProject(project) {
  initDatabase();
  const normalizedProject = normalizeProject(project);
  const now = new Date().toISOString();
  const payloadJson = JSON.stringify(normalizedProject);

  runSql(`
    INSERT INTO projects (id, name, slug, payload_json, created_at, updated_at)
    VALUES (
      ${sqlString(CURRENT_PROJECT_ID)},
      ${sqlString(getProjectName(normalizedProject))},
      ${sqlString(getProjectSlug(normalizedProject))},
      ${sqlString(payloadJson)},
      ${sqlString(now)},
      ${sqlString(now)}
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      slug = excluded.slug,
      payload_json = excluded.payload_json,
      updated_at = excluded.updated_at;
  `);

  return getCurrentProject();
}

function ensureCurrentProject() {
  initDatabase();
  const rows = JSON.parse(runSql(
    `SELECT id FROM projects WHERE id = ${sqlString(CURRENT_PROJECT_ID)} LIMIT 1;`,
    { json: true }
  ) || "[]");

  if (!rows.length) {
    return saveCurrentProject(readDefaultProject());
  }

  return getCurrentProject();
}

function getCurrentProject() {
  initDatabase();
  const rows = JSON.parse(runSql(
    `SELECT id, name, slug, payload_json, created_at, updated_at FROM projects WHERE id = ${sqlString(CURRENT_PROJECT_ID)} LIMIT 1;`,
    { json: true }
  ) || "[]");

  return serializeProjectRow(rows[0] || null);
}

function saveSettings(settings, key = DEFAULT_SETTINGS_KEY) {
  initDatabase();
  const normalizedSettings = normalizeSettings(settings);
  const now = new Date().toISOString();

  runSql(`
    INSERT INTO app_settings (key, value_json, updated_at)
    VALUES (
      ${sqlString(key)},
      ${sqlString(JSON.stringify(normalizedSettings))},
      ${sqlString(now)}
    )
    ON CONFLICT(key) DO UPDATE SET
      value_json = excluded.value_json,
      updated_at = excluded.updated_at;
  `);

  return getSettings(key);
}

function ensureSettings(key = DEFAULT_SETTINGS_KEY) {
  initDatabase();
  const rows = JSON.parse(runSql(
    `SELECT key FROM app_settings WHERE key = ${sqlString(key)} LIMIT 1;`,
    { json: true }
  ) || "[]");

  if (!rows.length) {
    return saveSettings(DEFAULT_SETTINGS, key);
  }

  return getSettings(key);
}

function getSettings(key = DEFAULT_SETTINGS_KEY) {
  initDatabase();
  const rows = JSON.parse(runSql(
    `SELECT key, value_json, updated_at FROM app_settings WHERE key = ${sqlString(key)} LIMIT 1;`,
    { json: true }
  ) || "[]");

  return serializeSettingsRow(rows[0] || null);
}

function listAssets(projectId = CURRENT_PROJECT_ID) {
  initDatabase();
  ensureCurrentProject();
  const rows = JSON.parse(runSql(
    `SELECT id, project_id, name, type, mime_type, size_bytes, file_path, public_url, use_in_video, created_at, updated_at
     FROM assets
     WHERE project_id = ${sqlString(projectId)}
     ORDER BY created_at DESC, id DESC;`,
    { json: true }
  ) || "[]");

  return rows.map(serializeAssetRow);
}

function getAsset(assetId, projectId = null) {
  initDatabase();
  const projectFilter = projectId ? ` AND project_id = ${sqlString(projectId)}` : "";
  const rows = JSON.parse(runSql(
    `SELECT id, project_id, name, type, mime_type, size_bytes, file_path, public_url, use_in_video, created_at, updated_at
     FROM assets
     WHERE id = ${sqlString(assetId)}${projectFilter}
     LIMIT 1;`,
    { json: true }
  ) || "[]");

  return serializeAssetRow(rows[0] || null);
}

function saveAsset(asset) {
  initDatabase();
  ensureCurrentProject();
  const now = new Date().toISOString();
  const useInVideo = asset.useInVideo === false ? 0 : 1;

  runSql(`
    INSERT INTO assets (id, project_id, name, type, mime_type, size_bytes, file_path, public_url, use_in_video, created_at, updated_at)
    VALUES (
      ${sqlString(asset.id)},
      ${sqlString(asset.projectId || CURRENT_PROJECT_ID)},
      ${sqlString(asset.name)},
      ${sqlString(asset.type)},
      ${sqlString(asset.mimeType)},
      ${Number.parseInt(asset.sizeBytes, 10) || 0},
      ${sqlString(asset.filePath)},
      ${sqlString(asset.publicUrl)},
      ${useInVideo},
      ${sqlString(now)},
      ${sqlString(now)}
    )
    ON CONFLICT(id) DO UPDATE SET
      name = excluded.name,
      type = excluded.type,
      mime_type = excluded.mime_type,
      size_bytes = excluded.size_bytes,
      file_path = excluded.file_path,
      public_url = excluded.public_url,
      use_in_video = excluded.use_in_video,
      updated_at = excluded.updated_at;
  `);

  return getAsset(asset.id);
}

function deleteAsset(assetId, projectId = null) {
  const asset = getAsset(assetId, projectId);
  if (!asset) {
    return null;
  }

  const projectFilter = projectId ? ` AND project_id = ${sqlString(projectId)}` : "";
  runSql(`DELETE FROM assets WHERE id = ${sqlString(assetId)}${projectFilter};`);
  return asset;
}

module.exports = {
  CURRENT_PROJECT_ID,
  DEFAULT_SETTINGS,
  DEFAULT_SETTINGS_KEY,
  ensureCurrentProject,
  ensureSettings,
  getCurrentProject,
  getAsset,
  getSettings,
  initDatabase,
  listAssets,
  saveAsset,
  saveCurrentProject,
  deleteAsset,
  saveSettings
};
