"use strict";

const fs = require("node:fs");
const path = require("node:path");
const { spawn } = require("node:child_process");
const { config } = require("../config");

function localRunnerModulePath(packageName) {
  return path.join(config.projectRoot, ".cache", "hyperframes-runner", "node_modules", packageName);
}

function getFfmpegPath() {
  const ffmpegModulePath = localRunnerModulePath("ffmpeg-static");
  if (!fs.existsSync(ffmpegModulePath)) {
    throw new Error("FFmpeg runner dependency is missing. Run: npm --prefix backend run hf:setup");
  }

  return require(ffmpegModulePath);
}

function getFfprobePath() {
  const ffprobeModulePath = localRunnerModulePath("ffprobe-static");
  if (!fs.existsSync(ffprobeModulePath)) {
    throw new Error("FFprobe runner dependency is missing. Run: npm --prefix backend run hf:setup");
  }

  return require(ffprobeModulePath).path;
}

function runProcess(command, args, options = {}) {
  const spawnImpl = options.spawn || spawn;

  return new Promise((resolve, reject) => {
    const child = spawnImpl(command, args, {
      cwd: config.projectRoot,
      stdio: ["ignore", "pipe", "pipe"]
    });
    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });
    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });
    child.on("error", reject);
    child.on("close", (exitCode) => {
      if (exitCode === 0) {
        resolve({ stdout, stderr });
        return;
      }

      const error = new Error(`${path.basename(command)} failed with exit code ${exitCode}.`);
      error.code = "MEDIA_PROCESS_FAILED";
      error.stdout = stdout;
      error.stderr = stderr;
      reject(error);
    });
  });
}

function createMuxVoiceoverArgs({ videoPath, audioPath, outputPath }) {
  return [
    "-y",
    "-i",
    videoPath,
    "-i",
    audioPath,
    "-map",
    "0:v:0",
    "-map",
    "1:a:0",
    "-c:v",
    "copy",
    "-c:a",
    "aac",
    "-shortest",
    "-movflags",
    "+faststart",
    outputPath
  ];
}

async function muxVoiceoverIntoVideo({ videoPath, audioPath, outputPath }, options = {}) {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file does not exist: ${videoPath}`);
  }

  if (!fs.existsSync(audioPath)) {
    throw new Error(`Voiceover file does not exist: ${audioPath}`);
  }

  const tempOutputPath = `${outputPath}.voiceover.tmp.mp4`;
  fs.rmSync(tempOutputPath, { force: true });
  await runProcess(options.ffmpegPath || getFfmpegPath(), createMuxVoiceoverArgs({
    videoPath,
    audioPath,
    outputPath: tempOutputPath
  }), options);
  fs.renameSync(tempOutputPath, outputPath);

  return outputPath;
}

async function hasAudioStream(filePath, options = {}) {
  const result = await runProcess(options.ffprobePath || getFfprobePath(), [
    "-v",
    "error",
    "-select_streams",
    "a",
    "-show_entries",
    "stream=index",
    "-of",
    "csv=p=0",
    filePath
  ], options);

  return result.stdout.trim().length > 0;
}

module.exports = {
  createMuxVoiceoverArgs,
  getFfmpegPath,
  getFfprobePath,
  hasAudioStream,
  muxVoiceoverIntoVideo
};
