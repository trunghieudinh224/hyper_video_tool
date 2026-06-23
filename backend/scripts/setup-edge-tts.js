"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawnSync } = require("node:child_process");

const projectRoot = path.resolve(__dirname, "../..");
const venvDir = path.join(projectRoot, ".cache", "edge-tts-venv");
const pythonBin = process.platform === "win32"
  ? path.join(venvDir, "Scripts", "python.exe")
  : path.join(venvDir, "bin", "python");

function run(command, args) {
  const result = spawnSync(command, args, {
    cwd: projectRoot,
    stdio: "inherit",
    shell: false
  });

  if (result.error) {
    console.error(result.error.message);
    process.exit(1);
  }

  if (result.status !== 0) {
    process.exit(result.status || 1);
  }
}

function main() {
  if (!fs.existsSync(pythonBin)) {
    fs.mkdirSync(path.dirname(venvDir), { recursive: true });
    run(process.env.HVT_PYTHON || "python3", ["-m", "venv", venvDir]);
  }

  run(pythonBin, ["-m", "pip", "install", "--upgrade", "pip"]);
  run(pythonBin, ["-m", "pip", "install", "edge-tts"]);
  run(pythonBin, ["-m", "edge_tts", "--list-voices"]);

  console.log(`edge-tts local venv ready: ${pythonBin}`);
}

main();
