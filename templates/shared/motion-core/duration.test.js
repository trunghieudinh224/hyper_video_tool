"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const {
  buildTimelinePlan,
  resolveSceneDuration
} = require("./duration");

function loadSamplePayload() {
  return JSON.parse(fs.readFileSync(
    path.resolve(__dirname, "../../../data/dynamic-motion-payload.sample.json"),
    "utf8"
  ));
}

function testTitleSceneUsesMinMax() {
  const duration = resolveSceneDuration({
    type: "title",
    headline: "Short title",
    duration: {
      mode: "auto",
      min: 4,
      max: 8
    }
  });

  assert(duration >= 4);
  assert(duration <= 8);
}

function testCardsGrowWithItems() {
  const oneItemDuration = resolveSceneDuration({
    type: "cards",
    headline: "Cards",
    items: [{ title: "One" }],
    duration: {
      mode: "auto",
      min: 4,
      max: 20,
      perItem: 2
    }
  });
  const threeItemDuration = resolveSceneDuration({
    type: "cards",
    headline: "Cards",
    items: [{ title: "One" }, { title: "Two" }, { title: "Three" }],
    duration: {
      mode: "auto",
      min: 4,
      max: 20,
      perItem: 2
    }
  });

  assert(threeItemDuration > oneItemDuration);
}

function testMediaSceneHasStableMinimum() {
  const duration = resolveSceneDuration({
    type: "media",
    headline: "Screenshot focus",
    media: {
      type: "image",
      url: "https://example.test/image.png"
    },
    duration: {
      mode: "auto",
      min: 6,
      max: 12
    }
  });

  assert(duration >= 6);
  assert(duration <= 12);
}

function testVoiceoverCanExtendScene() {
  const duration = resolveSceneDuration({
    type: "text",
    headline: "Voiceover",
    voiceover: {
      estimatedDuration: 11
    },
    duration: {
      mode: "auto",
      min: 4,
      max: 16
    }
  });

  assert(duration >= 11.8);
}

function testSamplePayloadTimelinePlan() {
  const payload = loadSamplePayload();
  const plan = buildTimelinePlan(payload);

  assert.equal(plan.scenes.length, payload.scenes.length);
  assert(plan.totalDuration > 0);
  plan.scenes.forEach((scene, index) => {
    assert(scene.duration > 0);
    assert(scene.end > scene.start);
    if (index > 0) {
      assert.equal(scene.start, plan.scenes[index - 1].end);
    }
  });
}

testTitleSceneUsesMinMax();
testCardsGrowWithItems();
testMediaSceneHasStableMinimum();
testVoiceoverCanExtendScene();
testSamplePayloadTimelinePlan();

console.log("duration tests passed");
