"use strict";

const assert = require("node:assert/strict");
const { createBurnSubtitlesArgs, createConcatAudioSegmentsArgs, createMuxAudioTracksArgs, createMuxVoiceoverArgs } = require("../src/render/media");
const { resolveCompositionMediaPath } = require("../src/render/render-runner");

const shortestArgs = createMuxVoiceoverArgs({
  videoPath: "/tmp/input.mp4",
  audioPath: "/tmp/voice.mp3",
  outputPath: "/tmp/output.mp4",
  useShortest: true
});

assert.deepEqual(shortestArgs, [
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

const fullVideoArgs = createMuxVoiceoverArgs({
  videoPath: "/tmp/input.mp4",
  audioPath: "/tmp/voice.mp3",
  outputPath: "/tmp/output.mp4",
  useShortest: false
});

assert(!fullVideoArgs.includes("-shortest"));
assert.deepEqual(fullVideoArgs.slice(-3), ["-movflags", "+faststart", "/tmp/output.mp4"]);

const duckedMixArgs = createMuxAudioTracksArgs({
  videoPath: "/tmp/input.mp4",
  voiceoverPath: "/tmp/voice.mp3",
  backgroundMusicPath: "/tmp/music.mp3",
  backgroundMusicVolume: 0.2,
  backgroundMusicDucking: true,
  durationSeconds: 8,
  outputPath: "/tmp/output.mp4"
});
assert.match(duckedMixArgs.join(" "), /sidechaincompress/, "Ducking should lower music under voiceover.");
assert.match(duckedMixArgs.join(" "), /-t 8/, "Looped music should be capped to the video duration.");
assert.match(duckedMixArgs.join(" "), /-stream_loop -1 -t 8 -i \/tmp\/music\.mp3/, "The looped music input itself should be finite.");

const plainMixArgs = createMuxAudioTracksArgs({
  videoPath: "/tmp/input.mp4",
  voiceoverPath: "/tmp/voice.mp3",
  backgroundMusicPath: "/tmp/music.mp3",
  backgroundMusicVolume: 0.2,
  backgroundMusicDucking: false,
  outputPath: "/tmp/output.mp4"
});
assert.doesNotMatch(plainMixArgs.join(" "), /sidechaincompress/, "Disabled ducking should use a plain mix.");

const fullLengthVoiceArgs = createMuxAudioTracksArgs({
  videoPath: "/tmp/scene.mp4",
  voiceoverPath: "/tmp/short-voice.mp3",
  durationSeconds: 7,
  outputPath: "/tmp/result.mp4"
});
assert.match(fullLengthVoiceArgs.join(" "), /-t 7/);
assert(!fullLengthVoiceArgs.includes("-shortest"), "A short voice must not truncate the video scene.");

const captionArgs = createBurnSubtitlesArgs({ videoPath: "/tmp/input.mp4", outputPath: "/tmp/output.mp4" });
assert.match(captionArgs.join(" "), /ass=filename=captions\.ass:fontsdir=caption-fonts/);
assert.match(captionArgs.join(" "), /-c:v libx264/);
assert.match(captionArgs.join(" "), /-map 0:a\?/);

const concatArgs = createConcatAudioSegmentsArgs({
  inputPaths: ["/tmp/vi.mp3", "/tmp/en.mp3"],
  outputPath: "/tmp/mixed.mp3"
});
assert.match(concatArgs.join(" "), /concat=n=2:v=0:a=1/);
assert.match(concatArgs.join(" "), /-c:a libmp3lame/);
assert.throws(() => createConcatAudioSegmentsArgs({ inputPaths: ["/tmp/one.mp3"], outputPath: "/tmp/out.mp3" }), /two audio/);

assert.equal(
  resolveCompositionMediaPath("/tmp/composition", "assets/music.mp3"),
  "/tmp/composition/assets/music.mp3"
);
assert.throws(
  () => resolveCompositionMediaPath("/tmp/composition", "/private/tmp/music.mp3"),
  /inside the composition directory/
);
assert.throws(
  () => resolveCompositionMediaPath("/tmp/composition", "../music.mp3"),
  /inside the composition directory/
);

console.log("Render media tests passed.");
