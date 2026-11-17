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
      cwd: options.cwd || config.projectRoot,
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

function createMuxVoiceoverArgs({ videoPath, audioPath, outputPath, useShortest = true }) {
  const args = [
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
    "aac"
  ];

  if (useShortest) {
    args.push("-shortest");
  }

  return [
    ...args,
    "-movflags",
    "+faststart",
    outputPath
  ];
}

function createMuxAudioTracksArgs({ videoPath, voiceoverPath = "", backgroundMusicPath = "", backgroundMusicVolume = 0.12, backgroundMusicDucking = true, durationSeconds = 0, outputPath }) {
  const hasVoiceover = Boolean(voiceoverPath);
  const hasBackgroundMusic = Boolean(backgroundMusicPath);
  const args = ["-y", "-i", videoPath];

  if (hasVoiceover) {
    args.push("-i", voiceoverPath);
  }
  if (hasBackgroundMusic) {
    args.push("-stream_loop", "-1");
    if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
      args.push("-t", String(durationSeconds));
    }
    args.push("-i", backgroundMusicPath);
  }

  args.push("-map", "0:v:0", "-c:v", "copy");

  if (hasVoiceover && hasBackgroundMusic) {
    const voiceoverInputIndex = 1;
    const backgroundInputIndex = 2;
    const safeVolume = Math.max(0, Math.min(1, Number.isFinite(backgroundMusicVolume) ? backgroundMusicVolume : 0.12));
    const mixFilter = backgroundMusicDucking
      ? `[${backgroundInputIndex}:a]volume=${safeVolume}[bg];[${voiceoverInputIndex}:a]apad,asplit=2[voice_sc][voice_mix];[bg][voice_sc]sidechaincompress=threshold=0.05:ratio=8:attack=20:release=250[ducked];[voice_mix][ducked]amix=inputs=2:duration=longest:dropout_transition=0[aout]`
      : `[${backgroundInputIndex}:a]volume=${safeVolume}[bg];[${voiceoverInputIndex}:a][bg]amix=inputs=2:duration=longest:dropout_transition=0[aout]`;
    args.push("-filter_complex", mixFilter, "-map", "[aout]");
  } else if (hasVoiceover) {
    args.push("-map", "1:a:0");
  } else if (hasBackgroundMusic) {
    args.push("-map", "1:a:0", "-filter:a", `volume=${Math.max(0, Math.min(1, Number.isFinite(backgroundMusicVolume) ? backgroundMusicVolume : 0.12))}`);
  } else {
    throw new Error("At least one audio track is required for muxing.");
  }

  args.push(
    "-c:a",
    "aac"
  );
  if (Number.isFinite(durationSeconds) && durationSeconds > 0) {
    args.push("-t", String(durationSeconds));
  } else {
    args.push("-shortest");
  }
  args.push(
    "-movflags",
    "+faststart",
    outputPath
  );

  return args;
}

function createBurnSubtitlesArgs({ videoPath, outputPath }) {
  return [
    "-y", "-i", videoPath,
    "-vf", "ass=filename=captions.ass:fontsdir=caption-fonts",
    "-map", "0:v:0", "-map", "0:a?",
    "-c:v", "libx264", "-preset", "medium", "-crf", "19",
    "-pix_fmt", "yuv420p", "-c:a", "copy",
    "-movflags", "+faststart", outputPath
  ];
}

function createConcatAudioSegmentsArgs({ inputPaths, outputPath }) {
  if (!Array.isArray(inputPaths) || inputPaths.length < 2) {
    throw new Error("At least two audio segments are required for concat.");
  }
  const inputs = inputPaths.flatMap((inputPath) => ["-i", inputPath]);
  const filters = inputPaths.map((_, index) => `[${index}:a:0]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=mono[a${index}]`);
  const labels = inputPaths.map((_, index) => `[a${index}]`).join("");
  filters.push(`${labels}concat=n=${inputPaths.length}:v=0:a=1[outa]`);
  return [
    "-y", ...inputs,
    "-filter_complex", filters.join(";"),
    "-map", "[outa]", "-c:a", "libmp3lame", "-q:a", "3",
    outputPath
  ];
}

async function concatAudioSegments({ inputPaths, outputPath }, options = {}) {
  const tempOutputPath = `${outputPath}.concat.tmp.mp3`;
  fs.rmSync(tempOutputPath, { force: true });
  try {
    await runProcess(options.ffmpegPath || getFfmpegPath(), createConcatAudioSegmentsArgs({
      inputPaths,
      outputPath: tempOutputPath
    }), options);
    fs.renameSync(tempOutputPath, outputPath);
  } finally {
    fs.rmSync(tempOutputPath, { force: true });
  }
  return outputPath;
}

async function getMediaDurationSeconds(filePath, options = {}) {
  const result = await runProcess(options.ffprobePath || getFfprobePath(), [
    "-v",
    "error",
    "-show_entries",
    "format=duration",
    "-of",
    "default=noprint_wrappers=1:nokey=1",
    filePath
  ], options);
  const duration = Number.parseFloat(result.stdout.trim());
  return Number.isFinite(duration) ? duration : 0;
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
  const ffprobePath = options.ffprobePath || getFfprobePath();
  const [videoDuration, audioDuration] = await Promise.all([
    getMediaDurationSeconds(videoPath, { ...options, ffprobePath }),
    getMediaDurationSeconds(audioPath, { ...options, ffprobePath })
  ]);
  const useShortest = audioDuration > 0 && videoDuration > 0 && audioDuration >= videoDuration;
  await runProcess(options.ffmpegPath || getFfmpegPath(), createMuxVoiceoverArgs({
    videoPath,
    audioPath,
    outputPath: tempOutputPath,
    useShortest
  }), options);
  fs.renameSync(tempOutputPath, outputPath);

  return outputPath;
}

async function muxAudioTracksIntoVideo({ videoPath, voiceoverPath = "", backgroundMusicPath = "", backgroundMusicVolume = 0.12, backgroundMusicDucking = true, outputPath }, options = {}) {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file does not exist: ${videoPath}`);
  }

  if (voiceoverPath && !fs.existsSync(voiceoverPath)) {
    throw new Error(`Voiceover file does not exist: ${voiceoverPath}`);
  }

  if (backgroundMusicPath && !fs.existsSync(backgroundMusicPath)) {
    throw new Error(`Background music file does not exist: ${backgroundMusicPath}`);
  }

  const tempOutputPath = `${outputPath}.audio.tmp.mp4`;
  fs.rmSync(tempOutputPath, { force: true });
  const durationSeconds = await getMediaDurationSeconds(videoPath, options);
  await runProcess(options.ffmpegPath || getFfmpegPath(), createMuxAudioTracksArgs({
    videoPath,
    voiceoverPath,
    backgroundMusicPath,
    backgroundMusicVolume,
    backgroundMusicDucking,
    durationSeconds,
    outputPath: tempOutputPath
  }), options);
  fs.renameSync(tempOutputPath, outputPath);

  return outputPath;
}

async function burnSubtitlesIntoVideo({ videoPath, compositionDir, outputPath }, options = {}) {
  if (!fs.existsSync(videoPath)) {
    throw new Error(`Video file does not exist: ${videoPath}`);
  }
  const assPath = path.join(compositionDir, "captions.ass");
  if (!fs.existsSync(assPath)) {
    throw new Error(`Subtitle file does not exist: ${assPath}`);
  }
  const tempOutputPath = `${outputPath}.subtitles.tmp.mp4`;
  fs.rmSync(tempOutputPath, { force: true });
  try {
    await runProcess(options.ffmpegPath || getFfmpegPath(), createBurnSubtitlesArgs({
      videoPath,
      outputPath: tempOutputPath
    }), { ...options, cwd: compositionDir });
    fs.renameSync(tempOutputPath, outputPath);
  } finally {
    fs.rmSync(tempOutputPath, { force: true });
  }
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
  burnSubtitlesIntoVideo,
  concatAudioSegments,
  createBurnSubtitlesArgs,
  createConcatAudioSegmentsArgs,
  createMuxAudioTracksArgs,
  createMuxVoiceoverArgs,
  getMediaDurationSeconds,
  getFfmpegPath,
  getFfprobePath,
  hasAudioStream,
  muxAudioTracksIntoVideo,
  muxVoiceoverIntoVideo
};
