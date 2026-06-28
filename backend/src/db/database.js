"use strict";

const childProcess = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");
const { config } = require("../config");

const CURRENT_PROJECT_ID = "current";
const SCHEMA_PATH = path.join(__dirname, "schema.sql");
const DEFAULT_PROJECT_PATH = path.join(config.projectRoot, "data", "sample-project.json");

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

module.exports = {
  CURRENT_PROJECT_ID,
  ensureCurrentProject,
  getCurrentProject,
  initDatabase,
  saveCurrentProject
};
