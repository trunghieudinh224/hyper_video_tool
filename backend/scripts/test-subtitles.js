"use strict";

const assert = require("node:assert/strict");
const {
  approximateVoiceCues,
  buildCaptionTimeline,
  groupVoiceCues,
  parseSrtCues,
  toAss,
  toSrt
} = require("../src/audio/subtitles");

const rawSrt = `1\n00:00:00,100 --> 00:00:00,400\nXin\n\n2\n00:00:00,420 --> 00:00:00,800\nchào\n\n3\n00:00:03,100 --> 00:00:03,500\nbạn.\n`;
const parsed = parseSrtCues(rawSrt);
assert.deepEqual(parsed.map((cue) => cue.text), ["Xin", "chào", "bạn."]);
assert.deepEqual(groupVoiceCues(parsed).map((cue) => cue.text), ["Xin chào", "bạn."]);
const sentenceCue = [{ start: 100, end: 6736, text: "Codegraph là bản đồ cấu trúc của codebase, giúp AI agent hiểu symbol, flow và impact trước khi sửa code." }];
const sentenceCaptions = groupVoiceCues(sentenceCue, { maxChars: 44 });
assert(sentenceCaptions.length > 1, "Long Edge TTS cues should split into readable captions.");
assert(sentenceCaptions.every((cue) => cue.words.length > 1));
assert.equal(sentenceCaptions[0].start, 100);
assert.equal(sentenceCaptions[sentenceCaptions.length - 1].end, 6736);
assert.deepEqual(approximateVoiceCues("  Xin   chào ", 1250), [{ start: 0, end: 1250, text: "Xin chào" }]);

const payload = {
  video: { aspectRatio: "9:16", width: 1080, height: 1920 },
  scenes: [
    {
      id: "scene-1",
      type: "slot",
      duration: { mode: "fixed", min: 3, max: 3 },
      captions: { enabled: true, mode: "voice", style: "karaoke" }
    },
    {
      id: "scene-2",
      type: "slot",
      duration: { mode: "fixed", min: 3, max: 3 },
      captions: { enabled: true, mode: "custom", text: "Lời kết", layout: { x: 0, y: 70, width: 90, height: 14 } }
    }
  ]
};
const captions = buildCaptionTimeline(payload, rawSrt);
assert.deepEqual(captions.map((cue) => cue.text), ["Xin chào", "Lời kết"]);
assert.deepEqual(captions.map((cue) => cue.start), [100, 3000]);
assert.equal(captions[1].settings.layout.x, 0);
assert.match(toAss(captions, payload.video), /\\k30/);
assert.match(toAss(captions, payload.video), /Dialogue: 0,0:00:03\.00,0:00:06\.00,bottom-caption/);
assert.deepEqual(parseSrtCues(toSrt(captions)).map((cue) => cue.text), ["Xin chào", "Lời kết"]);

const srtPayload = {
  ...payload,
  scenes: [{
    id: "scene-srt",
    type: "slot",
    duration: { mode: "fixed", min: 3, max: 3 },
    captions: { enabled: true, mode: "srt", text: "1\n00:00:00,500 --> 00:00:01,500\nCâu riêng\n" }
  }]
};
assert.deepEqual(buildCaptionTimeline(srtPayload).map((cue) => [cue.start, cue.end, cue.text]), [[500, 1500, "Câu riêng"]]);
const legacyCaptions = buildCaptionTimeline({
  video: { aspectRatio: "16:9", width: 1920, height: 1080 },
  scenes: [
    { id: "legacy-1", type: "intro", duration: 7, captions: { enabled: true, mode: "custom", text: "Scene đầu" } },
    { id: "legacy-2", type: "outro", duration: 4, captions: { enabled: true, mode: "custom", text: "Scene sau" } }
  ]
});
assert.deepEqual(legacyCaptions.map((cue) => [cue.start, cue.end]), [[0, 7000], [7000, 11000]]);
assert.deepEqual(buildCaptionTimeline({ ...payload, scenes: [{ ...payload.scenes[0], captions: { enabled: false } }] }, rawSrt), []);
assert.throws(() => parseSrtCues("x".repeat(500001)), /too long/);

console.log("Subtitle tests passed.");
