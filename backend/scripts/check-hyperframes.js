"use strict";

const { spawnSync } = require("node:child_process");

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: "utf8",
    timeout: 30000
  });

  return {
    command: [command, ...args].join(" "),
    status: result.status,
    stdout: (result.stdout || "").trim(),
    stderr: (result.stderr || "").trim(),
    error: result.error ? result.error.message : ""
  };
}

function parseMajor(versionText) {
  const match = versionText.match(/v?(\d+)\./);
  return match ? Number.parseInt(match[1], 10) : null;
}

function firstLine(text) {
  return (text || "").split(/\r?\n/).filter(Boolean)[0] || "";
}

const checks = [];

const nodeCheck = run("node", ["--version"]);
const nodeMajor = parseMajor(nodeCheck.stdout);
checks.push({
  name: "Node.js >= 22",
  ok: nodeCheck.status === 0 && nodeMajor !== null && nodeMajor >= 22,
  detail: nodeCheck.status === 0 ? nodeCheck.stdout : nodeCheck.error || nodeCheck.stderr
});

const npmCheck = run("npm", ["--version"]);
checks.push({
  name: "npm available",
  ok: npmCheck.status === 0,
  detail: npmCheck.status === 0 ? npmCheck.stdout : npmCheck.error || npmCheck.stderr
});

const ffmpegCheck = run("ffmpeg", ["-version"]);
checks.push({
  name: "FFmpeg available",
  ok: ffmpegCheck.status === 0,
  detail: ffmpegCheck.status === 0 ? firstLine(ffmpegCheck.stdout) : ffmpegCheck.error || ffmpegCheck.stderr
});

const hyperframesCheck = run("npx", ["--yes", "hyperframes", "--help"]);
checks.push({
  name: "HyperFrames CLI reachable",
  ok: hyperframesCheck.status === 0,
  detail: hyperframesCheck.status === 0
    ? firstLine(hyperframesCheck.stdout)
    : hyperframesCheck.error || firstLine(hyperframesCheck.stderr)
});

const failed = checks.filter((check) => !check.ok);

console.log("HyperFrames preflight");
console.log("=====================");

for (const check of checks) {
  console.log(`${check.ok ? "PASS" : "FAIL"} ${check.name}`);
  console.log(`     ${check.detail || "No detail"}`);
}

if (hyperframesCheck.stderr) {
  console.log("");
  console.log("HyperFrames CLI stderr:");
  console.log(hyperframesCheck.stderr);
}

if (failed.length > 0) {
  console.log("");
  console.log("Missing requirements:");
  for (const check of failed) {
    console.log(`- ${check.name}`);
  }
  process.exit(1);
}

console.log("");
console.log("HyperFrames environment is ready for local render.");
