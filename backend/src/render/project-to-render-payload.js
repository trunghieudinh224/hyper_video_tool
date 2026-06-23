"use strict";

const { RENDER_PAYLOAD_VERSION, VIDEO_PRESETS, validateRenderPayload } = require("./render-payload-schema");

const DEFAULT_VIDEO = {
  aspectRatio: "16:9",
  width: VIDEO_PRESETS["16:9"].width,
  height: VIDEO_PRESETS["16:9"].height,
  fps: 30,
  format: "mp4"
};

const SCENE_DURATIONS = {
  intro: 6,
  problem: 10,
  solution: 10,
  features: 18,
  timeline: 14,
  impact: 10,
  outro: 6
};

const DEFAULT_AUDIO = {
  voiceover: {
    enabled: false,
    provider: "edge-tts",
    language: "vi-VN",
    voiceId: "vi-VN-HoaiMyNeural",
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

function list(value) {
  return Array.isArray(value) ? value : [];
}

function mapFeature(feature, index) {
  return {
    id: text(feature.id, `feature-${index + 1}`),
    title: text(feature.name, `Tính năng ${index + 1}`),
    description: text(feature.description, "Chưa có mô tả tính năng."),
    benefit: text(feature.benefit, "Chưa có mô tả giá trị.")
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
    url: text(asset.url, ""),
    useInVideo: Boolean(asset.useInVideo)
  };
}

function findFirstAsset(assets, type) {
  return assets.find((asset) => asset.type === type && asset.useInVideo && asset.url) || null;
}

function estimateSpeechDurationSeconds(value) {
  const normalized = text(value, "");
  if (!normalized) {
    return 0;
  }
  const wordCount = normalized.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil((wordCount / 145) * 60));
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

function mapAudioConfig(project = {}) {
  const source = project.audio && typeof project.audio === "object" ? project.audio : {};
  const sourceVoiceover = source.voiceover && typeof source.voiceover === "object" ? source.voiceover : {};
  const voiceDefaults = getVoiceoverDefaults(sourceVoiceover.language);
  const sourceBackgroundMusic = source.backgroundMusic && typeof source.backgroundMusic === "object"
    ? source.backgroundMusic
    : {};
  const sourceSoundEffects = source.soundEffects && typeof source.soundEffects === "object" ? source.soundEffects : {};

  return {
    voiceover: {
      enabled: Boolean(sourceVoiceover.enabled),
      provider: text(sourceVoiceover.provider, voiceDefaults.provider),
      language: voiceDefaults.language,
      voiceId: text(sourceVoiceover.voiceId, voiceDefaults.voiceId),
      script: text(sourceVoiceover.script, ""),
      outputPath: text(sourceVoiceover.outputPath, "")
    },
    backgroundMusic: {
      enabled: Boolean(sourceBackgroundMusic.enabled),
      source: text(sourceBackgroundMusic.source, ""),
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

function projectToRenderPayload(project = {}, options = {}) {
  const hasExplicitAspectRatio = Boolean(options.aspectRatio || project.aspectRatio);
  const videoPreset = getVideoPreset({
    aspectRatio: options.aspectRatio || project.aspectRatio,
    templateId: options.templateId || (hasExplicitAspectRatio ? "" : project.templateId)
  });
  const templateId = text(options.templateId || (hasExplicitAspectRatio ? "" : project.templateId), videoPreset.templateId);
  const features = list(project.features)
    .filter((feature) => feature && feature.useInVideo)
    .slice(0, 4)
    .map(mapFeature);

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
    audio: mapAudioConfig(project),
    scenes: [
      createScene("intro", "Giới thiệu dự án", {
        projectName: text(project.projectName, "Dự án chưa đặt tên"),
        tagline: text(project.tagline, "Giới thiệu ngắn về dự án."),
        ownerTeam: text(project.ownerTeam, "Team phụ trách"),
        summary: text(project.shortSummary, "")
      }, sceneScripts.intro),
      createScene("problem", "Bối cảnh và vấn đề", {
        problem: text(project.problemContext, "Chưa có mô tả vấn đề."),
        targetUsers: text(project.targetUsers, "Chưa xác định người dùng mục tiêu."),
        useCase: text(project.useCase, "Chưa có use case.")
      }, sceneScripts.problem),
      createScene("solution", "Giải pháp", {
        solution: text(project.solutionWhat, "Chưa có mô tả giải pháp."),
        keyHighlight: text(project.keyHighlight, "")
      }, sceneScripts.solution),
      createScene("features", "Tính năng nổi bật", {
        items: features
      }, sceneScripts.features),
      createScene("timeline", "Timeline phát triển", {
        milestones
      }, sceneScripts.timeline || timelineScript),
      createScene("impact", "Kết quả và tác động", {
        resultImpact: text(project.resultImpact, "Chưa có số liệu tác động."),
        highlight: text(project.keyHighlight, "")
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
