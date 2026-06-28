"use strict";

const childProcess = require("node:child_process");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");

const CURRENT_PROJECT_ID = "current";
const ACTIVE_PROJECT_KEY = "default";
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
  ensureProjectColumn("content_type", "TEXT");
  ensureProjectColumn("status", "TEXT NOT NULL DEFAULT 'draft'");
  ensureProjectColumn("thumbnail_url", "TEXT");
  ensureProjectColumn("last_rendered_output_id", "TEXT");
  ensureProjectColumn("archived_at", "TEXT");
  runSql(`
    INSERT INTO app_meta (key, value, updated_at)
    VALUES ('schema_version', '1', ${sqlString(new Date().toISOString())})
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = excluded.updated_at;
  `);
}

function ensureProjectColumn(name, definition) {
  try {
    runSql(`ALTER TABLE projects ADD COLUMN ${name} ${definition};`);
  } catch (error) {
    if (!String(error.message || "").includes("duplicate column name")) {
      throw error;
    }
  }
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
    contentType: row.content_type || "",
    status: row.status || "draft",
    thumbnailUrl: row.thumbnail_url || "",
    lastRenderedOutputId: row.last_rendered_output_id || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at || null
  };
}

function serializeProjectMetaRow(row) {
  if (!row) {
    return null;
  }

  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    contentType: row.content_type || "",
    status: row.status || "draft",
    thumbnailUrl: row.thumbnail_url || "",
    lastRenderedOutputId: row.last_rendered_output_id || "",
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    archivedAt: row.archived_at || null
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

function getProjectContentType(project) {
  return String(project.contentType || project.content_type || "").trim();
}

function createId(prefix) {
  if (typeof crypto.randomUUID === "function") {
    return `${prefix}_${crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
}

function upsertCurrentSnapshot(projectId, project, createdAt = new Date().toISOString()) {
  const existingRows = JSON.parse(runSql(
    `SELECT id FROM project_snapshots WHERE project_id = ${sqlString(projectId)} AND is_current = 1 LIMIT 1;`,
    { json: true }
  ) || "[]");
  const payloadJson = JSON.stringify(project);

  if (existingRows.length) {
    runSql(`
      UPDATE project_snapshots
      SET payload_json = ${sqlString(payloadJson)}
      WHERE id = ${sqlString(existingRows[0].id)};
    `);
    return existingRows[0].id;
  }

  const snapshotId = createId("snap");
  runSql(`
    INSERT INTO project_snapshots (id, project_id, version, label, payload_json, created_at, is_current)
    VALUES (
      ${sqlString(snapshotId)},
      ${sqlString(projectId)},
      1,
      ${sqlString("Current")},
      ${sqlString(payloadJson)},
      ${sqlString(createdAt)},
      1
    );
  `);
  return snapshotId;
}

function migrateLegacyCurrentProject() {
  const legacyRows = JSON.parse(runSql(
    `SELECT id, payload_json FROM projects WHERE id = ${sqlString(CURRENT_PROJECT_ID)} LIMIT 1;`,
    { json: true }
  ) || "[]");
  if (!legacyRows.length) {
    return null;
  }

  const activeRows = JSON.parse(runSql(
    `SELECT project_id FROM active_project WHERE key = ${sqlString(ACTIVE_PROJECT_KEY)} LIMIT 1;`,
    { json: true }
  ) || "[]");
  if (activeRows.length) {
    return activeRows[0].project_id;
  }

  const realProjectRows = JSON.parse(runSql(
    `SELECT id FROM projects WHERE id != ${sqlString(CURRENT_PROJECT_ID)} LIMIT 1;`,
    { json: true }
  ) || "[]");
  if (realProjectRows.length) {
    setActiveProject(realProjectRows[0].id);
    return realProjectRows[0].id;
  }

  const legacyProject = JSON.parse(legacyRows[0].payload_json);
  const row = createProject(legacyProject, { activate: true });
  return row.id;
}

function ensureProjectStore() {
  initDatabase();
  migrateLegacyCurrentProject();
}

function projectMetadataSqlValues(project, now) {
  return {
    name: sqlString(getProjectName(project)),
    slug: sqlString(getProjectSlug(project)),
    contentType: sqlString(getProjectContentType(project)),
    status: sqlString("draft"),
    thumbnailUrl: sqlString(""),
    lastRenderedOutputId: "NULL",
    payloadJson: sqlString(JSON.stringify(project)),
    now: sqlString(now)
  };
}

function createProject(project = readDefaultProject(), options = {}) {
  initDatabase();
  const normalizedProject = normalizeProject(project);
  const now = new Date().toISOString();
  const id = options.id || createId("proj");
  const values = projectMetadataSqlValues(normalizedProject, now);

  runSql(`
    INSERT INTO projects (
      id,
      name,
      slug,
      content_type,
      status,
      thumbnail_url,
      last_rendered_output_id,
      payload_json,
      created_at,
      updated_at,
      archived_at
    )
    VALUES (
      ${sqlString(id)},
      ${values.name},
      ${values.slug},
      ${values.contentType},
      ${values.status},
      ${values.thumbnailUrl},
      ${values.lastRenderedOutputId},
      ${values.payloadJson},
      ${values.now},
      ${values.now},
      NULL
    );
  `);
  upsertCurrentSnapshot(id, normalizedProject, now);
  if (options.activate) {
    setActiveProject(id);
  }
  return getProject(id);
}

function listProjects(options = {}) {
  ensureProjectStore();
  const includeArchived = Boolean(options.includeArchived);
  const rows = JSON.parse(runSql(
    `SELECT id, name, slug, content_type, status, thumbnail_url, last_rendered_output_id, created_at, updated_at, archived_at
     FROM projects
     WHERE id != ${sqlString(CURRENT_PROJECT_ID)}
       ${includeArchived ? "" : "AND archived_at IS NULL"}
     ORDER BY updated_at DESC;`,
    { json: true }
  ) || "[]");
  return rows.map(serializeProjectMetaRow);
}

function getProject(projectId) {
  initDatabase();
  const rows = JSON.parse(runSql(
    `SELECT p.id, p.name, p.slug, p.content_type, p.status, p.thumbnail_url, p.last_rendered_output_id, p.created_at, p.updated_at, p.archived_at,
            COALESCE(s.payload_json, p.payload_json) AS payload_json
     FROM projects p
     LEFT JOIN project_snapshots s ON s.project_id = p.id AND s.is_current = 1
     WHERE p.id = ${sqlString(projectId)}
     LIMIT 1;`,
    { json: true }
  ) || "[]");

  return serializeProjectRow(rows[0] || null);
}

function saveProject(projectId, project) {
  ensureProjectStore();
  const normalizedProject = normalizeProject(project);
  const existing = getProject(projectId);
  if (!existing) {
    throw new Error(`Project not found: ${projectId}`);
  }
  const now = new Date().toISOString();
  const values = projectMetadataSqlValues(normalizedProject, now);

  runSql(`
    UPDATE projects
    SET name = ${values.name},
        slug = ${values.slug},
        content_type = ${values.contentType},
        payload_json = ${values.payloadJson},
        updated_at = ${values.now}
    WHERE id = ${sqlString(projectId)};
  `);
  upsertCurrentSnapshot(projectId, normalizedProject, now);
  return getProject(projectId);
}

function getActiveProject() {
  ensureProjectStore();
  const rows = JSON.parse(runSql(
    `SELECT project_id FROM active_project WHERE key = ${sqlString(ACTIVE_PROJECT_KEY)} LIMIT 1;`,
    { json: true }
  ) || "[]");
  if (rows.length) {
    const row = getProject(rows[0].project_id);
    if (row && !row.archivedAt) {
      return row;
    }
  }

  const projects = listProjects({ includeArchived: false });
  if (projects.length) {
    setActiveProject(projects[0].id);
    return getProject(projects[0].id);
  }

  return createProject(readDefaultProject(), { activate: true });
}

function setActiveProject(projectId) {
  initDatabase();
  const project = getProject(projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }
  if (project.archivedAt) {
    throw new Error(`Cannot activate archived project: ${projectId}`);
  }
  const now = new Date().toISOString();
  runSql(`
    INSERT INTO active_project (key, project_id, updated_at)
    VALUES (${sqlString(ACTIVE_PROJECT_KEY)}, ${sqlString(projectId)}, ${sqlString(now)})
    ON CONFLICT(key) DO UPDATE SET
      project_id = excluded.project_id,
      updated_at = excluded.updated_at;
  `);
  return getProject(projectId);
}

function archiveProject(projectId) {
  ensureProjectStore();
  const project = getProject(projectId);
  if (!project) {
    throw new Error(`Project not found: ${projectId}`);
  }
  const now = new Date().toISOString();
  runSql(`
    UPDATE projects
    SET archived_at = ${sqlString(now)},
        status = ${sqlString("archived")},
        updated_at = ${sqlString(now)}
    WHERE id = ${sqlString(projectId)};
  `);

  const active = getActiveProject();
  if (active && active.id === projectId) {
    const next = listProjects({ includeArchived: false }).find((item) => item.id !== projectId);
    if (next) {
      setActiveProject(next.id);
    }
  }
  return getProject(projectId);
}

function duplicateProject(projectId, options = {}) {
  ensureProjectStore();
  const source = getProject(projectId);
  if (!source) {
    throw new Error(`Project not found: ${projectId}`);
  }
  const nextProject = {
    ...source.project,
    projectName: options.name || `${getProjectName(source.project)} Copy`,
    projectSlug: options.slug || `${getProjectSlug(source.project)}-copy`
  };
  return createProject(nextProject, { activate: options.activate !== false });
}

function saveCurrentProject(project) {
  const active = getActiveProject();
  return saveProject(active.id, project);
}

function ensureCurrentProject() {
  return getActiveProject();
}

function getCurrentProject() {
  return getActiveProject();
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
  ACTIVE_PROJECT_KEY,
  CURRENT_PROJECT_ID,
  DEFAULT_SETTINGS,
  DEFAULT_SETTINGS_KEY,
  archiveProject,
  createProject,
  duplicateProject,
  getActiveProject,
  ensureCurrentProject,
  ensureSettings,
  getCurrentProject,
  getAsset,
  getProject,
  getSettings,
  initDatabase,
  listAssets,
  listProjects,
  readDefaultProject,
  saveAsset,
  saveCurrentProject,
  saveProject,
  setActiveProject,
  deleteAsset,
  saveSettings
};
