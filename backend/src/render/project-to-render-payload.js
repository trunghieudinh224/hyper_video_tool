"use strict";

const { DYNAMIC_RENDER_PAYLOAD_VERSION, RENDER_PAYLOAD_VERSION, TEMPLATE_PRESETS, VIDEO_PRESETS, validateRenderPayload } = require("./render-payload-schema");

const DEFAULT_VIDEO = {
  aspectRatio: "16:9",
  width: VIDEO_PRESETS["16:9"].width,
  height: VIDEO_PRESETS["16:9"].height,
  fps: 30,
  format: "mp4"
};

const EDGE_TTS_BASE_WORDS_PER_MINUTE = 185;

const SCENE_DURATIONS = {
  intro: 6,
  problem: 10,
  solution: 10,
  features: 18,
  timeline: 14,
  impact: 10,
  outro: 6
};

const DYNAMIC_SCENE_TEMPLATES = {
  "intro-stack": {
    id: "intro-stack",
    name: "Intro Stack",
    slots: [
      { id: "logo", label: "Logo", type: "asset", required: false, defaultDelay: 0, allowedAnimations: ["scale-in", "fade-up"] },
      { id: "kicker", label: "Kicker", type: "text", required: false, defaultDelay: 0, allowedAnimations: ["fade-up", "typewriter"] },
      { id: "title", label: "Title", type: "text", required: true, defaultDelay: 0.4, allowedAnimations: ["fade-up", "typewriter"] },
      { id: "description", label: "Description", type: "text", required: false, defaultDelay: 1.5, allowedAnimations: ["fade-up"] },
      { id: "tag", label: "Tag / Label", type: "tag", required: false, defaultDelay: 2.5, allowedAnimations: ["pop", "fade-up"] }
    ]
  },
  "media-showcase": {
    id: "media-showcase",
    name: "Media Showcase",
    slots: [
      { id: "header", label: "Header", type: "text", required: false, defaultDelay: 0, allowedAnimations: ["fade-up"] },
      { id: "logo", label: "Logo", type: "asset", required: false, defaultDelay: 0, allowedAnimations: ["scale-in"] },
      { id: "title", label: "Title", type: "text", required: true, defaultDelay: 0.6, allowedAnimations: ["fade-up", "typewriter"] },
      { id: "media", label: "Image / Video", type: "media", required: true, defaultDelay: 1.4, allowedAnimations: ["scale-in", "fade-up"] },
      { id: "description", label: "Description", type: "text", required: false, defaultDelay: 3, allowedAnimations: ["fade-up"] }
    ]
  },
  "grid-feature": {
    id: "grid-feature",
    name: "Grid Feature",
    slots: [
      { id: "header", label: "Header", type: "text", required: false, defaultDelay: 0, allowedAnimations: ["fade-up"] },
      { id: "title", label: "Title", type: "text", required: true, defaultDelay: 0.5, allowedAnimations: ["fade-up", "typewriter"] },
      { id: "grid", label: "Grid Items", type: "list", required: true, defaultDelay: 1.2, allowedAnimations: ["pop", "fade-up"] },
      { id: "description", label: "Description", type: "text", required: false, defaultDelay: 4, allowedAnimations: ["fade-up"] }
    ]
  },
  "step-flow": {
    id: "step-flow",
    name: "Step Flow",
    slots: [
      { id: "title", label: "Title", type: "text", required: true, defaultDelay: 0, allowedAnimations: ["fade-up"] },
      { id: "steps", label: "Steps", type: "list", required: true, defaultDelay: 1, allowedAnimations: ["slide-left", "fade-up"] },
      { id: "note", label: "Note", type: "text", required: false, defaultDelay: 4, allowedAnimations: ["fade-up"] }
    ]
  },
  "outro-cta": {
    id: "outro-cta",
    name: "Outro CTA",
    slots: [
      { id: "logo", label: "Logo", type: "asset", required: false, defaultDelay: 0, allowedAnimations: ["scale-in"] },
      { id: "title", label: "Title", type: "text", required: true, defaultDelay: 0.4, allowedAnimations: ["fade-up"] },
      { id: "cta", label: "Call to action", type: "text", required: false, defaultDelay: 1.5, allowedAnimations: ["pop", "fade-up"] },
      { id: "tag", label: "Tag / Label", type: "tag", required: false, defaultDelay: 2.5, allowedAnimations: ["fade-up"] }
    ]
  }
};

const VIDEO_STYLES = {
  "dark-tech": {
    id: "dark-tech",
    colorTheme: {
      background: "#05070A",
      surface: "#101722",
      surfaceAlt: "#162033",
      text: "#F8FAFC",
      mutedText: "#94A3B8",
      accent: "#22D3EE",
      accentSoft: "#164E63",
      border: "#1E3A5F",
      glow: "rgba(34, 211, 238, 0.28)"
    },
    motionStyle: "dynamic",
    backgroundStyle: "dark-grid"
  },
  "clean-report": {
    id: "clean-report",
    colorTheme: {
      background: "#F8FAFC",
      surface: "#FFFFFF",
      surfaceAlt: "#EEF2F7",
      text: "#111827",
      mutedText: "#64748B",
      accent: "#1F4FD8",
      accentSoft: "#E8EEFC",
      border: "#D9DEE7",
      glow: "rgba(31, 79, 216, 0.16)"
    },
    motionStyle: "minimal",
    backgroundStyle: "clean-surface"
  },
  "product-demo": {
    id: "product-demo",
    colorTheme: {
      background: "#0E1116",
      surface: "#171B22",
      surfaceAlt: "#202630",
      text: "#F5F7FA",
      mutedText: "#A7B0BE",
      accent: "#7DD3A8",
      accentSoft: "#183B2A",
      border: "#334155",
      glow: "rgba(125, 211, 168, 0.22)"
    },
    motionStyle: "soft",
    backgroundStyle: "media-focus"
  }
};

const DEFAULT_AUDIO = {
  voiceover: {
    enabled: false,
    provider: "edge-tts",
    language: "vi-VN",
    voiceId: "vi-VN-HoaiMyNeural",
    rate: "+0%",
    volume: "+0%",
    script: "",
    outputPath: ""
  },
  backgroundMusic: {
    enabled: false,
    source: "",
    volume: 0.12,
    ducking: true
  },
  soundEffects: {
    enabled: false,
    items: []
  }
};

function text(value, fallback = "") {
  if (typeof value !== "string") {
    return fallback;
  }
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : fallback;
}

function percent(value, fallback = "+0%") {
  if (typeof value === "number" && Number.isFinite(value)) {
    return `${value >= 0 ? "+" : ""}${Math.trunc(value)}%`;
  }

  const normalized = text(value, fallback);
  return /^[+-]\d+%$/.test(normalized) ? normalized : fallback;
}

function list(value) {
  return Array.isArray(value) ? value : [];
}

function mapFeature(feature, index) {
  return {
    id: text(feature.id, `feature-${index + 1}`),
    title: text(feature.name, `Tính năng ${index + 1}`),
    description: text(feature.description, "Chưa có mô tả tính năng."),
    benefit: text(feature.benefit, "Chưa có mô tả giá trị."),
    voiceoverScript: text(feature.voiceoverScript, ""),
    durationSec: Math.min(30, Math.max(3, Number.parseInt(feature.durationSec, 10) || 8)),
    order: index + 1
  };
}

function mapMilestone(milestone, index) {
  return {
    id: text(milestone.id, `milestone-${index + 1}`),
    title: text(milestone.name, `Cột mốc ${index + 1}`),
    date: text(milestone.date, ""),
    description: text(milestone.description, "Chưa có mô tả cột mốc."),
    status: text(milestone.status, "unknown"),
    voiceoverScript: text(milestone.voiceoverScript, "")
  };
}

function mapAsset(asset, index) {
  return {
    id: text(asset.id, `asset-${index + 1}`),
    name: text(asset.name, `Asset ${index + 1}`),
    type: text(asset.type, "unknown"),
    url: text(asset.url, text(asset.publicUrl, "")),
    useInVideo: Boolean(asset.useInVideo)
  };
}

function findFirstAsset(assets, type) {
  return assets.find((asset) => asset.type === type && asset.useInVideo && asset.url) || null;
}

function resolveVideoStyle(project = {}) {
  const preset = VIDEO_STYLES[project.videoStyleId] || VIDEO_STYLES["dark-tech"];
  const overrides = project.videoStyleOverrides && typeof project.videoStyleOverrides === "object"
    ? project.videoStyleOverrides
    : {};
  const override = overrides[preset.id] && typeof overrides[preset.id] === "object" ? overrides[preset.id] : {};

  return {
    ...preset,
    ...override,
    id: preset.id,
    colorTheme: {
      ...(preset.colorTheme || {}),
      ...(override.colorTheme || {})
    }
  };
}

function estimateSpeechDurationSeconds(value) {
  const normalized = text(value, "");
  if (!normalized) {
    return 0;
  }
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil((wordCount / EDGE_TTS_BASE_WORDS_PER_MINUTE) * 60));
}

function createScene(type, title, content, voiceoverScript = "") {
  const script = text(voiceoverScript, "");
  const estimatedDuration = estimateSpeechDurationSeconds(script);
  const duration = SCENE_DURATIONS[type];

  return {
    id: `scene-${type}`,
    type,
    title,
    duration,
    content,
    voiceover: {
      script,
      estimatedDuration,
      fits: !script || estimatedDuration <= duration
    }
  };
}

function getVoiceoverDefaults(language) {
  const voiceByLanguage = {
    "vi-VN": "vi-VN-HoaiMyNeural",
    "en-US": "en-US-JennyNeural",
    "ja-JP": "ja-JP-NanamiNeural"
  };

  const normalizedLanguage = text(language, DEFAULT_AUDIO.voiceover.language);

  return {
    provider: DEFAULT_AUDIO.voiceover.provider,
    language: voiceByLanguage[normalizedLanguage] ? normalizedLanguage : DEFAULT_AUDIO.voiceover.language,
    voiceId: voiceByLanguage[normalizedLanguage] || DEFAULT_AUDIO.voiceover.voiceId
  };
}

function mapAudioConfig(project = {}, assets = []) {
  const source = project.audio && typeof project.audio === "object" ? project.audio : {};
  const sourceVoiceover = source.voiceover && typeof source.voiceover === "object" ? source.voiceover : {};
  const voiceDefaults = getVoiceoverDefaults(sourceVoiceover.language);
  const sourceBackgroundMusic = source.backgroundMusic && typeof source.backgroundMusic === "object"
    ? source.backgroundMusic
    : {};
  const backgroundMusicAssetId = text(sourceBackgroundMusic.assetId, "");
  const backgroundMusicAsset = backgroundMusicAssetId
    ? assets.find((asset) => asset.id === backgroundMusicAssetId && asset.type === "audio" && asset.url)
    : null;
  const backgroundMusicSource = backgroundMusicAssetId
    ? (backgroundMusicAsset ? backgroundMusicAsset.url : "")
    : text(sourceBackgroundMusic.source, "");
  const sourceSoundEffects = source.soundEffects && typeof source.soundEffects === "object" ? source.soundEffects : {};

  return {
    voiceover: {
      enabled: Boolean(sourceVoiceover.enabled),
      provider: text(sourceVoiceover.provider, voiceDefaults.provider),
      language: voiceDefaults.language,
      voiceId: text(sourceVoiceover.voiceId, voiceDefaults.voiceId),
      rate: percent(sourceVoiceover.rate, DEFAULT_AUDIO.voiceover.rate),
      volume: percent(sourceVoiceover.volume, DEFAULT_AUDIO.voiceover.volume),
      script: text(sourceVoiceover.script, ""),
      outputPath: text(sourceVoiceover.outputPath, "")
    },
    backgroundMusic: {
      enabled: Boolean(sourceBackgroundMusic.enabled && backgroundMusicSource),
      source: backgroundMusicSource,
      volume: Number.isFinite(sourceBackgroundMusic.volume) ? sourceBackgroundMusic.volume : DEFAULT_AUDIO.backgroundMusic.volume,
      ducking: sourceBackgroundMusic.ducking !== undefined
        ? Boolean(sourceBackgroundMusic.ducking)
        : DEFAULT_AUDIO.backgroundMusic.ducking
    },
    soundEffects: {
      enabled: Boolean(sourceSoundEffects.enabled),
      items: Array.isArray(sourceSoundEffects.items) ? sourceSoundEffects.items : []
    }
  };
}

function getVideoPreset(options = {}) {
  const requestedAspectRatio = typeof options.aspectRatio === "string" ? options.aspectRatio : "";
  const requestedTemplateId = typeof options.templateId === "string" ? options.templateId : "";

  if (VIDEO_PRESETS[requestedAspectRatio]) {
    return VIDEO_PRESETS[requestedAspectRatio];
  }

  const matchedPreset = Object.values(VIDEO_PRESETS).find((preset) => preset.templateId === requestedTemplateId);
  return matchedPreset || VIDEO_PRESETS["16:9"];
}

function normalizeScriptDisplayMode(value) {
  return text(value, "sequence") === "stack" ? "stack" : "sequence";
}

function isDynamicTemplate(templateId) {
  return ["dynamic-story-vertical", "dynamic-story-horizontal"].includes(templateId);
}

function normalizeDynamicSlotValue(slot = {}, value = {}) {
  const slotValue = value && typeof value === "object" ? value : {};
  if (slot.type === "list" && Array.isArray(slotValue.items)) {
    return {
      ...slotValue,
      items: slotValue.items.filter(Boolean)
    };
  }
  return slotValue;
}

function normalizeVideoBackground(project = {}) {
  const background = project.videoBackground && typeof project.videoBackground === "object"
    ? project.videoBackground
    : {};
  if (background.mode === "asset" && text(background.assetId, "")) {
    return { mode: "asset", assetId: text(background.assetId, "") };
  }
  if (background.mode === "color") {
    return {
      mode: "color",
      colorType: background.colorType === "gradient" ? "gradient" : "solid",
      color: text(background.color, ""),
      gradientFrom: text(background.gradientFrom, text(background.color, "")),
      gradientTo: text(background.gradientTo, ""),
      gradientDirection: ["to-right", "to-left", "to-bottom", "to-top"].includes(background.gradientDirection) ? background.gradientDirection : "to-right"
    };
  }
  return null;
}

function buildDynamicSlotScenes(project = {}, features = []) {
  const videoBackground = normalizeVideoBackground(project);
  return features.map((feature, index) => {
    const baseTemplate = DYNAMIC_SCENE_TEMPLATES[feature.sceneTemplateId] || DYNAMIC_SCENE_TEMPLATES["intro-stack"];
    const template = feature.sceneTemplateOverride && Array.isArray(feature.sceneTemplateOverride.slots)
      ? {
        ...baseTemplate,
        ...feature.sceneTemplateOverride,
        id: feature.sceneTemplateId || feature.sceneTemplateOverride.id || baseTemplate.id
      }
      : baseTemplate;
    const durationSec = Math.min(30, Math.max(3, Number.parseInt(feature.durationSec, 10) || 8));
    const slots = {};
    for (const slot of template.slots) {
      slots[slot.id] = normalizeDynamicSlotValue(slot, feature.slots && feature.slots[slot.id]);
    }

    return {
      id: text(feature.id, `scene-${index + 1}`),
      type: "slot",
      headline: text(feature.name, `Phân đoạn ${index + 1}`),
      body: text(feature.description, ""),
      duration: {
        mode: "fixed",
        min: durationSec,
        max: durationSec
      },
      sceneTemplate: template,
      background: videoBackground || feature.background || null,
      captions: feature.subtitles || { enabled: false },
      slots
    };
  });
}

function projectToDynamicRenderPayload(project = {}, options = {}) {
  const templateId = text(options.templateId || project.templateId, "dynamic-story-vertical");
  const templatePreset = TEMPLATE_PRESETS[templateId] || TEMPLATE_PRESETS["dynamic-story-vertical"];
  const features = list(project.features).filter((feature) => feature && feature.useInVideo !== false);
  const assets = list(project.assets).filter(Boolean).map(mapAsset);
  const audio = mapAudioConfig(project, assets);
  if (audio.voiceover.enabled && !audio.voiceover.script) {
    audio.voiceover.script = features.map((feature) => text(feature.voiceoverScript, "")).filter(Boolean).join("\n");
  }
  const scenes = buildDynamicSlotScenes(project, features);
  const payload = {
    version: DYNAMIC_RENDER_PAYLOAD_VERSION,
    source: {
      projectName: text(project.projectName, "Dự án chưa đặt tên"),
      projectSlug: text(project.projectSlug, "untitled-project"),
      ownerTeam: text(project.ownerTeam, "Team phụ trách"),
      presenterRole: text(project.presenterRole, "Người trình bày")
    },
    template: {
      id: templateId,
      variant: "default",
      config: {
        ...(project.templateConfig || {}),
        videoStyle: resolveVideoStyle(project)
      }
    },
    video: {
      aspectRatio: templatePreset.aspectRatio,
      width: templatePreset.width,
      height: templatePreset.height,
      fps: Number.isInteger(options.fps) && options.fps > 0 ? options.fps : DEFAULT_VIDEO.fps,
      format: "mp4",
      estimatedDuration: scenes.reduce((total, scene) => total + (scene.duration && scene.duration.max || 0), 0)
    },
    assets: {
      logo: findFirstAsset(assets, "logo"),
      screenshots: assets.filter((asset) => asset.type === "screenshot" && asset.useInVideo && asset.url).slice(0, 3),
      videos: assets.filter((asset) => asset.type === "video" && asset.useInVideo && asset.url).slice(0, 2),
      all: assets
    },
    audio,
    scenes
  };

  const validation = validateRenderPayload(payload);
  if (!validation.valid) {
    const message = validation.errors.map((error) => `${error.path}: ${error.message}`).join("\n");
    throw new Error(`Generated render payload is invalid:\n${message}`);
  }

  return payload;
}

function projectToRenderPayload(project = {}, options = {}) {
  const hasExplicitAspectRatio = Boolean(options.aspectRatio || project.aspectRatio);
  const videoPreset = getVideoPreset({
    aspectRatio: options.aspectRatio || project.aspectRatio,
    templateId: options.templateId || (hasExplicitAspectRatio ? "" : project.templateId)
  });
  const templateId = text(options.templateId || (hasExplicitAspectRatio ? "" : project.templateId), videoPreset.templateId);
  if (isDynamicTemplate(templateId)) {
    return projectToDynamicRenderPayload(project, { ...options, templateId });
  }
  const features = list(project.features)
    .filter((feature) => feature && feature.useInVideo)
    .slice(0, 4)
    .map(mapFeature);
  const derivedHighlight = text(
    project.mainMessage,
    text(
      project.keyHighlight,
    (features[0] && (features[0].benefit || features[0].description || features[0].title)) || ""
    )
  );

  const milestones = list(project.milestones)
    .filter(Boolean)
    .slice(0, 5)
    .map(mapMilestone);

  const assets = list(project.assets).filter(Boolean).map(mapAsset);
  const logo = findFirstAsset(assets, "logo");
  const screenshots = assets.filter((asset) => asset.type === "screenshot" && asset.useInVideo && asset.url).slice(0, 3);
  const videos = assets.filter((asset) => asset.type === "video" && asset.useInVideo && asset.url).slice(0, 2);
  const voiceover = project.voiceover && typeof project.voiceover === "object" ? project.voiceover : {};
  const sceneScripts = voiceover.sceneScripts && typeof voiceover.sceneScripts === "object" ? voiceover.sceneScripts : {};
  const timelineScript = milestones
    .map((milestone) => milestone.voiceoverScript)
    .filter(Boolean)
    .join("\n");
  const featureSegmentScript = features
    .map((feature) => text(feature.voiceoverScript, ""))
    .filter(Boolean)
    .join("\n");
  const scriptDisplayMode = normalizeScriptDisplayMode(project.scriptDisplayMode);

  const payload = {
    version: RENDER_PAYLOAD_VERSION,
    source: {
      projectName: text(project.projectName, "Dự án chưa đặt tên"),
      projectSlug: text(project.projectSlug, "untitled-project"),
      ownerTeam: text(project.ownerTeam, "Team phụ trách"),
      presenterRole: text(project.presenterRole, "Người trình bày")
    },
    template: {
      id: templateId,
      config: {
        theme: text(project.templateConfig && project.templateConfig.theme, "dark"),
        accentColor: text(project.templateConfig && project.templateConfig.accentColor, "blue"),
        fontSize: text(project.templateConfig && project.templateConfig.fontSize, "default"),
        logoPosition: text(project.templateConfig && project.templateConfig.logoPosition, "top-left")
      }
    },
    video: {
      ...DEFAULT_VIDEO,
      aspectRatio: videoPreset.aspectRatio,
      width: videoPreset.width,
      height: videoPreset.height,
      fps: Number.isInteger(options.fps) && options.fps > 0 ? options.fps : DEFAULT_VIDEO.fps,
      estimatedDuration: Object.values(SCENE_DURATIONS).reduce((total, duration) => total + duration, 0)
    },
    assets: {
      logo,
      screenshots,
      videos,
      all: assets
    },
    audio: mapAudioConfig(project, assets),
    scenes: [
      createScene("intro", "Giới thiệu nội dung", {
        projectName: text(project.projectName, "Dự án chưa đặt tên"),
        tagline: text(project.tagline, "Giới thiệu ngắn về dự án."),
        ownerTeam: text(project.ownerTeam, "Team phụ trách"),
        summary: text(project.shortSummary, "")
      }, sceneScripts.intro),
      createScene("problem", "Bối cảnh và vấn đề", {
        problem: text(project.problemContext, "Chưa có mô tả vấn đề."),
        targetUsers: text(project.targetUsers, "Chưa xác định người dùng mục tiêu."),
        useCase: text(project.useCase, text(project.videoGoal, "Chưa có use case."))
      }, sceneScripts.problem),
      createScene("solution", "Giải pháp", {
        solution: text(project.solutionWhat, "Chưa có mô tả giải pháp."),
        keyHighlight: derivedHighlight
      }, sceneScripts.solution),
      createScene("features", "Tính năng nổi bật", {
        displayMode: scriptDisplayMode,
        items: features
      }, sceneScripts.features || featureSegmentScript),
      createScene("timeline", "Timeline phát triển", {
        milestones
      }, sceneScripts.timeline || timelineScript),
      createScene("impact", "Kết quả và tác động", {
        resultImpact: text(project.resultImpact, "Chưa có số liệu tác động."),
        highlight: derivedHighlight
      }, sceneScripts.impact),
      createScene("outro", "Kết thúc", {
        endingNote: text(project.endingNote, "Cảm ơn đã theo dõi."),
        ownerTeam: text(project.ownerTeam, "Team phụ trách")
      }, sceneScripts.outro)
    ]
  };

  const validation = validateRenderPayload(payload);
  if (!validation.valid) {
    const message = validation.errors.map((error) => `${error.path}: ${error.message}`).join("\n");
    throw new Error(`Generated render payload is invalid:\n${message}`);
  }

  return payload;
}

module.exports = {
  DEFAULT_AUDIO,
  DEFAULT_VIDEO,
  SCENE_DURATIONS,
  estimateSpeechDurationSeconds,
  getVideoPreset,
  mapAudioConfig,
  projectToRenderPayload
};
