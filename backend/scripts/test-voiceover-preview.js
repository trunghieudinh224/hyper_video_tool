"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");
const { cleanupAudioCache, normalizePreviewInput } = require("../src/routes/voiceover-preview");

function assertThrowsWithStatus(fn, statusCode) {
  try {
    fn();
  } catch (error) {
    assert.equal(error.statusCode, statusCode);
    return;
  }

  throw new Error(`Expected status ${statusCode}.`);
}

function run() {
  assertThrowsWithStatus(() => normalizePreviewInput({ script: "" }), 422);
  assertThrowsWithStatus(() => normalizePreviewInput({ script: "x".repeat(3001) }), 422);

  const input = normalizePreviewInput({
    script: "  CodeGraph giúp agent hiểu code.  ",
    language: "vi-VN",
    voiceId: "vi-VN-HoaiMyNeural",
    rate: "+10%",
    volume: "+0%"
  });

  assert.equal(input.enabled, true);
  assert.equal(input.provider, "edge-tts");
  assert.equal(input.language, "vi-VN");
  assert.equal(input.voiceId, "vi-VN-HoaiMyNeural");
  assert.equal(input.rate, "+10%");
  assert.equal(input.volume, "+0%");
  assert.equal(input.script, "CodeGraph giúp agent hiểu code.");

  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), "hvt-audio-cache-"));
  try {
    const oldMp3 = path.join(tempDir, "aaaaaaaaaaaaaaaa.mp3");
    const keepMp3 = path.join(tempDir, "bbbbbbbbbbbbbbbb.mp3");
    const largeMp3 = path.join(tempDir, "cccccccccccccccc.mp3");
    const ignoredFile = path.join(tempDir, "notes.txt");

    fs.writeFileSync(oldMp3, "old");
    fs.writeFileSync(keepMp3, "keep");
    fs.writeFileSync(largeMp3, "large-large");
    fs.writeFileSync(ignoredFile, "ignored");

    const now = Date.now();
    fs.utimesSync(oldMp3, new Date(now - 10_000), new Date(now - 10_000));
    fs.utimesSync(keepMp3, new Date(now), new Date(now));
    fs.utimesSync(largeMp3, new Date(now - 5_000), new Date(now - 5_000));

    const ageCleanup = cleanupAudioCache(tempDir, {
      now,
      maxAgeMs: 1_000,
      maxBytes: 0,
      excludePaths: [keepMp3]
    });

    assert.equal(ageCleanup.deletedFiles, 2);
    assert.equal(fs.existsSync(oldMp3), false);
    assert.equal(fs.existsSync(largeMp3), false);
    assert.equal(fs.existsSync(keepMp3), true);
    assert.equal(fs.existsSync(ignoredFile), true);

    fs.writeFileSync(oldMp3, "old");
    fs.writeFileSync(largeMp3, "large-large");
    fs.utimesSync(oldMp3, new Date(now - 10_000), new Date(now - 10_000));
    fs.utimesSync(largeMp3, new Date(now - 5_000), new Date(now - 5_000));

    const sizeCleanup = cleanupAudioCache(tempDir, {
      now,
      maxAgeMs: 0,
      maxBytes: 8,
      excludePaths: [keepMp3]
    });

    assert.equal(sizeCleanup.deletedFiles, 2);
    assert.equal(fs.existsSync(oldMp3), false);
    assert.equal(fs.existsSync(largeMp3), false);
    assert.equal(fs.existsSync(keepMp3), true);
  } finally {
    fs.rmSync(tempDir, { recursive: true, force: true });
  }

  console.log("Voiceover preview tests passed.");
}

run();
