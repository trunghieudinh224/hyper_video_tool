const ROOT_SAMPLE_PAYLOAD_PATH = "../../data/dynamic-motion-payload.sample.json";
const WORKDIR_PAYLOAD_PATH = "./render-payload.json";
const COMPOSITION_ID = "dynamic-story-vertical";

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
  if (window.location.pathname.includes("/templates/dynamic-story-vertical/")) {
    return ROOT_SAMPLE_PAYLOAD_PATH;
  }
  return WORKDIR_PAYLOAD_PATH;
}

function updateTemplatePayload(payload) {
  const safePayload = payload && typeof payload === "object" ? payload : createFallbackPayload();
  const stage = document.getElementById("scene-stage");
  MotionCore.dom.clearChildren(stage);
  const scenes = Array.isArray(safePayload.scenes) ? safePayload.scenes : [];
  scenes.forEach((scene) => {
    stage.appendChild(renderScene(scene, safePayload));
  });
  registerTimeline(safePayload);
  showScene(scenes[0] && scenes[0].id);
}

function renderScene(scene, payload) {
  const root = MotionCore.dom.createElement("section", `scene scene-${scene.type || "text"}`);
  root.id = scene.id || `scene-${Math.random().toString(16).slice(2)}`;
  root.dataset.sceneType = scene.type || "text";

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
      MotionCore.dom.queryAll(scene, ".scene-kicker, .title-badge, .scene-headline, .scene-subtitle, .scene-body"),
      sceneStart + 0.18,
      { stagger: 0.075 }
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
        { padding: 0.2 }
      );
    }

    if (scenePlan.type === "steps") {
      MotionCore.animations.spotlightItems(
        timeline,
        MotionCore.dom.queryAll(scene, ".motion-step"),
        sceneStart + 1.4,
        Math.max(1, sceneDuration - 1.7)
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
