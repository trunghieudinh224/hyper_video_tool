"use strict";

const assert = require("node:assert/strict");
const { normalizePreviewInput } = require("../src/routes/voiceover-preview");

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

  console.log("Voiceover preview tests passed.");
}

run();
