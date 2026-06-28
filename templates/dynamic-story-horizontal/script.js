const ROOT_SAMPLE_PAYLOAD_PATH = "../../data/dynamic-motion-payload.sample.json";
const WORKDIR_PAYLOAD_PATH = "./render-payload.json";
const COMPOSITION_ID = "dynamic-story-horizontal";

if (document.readyState === "loading") {
  initializeTemplate();
} else {
  initializeTemplate();
}

window.addEventListener("message", (event) => {
  if (!event.data || typeof event.data !== "object") {
    return;
  }

  const { action, payload, data, sceneId } = event.data;
  if (action === "updatePayload") {
    updateTemplatePayload(payload || data);
  }
  if (action === "showScene") {
    showScene(sceneId);
  }
});

function initializeTemplate() {
  updateTemplatePayload(loadPayloadSync() || createFallbackPayload());
}

function loadPayloadSync() {
  const request = new XMLHttpRequest();
  try {
    request.open("GET", getPayloadPath(), false);
    request.send(null);
    if (request.status >= 200 && request.status < 300) {
      return JSON.parse(request.responseText);
    }
    console.warn(`Cannot load payload: ${request.status}`);
  } catch (error) {
    console.warn("Cannot load dynamic payload sample.", error);
  }
  return null;
}

function getPayloadPath() {
  if (window.location.pathname.includes("/templates/dynamic-story-horizontal/")) {
    return ROOT_SAMPLE_PAYLOAD_PATH;
  }
  return WORKDIR_PAYLOAD_PATH;
}

function updateTemplatePayload(payload) {
  const safePayload = payload && typeof payload === "object" ? payload : createFallbackPayload();
  applyVideoStyleTheme(safePayload);
  const stage = document.getElementById("scene-stage");
  MotionCore.dom.clearChildren(stage);
  const scenes = Array.isArray(safePayload.scenes) ? safePayload.scenes : [];
  scenes.forEach((scene) => {
    stage.appendChild(renderScene(scene, safePayload));
  });
  registerTimeline(safePayload);
  showScene(scenes[0] && scenes[0].id);
}

function getVideoStyleTheme(payload) {
  const videoStyle = payload && payload.template && payload.template.config && payload.template.config.videoStyle;
  return videoStyle && videoStyle.colorTheme && typeof videoStyle.colorTheme === "object"
    ? videoStyle.colorTheme
    : {};
}

function applyVideoStyleTheme(payload) {
  const videoStyle = payload && payload.template && payload.template.config && payload.template.config.videoStyle || {};
  const theme = getVideoStyleTheme(payload);
  const root = document.documentElement;
  root.dataset.backgroundStyle = videoStyle.backgroundStyle || "plain";
  root.dataset.motionStyle = videoStyle.motionStyle || "dynamic";
  root.style.setProperty("--video-bg", theme.background || "#020611");
  root.style.setProperty("--video-surface", theme.surface || "#101722");
  root.style.setProperty("--video-surface-alt", theme.surfaceAlt || theme.surface || "#162033");
  root.style.setProperty("--video-text", theme.text || "#f8fafc");
  root.style.setProperty("--video-muted", theme.mutedText || "#cbd5e1");
  root.style.setProperty("--video-accent", theme.accent || "#67e8f9");
  root.style.setProperty("--video-accent-soft", theme.accentSoft || "#164e63");
  root.style.setProperty("--video-border", theme.border || "#1e3a5f");
  root.style.setProperty("--video-glow", theme.glow || "transparent");

  let style = document.getElementById("video-style-theme");
  if (!style) {
    style = document.createElement("style");
    style.id = "video-style-theme";
    document.head.appendChild(style);
  }
  style.textContent = `
    html, body, .video-container, .scene { background-color: var(--video-bg); color: var(--video-text); }
    .scene-kicker { color: var(--video-accent); }
    .scene-headline { color: var(--video-text); }
    .scene-subtitle, .scene-body { color: var(--video-muted); }
    .title-badge, .feature-card, .step-item, .media-frame { background-color: var(--video-surface); border-color: var(--video-border); }
    .feature-card:nth-child(even), .step-item:nth-child(even) { background-color: var(--video-surface-alt); }
    .scene-tag, .scene-cta { background-color: var(--video-accent-soft); color: var(--video-accent); border-color: var(--video-border); }
    .display-glow-soft { filter: drop-shadow(0 0 18px var(--video-glow)); }
    .slot-scene-item { border-color: var(--video-border); }
    [data-background-style="dark-grid"] .scene { background-image: linear-gradient(rgba(148, 163, 184, 0.10) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.10) 1px, transparent 1px); background-size: 64px 64px; }
    [data-background-style="subtle-grid"] .scene { background-image: linear-gradient(rgba(148, 163, 184, 0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(148, 163, 184, 0.06) 1px, transparent 1px); background-size: 88px 88px; }
    [data-background-style="clean-surface"] .scene, [data-background-style="plain"] .scene { background-image: none; }
    [data-background-style="media-focus"] .scene { background-image: radial-gradient(circle at 50% 42%, var(--video-surface-alt), var(--video-bg) 68%); }
  `;
}

function getMotionConfig(payload) {
  const videoStyle = payload && payload.template && payload.template.config && payload.template.config.videoStyle || {};
  const configs = {
    minimal: { y: 14, duration: 0.4, stagger: 0.04, ease: "power1.out", filter: false },
    soft: { y: 28, duration: 0.88, stagger: 0.12, ease: "power2.out" },
    sharp: { y: 38, duration: 0.34, stagger: 0.05, ease: "power4.out" },
    dynamic: { y: 52, duration: 0.68, stagger: 0.075, ease: "power3.out" }
  };
  return configs[videoStyle.motionStyle] || configs.dynamic;
}

function renderScene(scene, payload) {
  const root = MotionCore.dom.createElement("section", `scene scene-${scene.type || "text"}`);
  root.id = scene.id || `scene-${Math.random().toString(16).slice(2)}`;
  root.dataset.sceneType = scene.type || "text";

  if (scene.type === "slot") {
    renderSlotScene(root, scene, payload);
    return root;
  }

  const shell = MotionCore.dom.createElement("div", "scene-shell");
  const kicker = MotionCore.dom.createElement("div", "scene-kicker", getSceneKicker(scene));
  const headline = MotionCore.dom.createElement("h1", "scene-headline", scene.headline || "Untitled scene");
  const subtitle = MotionCore.dom.createElement("p", "scene-subtitle", scene.subtitle || "");
  const body = MotionCore.dom.createElement("p", "scene-body", scene.body || "");

  shell.appendChild(kicker);

  if (scene.media && scene.media.placement === "badge") {
    shell.appendChild(renderBadgeMedia(scene, payload));
  }

  shell.appendChild(headline);
  if (scene.subtitle) {
    shell.appendChild(subtitle);
  }
  if (scene.body) {
    shell.appendChild(body);
  }

  if (scene.type === "media") {
    shell.appendChild(renderFocusMedia(scene, payload));
  }

  if (scene.type === "cards") {
    shell.appendChild(renderCards(scene));
  }

  if (scene.type === "steps") {
    shell.appendChild(renderSteps(scene));
  }

  root.appendChild(shell);
  return root;
}

function renderSlotScene(root, scene, payload) {
  applySceneBackground(root, scene, payload);
  const shell = MotionCore.dom.createElement("div", "slot-scene-shell");
  const slots = scene.sceneTemplate && Array.isArray(scene.sceneTemplate.slots)
    ? scene.sceneTemplate.slots
    : [];

  if (!slots.length) {
    shell.appendChild(MotionCore.dom.createElement("h1", "scene-headline", scene.headline || "Untitled scene"));
    if (scene.body) {
      shell.appendChild(MotionCore.dom.createElement("p", "scene-body", scene.body));
    }
    root.appendChild(shell);
    return;
  }

  slots.forEach((slot, index) => {
    shell.appendChild(renderSlotItem(slot, scene.slots && scene.slots[slot.id], payload, index));
  });
  root.appendChild(shell);
}

function applySceneBackground(root, scene, payload) {
  const background = scene.background || {};
  if (background.mode === "asset") {
    const asset = MotionCore.dom.resolveAsset(payload, background.assetId);
    if (!asset || !asset.url) {
      return;
    }
    const media = asset.type === "video" ? document.createElement("video") : document.createElement("img");
    media.className = "slot-scene-background";
    media.src = asset.url;
    if (asset.type === "video") {
      media.muted = true;
      media.loop = true;
      media.playsInline = true;
      media.autoplay = true;
    } else {
      media.alt = "";
    }
    root.appendChild(media);
    return;
  }

  if (background.mode === "color" && background.colorType === "gradient") {
    root.style.backgroundImage = `linear-gradient(${getGradientDirectionValue(background.gradientDirection)}, ${background.gradientFrom || background.color || "#020611"}, ${background.gradientTo || "#1f4fd8"})`;
    return;
  }

  if (background.mode === "color" && background.color) {
    root.style.backgroundColor = background.color;
  }
}

function getGradientDirectionValue(direction) {
  return ({
    "to-right": "to right",
    "to-left": "to left",
    "to-bottom": "to bottom",
    "to-top": "to top"
  })[direction] || "to right";
}

function renderSlotItem(slot, value, payload, index) {
  const slotValue = value || {};
  const theme = getVideoStyleTheme(payload);
  const label = `${slot.id || ""} ${slot.label || ""}`.toLowerCase();
  const defaultRole = slot.type === "tag" || label.includes("kicker") || label.includes("header") || label.includes("cta")
    ? "accent"
    : label.includes("description") || label.includes("note") || label.includes("caption")
      ? "mutedText"
      : "text";
  const colorRole = slot.colorRole || defaultRole;
  const displayStyle = slot.displayStyle || (slot.type === "tag" ? "pill" : ["asset", "list"].includes(slot.type) ? "surface" : slot.type === "media" ? "media-frame" : slot.type === "icon" ? "filled" : "plain");
  const item = MotionCore.dom.createElement("div", `slot-scene-item slot-${slot.type || "text"}`);
  item.style.cssText = getSlotLayoutStyle(slot, index);
  const legacyTextColors = new Set(["#0891B2", "#9333EA", "#D97706"]);
  const explicitTextColor = String(slotValue.textColor || "").toUpperCase();
  item.style.color = explicitTextColor && !legacyTextColors.has(explicitTextColor) ? explicitTextColor : (theme[colorRole] || theme.text || "#f8fafc");
  if (slotValue.fontSize) item.style.fontSize = `${Math.max(8, Math.min(96, Number.parseInt(slotValue.fontSize, 10) || 18))}px`;
  if (slotValue.fontWeight) item.style.fontWeight = String(slotValue.fontWeight);
  if (slotValue.textAlign) item.style.textAlign = slotValue.textAlign;
  if (slotValue.backgroundColor) item.style.backgroundColor = slotValue.backgroundColor;
  else if (["surface", "media-frame"].includes(displayStyle)) item.style.backgroundColor = theme.surface || "#101722";
  else if (["filled", "pill"].includes(displayStyle)) item.style.backgroundColor = theme.accentSoft || "#164e63";
  else item.style.backgroundColor = "transparent";
  const borderWidths = { none: 0, thin: 1, medium: 2, thick: 3 };
  const borderWidth = Object.prototype.hasOwnProperty.call(borderWidths, slotValue.borderWidth) ? borderWidths[slotValue.borderWidth] : 0;
  item.style.borderStyle = "solid";
  item.style.borderWidth = `${borderWidth}px`;
  item.style.borderColor = slotValue.borderColor || theme.border || "#1e3a5f";
  if (slotValue.displayAnimation === "glow-soft") item.style.filter = `drop-shadow(0 0 18px ${theme.glow || "transparent"})`;

  if (slot.type === "asset" || slot.type === "media") {
    appendSlotMedia(item, slotValue, payload);
  } else if (slot.type === "list") {
    const list = MotionCore.dom.createElement("div", "slot-scene-list");
    (Array.isArray(slotValue.items) ? slotValue.items : []).filter(Boolean).slice(0, 6).forEach((entry) => {
      list.appendChild(MotionCore.dom.createElement("span", "", entry));
    });
    item.appendChild(list);
  } else if (slot.type === "icon") {
    item.textContent = "●";
  } else {
    item.textContent = slotValue.text || slot.label || "";
  }

  return item;
}

function appendSlotMedia(item, slotValue, payload) {
  const asset = MotionCore.dom.resolveAsset(payload, slotValue.assetId);
  if (!asset || !asset.url) {
    item.textContent = "Missing media";
    return;
  }
  const media = asset.type === "video" ? document.createElement("video") : document.createElement("img");
  media.src = asset.url;
  if (asset.type === "video") {
    media.muted = true;
    media.loop = true;
    media.playsInline = true;
    media.autoplay = true;
  } else {
    media.alt = asset.name || "";
  }
  item.appendChild(media);
}

function getSlotLayoutStyle(slot, index) {
  const layout = slot && slot.layout ? slot.layout : getDefaultSlotLayout(slot, index);
  const width = clamp(Number(layout.width), 12, 100);
  const height = clamp(Number(layout.height), 5, 100);
  const x = clamp(Number(layout.x), 0, 100 - width);
  const y = clamp(Number(layout.y), 0, 100 - height);
  return `left:${x}%;top:${y}%;width:${width}%;height:${height}%;`;
}

function getDefaultSlotLayout(slot, index) {
  const type = slot && slot.type;
  if (type === "asset") return { x: 36, y: 18, width: 28, height: 10 };
  if (type === "media") return { x: 12, y: 52, width: 76, height: 26 };
  if (type === "icon") return { x: 42, y: 24, width: 16, height: 10 };
  if (type === "list") return { x: 16, y: 48, width: 68, height: 20 };
  if (type === "tag") return { x: 22, y: 78, width: 56, height: 8 };
  return { x: 16, y: Math.min(84, 22 + (index * 11)), width: 68, height: 8 };
}

function clamp(value, min, max) {
  if (!Number.isFinite(value)) {
    return min;
  }
  return Math.min(max, Math.max(min, value));
}

function getSceneKicker(scene) {
  const labels = {
    title: "Intro",
    text: "Context",
    media: "Media",
    cards: "Motion",
    steps: "Pipeline",
    outro: "Close"
  };
  return labels[scene.type] || "Scene";
}

function renderBadgeMedia(scene, payload) {
  const badge = MotionCore.dom.createElement("div", "title-badge");
  const url = MotionCore.dom.getMediaUrl(payload, scene.media);
  if (url) {
    const image = document.createElement("img");
    image.src = url;
    image.alt = scene.media.alt || scene.headline || "Scene media";
    badge.appendChild(image);
  } else {
    badge.textContent = getInitials(scene.headline || "DM");
  }
  return badge;
}

function renderFocusMedia(scene, payload) {
  const frame = MotionCore.dom.createElement("figure", "media-frame");
  const url = MotionCore.dom.getMediaUrl(payload, scene.media);
  if (url && scene.media.type === "video") {
    const video = document.createElement("video");
    video.src = url;
    video.muted = true;
    video.loop = true;
    video.playsInline = true;
    video.autoplay = true;
    frame.appendChild(video);
  } else if (url) {
    const image = document.createElement("img");
    image.src = url;
    image.alt = scene.media.alt || scene.headline || "Scene media";
    frame.appendChild(image);
  } else {
    frame.appendChild(MotionCore.dom.createElement("div", "media-empty", "Missing media"));
  }

  if (scene.media && scene.media.caption) {
    frame.appendChild(MotionCore.dom.createElement("figcaption", "media-caption", scene.media.caption));
  }
  return frame;
}

function renderCards(scene) {
  const stack = MotionCore.dom.createElement("div", "items-stack");
  getSceneItems(scene).forEach((item, index) => {
    const card = MotionCore.dom.createElement("article", "motion-card");
    card.appendChild(MotionCore.dom.createElement("div", "item-index", String(index + 1).padStart(2, "0")));
    card.appendChild(MotionCore.dom.createElement("h2", "item-title", item.title || `Item ${index + 1}`));
    card.appendChild(MotionCore.dom.createElement("p", "item-body", item.body || ""));
    stack.appendChild(card);
  });
  return stack;
}

function renderSteps(scene) {
  const list = MotionCore.dom.createElement("div", "steps-list");
  getSceneItems(scene).forEach((item, index) => {
    const step = MotionCore.dom.createElement("article", "motion-step");
    step.appendChild(MotionCore.dom.createElement("div", "item-index", String(index + 1)));
    const copy = MotionCore.dom.createElement("div", "step-copy");
    copy.appendChild(MotionCore.dom.createElement("h2", "item-title", item.title || `Step ${index + 1}`));
    copy.appendChild(MotionCore.dom.createElement("p", "item-body", item.body || ""));
    step.appendChild(copy);
    list.appendChild(step);
  });
  return list;
}

function getSceneItems(scene) {
  return Array.isArray(scene && scene.items) ? scene.items : [];
}

function registerTimeline(payload) {
  if (!window.gsap || !window.MotionCore) {
    console.warn("Motion runtime is not ready.");
    return;
  }

  const oldTimeline = window.__timelines && window.__timelines[COMPOSITION_ID];
  if (oldTimeline && oldTimeline.kill) {
    oldTimeline.kill();
  }

  const plan = MotionCore.buildTimelinePlan(payload);
  const motion = getMotionConfig(payload);
  const container = document.getElementById("video-container");
  if (container) {
    container.dataset.duration = String(plan.totalDuration);
  }
  const timeline = window.gsap.timeline({ paused: true });
  const sceneNodes = MotionCore.dom.queryAll(document, ".scene");
  const hiddenSceneNodes = sceneNodes.slice(1);
  timeline.set(hiddenSceneNodes, { opacity: 0, pointerEvents: "none" }, 0);

  const progressFill = document.getElementById("progress-fill");
  if (progressFill) {
    timeline.fromTo(progressFill, { width: "0%" }, { width: "100%", duration: plan.totalDuration, ease: "none" }, 0);
  }

  timeline.to(".scan-band", { y: -32, duration: plan.totalDuration, ease: "none" }, 0);

  plan.scenes.forEach((scenePlan) => {
    const scene = document.getElementById(scenePlan.id);
    if (!scene) {
      return;
    }
    const sceneStart = scenePlan.start;
    const sceneDuration = scenePlan.duration;
    MotionCore.animations.transitionScene(timeline, scene, sceneStart, sceneDuration);
    MotionCore.animations.revealText(
      timeline,
      MotionCore.dom.queryAll(scene, ".scene-kicker, .title-badge, .scene-headline, .scene-subtitle, .scene-body, .slot-scene-item"),
      sceneStart + 0.18,
      motion
    );

    if (scenePlan.type === "media") {
      const media = scene.querySelector(".media-frame");
      MotionCore.animations.revealMedia(timeline, media, sceneStart + 1.15);
      MotionCore.animations.panMedia(timeline, scene.querySelector(".media-frame img, .media-frame video"), sceneStart + 1.5, Math.max(1, sceneDuration - 1.8));
    }

    if (scenePlan.type === "cards") {
      MotionCore.animations.sequenceItems(
        timeline,
        MotionCore.dom.queryAll(scene, ".motion-card"),
        sceneStart + 1.55,
        Math.max(1, sceneDuration - 1.7),
        { padding: 0.2, enterY: motion.y, inDuration: motion.duration, ease: motion.ease }
      );
    }

    if (scenePlan.type === "steps") {
      MotionCore.animations.spotlightItems(
        timeline,
        MotionCore.dom.queryAll(scene, ".motion-step"),
        sceneStart + 1.4,
        Math.max(1, sceneDuration - 1.7),
        { enterY: motion.y, focusDuration: motion.duration, ease: motion.ease }
      );
    }
  });

  window.__timelines = window.__timelines || {};
  window.__timelines[COMPOSITION_ID] = timeline;
  window.__dynamicMotionPlan = plan;
}

function showScene(sceneId) {
  document.querySelectorAll(".scene").forEach((scene) => {
    scene.classList.remove("is-active");
    scene.style.opacity = "";
    scene.style.pointerEvents = "";
  });

  const target = document.getElementById(sceneId) || document.querySelector(".scene");
  if (target) {
    target.classList.add("is-active");
  }
}

function getInitials(value) {
  return String(value || "DM")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "DM";
}

function createFallbackPayload() {
  return {
    version: "dynamic-motion-1.0.0",
    template: { id: COMPOSITION_ID },
    video: { aspectRatio: "9:16", width: 1080, height: 1920, fps: 30 },
    assets: { all: [] },
    scenes: [
      {
        id: "scene-fallback",
        type: "title",
        headline: "Dynamic Motion Video",
        subtitle: "Payload fallback",
        body: "Template is ready, but no payload was loaded.",
        duration: { mode: "auto", min: 5, max: 8 }
      }
    ]
  };
}
