"use strict";

const assert = require("node:assert/strict");
const { createMuxVoiceoverArgs } = require("../src/render/media");

const args = createMuxVoiceoverArgs({
  videoPath: "/tmp/input.mp4",
  audioPath: "/tmp/voice.mp3",
  outputPath: "/tmp/output.mp4"
});

assert.deepEqual(args, [
  "-y",
  "-i",
  "/tmp/input.mp4",
  "-i",
  "/tmp/voice.mp3",
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
  "/tmp/output.mp4"
]);

console.log("Render media tests passed.");
