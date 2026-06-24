"use strict";

const RENDER_PAYLOAD_VERSION = "1.0.0";
const DYNAMIC_RENDER_PAYLOAD_VERSION = "dynamic-motion-1.0.0";
const VIDEO_PRESETS = {
  "16:9": {
    aspectRatio: "16:9",
    width: 1920,
    height: 1080,
    templateId: "project-showcase-90s",
    templateName: "Showcase 90s"
  },
  "9:16": {
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    templateId: "project-showcase-vertical-60s",
    templateName: "Showcase Vertical 60s"
  }
};
const TEMPLATE_PRESETS = {
  "project-showcase-90s": VIDEO_PRESETS["16:9"],
  "project-showcase-vertical-60s": VIDEO_PRESETS["9:16"],
  "dynamic-story-vertical": {
    aspectRatio: "9:16",
    width: 1080,
    height: 1920,
    templateId: "dynamic-story-vertical",
    templateName: "Dynamic Story Vertical"
  }
};
const SUPPORTED_TEMPLATE_IDS = new Set(Object.keys(TEMPLATE_PRESETS));
const SUPPORTED_ASPECT_RATIOS = new Set(Object.keys(VIDEO_PRESETS));
const SUPPORTED_VOICEOVER_PROVIDERS = new Set(["edge-tts", "openai", "elevenlabs", "piper"]);
const SUPPORTED_VOICEOVER_LANGUAGES = new Set(["vi-VN", "en-US", "ja-JP"]);
const SCENE_TYPES = new Set([
  "intro",
  "problem",
  "solution",
  "features",
  "timeline",
  "impact",
  "outro"
]);
const DYNAMIC_SCENE_TYPES = new Set([
  "title",
  "text",
  "media",
  "cards",
  "steps",
  "outro"
]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function pushError(errors, path, message) {
  errors.push({ path, message });
}

function validateStringField(errors, target, fieldPath, required = true) {
  const value = fieldPath.split(".").reduce((current, key) => {
    if (!isPlainObject(current)) {
      return undefined;
    }
    return current[key];
  }, target);

  if (required && !isNonEmptyString(value)) {
    pushError(errors, fieldPath, "Required string is missing or empty.");
    return;
  }

  if (!required && value !== undefined && typeof value !== "string") {
    pushError(errors, fieldPath, "Expected string.");
  }
}

function validateScene(errors, scene, index) {
  const basePath = `scenes[${index}]`;

  if (!isPlainObject(scene)) {
    pushError(errors, basePath, "Expected scene object.");
    return;
  }

  if (!isNonEmptyString(scene.id)) {
    pushError(errors, `${basePath}.id`, "Scene id is required.");
  }

  if (!SCENE_TYPES.has(scene.type)) {
    pushError(errors, `${basePath}.type`, `Scene type must be one of: ${Array.from(SCENE_TYPES).join(", ")}.`);
  }

  if (!Number.isFinite(scene.duration) || scene.duration <= 0) {
    pushError(errors, `${basePath}.duration`, "Scene duration must be a positive number.");
  }

  if (!isNonEmptyString(scene.title)) {
    pushError(errors, `${basePath}.title`, "Scene title is required.");
  }

  if (!isPlainObject(scene.content)) {
    pushError(errors, `${basePath}.content`, "Scene content object is required.");
  }

  if (scene.voiceover !== undefined) {
    if (!isPlainObject(scene.voiceover)) {
      pushError(errors, `${basePath}.voiceover`, "Scene voiceover must be an object.");
    } else {
      validateStringField(errors, scene, "voiceover.script", false);
      if (scene.voiceover.estimatedDuration !== undefined && !Number.isFinite(scene.voiceover.estimatedDuration)) {
        pushError(errors, `${basePath}.voiceover.estimatedDuration`, "Scene voiceover estimatedDuration must be a number.");
      }
      if (scene.voiceover.fits !== undefined && typeof scene.voiceover.fits !== "boolean") {
        pushError(errors, `${basePath}.voiceover.fits`, "Scene voiceover fits must be a boolean.");
      }
    }
  }
}

function validateDynamicDuration(errors, duration, basePath) {
  if (duration === undefined) {
    return;
  }

  if (!isPlainObject(duration)) {
    pushError(errors, `${basePath}.duration`, "Scene duration must be an object.");
    return;
  }

  if (duration.mode !== undefined && !["auto", "fixed"].includes(duration.mode)) {
    pushError(errors, `${basePath}.duration.mode`, "Duration mode must be auto or fixed.");
  }

  for (const fieldName of ["seconds", "min", "max", "perItem"]) {
    if (duration[fieldName] !== undefined && (!Number.isFinite(duration[fieldName]) || duration[fieldName] < 0)) {
      pushError(errors, `${basePath}.duration.${fieldName}`, "Duration value must be a non-negative number.");
    }
  }
}

function validateDynamicMedia(errors, media, basePath) {
  if (media === undefined || media === null) {
    return;
  }

  if (!isPlainObject(media)) {
    pushError(errors, basePath, "Scene media must be an object.");
    return;
  }

  validateStringField(errors, { media }, "media.assetId", false);
  validateStringField(errors, { media }, "media.type", false);
  validateStringField(errors, { media }, "media.url", false);
  validateStringField(errors, { media }, "media.alt", false);
  validateStringField(errors, { media }, "media.fit", false);
  validateStringField(errors, { media }, "media.focus", false);
  validateStringField(errors, { media }, "media.caption", false);
}

function validateDynamicItem(errors, item, basePath) {
  if (!isPlainObject(item)) {
    pushError(errors, basePath, "Scene item must be an object.");
    return;
  }

  validateStringField(errors, item, "id", false);
  validateStringField(errors, item, "title", false);
  validateStringField(errors, item, "body", false);
  validateDynamicMedia(errors, item.media, `${basePath}.media`);
}

function validateDynamicScene(errors, scene, index) {
  const basePath = `scenes[${index}]`;

  if (!isPlainObject(scene)) {
    pushError(errors, basePath, "Expected scene object.");
    return;
  }

  if (!isNonEmptyString(scene.id)) {
    pushError(errors, `${basePath}.id`, "Scene id is required.");
  }

  if (!DYNAMIC_SCENE_TYPES.has(scene.type)) {
    pushError(errors, `${basePath}.type`, `Scene type must be one of: ${Array.from(DYNAMIC_SCENE_TYPES).join(", ")}.`);
  }

  validateStringField(errors, scene, "headline", false);
  validateStringField(errors, scene, "subtitle", false);
  validateStringField(errors, scene, "body", false);
  validateDynamicMedia(errors, scene.media, `${basePath}.media`);
  validateDynamicDuration(errors, scene.duration, basePath);

  if (scene.items !== undefined) {
    if (!Array.isArray(scene.items)) {
      pushError(errors, `${basePath}.items`, "Scene items must be an array.");
    } else {
      scene.items.forEach((item, itemIndex) => validateDynamicItem(errors, item, `${basePath}.items[${itemIndex}]`));
    }
  }
}

function validateBooleanField(errors, target, fieldPath, required = true) {
  const value = fieldPath.split(".").reduce((current, key) => {
    if (!isPlainObject(current)) {
      return undefined;
    }
    return current[key];
  }, target);

  if (required && typeof value !== "boolean") {
    pushError(errors, fieldPath, "Expected boolean.");
    return;
  }

  if (!required && value !== undefined && typeof value !== "boolean") {
    pushError(errors, fieldPath, "Expected boolean.");
  }
}

function validatePercentField(errors, target, fieldPath, min, max) {
  const value = fieldPath.split(".").reduce((current, key) => {
    if (!isPlainObject(current)) {
      return undefined;
    }
    return current[key];
  }, target);

  if (value === undefined) {
    return;
  }

  if (typeof value !== "string" || !/^[+-]\d+%$/.test(value)) {
    pushError(errors, fieldPath, "Expected signed percent string, for example +10% or -10%.");
    return;
  }

  const numericValue = Number.parseInt(value.slice(0, -1), 10);
  if (numericValue < min || numericValue > max) {
    pushError(errors, fieldPath, `Percent value must be between ${min}% and ${max}%.`);
  }
}

function validateAudio(errors, audio) {
  if (!isPlainObject(audio)) {
    pushError(errors, "audio", "Audio settings object is required.");
    return;
  }

  const voiceover = audio.voiceover;
  if (!isPlainObject(voiceover)) {
    pushError(errors, "audio.voiceover", "Voiceover settings object is required.");
  } else {
    validateBooleanField(errors, audio, "voiceover.enabled");
    validateStringField(errors, audio, "voiceover.provider");
    validateStringField(errors, audio, "voiceover.language");
    validateStringField(errors, audio, "voiceover.voiceId");
    validatePercentField(errors, audio, "voiceover.rate", -30, 50);
    validatePercentField(errors, audio, "voiceover.volume", -50, 50);
    validateStringField(errors, audio, "voiceover.script", false);
    validateStringField(errors, audio, "voiceover.outputPath", false);

    if (isNonEmptyString(voiceover.provider) && !SUPPORTED_VOICEOVER_PROVIDERS.has(voiceover.provider)) {
      pushError(
        errors,
        "audio.voiceover.provider",
        `Voiceover provider must be one of: ${Array.from(SUPPORTED_VOICEOVER_PROVIDERS).join(", ")}.`
      );
    }

    if (isNonEmptyString(voiceover.language) && !SUPPORTED_VOICEOVER_LANGUAGES.has(voiceover.language)) {
      pushError(
        errors,
        "audio.voiceover.language",
        `Voiceover language must be one of: ${Array.from(SUPPORTED_VOICEOVER_LANGUAGES).join(", ")}.`
      );
    }

    if (voiceover.enabled && !isNonEmptyString(voiceover.script)) {
      pushError(errors, "audio.voiceover.script", "Enabled voiceover requires a script.");
    }
  }

  const backgroundMusic = audio.backgroundMusic;
  if (!isPlainObject(backgroundMusic)) {
    pushError(errors, "audio.backgroundMusic", "Background music settings object is required.");
  } else {
    validateBooleanField(errors, audio, "backgroundMusic.enabled");
    validateStringField(errors, audio, "backgroundMusic.source", false);
    validateBooleanField(errors, audio, "backgroundMusic.ducking");

    if (!Number.isFinite(backgroundMusic.volume) || backgroundMusic.volume < 0 || backgroundMusic.volume > 1) {
      pushError(errors, "audio.backgroundMusic.volume", "Background music volume must be between 0 and 1.");
    }

    if (backgroundMusic.enabled && !isNonEmptyString(backgroundMusic.source)) {
      pushError(errors, "audio.backgroundMusic.source", "Enabled background music requires a source.");
    }
  }

  const soundEffects = audio.soundEffects;
  if (!isPlainObject(soundEffects)) {
    pushError(errors, "audio.soundEffects", "Sound effects settings object is required.");
  } else {
    validateBooleanField(errors, audio, "soundEffects.enabled");
    if (!Array.isArray(soundEffects.items)) {
      pushError(errors, "audio.soundEffects.items", "Sound effects items must be an array.");
    }
  }
}

function validateRenderPayload(payload) {
  const errors = [];

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: [{ path: "$", message: "Payload must be an object." }]
    };
  }

  validateStringField(errors, payload, "source.projectName");
  validateStringField(errors, payload, "source.projectSlug");
  validateStringField(errors, payload, "template.id");

  const templateId = isPlainObject(payload.template) ? payload.template.id : null;
  const isDynamicPayload = templateId === "dynamic-story-vertical" || payload.version === DYNAMIC_RENDER_PAYLOAD_VERSION;
  const expectedVersion = isDynamicPayload ? DYNAMIC_RENDER_PAYLOAD_VERSION : RENDER_PAYLOAD_VERSION;
  if (payload.version !== expectedVersion) {
    pushError(errors, "version", `Expected render payload version ${expectedVersion}.`);
  }

  if (isPlainObject(payload.template) && !SUPPORTED_TEMPLATE_IDS.has(templateId)) {
    pushError(
      errors,
      "template.id",
      `Template id must be one of: ${Array.from(SUPPORTED_TEMPLATE_IDS).join(", ")}.`
    );
  }

  if (!isPlainObject(payload.video)) {
    pushError(errors, "video", "Video settings object is required.");
  } else {
    if (!SUPPORTED_ASPECT_RATIOS.has(payload.video.aspectRatio)) {
      pushError(errors, "video.aspectRatio", `Aspect ratio must be one of: ${Array.from(SUPPORTED_ASPECT_RATIOS).join(", ")}.`);
    }
    if (!Number.isInteger(payload.video.width) || payload.video.width <= 0) {
      pushError(errors, "video.width", "Video width must be a positive integer.");
    }
    if (!Number.isInteger(payload.video.height) || payload.video.height <= 0) {
      pushError(errors, "video.height", "Video height must be a positive integer.");
    }
    if (!Number.isInteger(payload.video.fps) || payload.video.fps <= 0) {
      pushError(errors, "video.fps", "Video fps must be a positive integer.");
    }

    const preset = TEMPLATE_PRESETS[templateId] || VIDEO_PRESETS[payload.video.aspectRatio];
    if (preset) {
      if (payload.video.aspectRatio !== preset.aspectRatio) {
        pushError(errors, "video.aspectRatio", `Template ${preset.templateId} requires aspect ratio ${preset.aspectRatio}.`);
      }
      if (payload.video.width !== preset.width || payload.video.height !== preset.height) {
        pushError(errors, "video", `Template ${preset.templateId} requires video ${preset.width}x${preset.height}.`);
      }
      const defaultPreset = VIDEO_PRESETS[payload.video.aspectRatio];
      if (!isDynamicPayload && defaultPreset && templateId !== defaultPreset.templateId) {
        pushError(errors, "template.id", `Template for ${payload.video.aspectRatio} must be ${defaultPreset.templateId}.`);
      }
    }
  }

  if (!Array.isArray(payload.scenes)) {
    pushError(errors, "scenes", "Scenes must be an array.");
  } else if (isDynamicPayload) {
    payload.scenes.forEach((scene, index) => validateDynamicScene(errors, scene, index));
  } else {
    const sceneTypes = payload.scenes.map((scene) => scene && scene.type);
    for (const requiredType of SCENE_TYPES) {
      if (!sceneTypes.includes(requiredType)) {
        pushError(errors, "scenes", `Missing required scene type: ${requiredType}.`);
      }
    }
    payload.scenes.forEach((scene, index) => validateScene(errors, scene, index));
  }

  if (!isPlainObject(payload.assets)) {
    pushError(errors, "assets", "Assets object is required.");
  }

  validateAudio(errors, payload.audio);

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  DYNAMIC_RENDER_PAYLOAD_VERSION,
  RENDER_PAYLOAD_VERSION,
  DYNAMIC_SCENE_TYPES,
  TEMPLATE_PRESETS,
  VIDEO_PRESETS,
  SUPPORTED_TEMPLATE_IDS,
  SUPPORTED_VOICEOVER_LANGUAGES,
  SUPPORTED_VOICEOVER_PROVIDERS,
  SCENE_TYPES,
  validateRenderPayload
};
