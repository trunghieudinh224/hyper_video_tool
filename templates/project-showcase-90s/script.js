const ROOT_SAMPLE_PAYLOAD_PATH = "../../data/render-payload.sample.json";
const WORKDIR_PAYLOAD_PATH = "./render-payload.json";
const COMPOSITION_ID = "project-showcase-90s";
const SCENE_TIMELINE = [
  { id: "scene-intro", start: 0, duration: 6 },
  { id: "scene-problem", start: 6, duration: 10 },
  { id: "scene-solution", start: 16, duration: 10 },
  { id: "scene-features", start: 26, duration: 18 },
  { id: "scene-timeline", start: 44, duration: 14 },
  { id: "scene-impact", start: 58, duration: 10 },
  { id: "scene-outro", start: 68, duration: 6 },
];

window.addEventListener("DOMContentLoaded", () => {
  registerHyperFramesTimeline();
  initializeTemplate();
});

window.addEventListener("message", (event) => {
  if (!event.data || typeof event.data !== "object") {
    return;
  }

  const { action, sceneId, data, payload } = event.data;

  if (action === "showScene") {
    showScene(sceneId);
  }

  if (action === "updatePayload") {
    updateTemplatePayload(payload || data);
  }

  if (action === "updateData") {
    updateTemplatePayload(createPayloadFromLegacyData(data || {}));
  }
});

async function initializeTemplate() {
  try {
    const payload = await fetchSamplePayload();
    updateTemplatePayload(payload);
  } catch (error) {
    console.warn("Không đọc được render payload mẫu, dùng dữ liệu fallback.", error);
    updateTemplatePayload(createFallbackPayload());
  }
}

async function fetchSamplePayload() {
  const payloadPath = getRenderPayloadPath();
  const response = await fetch(payloadPath, { cache: "no-store" });
  if (!response.ok) {
    throw new Error(`Không đọc được ${payloadPath}: ${response.status}`);
  }

  return response.json();
}

function getRenderPayloadPath() {
  if (window.location.pathname.includes("/templates/project-showcase-90s/")) {
    return ROOT_SAMPLE_PAYLOAD_PATH;
  }

  return WORKDIR_PAYLOAD_PATH;
}

function showScene(sceneId) {
  document.querySelectorAll(".scene").forEach((scene) => {
    scene.style.opacity = "";
    scene.style.pointerEvents = "";
    scene.classList.remove("active");
  });

  const normalizedSceneId = String(sceneId || "intro").replace(/^scene-/, "");
  const activeScene = document.getElementById(`scene-${normalizedSceneId}`);
  if (activeScene) {
    activeScene.classList.add("active");
  }
}

function registerHyperFramesTimeline() {
  if (window.__timelines && window.__timelines[COMPOSITION_ID]) {
    showScene(getActiveSceneType());
    return;
  }

  if (!window.gsap) {
    console.warn("GSAP chưa sẵn sàng, HyperFrames timeline không được đăng ký.");
    return;
  }

  const tl = window.gsap.timeline({ paused: true });
  const allSceneSelectors = SCENE_TIMELINE.map((scene) => `#${scene.id}`).join(", ");

  tl.set(allSceneSelectors, { opacity: 0, pointerEvents: "none" }, 0);

  SCENE_TIMELINE.forEach((scene) => {
    tl.set(`#${scene.id}`, { opacity: 1, pointerEvents: "auto" }, scene.start);
    tl.fromTo(
      `#${scene.id} .scene-label, #${scene.id} .scene-header, #${scene.id} .logo-box, #${scene.id} h1, #${scene.id} p, #${scene.id} .problem-box, #${scene.id} .solution-box, #${scene.id} .feature-item, #${scene.id} .timeline-node, #${scene.id} .impact-val, #${scene.id} .impact-desc, #${scene.id} .highlight-box, #${scene.id} .meta-box`,
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.04 },
      scene.start + 0.1
    );
    tl.set(`#${scene.id}`, { opacity: 0, pointerEvents: "none" }, scene.start + scene.duration);
  });

  window.__timelines = window.__timelines || {};
  window.__timelines[COMPOSITION_ID] = tl;
  showScene(getActiveSceneType());
}

function updateTemplatePayload(payload) {
  const safePayload = payload && typeof payload === "object" ? payload : createFallbackPayload();
  renderIntroScene(getScene(safePayload, "intro"), safePayload);
  renderProblemScene(getScene(safePayload, "problem"));
  renderSolutionScene(getScene(safePayload, "solution"));
  renderFeaturesScene(getScene(safePayload, "features"));
  renderTimelineScene(getScene(safePayload, "timeline"));
  renderImpactScene(getScene(safePayload, "impact"));
  renderOutroScene(getScene(safePayload, "outro"), safePayload);
  showScene(getActiveSceneType());
}

function renderIntroScene(scene, payload) {
  const content = scene.content || {};
  const source = payload.source || {};
  setText("intro-title", content.projectName || source.projectName || "Tên dự án");
  setText("intro-tagline", content.tagline || "Tagline giới thiệu dự án nội bộ");
  setText("intro-summary", content.summary || "Tóm tắt ngắn về giá trị dự án.");
  setText("intro-team", content.ownerTeam || source.ownerTeam || "Team phát triển");
  renderLogo("intro-logo", payload.assets && payload.assets.logo, source.projectName);
}

function renderProblemScene(scene) {
  const content = scene.content || {};
  setText("problem-content", content.problem || "Chưa có mô tả vấn đề.");
  setText("problem-users", content.targetUsers || "Người dùng nội bộ");
  setText("problem-use-case", content.useCase || "Use case chính của dự án");
}

function renderSolutionScene(scene) {
  const content = scene.content || {};
  setText("solution-content", content.solution || "Chưa có mô tả giải pháp.");
  setText("solution-highlight", content.keyHighlight || "Chưa có điểm nhấn chính.");
}

function renderFeaturesScene(scene) {
  const target = document.getElementById("features-list-target");
  clearChildren(target);

  const items = ((scene.content && scene.content.items) || []).slice(0, 4);
  if (items.length === 0) {
    target.appendChild(createEmptyCopy("Chưa chọn tính năng nào đưa vào video."));
    return;
  }

  items.forEach((feature, index) => {
    const item = createElement("article", "feature-item");
    item.appendChild(createElement("div", "feature-index", String(index + 1).padStart(2, "0")));
    item.appendChild(createElement("div", "feature-title", feature.title || "Tính năng chưa đặt tên"));
    item.appendChild(createElement("div", "feature-desc", feature.description || "Chưa có mô tả tính năng."));
    item.appendChild(createElement("div", "feature-benefit", feature.benefit || "Chưa có giá trị nổi bật."));
    target.appendChild(item);
  });
}

function renderTimelineScene(scene) {
  const target = document.getElementById("timeline-target");
  clearChildren(target);

  const milestones = ((scene.content && scene.content.milestones) || []).slice(0, 5);
  if (milestones.length === 0) {
    target.appendChild(createEmptyCopy("Chưa có mốc timeline phát triển nào."));
    return;
  }

  milestones.forEach((milestone, index) => {
    const item = createElement("article", `timeline-node status-${milestone.status || "upcoming"}`);
    item.appendChild(createElement("div", "node-dot", String(index + 1)));
    item.appendChild(createElement("div", "node-date", milestone.date || "Chưa có thời gian"));
    item.appendChild(createElement("div", "node-title", milestone.title || "Cột mốc chưa đặt tên"));
    item.appendChild(createElement("div", "node-status", getStatusLabel(milestone.status)));
    target.appendChild(item);
  });
}

function renderImpactScene(scene) {
  const content = scene.content || {};
  const resultImpact = content.resultImpact || "Mô tả kết quả đạt được cụ thể.";
  setText("impact-value", extractImpactMetric(resultImpact));
  setText("impact-description", resultImpact);
  setText("impact-highlight", content.highlight || "Chưa có điểm nhấn tác động.");
}

function renderOutroScene(scene, payload) {
  const content = scene.content || {};
  const source = payload.source || {};
  setText("outro-note", content.endingNote || "Cảm ơn đã theo dõi!");
  setText("outro-team", content.ownerTeam || source.ownerTeam || "Team phát triển");
  renderLogo("outro-logo", payload.assets && payload.assets.logo, source.projectName);
}

function getScene(payload, type) {
  const scenes = Array.isArray(payload.scenes) ? payload.scenes : [];
  return scenes.find((scene) => scene.type === type) || { type, content: {} };
}

function getActiveSceneType() {
  const activeScene = document.querySelector(".scene.active");
  if (!activeScene) {
    return "intro";
  }

  return activeScene.id.replace(/^scene-/, "");
}

function setText(id, value) {
  const element = document.getElementById(id);
  if (element) {
    element.textContent = value || "";
  }
}

function clearChildren(element) {
  if (!element) {
    return;
  }

  while (element.firstChild) {
    element.removeChild(element.firstChild);
  }
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function createEmptyCopy(text) {
  return createElement("p", "empty-copy", text);
}

function renderLogo(targetId, logo, projectName) {
  const target = document.getElementById(targetId);
  if (!target) {
    return;
  }

  clearChildren(target);
  target.removeAttribute("style");

  if (logo && logo.useInVideo && logo.url) {
    const image = document.createElement("img");
    image.src = logo.url;
    image.alt = logo.name || `${projectName || "Project"} logo`;
    target.appendChild(image);
    return;
  }

  target.textContent = getInitials(projectName || "HV");
}

function getInitials(value) {
  return String(value)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join("") || "HV";
}

function extractImpactMetric(text) {
  const value = String(text || "");
  const percentMatch = value.match(/(?:giảm|tăng|tiết kiệm|rút ngắn)?\s*\d+%[^.,;]*/i);
  if (percentMatch) {
    return percentMatch[0].trim();
  }

  return value.split(/\s+/).slice(0, 5).join(" ") || "Kết quả đạt được";
}

function getStatusLabel(status) {
  const labels = {
    completed: "Đã xong",
    active: "Đang làm",
    upcoming: "Sắp tới",
  };

  return labels[status] || "Sắp tới";
}

function createPayloadFromLegacyData(data) {
  const features = (data.features || [])
    .filter((feature) => feature.useInVideo !== false)
    .slice(0, 4)
    .map((feature, index) => ({
      id: feature.id || `legacy_feature_${index + 1}`,
      title: feature.title || feature.name || "Tính năng chưa đặt tên",
      description: feature.description || "",
      benefit: feature.benefit || feature.value || "",
    }));

  const milestones = (data.milestones || []).slice(0, 5).map((milestone, index) => ({
    id: milestone.id || `legacy_milestone_${index + 1}`,
    title: milestone.title || milestone.name || "Cột mốc chưa đặt tên",
    date: milestone.date || "",
    description: milestone.description || "",
    status: milestone.status || "upcoming",
  }));

  return {
    version: "1.0.0",
    source: {
      projectName: data.projectName || "Tên dự án",
      ownerTeam: data.ownerTeam || "Team phát triển",
    },
    assets: {
      logo: data.logo || null,
    },
    scenes: [
      {
        type: "intro",
        content: {
          projectName: data.projectName,
          tagline: data.tagline,
          ownerTeam: data.ownerTeam,
          summary: data.summary,
        },
      },
      {
        type: "problem",
        content: {
          problem: data.problemContext,
          targetUsers: data.targetUsers,
          useCase: data.useCase,
        },
      },
      {
        type: "solution",
        content: {
          solution: data.solutionWhat,
          keyHighlight: data.keyHighlight,
        },
      },
      { type: "features", content: { items: features } },
      { type: "timeline", content: { milestones } },
      {
        type: "impact",
        content: {
          resultImpact: data.resultImpact,
          highlight: data.keyHighlight,
        },
      },
      {
        type: "outro",
        content: {
          endingNote: data.endingNote,
          ownerTeam: data.ownerTeam,
        },
      },
    ],
  };
}

function createFallbackPayload() {
  return createPayloadFromLegacyData({
    projectName: "Tên dự án",
    tagline: "Tagline giới thiệu dự án nội bộ",
    ownerTeam: "Team phát triển",
    summary: "Tóm tắt ngắn về giá trị dự án.",
    problemContext: "Chưa có mô tả vấn đề.",
    solutionWhat: "Chưa có mô tả giải pháp.",
    resultImpact: "Kết quả đạt được",
    endingNote: "Cảm ơn đã theo dõi!",
  });
}
