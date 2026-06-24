(function initDurationCore(globalScope) {
  "use strict";

  const DEFAULT_BASE_DURATIONS = {
    title: 4.5,
    text: 5,
    media: 6,
    cards: 5,
    steps: 5,
    outro: 4
  };

  const DEFAULT_ITEM_SLOT_SECONDS = {
    cards: 2,
    steps: 1.8
  };

  const DEFAULT_MIN_DURATION = 3;
  const DEFAULT_MAX_DURATION = 18;
  const WORDS_PER_SECOND = 2.4;

  function isPlainObject(value) {
    return Boolean(value) && typeof value === "object" && !Array.isArray(value);
  }

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function countWords(value) {
    const normalized = normalizeText(value);
    return normalized ? normalized.split(/\s+/).filter(Boolean).length : 0;
  }

  function clampNumber(value, min, max) {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return min;
    }
    return Math.min(max, Math.max(min, numericValue));
  }

  function getSceneTextWeight(scene) {
    return [
      scene && scene.headline,
      scene && scene.subtitle,
      scene && scene.body
    ].reduce((total, value) => total + countWords(value), 0);
  }

  function estimateTextSeconds(scene) {
    const wordCount = getSceneTextWeight(scene);
    if (wordCount === 0) {
      return 0;
    }
    return Math.min(6, wordCount / WORDS_PER_SECOND);
  }

  function getSceneItems(scene) {
    return Array.isArray(scene && scene.items) ? scene.items : [];
  }

  function getVoiceoverEstimate(scene) {
    const voiceover = isPlainObject(scene && scene.voiceover) ? scene.voiceover : {};
    if (Number.isFinite(voiceover.estimatedDuration)) {
      return Math.max(0, voiceover.estimatedDuration);
    }
    const script = normalizeText(voiceover.script);
    if (!script) {
      return 0;
    }
    return countWords(script) / WORDS_PER_SECOND;
  }

  function getDurationConfig(scene) {
    return isPlainObject(scene && scene.duration) ? scene.duration : {};
  }

  function resolveSceneDuration(scene, options = {}) {
    const type = normalizeText(scene && scene.type) || "text";
    const durationConfig = getDurationConfig(scene);
    const baseDurations = isPlainObject(options.baseDurations) ? options.baseDurations : DEFAULT_BASE_DURATIONS;
    const itemSlotSeconds = isPlainObject(options.itemSlotSeconds) ? options.itemSlotSeconds : DEFAULT_ITEM_SLOT_SECONDS;
    const base = Number.isFinite(durationConfig.base)
      ? durationConfig.base
      : Number.isFinite(baseDurations[type]) ? baseDurations[type] : DEFAULT_BASE_DURATIONS.text;
    const perItem = Number.isFinite(durationConfig.perItem)
      ? durationConfig.perItem
      : Number.isFinite(itemSlotSeconds[type]) ? itemSlotSeconds[type] : 0;
    const itemDuration = getSceneItems(scene).length * perItem;
    const animationDuration = base + itemDuration + estimateTextSeconds(scene);
    const voiceoverDuration = getVoiceoverEstimate(scene);
    const minDuration = Number.isFinite(durationConfig.min) ? durationConfig.min : DEFAULT_MIN_DURATION;
    const maxDuration = Number.isFinite(durationConfig.max) ? durationConfig.max : DEFAULT_MAX_DURATION;
    const breathingRoom = Number.isFinite(options.voiceoverBreathingRoom)
      ? options.voiceoverBreathingRoom
      : 0.8;
    const rawDuration = Math.max(animationDuration, voiceoverDuration > 0 ? voiceoverDuration + breathingRoom : 0);

    return roundTime(clampNumber(rawDuration, minDuration, maxDuration));
  }

  function roundTime(value) {
    return Math.round(value * 100) / 100;
  }

  function buildTimelinePlan(payload, options = {}) {
    const scenes = Array.isArray(payload && payload.scenes) ? payload.scenes : [];
    let cursor = 0;
    const timelineScenes = scenes.map((scene, index) => {
      const duration = resolveSceneDuration(scene, options);
      const start = roundTime(cursor);
      const end = roundTime(start + duration);
      cursor = end;
      return {
        id: normalizeText(scene && scene.id) || `scene-${index + 1}`,
        type: normalizeText(scene && scene.type) || "text",
        index,
        start,
        duration,
        end
      };
    });

    return {
      scenes: timelineScenes,
      totalDuration: roundTime(cursor)
    };
  }

  const api = {
    DEFAULT_BASE_DURATIONS,
    DEFAULT_ITEM_SLOT_SECONDS,
    buildTimelinePlan,
    countWords,
    estimateTextSeconds,
    resolveSceneDuration
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.MotionDuration = api;
})(typeof window !== "undefined" ? window : globalThis);
