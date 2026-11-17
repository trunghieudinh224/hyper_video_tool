"use strict";

const fs = require("node:fs");
const crypto = require("node:crypto");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../..");
const runnerPackageJson = path.join(projectRoot, "backend", "hyperframes-runner-package.json");
const runnerPackageLock = path.join(projectRoot, "backend", "hyperframes-runner-package-lock.json");
const runnerDir = path.join(projectRoot, ".cache", "hyperframes-runner");
const runnerBinDir = path.join(runnerDir, "bin");
const installFingerprintPath = path.join(runnerDir, ".install-sha256");
const nodeBinaryName = process.platform === "win32" ? "node.exe" : "node";

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: false,
    ...options
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function localModulePath(packageName) {
  return path.join(runnerDir, "node_modules", packageName);
}

function filesMatch(sourcePath, installedPath) {
  return fs.existsSync(installedPath)
    && fs.readFileSync(sourcePath).equals(fs.readFileSync(installedPath));
}

function getInstallFingerprint() {
  return crypto.createHash("sha256")
    .update(fs.readFileSync(runnerPackageJson))
    .update("\0")
    .update(fs.readFileSync(runnerPackageLock))
    .digest("hex");
}

function ensureRunnerInstalled() {
  const fingerprint = getInstallFingerprint();
  const dependencies = JSON.parse(fs.readFileSync(runnerPackageJson, "utf8")).dependencies;
  const requiredPaths = [
    path.join(localModulePath("node"), "bin", nodeBinaryName),
    path.join(localModulePath("hyperframes"), "dist", "cli.js"),
    localModulePath("ffmpeg-static"),
    localModulePath("ffprobe-static")
  ];
  const versionsMatch = Object.entries(dependencies).every(([name, version]) => {
    const installedPackage = path.join(localModulePath(name), "package.json");
    return fs.existsSync(installedPackage)
      && JSON.parse(fs.readFileSync(installedPackage, "utf8")).version === version;
  });

  const installedFilesMatch = requiredPaths.every((requiredPath) => fs.existsSync(requiredPath))
    && versionsMatch
    && filesMatch(runnerPackageJson, path.join(runnerDir, "package.json"))
    && filesMatch(runnerPackageLock, path.join(runnerDir, "package-lock.json"));
  if (installedFilesMatch) {
    const installedFingerprint = fs.existsSync(installFingerprintPath)
      ? fs.readFileSync(installFingerprintPath, "utf8").trim()
      : "";
    if (installedFingerprint === fingerprint) return false;
    if (!installedFingerprint) {
      // Existing local runners predate the fingerprint marker.
      fs.writeFileSync(installFingerprintPath, fingerprint);
      return false;
    }
  }

  fs.mkdirSync(runnerDir, { recursive: true });
  fs.copyFileSync(runnerPackageJson, path.join(runnerDir, "package.json"));
  fs.copyFileSync(runnerPackageLock, path.join(runnerDir, "package-lock.json"));
  run("npm", ["ci", "--prefix", runnerDir]);
  fs.writeFileSync(installFingerprintPath, fingerprint);
  return true;
}

function ensureMediaBinary(name, sourcePath, forceCopy = false) {
  const binaryName = process.platform === "win32" ? `${name}.exe` : name;
  const binaryPath = path.join(runnerBinDir, binaryName);

  if (process.platform !== "win32") {
    try {
      if (fs.readlinkSync(binaryPath) === sourcePath) return;
    } catch (_error) {
      // Replace a missing or stale link below.
    }
    fs.rmSync(binaryPath, { force: true });
    fs.symlinkSync(sourcePath, binaryPath, "file");
    return;
  }

  const sourceStat = fs.statSync(sourcePath);
  const installedStat = fs.existsSync(binaryPath) ? fs.statSync(binaryPath) : null;
  if (forceCopy || !installedStat || installedStat.size !== sourceStat.size || installedStat.mtimeMs < sourceStat.mtimeMs) {
    fs.copyFileSync(sourcePath, binaryPath);
  }
}

function ensureMediaBinaries(forceCopy = false) {
  fs.mkdirSync(runnerBinDir, { recursive: true });

  const ffmpegPath = require(path.join(localModulePath("ffmpeg-static")));
  const ffprobeInfo = require(path.join(localModulePath("ffprobe-static")));
  const ffprobePath = ffprobeInfo.path;

  ensureMediaBinary("ffmpeg", ffmpegPath, forceCopy);
  ensureMediaBinary("ffprobe", ffprobePath, forceCopy);
}

function parseArgs(argv) {
  const args = [...argv];
  let cwd = process.cwd();
  let setupOnly = false;
  const hyperframesArgs = [];

  while (args.length > 0) {
    const arg = args.shift();

    if (arg === "--setup-only") {
      setupOnly = true;
      continue;
    }

    if (arg === "--cwd") {
      const cwdValue = args.shift();
      if (!cwdValue) {
        throw new Error("--cwd requires a path.");
      }
      cwd = path.isAbsolute(cwdValue) ? cwdValue : path.resolve(projectRoot, cwdValue);
      continue;
    }

    hyperframesArgs.push(arg);
  }

  return { cwd, setupOnly, hyperframesArgs };
}

function main() {
  const { cwd, setupOnly, hyperframesArgs } = parseArgs(process.argv.slice(2));

  const runnerInstalled = ensureRunnerInstalled();
  ensureMediaBinaries(runnerInstalled);

  if (setupOnly) {
    console.log(`HyperFrames local runner ready at ${runnerDir}`);
    return;
  }

  if (hyperframesArgs.length === 0) {
    console.error("Usage: node scripts/run-hyperframes-local.js [--cwd path] <hyperframes-command> [...args]");
    process.exit(1);
  }

  const localNode = path.join(localModulePath("node"), "bin", nodeBinaryName);
  const hyperframesCli = path.join(localModulePath("hyperframes"), "dist", "cli.js");
  const env = {
    ...process.env,
    PATH: `${runnerBinDir}${path.delimiter}${process.env.PATH || ""}`
  };

  run(localNode, [hyperframesCli, ...hyperframesArgs], { cwd, env });
}

main();
