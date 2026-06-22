"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../..");
const runnerPackageJson = path.join(projectRoot, "backend", "hyperframes-runner-package.json");
const runnerPackageLock = path.join(projectRoot, "backend", "hyperframes-runner-package-lock.json");
const runnerDir = path.join(projectRoot, ".cache", "hyperframes-runner");
const runnerBinDir = path.join(runnerDir, "bin");

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

function ensureRunnerInstalled() {
  const requiredPaths = [
    path.join(localModulePath("node"), "bin", "node"),
    path.join(localModulePath("hyperframes"), "dist", "cli.js"),
    localModulePath("ffmpeg-static"),
    localModulePath("ffprobe-static")
  ];

  if (requiredPaths.every((requiredPath) => fs.existsSync(requiredPath))) {
    return;
  }

  fs.mkdirSync(runnerDir, { recursive: true });
  fs.copyFileSync(runnerPackageJson, path.join(runnerDir, "package.json"));
  fs.copyFileSync(runnerPackageLock, path.join(runnerDir, "package-lock.json"));
  run("npm", ["ci", "--prefix", runnerDir]);
}

function ensureMediaBinaries() {
  fs.mkdirSync(runnerBinDir, { recursive: true });

  const ffmpegPath = require(path.join(localModulePath("ffmpeg-static")));
  const ffprobeInfo = require(path.join(localModulePath("ffprobe-static")));
  const ffprobePath = ffprobeInfo.path;

  fs.rmSync(path.join(runnerBinDir, "ffmpeg"), { force: true });
  fs.symlinkSync(ffmpegPath, path.join(runnerBinDir, "ffmpeg"), "file");
  fs.rmSync(path.join(runnerBinDir, "ffprobe"), { force: true });
  fs.symlinkSync(ffprobePath, path.join(runnerBinDir, "ffprobe"), "file");
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

  ensureRunnerInstalled();
  ensureMediaBinaries();

  if (setupOnly) {
    console.log(`HyperFrames local runner ready at ${runnerDir}`);
    return;
  }

  if (hyperframesArgs.length === 0) {
    console.error("Usage: node scripts/run-hyperframes-local.js [--cwd path] <hyperframes-command> [...args]");
    process.exit(1);
  }

  const localNode = path.join(localModulePath("node"), "bin", "node");
  const hyperframesCli = path.join(localModulePath("hyperframes"), "dist", "cli.js");
  const env = {
    ...process.env,
    PATH: `${runnerBinDir}${path.delimiter}${process.env.PATH || ""}`
  };

  run(localNode, [hyperframesCli, ...hyperframesArgs], { cwd, env });
}

main();
