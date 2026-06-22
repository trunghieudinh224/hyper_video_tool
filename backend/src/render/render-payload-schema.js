"use strict";

const RENDER_PAYLOAD_VERSION = "1.0.0";
const SCENE_TYPES = new Set([
  "intro",
  "problem",
  "solution",
  "features",
  "timeline",
  "impact",
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
}

function validateRenderPayload(payload) {
  const errors = [];

  if (!isPlainObject(payload)) {
    return {
      valid: false,
      errors: [{ path: "$", message: "Payload must be an object." }]
    };
  }

  if (payload.version !== RENDER_PAYLOAD_VERSION) {
    pushError(errors, "version", `Expected render payload version ${RENDER_PAYLOAD_VERSION}.`);
  }

  validateStringField(errors, payload, "source.projectName");
  validateStringField(errors, payload, "source.projectSlug");
  validateStringField(errors, payload, "template.id");

  if (!isPlainObject(payload.video)) {
    pushError(errors, "video", "Video settings object is required.");
  } else {
    if (!Number.isInteger(payload.video.width) || payload.video.width <= 0) {
      pushError(errors, "video.width", "Video width must be a positive integer.");
    }
    if (!Number.isInteger(payload.video.height) || payload.video.height <= 0) {
      pushError(errors, "video.height", "Video height must be a positive integer.");
    }
    if (!Number.isInteger(payload.video.fps) || payload.video.fps <= 0) {
      pushError(errors, "video.fps", "Video fps must be a positive integer.");
    }
  }

  if (!Array.isArray(payload.scenes)) {
    pushError(errors, "scenes", "Scenes must be an array.");
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

  return {
    valid: errors.length === 0,
    errors
  };
}

module.exports = {
  RENDER_PAYLOAD_VERSION,
  SCENE_TYPES,
  validateRenderPayload
};
