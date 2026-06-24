"use strict";

const assert = require("node:assert/strict");
const MotionCore = require("./index");

function createFakeTimeline() {
  const calls = [];
  return {
    calls,
    fromTo(...args) {
      calls.push(["fromTo", ...args]);
      return this;
    },
    set(...args) {
      calls.push(["set", ...args]);
      return this;
    },
    to(...args) {
      calls.push(["to", ...args]);
      return this;
    }
  };
}

function testRevealTextUsesTimeline() {
  const timeline = createFakeTimeline();
  const element = { id: "headline" };

  MotionCore.animations.revealText(timeline, element, 1);

  assert.equal(timeline.calls.length, 1);
  assert.equal(timeline.calls[0][0], "fromTo");
  assert.equal(timeline.calls[0][4], 1);
}

function testSequenceItemsCreatesSlots() {
  const timeline = createFakeTimeline();
  const items = [{ id: "one" }, { id: "two" }, { id: "three" }];

  MotionCore.animations.sequenceItems(timeline, items, 2, 9);

  assert.equal(timeline.calls[0][0], "set");
  assert(timeline.calls.some((call) => call[0] === "fromTo"));
  assert(timeline.calls.some((call) => call[0] === "to"));
}

function testMissingTargetsDoNotCrash() {
  const timeline = createFakeTimeline();

  MotionCore.animations.revealText(timeline, null, 0);
  MotionCore.animations.sequenceItems(timeline, [], 0, 4);

  assert.equal(timeline.calls.length, 0);
}

function testIndexExportsDuration() {
  const plan = MotionCore.buildTimelinePlan({
    scenes: [
      {
        id: "scene-title",
        type: "title",
        headline: "Hello",
        duration: {
          min: 4,
          max: 8
        }
      }
    ]
  });

  assert.equal(plan.scenes.length, 1);
  assert(plan.totalDuration >= 4);
}

testRevealTextUsesTimeline();
testSequenceItemsCreatesSlots();
testMissingTargetsDoNotCrash();
testIndexExportsDuration();

console.log("motion core tests passed");
