/* UI Controller - DOM Operations and Screen Renderers */

const AppUI = (() => {
  // DOM Cache
  const DOM = {};
  const VOICE_ESTIMATE_BASE_WPM = 185;

  // Internal view states
  let templateRatioFilter = "9:16";
  let selectedScriptSegmentId = null;

  const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const escapeAttribute = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");

  const escapeText = (value) => String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");

  const renderIcon = (name, className = "") => {
    const icons = {
      palette: "fa-palette",
      grid: "fa-table-cells-large",
      layers: "fa-layer-group",
      plus: "fa-plus",
      pen: "fa-pen",
      trash: "fa-trash",
      text: "fa-font",
      shapes: "fa-shapes",
      image: "fa-image",
      list: "fa-list",
      tag: "fa-tag"
    };
    const icon = icons[name] || icons.grid;
    const extraClass = className ? ` ${escapeAttribute(className)}` : "";
    return `<i class="fa-solid ${icon} app-icon${extraClass}" aria-hidden="true"></i>`;
  };

  const SCENE_ITEM_COLOR_ROLES = [
    { id: "text", label: "Text", hint: "Chữ chính: title, label chính, CTA chính." },
    { id: "mutedText", label: "Muted text", hint: "Chữ phụ: description, note, caption." },
    { id: "accent", label: "Accent", hint: "Điểm nhấn: kicker, tag, CTA, highlight." }
  ];

  const SCENE_ITEM_DISPLAY_STYLES = [
    { id: "plain", label: "Plain", hint: "Không nền, không viền. Hợp với text/title/description." },
    { id: "surface", label: "Surface", hint: "Có nền surface và viền nhẹ. Hợp logo, card, list item." },
    { id: "outlined", label: "Outlined", hint: "Trong suốt hoặc nền rất nhẹ, nhấn bằng border." },
    { id: "filled", label: "Filled", hint: "Dùng nền nhấn mạnh từ accent/accent soft." },
    { id: "pill", label: "Pill", hint: "Badge/tag bo tròn." },
    { id: "media-frame", label: "Media frame", hint: "Khung ảnh/video có surface, border và crop media." }
  ];

  const getSceneItemAppearanceDefaults = (item = {}) => {
    const label = String(item.label || item.id || "").toLowerCase();
    const type = item.type || "text";

    if (type === "media") {
      return { colorRole: "accent", displayStyle: "media-frame" };
    }
    if (type === "asset") {
      return { colorRole: "accent", displayStyle: "surface" };
    }
    if (type === "list") {
      return { colorRole: "text", displayStyle: "surface" };
    }
    if (type === "tag") {
      return { colorRole: "accent", displayStyle: "pill" };
    }
    if (label.includes("description") || label.includes("note") || label.includes("caption")) {
      return { colorRole: "mutedText", displayStyle: "plain" };
    }
    if (label.includes("header") || label.includes("kicker") || label.includes("cta") || label.includes("call")) {
      return { colorRole: "accent", displayStyle: "plain" };
    }
    return { colorRole: "text", displayStyle: "plain" };
  };

  const getSceneItemColorRole = (roleId) => SCENE_ITEM_COLOR_ROLES.find((role) => role.id === roleId) || SCENE_ITEM_COLOR_ROLES[0];
  const getSceneItemDisplayStyle = (styleId) => SCENE_ITEM_DISPLAY_STYLES.find((style) => style.id === styleId) || SCENE_ITEM_DISPLAY_STYLES[0];

  const renderSceneItemPreview = (slot) => {
    if (slot.type === "asset") {
      return `<span class="scene-item-thumb-mark">${renderIcon("shapes")}</span>`;
    }
    if (slot.type === "media") {
      return `
        <span class="scene-item-media-mark">
          ${renderIcon("image")}
        </span>
      `;
    }
    if (slot.type === "list") {
      return `
        <span class="scene-item-list-mark">
          <span></span><span></span><span></span><span></span>
        </span>
      `;
    }
    if (slot.type === "tag") {
      return `<span class="scene-item-tag-mark"><span></span></span>`;
    }
    return `
      <span class="scene-item-text-mark">
        <span></span>
        <span></span>
      </span>
    `;
  };

  const getVideoStylePreset = (styleId) => {
    const styles = Array.isArray(VIDEO_STYLES) ? VIDEO_STYLES : [];
    return styles.find((style) => style.id === styleId) || styles[0] || null;
  };

  const getProjectSceneTemplates = (data = AppState.getProjectData()) => {
    const presets = Array.isArray(SCENE_TEMPLATES) ? SCENE_TEMPLATES : [];
    const customTemplates = Array.isArray(data && data.customSceneTemplates) ? data.customSceneTemplates : [];
    const merged = new Map();

    presets.forEach((template) => {
      if (template && template.id) {
        merged.set(template.id, template);
      }
    });
    customTemplates.forEach((template) => {
      if (template && template.id) {
        merged.set(template.id, {
          ...template,
          isCustomized: presets.some((preset) => preset.id === template.id)
        });
      }
    });

    return Array.from(merged.values());
  };

  const getSceneTemplateAspectRatios = (template) => {
    if (!template || typeof template !== "object") {
      return [];
    }

    const ratios = Array.isArray(template.supportedAspectRatios)
      ? template.supportedAspectRatios
      : template.aspectRatios;

    return Array.isArray(ratios) ? ratios.filter(Boolean) : [];
  };

  const getProjectSceneItemViews = (data = AppState.getProjectData()) => {
    const presets = Array.isArray(SCENE_ITEM_VIEW_PRESETS) ? SCENE_ITEM_VIEW_PRESETS : [];
    const customItems = Array.isArray(data && data.sceneItemViews) ? data.sceneItemViews : [];
    return [
      ...presets,
      ...customItems
    ].filter((item) => item && item.enabled !== false)
      .map((item) => {
        const appearance = getSceneItemAppearanceDefaults(item);
        return {
          ...item,
          colorRole: item.colorRole || appearance.colorRole,
          displayStyle: item.displayStyle || appearance.displayStyle
        };
      });
  };

  const clampSceneLayoutNumber = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));

  const getSceneSlotLayout = (slot, index = 0, ratio = "") => {
    if (slot && slot.layout && typeof slot.layout === "object") {
      const width = clampSceneLayoutNumber(slot.layout.width, 12, 100);
      const height = clampSceneLayoutNumber(slot.layout.height, 5, 100);
      return {
        x: clampSceneLayoutNumber(slot.layout.x, 0, 100 - width),
        y: clampSceneLayoutNumber(slot.layout.y, 0, 100 - height),
        width,
        height
      };
    }

    const label = String(slot && slot.label || "").toLowerCase();
    const type = slot && slot.type;
    const portraitPresets = [
      { x: 16, y: 24, width: 68, height: 7 },
      { x: 36, y: 34, width: 28, height: 10 },
      { x: 16, y: 47, width: 68, height: 7 },
      { x: 12, y: 58, width: 76, height: 20 },
      { x: 16, y: 82, width: 68, height: 7 }
    ];
    const landscapePresets = [
      { x: 10, y: 22, width: 36, height: 14 },
      { x: 10, y: 45, width: 36, height: 14 },
      { x: 52, y: 24, width: 36, height: 18 },
      { x: 52, y: 52, width: 36, height: 20 },
      { x: 10, y: 68, width: 36, height: 12 }
    ];
    const presets = ratio === "16:9" ? landscapePresets : portraitPresets;

    if (ratio === "16:9" && (type === "asset" || label.includes("logo"))) {
      return { x: 10, y: 22, width: 16, height: 18 };
    }
    if (ratio === "16:9" && (label.includes("header") || label.includes("kicker"))) {
      return { x: 30, y: 25, width: 30, height: 12 };
    }
    if (ratio === "16:9" && label.includes("title")) {
      return { x: 10, y: 45, width: 36, height: 14 };
    }
    if (ratio === "16:9" && type === "media") {
      return { x: 48, y: 22, width: 42, height: 48 };
    }
    if (ratio === "16:9" && type === "list") {
      return { x: 52, y: 36, width: 36, height: 20 };
    }
    if (ratio === "16:9" && (label.includes("description") || label.includes("note"))) {
      return { x: 10, y: 68, width: 38, height: 14 };
    }
    if (ratio === "16:9" && type === "tag") {
      return { x: 56, y: 66, width: 28, height: 12 };
    }
    if (type === "media") {
      return { x: 12, y: 58, width: 76, height: 20 };
    }
    if (type === "asset" || label.includes("logo")) {
      return { x: 36, y: 34, width: 28, height: 10 };
    }

    return presets[index] || {
      x: 16,
      y: Math.min(84, 22 + (index * 11)),
      width: 68,
      height: 7
    };
  };

  const getSceneSlotStyle = (slot, index = 0, ratio = "") => {
    const layout = getSceneSlotLayout(slot, index, ratio);
    return [
      `left:${layout.x}%`,
      `top:${layout.y}%`,
      `width:${layout.width}%`,
      `height:${layout.height}%`
    ].join(";");
  };

  const getSceneTemplateAspectClass = (template, ratio = "") => {
    if (ratio === "16:9") {
      return "is-landscape";
    }
    if (ratio === "9:16") {
      return "is-portrait";
    }
    const aspectRatios = getSceneTemplateAspectRatios(template);
    return aspectRatios.includes("16:9") && !aspectRatios.includes("9:16")
      ? "is-landscape"
      : "is-portrait";
  };

  const getVideoStyleOverride = (data, styleId) => {
    const overrides = data && data.videoStyleOverrides && typeof data.videoStyleOverrides === "object"
      ? data.videoStyleOverrides
      : {};
    return overrides[styleId] && typeof overrides[styleId] === "object" ? overrides[styleId] : {};
  };

  const resolveVideoStyle = (styleId, data = AppState.getProjectData()) => {
    const preset = getVideoStylePreset(styleId);
    if (!preset) {
      return null;
    }

    const override = getVideoStyleOverride(data, preset.id);
    return {
      ...preset,
      ...override,
      id: preset.id,
      name: preset.name,
      description: preset.description,
      aspectRatios: preset.aspectRatios,
      colorTheme: {
        ...(preset.colorTheme || {}),
        ...(override.colorTheme || {})
      },
      fontStyle: {
        ...(preset.fontStyle || {}),
        ...(override.fontStyle || {})
      },
      isCustomized: Boolean(Object.keys(override).length)
    };
  };

  const getStyleTemplateConfig = (styleId) => {
    if (styleId === "clean-report") {
      return { theme: "light", accentColor: "blue", fontSize: "default", logoPosition: "top-left" };
    }
    if (styleId === "product-demo") {
      return { theme: "dark", accentColor: "green", fontSize: "default", logoPosition: "top-left" };
    }
    return { theme: "dark", accentColor: "blue", fontSize: "default", logoPosition: "top-left" };
  };

  const isLightHexColor = (value) => {
    const hex = String(value || "").replace("#", "");
    if (!/^[0-9a-f]{6}$/i.test(hex)) {
      return false;
    }

    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    return ((red * 299) + (green * 587) + (blue * 114)) / 1000 > 180;
  };

  const normalizeHexColor = (value, fallback = "#000000") => {
    const raw = String(value || "").trim();
    const normalized = raw.startsWith("#") ? raw : `#${raw}`;
    if (/^#[0-9a-f]{6}$/i.test(normalized)) {
      return normalized.toUpperCase();
    }

    return fallback.toUpperCase();
  };

  const parseCssColorOpacity = (value, fallbackHex = "#22D3EE", fallbackOpacity = 0.28) => {
    const text = String(value || "").trim();
    const hexMatch = text.match(/^#([0-9a-f]{6})$/i);
    if (hexMatch) {
      return { hex: `#${hexMatch[1]}`.toUpperCase(), opacity: fallbackOpacity };
    }

    const rgbaMatch = text.match(/^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)$/i);
    if (!rgbaMatch) {
      return { hex: normalizeHexColor(fallbackHex, "#22D3EE"), opacity: fallbackOpacity };
    }

    const red = Math.min(255, Math.max(0, Number.parseInt(rgbaMatch[1], 10) || 0));
    const green = Math.min(255, Math.max(0, Number.parseInt(rgbaMatch[2], 10) || 0));
    const blue = Math.min(255, Math.max(0, Number.parseInt(rgbaMatch[3], 10) || 0));
    const opacity = Math.min(1, Math.max(0, Number.parseFloat(rgbaMatch[4] || String(fallbackOpacity))));
    const hex = `#${[red, green, blue].map((part) => part.toString(16).padStart(2, "0")).join("")}`;
    return { hex: hex.toUpperCase(), opacity };
  };

  const hexToRgba = (hexValue, opacityValue) => {
    const hex = normalizeHexColor(hexValue, "#22D3EE").replace("#", "");
    const opacity = Math.min(1, Math.max(0, Number.parseFloat(opacityValue) || 0));
    const red = Number.parseInt(hex.slice(0, 2), 16);
    const green = Number.parseInt(hex.slice(2, 4), 16);
    const blue = Number.parseInt(hex.slice(4, 6), 16);
    return `rgba(${red}, ${green}, ${blue}, ${Math.round(opacity * 100) / 100})`;
  };

  const applyStylePreviewVariables = (root, style) => {
    if (!root || !style || !style.colorTheme) {
      return;
    }

    const theme = style.colorTheme;
    root.style.setProperty("--style-bg", theme.background || "#05070a");
    root.style.setProperty("--style-surface", theme.surface || "#101722");
    root.style.setProperty("--style-surface-alt", theme.surfaceAlt || theme.surface || "#162033");
    root.style.setProperty("--style-text", theme.text || "#f8fafc");
    root.style.setProperty("--style-muted", theme.mutedText || "#94a3b8");
    root.style.setProperty("--style-accent", theme.accent || "#22d3ee");
    root.style.setProperty("--style-accent-soft", theme.accentSoft || theme.accent || "#164e63");
    root.style.setProperty("--style-border", theme.border || "#1e3a5f");
    root.style.setProperty("--style-glow", theme.glow || "rgba(34, 211, 238, 0.28)");
  };

  const parseVoiceRatePercent = (value) => {
    const parsed = Number.parseInt(String(value || "0").replace("%", ""), 10);
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const countVoiceWords = (value) => {
    const text = normalizeText(value);
    if (!text) {
      return 0;
    }

    return (text.match(/[\p{L}\p{N}]+(?:['’-][\p{L}\p{N}]+)*/gu) || []).length;
  };

  const estimateVoiceDurationSeconds = (script, rateValue) => {
    const words = countVoiceWords(script);
    if (words === 0) {
      return 0;
    }

    const ratePercent = parseVoiceRatePercent(rateValue);
    const wordsPerMinute = Math.max(80, VOICE_ESTIMATE_BASE_WPM * (1 + ratePercent / 100));
    return Math.round((words / wordsPerMinute) * 60 * 10) / 10;
  };

  const getVoiceFitStatus = (voiceSeconds, sceneSeconds) => {
    if (voiceSeconds === 0) {
      return {
        className: "is-short",
        label: "Chưa có lời đọc",
        message: "Nhập voice script để ước lượng thời lượng đọc cho scene này."
      };
    }

    const minUsefulSeconds = Math.max(2, sceneSeconds * 0.45);
    const maxUsefulSeconds = sceneSeconds + 1;

    if (voiceSeconds > maxUsefulSeconds) {
      return {
        className: "is-long",
        label: "Quá dài",
        message: "Lời đọc đang dài hơn thời lượng scene. Nên rút gọn hoặc tăng thời lượng scene."
      };
    }

    if (voiceSeconds < minUsefulSeconds) {
      return {
        className: "is-short",
        label: "Hơi ngắn",
        message: "Lời đọc khá ngắn so với scene. Có thể thêm ý hoặc giảm thời lượng scene."
      };
    }

    return {
      className: "is-fit",
      label: "Vừa",
      message: "Lời đọc đang khớp ổn với thời lượng scene."
    };
  };

  const initDOM = () => {
    DOM.themeToggle = document.getElementById("theme-toggle");
    DOM.saveStatus = document.getElementById("save-status");
    DOM.topbarProjectName = document.getElementById("topbar-project-name");
    DOM.topbarRenderBtn = document.getElementById("topbar-render-btn");
    DOM.sidebar = document.getElementById("sidebar");
    DOM.mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
    DOM.toastContainer = document.getElementById("toast-container");
    DOM.modalContainer = document.getElementById("modal-container");
    DOM.modalTitle = document.getElementById("modal-title");
    DOM.modalBody = document.getElementById("modal-body");
    DOM.modalFooter = document.getElementById("modal-footer");
    DOM.modalClose = document.getElementById("modal-close");
    DOM.tabsContent = document.getElementById("workspace-tabs-content");
    DOM.html = document.documentElement;

    // Badges Sidebar
    DOM.badges = {
      content: document.getElementById("badge-content"),
      features: document.getElementById("badge-features"),
      timeline: document.getElementById("badge-timeline"),
      assets: document.getElementById("badge-assets"),
      template: document.getElementById("badge-template"),
      render: document.getElementById("badge-render")
    };
  };

  // Toast Helper
  const showToast = (message, type = "success") => {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <span class="toast-content">${message}</span>
      <button class="toast-close">&times;</button>
    `;
    DOM.toastContainer.appendChild(toast);

    toast.querySelector(".toast-close").addEventListener("click", () => {
      toast.remove();
    });

    setTimeout(() => {
      toast.style.animation = "toastEnter 0.2s reverse forwards";
      setTimeout(() => toast.remove(), 200);
    }, 4000);
  };

  // Modal Helper
  const showModal = (title, bodyContent, buttons = []) => {
    DOM.modalContainer.classList.remove("is-style-editor");
    DOM.modalContainer.classList.remove("is-scene-template-editor");
    DOM.modalTitle.textContent = title;
    DOM.modalBody.innerHTML = typeof bodyContent === 'string' ? `<p>${bodyContent}</p>` : "";
    if (typeof bodyContent === 'object') {
      DOM.modalBody.appendChild(bodyContent);
    }

    DOM.modalFooter.innerHTML = "";
    if (buttons.length === 0) {
      buttons = [{ text: "Đóng", class: "btn-secondary", onClick: closeModal }];
    }

    buttons.forEach(btn => {
      const button = document.createElement("button");
      button.className = `btn ${btn.class || 'btn-secondary'}`;
      button.textContent = btn.text;
      button.addEventListener("click", () => {
        btn.onClick();
      });
      DOM.modalFooter.appendChild(button);
    });

    DOM.modalContainer.classList.remove("d-none");
  };

  const closeModal = () => {
    DOM.modalContainer.classList.add("d-none");
    DOM.modalContainer.classList.remove("is-style-editor");
    DOM.modalContainer.classList.remove("is-scene-template-editor");
  };

  // Switch App Tab
  const switchTab = (tabId) => {
    // Close mobile sidebars on transition
    DOM.sidebar.classList.remove("mobile-open");

    const currentPage = document.body.getAttribute("data-page");
    if (currentPage === tabId) {
      renderScreen(tabId);
      return;
    }

    window.location.href = AppNavigation.getPageUrl(tabId);
  };

  // Render specific view
  const renderScreen = (tabId) => {
    if (typeof AppNavigation !== "undefined") {
      AppNavigation.setActiveNav(tabId);
    }

    const data = AppState.getProjectData();
    const container = document.getElementById(`view-${tabId}`);
    if (!container) return;

    switch (tabId) {
      case "overview":
        renderOverviewScreen(container, data);
        break;
      case "content":
        renderContentScreen(container, data);
        break;
      case "features":
        renderFeaturesScreen(container, data);
        break;
      case "timeline":
        renderTimelineScreen(container, data);
        break;
      case "assets":
        renderAssetsScreen(container, data);
        break;
      case "template":
        renderTemplateScreen(container, data);
        break;
      case "preview":
        renderPreviewScreen(container, data);
        break;
      case "render":
        renderRenderScreen(container, data);
        break;
      case "outputs":
        renderOutputsScreen(container, data);
        break;
      case "settings":
        renderSettingsScreen(container, data);
        break;
    }
  };

  // ================= VIEW RENDERERS =================

  // 1. Overview View
  const renderOverviewScreen = (container, data) => {
    // Quick checks
    const checkBasic = (data.projectName && data.shortSummary) ? "success" : "danger";
    const checkFeatures = (data.features || []).filter(f => f.useInVideo).length >= 3 ? "success" : "warning";
    const checkAssets = (data.assets || []).some(a => ["logo", "screenshot", "video"].includes(a.type) && a.useInVideo) ? "success" : "warning";
    const checkTemplate = data.templateId ? "success" : "danger";

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Tổng quan video</h1>
      </div>
      <div class="grid-2 mb-6">
        <div class="card">
          <div class="card-header">
            <h3>Thông tin chung</h3>
            <button id="overview-edit-btn" class="btn btn-secondary btn-sm">Sửa brief</button>
          </div>
          <div class="card-body">
            <p class="mb-2"><strong>Chủ đề video:</strong> ${data.projectName || '<span class="text-danger">Chưa nhập</span>'}</p>
            <p class="mb-2"><strong>Mô tả ngắn:</strong> ${data.shortSummary || '<span class="text-danger">Chưa nhập</span>'}</p>
            <p class="mb-2"><strong>Ngữ cảnh/team:</strong> ${data.ownerTeam || '<span class="text-subtle">Không có</span>'}</p>
            <p class="mb-2"><strong>Template đang chọn:</strong> ${TEMPLATES_LIST.find(t => t.id === data.templateId)?.name || 'Chưa chọn'}</p>
            <p class="mb-2"><strong>Trạng thái dự án:</strong> <span class="status-pill status-info">Cục bộ</span></p>
          </div>
        </div>

        <div class="card">
          <div class="card-header">
            <h3>Kiểm tra sức khỏe Video</h3>
          </div>
          <div class="card-body" style="display:flex; flex-direction:column; gap: var(--space-3);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Brief cốt lõi</span>
              <span class="status-pill status-${checkBasic}">${checkBasic === 'success' ? 'Đủ' : 'Thiếu'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Số đoạn kịch bản đang dùng (3-6)</span>
              <span class="status-pill status-${checkFeatures}">${checkFeatures === 'success' ? 'Đủ' : 'Cần thêm'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Asset hình ảnh/video</span>
              <span class="status-pill status-${checkAssets}">${checkAssets === 'success' ? 'Đã chọn' : 'Nên thêm'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Chọn Template Video</span>
              <span class="status-pill status-${checkTemplate}">${checkTemplate === 'success' ? 'Đã chọn' : 'Chưa chọn'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--color-border); padding-top: var(--space-2); margin-top: var(--space-1); font-weight:600;">
              <span>Trạng thái sẵn sàng render</span>
              <span class="status-pill status-info">Kiểm tra ở Render</span>
            </div>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Hành động nhanh</h3>
        </div>
        <div class="card-body" style="display:flex; gap: var(--space-3); flex-wrap: wrap;">
          <button id="quick-fill-btn" class="btn btn-secondary">Tải dữ liệu mẫu thử nghiệm</button>
          <button id="quick-preview-btn" class="btn btn-secondary">Xem trước scene (16:9)</button>
          <button id="quick-render-btn" class="btn btn-primary">Đi tới Render Video</button>
        </div>
      </div>
    `;

    // Event Handlers
    document.getElementById("overview-edit-btn").addEventListener("click", () => AppState.setTab("content"));
    document.getElementById("quick-fill-btn").addEventListener("click", async () => {
      const sample = await AppStorage.loadSampleData();
      AppState.setProjectData(sample);
      renderOverviewScreen(container, AppState.getProjectData());
      showToast("Đã tải dữ liệu mẫu thành công!");
    });
    document.getElementById("quick-preview-btn").addEventListener("click", () => AppState.setTab("preview"));
    document.getElementById("quick-render-btn").addEventListener("click", () => AppState.setTab("render"));
  };

  // 2. Content Form View
  const renderContentScreen = (container, data) => {
    const voiceoverLanguages = Array.isArray(VOICEOVER_LANGUAGES) ? VOICEOVER_LANGUAGES : [];
    const voiceoverVoices = VOICEOVER_VOICES || {};
    const savedAudio = data.audio || {};
    const savedVoiceover = savedAudio.voiceover || {};
    const selectedVoiceLanguage = voiceoverVoices[savedVoiceover.language] ? savedVoiceover.language : "vi-VN";
    const selectedVoiceList = voiceoverVoices[selectedVoiceLanguage] || [];
    const selectedVoiceId = selectedVoiceList.some((voice) => voice.id === savedVoiceover.voiceId)
      ? savedVoiceover.voiceId
      : (selectedVoiceList[0] && selectedVoiceList[0].id) || "vi-VN-HoaiMyNeural";
    const parsePercentValue = (value, fallback = 0) => {
      const match = String(value || "").match(/^([+-]?\d+)%$/);
      return match ? Number.parseInt(match[1], 10) : fallback;
    };
    const selectedVoiceRate = Math.min(50, Math.max(-30, parsePercentValue(savedVoiceover.rate, 0)));
    const selectedVoiceVolume = Math.min(50, Math.max(-50, parsePercentValue(savedVoiceover.volume, 0)));
    const formatPercentValue = (value) => {
      const numericValue = Number.parseInt(value, 10) || 0;
      return `${numericValue >= 0 ? "+" : ""}${numericValue}%`;
    };
    const contentTypes = Array.isArray(VIDEO_CONTENT_TYPES) ? VIDEO_CONTENT_TYPES : [];
    const videoTones = Array.isArray(VIDEO_TONES) ? VIDEO_TONES : [];
    const renderFormats = Array.isArray(RENDER_FORMATS) ? RENDER_FORMATS : [];
    const projectAssets = Array.isArray(data.assets) ? data.assets : [];
    const selectedContentType = data.contentType || "feature";
    const selectedTone = data.contentTone || "technical";
    const selectedLanguage = data.contentLanguage || (savedVoiceover.language || "vi-VN");
    const selectedPrimaryAssetId = data.primaryAssetId || "";
    const selectedVideoConfig = data.video || {};
    const selectedVideoFormat = renderFormats.find((format) => format.id === selectedVideoConfig.formatId)
      || renderFormats.find((format) => format.templateId === data.templateId)
      || renderFormats.find((format) => format.id === "dynamic-story-vertical")
      || renderFormats[0];
    const selectedVideoFormatId = selectedVideoFormat ? selectedVideoFormat.id : "dynamic-story-vertical";
    const selectedVideoFps = Number(selectedVideoConfig.fps) === 60 ? 60 : 30;
    const selectedOutputFilename = selectedVideoConfig.outputFilename || `${data.projectSlug || "project"}_video.mp4`;

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Thiết lập video</h1>
        <div style="display:flex; gap: var(--space-2);">
          <button id="content-fill-btn" class="btn btn-secondary">Tải dữ liệu mẫu</button>
          <button id="content-clear-btn" class="btn btn-secondary">Xóa form</button>
          <button id="content-save-btn" class="btn btn-primary">Lưu nháp</button>
        </div>
      </div>

      <form id="content-form" class="page-form-stack">
        <div class="render-voiceover-panel">
          <div class="render-voiceover-header">
            <div>
              <div class="render-voiceover-title">Voiceover toàn video</div>
              <div class="render-voiceover-desc">Thiết lập giọng đọc mặc định. Nội dung đọc chi tiết sẽ nằm trong từng đoạn ở trang Kịch bản.</div>
            </div>
            <label class="render-voiceover-toggle">
              <input id="render-voiceover-enabled" type="checkbox" ${savedVoiceover.enabled ? "checked" : ""}>
              <span class="render-voiceover-switch" aria-hidden="true"></span>
              <span class="render-voiceover-toggle-text">Bật voice</span>
            </label>
          </div>

          <div class="render-voiceover-controls">
            <div class="form-group">
              <label class="form-label" for="render-voiceover-language">Ngôn ngữ</label>
              <div class="form-hint">Ngôn ngữ dùng để chọn bộ giọng đọc phù hợp.</div>
              <select id="render-voiceover-language" class="form-control">
                ${voiceoverLanguages.map((language) => `
                  <option value="${language.id}" ${language.id === selectedVoiceLanguage ? "selected" : ""}>${language.label}</option>
                `).join("")}
              </select>
            </div>
            <div class="form-group render-voiceover-voice-field">
              <label class="form-label" for="render-voiceover-voice">Giọng đọc</label>
              <div class="form-hint">Giọng sẽ đọc toàn bộ voiceover của video.</div>
              <select id="render-voiceover-voice" class="form-control">
                ${selectedVoiceList.map((voice) => `
                  <option value="${voice.id}" ${voice.id === selectedVoiceId ? "selected" : ""}>${voice.label}</option>
                `).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="render-voiceover-rate">Tốc độ đọc <span id="render-voiceover-rate-value">${formatPercentValue(selectedVoiceRate)}</span></label>
              <div class="form-hint">Điều chỉnh tốc độ đọc áp dụng cho toàn bộ video.</div>
              <input id="render-voiceover-rate" class="render-voiceover-range" type="range" min="-30" max="50" step="5" value="${selectedVoiceRate}">
            </div>
            <div class="form-group">
              <label class="form-label" for="render-voiceover-volume">Âm lượng <span id="render-voiceover-volume-value">${formatPercentValue(selectedVoiceVolume)}</span></label>
              <div class="form-hint">Điều chỉnh âm lượng voiceover trước khi ghép vào video.</div>
              <input id="render-voiceover-volume" class="render-voiceover-range" type="range" min="-50" max="50" step="5" value="${selectedVoiceVolume}">
            </div>
          </div>

        </div>

        <section class="content-form-block">
          <div class="content-form-block-header">
            <h3>Brief video</h3>
            <p>Thông tin chung để template hiểu video đang nói về nội dung gì.</p>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="field-contentType">Loại nội dung</label>
              <div class="form-hint">Dùng để định hướng template và kịch bản ở các phase sau.</div>
              <select id="field-contentType" class="form-control">
                ${contentTypes.map((type) => `
                  <option value="${type.id}" ${type.id === selectedContentType ? "selected" : ""}>${type.label}</option>
                `).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="field-projectName">Chủ đề video *</label>
              <div class="form-hint">Tên nội dung đang được giới thiệu: tính năng, module, workflow, dashboard hoặc báo cáo.</div>
              <input type="text" id="field-projectName" class="form-control" value="${data.projectName || ''}">
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="field-videoFormatId">Tỷ lệ video</label>
              <div class="form-hint">Cấu hình này quyết định template, độ phân giải và bố cục preview/render.</div>
              <select id="field-videoFormatId" class="form-control">
                ${renderFormats.map((format) => `
                  <option value="${format.id}" ${format.id === selectedVideoFormatId ? "selected" : ""}>${format.label}</option>
                `).join("")}
              </select>
            </div>
            <div class="form-group">
              <label class="form-label" for="field-videoFps">Số khung hình (FPS)</label>
              <div class="form-hint">FPS cao mượt hơn nhưng render lâu và nặng máy hơn.</div>
              <select id="field-videoFps" class="form-control">
                <option value="30" ${selectedVideoFps === 30 ? "selected" : ""}>30 FPS (Mượt mà, ít tốn tài nguyên)</option>
                <option value="60" ${selectedVideoFps === 60 ? "selected" : ""}>60 FPS (Mượt hơn, render lâu hơn)</option>
              </select>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="field-projectSlug">Mã video *</label>
              <div class="form-hint">Mã ngắn dùng để đặt tên file và định danh nội dung video.</div>
              <input type="text" id="field-projectSlug" class="form-control" value="${data.projectSlug || ''}" placeholder="ví dụ: internal-analytics-dashboard">
            </div>
            <div class="form-group">
              <label class="form-label" for="field-outputFilename">Tên tệp tin đầu ra</label>
              <div class="form-hint">Tên file MP4 sau khi render thành công.</div>
              <input type="text" id="field-outputFilename" class="form-control" value="${selectedOutputFilename}">
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="field-contentLanguage">Ngôn ngữ nội dung</label>
              <div class="form-hint">Ngôn ngữ chính của text và voice script.</div>
              <select id="field-contentLanguage" class="form-control">
                ${voiceoverLanguages.map((language) => `
                  <option value="${language.id}" ${language.id === selectedLanguage ? "selected" : ""}>${language.label}</option>
                `).join("")}
              </select>
            </div>
          </div>

          <div class="grid-2">
            <div class="form-group">
              <label class="form-label" for="field-tagline">Tagline</label>
              <div class="form-hint">Một câu ngắn tóm tắt giá trị chính của nội dung video.</div>
              <input type="text" id="field-tagline" class="form-control" value="${data.tagline || ''}" placeholder="Câu tóm tắt ngắn dưới 80 chữ...">
              <span class="char-counter"><span id="count-tagline">0</span>/80 ký tự</span>
            </div>
            <div class="form-group">
              <label class="form-label" for="field-contentTone">Tone trình bày</label>
              <div class="form-hint">Phong cách trình bày dùng cho script và template sau này.</div>
              <select id="field-contentTone" class="form-control">
                ${videoTones.map((tone) => `
                  <option value="${tone.id}" ${tone.id === selectedTone ? "selected" : ""}>${tone.label}</option>
                `).join("")}
              </select>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label" for="field-shortSummary">Mô tả ngắn *</label>
            <div class="form-hint">Mô tả ngắn về video. Chi tiết từng ý sẽ nhập ở trang Kịch bản.</div>
            <textarea id="field-shortSummary" class="form-control" rows="3" placeholder="Tóm tắt bối cảnh tổng quát...">${data.shortSummary || ''}</textarea>
            <span class="char-counter"><span id="count-shortSummary">0</span>/200 ký tự</span>
          </div>

          <div class="form-group">
            <label class="form-label" for="field-primaryAssetId">Asset chính</label>
            <div class="form-hint">Ảnh/logo/video mặc định để template ưu tiên dùng trước.</div>
            <select id="field-primaryAssetId" class="form-control">
              <option value="">Chưa chọn asset chính</option>
              ${projectAssets.map((asset) => `
                <option value="${asset.id}" ${asset.id === selectedPrimaryAssetId ? "selected" : ""}>${asset.name || asset.id}</option>
              `).join("")}
            </select>
          </div>
        </section>
      </form>
    `;

    // Char counter binding helpers
    const bindCounter = (id, max) => {
      const el = document.getElementById(`field-${id}`);
      const counter = document.getElementById(`count-${id}`);
      if (!el || !counter) return;

      const update = () => {
        counter.textContent = el.value.length;
        if (el.value.length > max) {
          counter.style.color = 'var(--color-danger)';
        } else {
          counter.style.color = 'var(--color-text-subtle)';
        }
      };

      el.addEventListener("input", () => {
        AppState.updateProjectField(id, el.value);
        update();
      });

      update();
    };

    bindCounter("tagline", 80);
    bindCounter("shortSummary", 200);

    const voiceoverEnabledInput = document.getElementById("render-voiceover-enabled");
    const voiceoverLanguageInput = document.getElementById("render-voiceover-language");
    const voiceoverVoiceInput = document.getElementById("render-voiceover-voice");
    const voiceoverRateInput = document.getElementById("render-voiceover-rate");
    const voiceoverRateValue = document.getElementById("render-voiceover-rate-value");
    const voiceoverVolumeInput = document.getElementById("render-voiceover-volume");
    const voiceoverVolumeValue = document.getElementById("render-voiceover-volume-value");

    const getVoiceOptionsHTML = (language) => {
      return (voiceoverVoices[language] || voiceoverVoices["vi-VN"] || []).map((voice) => {
        return `<option value="${voice.id}">${voice.label}</option>`;
      }).join("");
    };

    const saveVoiceoverSettings = () => {
      const audio = {
        ...(AppState.getProjectData().audio || {}),
        voiceover: {
          enabled: Boolean(voiceoverEnabledInput && voiceoverEnabledInput.checked),
          provider: "edge-tts",
          language: voiceoverLanguageInput ? voiceoverLanguageInput.value : "vi-VN",
          voiceId: voiceoverVoiceInput ? voiceoverVoiceInput.value : "vi-VN-HoaiMyNeural",
          rate: voiceoverRateInput ? formatPercentValue(voiceoverRateInput.value) : "+0%",
          volume: voiceoverVolumeInput ? formatPercentValue(voiceoverVolumeInput.value) : "+0%",
          script: "",
          outputPath: ""
        }
      };
      AppState.updateProjectField("audio", audio);
    };

    const syncVoiceoverRangeLabels = () => {
      if (voiceoverRateInput && voiceoverRateValue) {
        voiceoverRateValue.textContent = formatPercentValue(voiceoverRateInput.value);
      }
      if (voiceoverVolumeInput && voiceoverVolumeValue) {
        voiceoverVolumeValue.textContent = formatPercentValue(voiceoverVolumeInput.value);
      }
    };

    if (voiceoverLanguageInput && voiceoverVoiceInput) {
      voiceoverLanguageInput.addEventListener("change", () => {
        voiceoverVoiceInput.innerHTML = getVoiceOptionsHTML(voiceoverLanguageInput.value);
        saveVoiceoverSettings();
      });
    }

    [voiceoverEnabledInput, voiceoverVoiceInput, voiceoverRateInput, voiceoverVolumeInput].forEach((input) => {
      if (!input) return;
      input.addEventListener(input.type === "range" || input.tagName === "TEXTAREA" ? "input" : "change", () => {
        syncVoiceoverRangeLabels();
        saveVoiceoverSettings();
      });
    });

    const videoFormatInput = document.getElementById("field-videoFormatId");
    const videoFpsInput = document.getElementById("field-videoFps");
    const outputFilenameInput = document.getElementById("field-outputFilename");
    const saveVideoSettings = () => {
      const selectedFormat = renderFormats.find((format) => format.id === (videoFormatInput && videoFormatInput.value)) || renderFormats[0];
      const fps = Number.parseInt(videoFpsInput ? videoFpsInput.value : "30", 10) === 60 ? 60 : 30;
      AppState.updateProjectField("video", {
        formatId: selectedFormat ? selectedFormat.id : "dynamic-story-vertical",
        fps,
        outputFilename: outputFilenameInput ? outputFilenameInput.value.trim() : ""
      });
      if (selectedFormat) {
        AppState.updateProjectField("templateId", selectedFormat.templateId);
      }
    };

    [videoFormatInput, videoFpsInput, outputFilenameInput].forEach((input) => {
      if (!input) return;
      input.addEventListener(input.tagName === "INPUT" ? "input" : "change", saveVideoSettings);
    });

    // Other inputs binding
    const bindSimpleInput = (id) => {
      const el = document.getElementById(`field-${id}`);
      if (el) {
        el.addEventListener("input", () => {
          AppState.updateProjectField(id, el.value);
        });
      }
    };

    ["projectName", "projectSlug"].forEach(id => {
      bindSimpleInput(id);
    });

    const bindSimpleSelect = (id) => {
      const el = document.getElementById(`field-${id}`);
      if (el) {
        el.addEventListener("change", () => {
          AppState.updateProjectField(id, el.value);
        });
      }
    };

    ["contentType", "contentLanguage", "contentTone", "primaryAssetId"].forEach(id => {
      bindSimpleSelect(id);
    });

    // Action buttons click handler
    document.getElementById("content-fill-btn").addEventListener("click", async () => {
      const sample = await AppStorage.loadSampleData();
      AppState.setProjectData(sample);
      renderContentScreen(container, sample);
      showToast("Đã điền dữ liệu mẫu!");
    });

    document.getElementById("content-clear-btn").addEventListener("click", () => {
      showModal(
        "Xác nhận xóa form",
        "Bạn có chắc muốn xóa sạch toàn bộ nội dung của form? Thao tác này không thể khôi phục.",
        [
          { text: "Hủy", class: "btn-secondary", onClick: closeModal },
          {
            text: "Xóa sạch",
            class: "btn-danger",
            onClick: () => {
              AppStorage.clearLocalData();
              renderContentScreen(container, AppState.getProjectData());
              closeModal();
              showToast("Đã xóa sạch form nhập liệu", "info");
            }
          }
        ]
      );
    });

    document.getElementById("content-save-btn").addEventListener("click", () => {
      AppStorage.saveLocalData(data);
              showToast("Đã lưu nháp video thành công!");
    });
  };

  // 3. Script Manager View
  const renderFeaturesScreen = (container, data) => {
    const list = data.features || [];
    const segmentTypes = Array.isArray(VIDEO_SEGMENT_TYPES) ? VIDEO_SEGMENT_TYPES : [];
    const getSegmentType = (typeId) => segmentTypes.find((type) => type.id === typeId) || segmentTypes.find((type) => type.id === "feature") || { id: "feature", label: "Tính năng" };
    const enabledCount = list.filter((item) => item.useInVideo).length;
    const voiceCount = list.filter((item) => String(item.voiceoverScript || "").trim()).length;
    const scriptDisplayMode = data.scriptDisplayMode === "stack" ? "stack" : "sequence";
    const currentVoiceover = (data.audio && data.audio.voiceover) || {};
    const currentVoiceRate = currentVoiceover.rate || "+0%";
    const sceneTemplates = getProjectSceneTemplates(data);
    const slotTypes = Array.isArray(SCENE_SLOT_TYPES) ? SCENE_SLOT_TYPES : [];
    const slotAnimations = Array.isArray(SCENE_SLOT_ANIMATIONS) ? SCENE_SLOT_ANIMATIONS : [];
    const estimatedDuration = list
      .filter((item) => item.useInVideo)
      .reduce((total, item) => total + (Number.parseInt(item.durationSec, 10) || 8), 0);
    const escapeText = (value) => String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
    const getSceneTemplate = (templateId) => sceneTemplates.find((template) => template.id === templateId)
      || sceneTemplates.find((template) => template.id === data.defaultSceneTemplateId)
      || sceneTemplates[0]
      || null;
    const getSlotTypeLabel = (typeId) => {
      const slotType = slotTypes.find((type) => type.id === typeId);
      return slotType ? slotType.label : typeId;
    };
    const getAnimationLabel = (animationId) => {
      const animation = slotAnimations.find((item) => item.id === animationId);
      return animation ? animation.label : animationId;
    };
    const getDefaultSlotValue = (slot, feature = {}) => {
      const primaryAssetId = data.primaryAssetId || ((data.assets || [])[0] && (data.assets || [])[0].id) || "";
      const base = {
        type: slot.type,
        delay: Number.isFinite(slot.defaultDelay) ? slot.defaultDelay : 0,
        animation: (slot.allowedAnimations && slot.allowedAnimations[0]) || "fade-up",
        enabled: slot.required ? true : true
      };

      if (slot.type === "asset" || slot.type === "media") {
        return { ...base, assetId: primaryAssetId };
      }
      if (slot.type === "list") {
        const fallbackItems = [feature.name, feature.description, feature.benefit]
          .map((value) => String(value || "").trim())
          .filter(Boolean)
          .slice(0, 4);
        return { ...base, items: fallbackItems };
      }
      if (slot.id === "title") {
        return { ...base, text: feature.name || "" };
      }
      if (slot.id === "description") {
        return { ...base, text: feature.description || "" };
      }
      if (slot.id === "tag" || slot.id === "kicker" || slot.id === "header" || slot.id === "cta") {
        return { ...base, text: feature.benefit || feature.type || "" };
      }
      return { ...base, text: "" };
    };
    const normalizeSegmentSlots = (feature = {}, templateId) => {
      const template = getSceneTemplate(templateId);
      if (!template) {
        return {};
      }

      return template.slots.reduce((normalized, slot) => {
        const existing = feature.slots && feature.slots[slot.id] ? feature.slots[slot.id] : {};
        const fallback = getDefaultSlotValue(slot, feature);
        const delay = Number.parseFloat(existing.delay);

        normalized[slot.id] = {
          ...fallback,
          ...existing,
          type: slot.type,
          delay: Number.isFinite(delay) ? Math.max(0, delay) : fallback.delay,
          animation: existing.animation || fallback.animation,
          enabled: slot.required ? true : existing.enabled !== false
        };
        return normalized;
      }, {});
    };
    const getAssetLabel = (assetId) => {
      const asset = (data.assets || []).find((item) => item.id === assetId);
      return asset ? (asset.name || asset.id) : assetId;
    };
    const getSlotValueSummary = (slot, value = {}) => {
      if (value.enabled === false) {
        return "Đang tắt";
      }
      if (slot.type === "asset" || slot.type === "media") {
        return value.assetId ? getAssetLabel(value.assetId) : "Chưa chọn tài nguyên";
      }
      if (slot.type === "list") {
        const items = Array.isArray(value.items) ? value.items.filter(Boolean) : [];
        return items.length ? `${items.length} item` : "Chưa có item";
      }
      return value.text ? value.text : "Chưa có nội dung";
    };
    const validateRequiredSlotValues = (template, slots) => {
      if (!template) {
        return [];
      }

      return template.slots.filter((slot) => {
        if (!slot.required) {
          return false;
        }
        const value = slots[slot.id] || {};
        if (value.enabled === false) {
          return true;
        }
        if (slot.type === "asset" || slot.type === "media") {
          return !value.assetId;
        }
        if (slot.type === "list") {
          return !Array.isArray(value.items) || value.items.filter(Boolean).length === 0;
        }
        return !String(value.text || "").trim();
      });
    };
    const selectedItem = list.find((item) => item.id === selectedScriptSegmentId) || list[0] || null;
    if (selectedItem) {
      selectedScriptSegmentId = selectedItem.id;
    } else {
      selectedScriptSegmentId = null;
    }

    let rowsHTML = "";
    if (list.length === 0) {
      rowsHTML = `
        <div class="empty-state script-empty-state">
          <div class="empty-state-title">Chưa có đoạn nào trong video</div>
          <div class="empty-state-desc">Mỗi đoạn là một ý sẽ xuất hiện trong video: mở đầu, demo, workflow, kết quả hoặc kết thúc.</div>
          <button id="features-empty-add-btn" class="btn btn-primary">Thêm đoạn đầu tiên</button>
        </div>
      `;
    } else {
      rowsHTML = `
        <div class="script-list" id="script-sortable-list">
          ${list.map((item, index) => {
            const segmentType = getSegmentType(item.type);
            const sceneTemplate = getSceneTemplate(item.sceneTemplateId);
            const durationSec = Number.parseInt(item.durationSec, 10) || 8;
            const voiceScript = String(item.voiceoverScript || "").trim();
            return `
            <article class="script-segment ${item.useInVideo ? "" : "is-disabled"} ${selectedItem && selectedItem.id === item.id ? "is-selected" : ""}" data-id="${item.id}" data-type="${escapeText(item.type || "feature")}">
              <div class="script-order">
                <span class="script-order-number">${index + 1}</span>
                <button class="script-drag-handle" type="button" aria-label="Kéo để đổi thứ tự" title="Kéo để đổi thứ tự">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="8" cy="6" r="1.5"></circle>
                    <circle cx="16" cy="6" r="1.5"></circle>
                    <circle cx="8" cy="12" r="1.5"></circle>
                    <circle cx="16" cy="12" r="1.5"></circle>
                    <circle cx="8" cy="18" r="1.5"></circle>
                    <circle cx="16" cy="18" r="1.5"></circle>
                  </svg>
                </button>
              </div>
              <div class="script-segment-main">
                <h3 class="script-title-wrapper">
                  <span class="script-title">${escapeText(item.name || "Đoạn chưa đặt tên")}</span>
                  <span class="script-duration">${durationSec}s</span>
                </h3>
                <div class="script-layout-chip">${escapeText(sceneTemplate ? sceneTemplate.name : "Chưa chọn layout")}</div>
                <p class="script-body">${escapeText(item.description || "Chưa có nội dung chính.")}</p>
                ${(item.benefit || voiceScript) ? `
                  <div class="script-meta-group">
                    ${item.benefit ? `
                      <div class="script-meta-item is-highlight">
                        <svg class="meta-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
                        <strong>Điểm nhấn:</strong>
                        <span>${escapeText(item.benefit)}</span>
                      </div>
                    ` : ""}
                    ${voiceScript ? `
                      <div class="script-meta-item is-voice">
                        <svg class="meta-icon" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v4M8 23h8"/></svg>
                        <strong>Giọng đọc:</strong>
                        <span>${escapeText(voiceScript)}</span>
                      </div>
                    ` : ""}
                  </div>
                ` : ""}
              </div>
              <div class="script-segment-side">
                <label class="script-switch">
                  <input type="checkbox" class="feature-use-toggle" data-id="${item.id}" ${item.useInVideo ? 'checked' : ''}>
                  <span class="script-switch-track" aria-hidden="true"></span>
                  <span class="script-switch-text">${item.useInVideo ? "Đang bật" : "Đang tắt"}</span>
                </label>
                <div class="script-actions">
                  <button class="btn-action btn-view-feature" data-id="${item.id}" type="button" aria-label="Xem chi tiết đoạn" title="Xem chi tiết">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5Zm0 12.5a5 5 0 1 1 0-10 5 5 0 0 1 0 10Zm0-2a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/>
                    </svg>
                  </button>
                  <button class="btn-action btn-edit-feature" data-id="${item.id}" type="button" aria-label="Sửa đoạn" title="Sửa đoạn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 5.63l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.84 1.83 3.75 3.75 1.84-1.83c-.39-.39-.39-1.02 0-1.41z"/>
                    </svg>
                  </button>
                  <button class="btn-action btn-delete-feature" data-id="${item.id}" type="button" aria-label="Xóa đoạn" title="Xóa đoạn">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </article>
          `;
          }).join("")}
        </div>
      `;
    }

    const selectedType = selectedItem ? getSegmentType(selectedItem.type) : null;
    const selectedSceneTemplate = selectedItem ? getSceneTemplate(selectedItem.sceneTemplateId) : null;
    const selectedSlotValues = selectedItem && selectedSceneTemplate
      ? normalizeSegmentSlots(selectedItem, selectedSceneTemplate.id)
      : {};
    const selectedIndex = selectedItem ? list.findIndex((item) => item.id === selectedItem.id) : -1;
    const selectedDuration = selectedItem ? (Number.parseInt(selectedItem.durationSec, 10) || 8) : 0;
    const selectedVoice = selectedItem ? String(selectedItem.voiceoverScript || "").trim() : "";
    const detailHTML = selectedItem ? `
      <aside class="script-detail-panel" aria-label="Chi tiết đoạn kịch bản">
        <div class="script-detail-header">
          <div>
            <span class="script-detail-eyebrow">Đoạn ${selectedIndex + 1}</span>
            <h2>${escapeText(selectedItem.name || "Đoạn chưa đặt tên")}</h2>
          </div>
          <span class="status-pill ${selectedItem.useInVideo ? "status-success" : "status-warning"}">${selectedItem.useInVideo ? "Đang bật" : "Đang tắt"}</span>
        </div>

        <div class="script-detail-metrics">
          <div>
            <span>Loại</span>
            <strong>${escapeText(selectedType ? selectedType.label : "Tính năng")}</strong>
          </div>
          <div>
            <span>Thời lượng</span>
            <strong>${selectedDuration}s</strong>
          </div>
          <div>
            <span>Voice</span>
            <strong>${selectedVoice ? "Có" : "Chưa có"}</strong>
          </div>
        </div>

        <div class="script-detail-section">
          <h3>Scene template</h3>
          <p>${escapeText(selectedSceneTemplate ? selectedSceneTemplate.name : "Chưa chọn layout cho đoạn này.")}</p>
        </div>

        ${selectedSceneTemplate ? `
          <div class="script-detail-section">
            <h3>Slots</h3>
            <div class="script-slot-summary">
              ${selectedSceneTemplate.slots.map((slot) => {
                const value = selectedSlotValues[slot.id] || {};
                return `
                  <div class="script-slot-summary-item ${value.enabled === false ? "is-disabled" : ""}">
                    <span>
                      <strong>${escapeText(slot.label)}</strong>
                      <small>${escapeText(getSlotTypeLabel(slot.type))} · ${escapeText(value.delay)}s · ${escapeText(value.animation || "none")}</small>
                    </span>
                    <em>${escapeText(getSlotValueSummary(slot, value))}</em>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        ` : ""}

        <div class="script-detail-section">
          <h3>Nội dung chính</h3>
          <p>${escapeText(selectedItem.description || "Chưa có nội dung chính.")}</p>
        </div>

        <div class="script-detail-section">
          <h3>Điểm nhấn</h3>
          <p>${escapeText(selectedItem.benefit || "Chưa nhập điểm nhấn cho đoạn này.")}</p>
        </div>

        <div class="script-detail-section">
          <h3>Voice script</h3>
          <p>${escapeText(selectedVoice || "Chưa có kịch bản giọng đọc riêng cho đoạn này.")}</p>
        </div>

        <div class="script-detail-actions">
          <button class="btn btn-secondary btn-sm" id="script-detail-edit-btn" type="button">Sửa đoạn này</button>
          <button class="btn btn-primary btn-sm" id="script-detail-preview-btn" type="button">Xem trước</button>
        </div>
      </aside>
    ` : `
      <aside class="script-detail-panel is-empty" aria-label="Chi tiết đoạn kịch bản">
        <div class="empty-state-title">Chưa có đoạn để xem chi tiết</div>
        <div class="empty-state-desc">Thêm đoạn đầu tiên để kiểm tra nội dung, voice và thời lượng.</div>
      </aside>
    `;

    container.innerHTML = `
      <div class="workspace-header script-workspace-header">
        <div>
          <h1>Kịch bản</h1>
          <p class="workspace-subtitle">Sắp xếp các đoạn sẽ xuất hiện trong video. Nội dung chi tiết và voice từng đoạn nằm ở đây.</p>
        </div>
        ${list.length > 0 ? `<button id="features-add-btn" class="btn btn-primary">Thêm đoạn</button>` : ''}
      </div>
      <div class="page-section-stack">
        <section class="script-flow-panel" aria-label="Cách hiển thị trong video">
          <div>
            <span class="script-flow-eyebrow">Cách hiển thị</span>
            <h2>Trong video render</h2>
            <p>${scriptDisplayMode === "sequence"
              ? "Các đoạn đang bật sẽ xuất hiện lần lượt theo thứ tự kéo thả."
              : "Các đoạn đang bật sẽ xuất hiện cùng lúc trong một cảnh."}</p>
          </div>
          <div class="script-display-toggle" role="group" aria-label="Chọn cách hiển thị đoạn">
            <button type="button" class="${scriptDisplayMode === "sequence" ? "is-active" : ""}" data-display-mode="sequence">Lần lượt</button>
            <button type="button" class="${scriptDisplayMode === "stack" ? "is-active" : ""}" data-display-mode="stack">Cùng lúc</button>
          </div>
        </section>
        <section class="script-summary">
          <div class="script-stat-card stat-total">
            <span class="script-stat-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M7 6.5h13M7 12h13M7 17.5h13" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
                <path d="M4 6.5h.01M4 12h.01M4 17.5h.01" stroke="currentColor" stroke-width="3" stroke-linecap="round"></path>
              </svg>
            </span>
            <div class="script-stat-copy">
              <span>Tổng đoạn</span>
              <strong>${list.length}</strong>
            </div>
          </div>
          <div class="script-stat-card stat-active">
            <span class="script-stat-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M8 5.75v12.5L18 12 8 5.75Z" stroke="currentColor" stroke-width="2" stroke-linejoin="round"></path>
              </svg>
            </span>
            <div class="script-stat-copy">
              <span>Đang bật</span>
              <strong>${enabledCount}</strong>
            </div>
          </div>
          <div class="script-stat-card stat-duration">
            <span class="script-stat-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" stroke="currentColor" stroke-width="2"></path>
                <path d="M12 7v5l3 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </span>
            <div class="script-stat-copy">
              <span>Ước tính</span>
              <strong>${estimatedDuration}s</strong>
            </div>
          </div>
          <div class="script-stat-card stat-voice">
            <span class="script-stat-icon" aria-hidden="true">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M4 12v2M8 8v8M12 5v14M16 9v6M20 11v2" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
              </svg>
            </span>
            <div class="script-stat-copy">
              <span>Có voice</span>
              <strong>${voiceCount}</strong>
            </div>
          </div>
        </section>
        <section class="script-board">
          ${rowsHTML}
          ${detailHTML}
        </section>
      </div>
    `;

    // Modal Form for Add/Edit
    const showFeatureFormModal = (feature = null) => {
      const isEdit = feature !== null;
      let activeSceneTemplateId = (isEdit && feature.sceneTemplateId)
        || data.defaultSceneTemplateId
        || (sceneTemplates[0] && sceneTemplates[0].id)
        || "";
      let activeSlotValues = normalizeSegmentSlots(feature || {}, activeSceneTemplateId);
      const renderAssetOptions = (selectedAssetId = "") => (data.assets || []).map((asset) => `
        <option value="${escapeText(asset.id)}" ${asset.id === selectedAssetId ? "selected" : ""}>${escapeText(asset.name || asset.id)}</option>
      `).join("");

      const collectSlotEditorValues = () => {
        const editor = document.getElementById("modal-scene-slot-editor");
        const template = getSceneTemplate(activeSceneTemplateId);
        if (!editor || !template) {
          return activeSlotValues;
        }

        return template.slots.reduce((values, slot) => {
          const item = editor.querySelector(`[data-slot-id="${slot.id}"]`);
          const current = activeSlotValues[slot.id] || getDefaultSlotValue(slot, feature || {});
          if (!item) {
            values[slot.id] = current;
            return values;
          }

          const delayInput = item.querySelector("[data-slot-field='delay']");
          const animationInput = item.querySelector("[data-slot-field='animation']");
          const enabledInput = item.querySelector("[data-slot-field='enabled']");
          const delay = Number.parseFloat(delayInput ? delayInput.value : current.delay);
          const next = {
            ...current,
            type: slot.type,
            delay: Number.isFinite(delay) ? Math.max(0, delay) : current.delay,
            animation: animationInput ? animationInput.value : current.animation,
            enabled: slot.required ? true : !(enabledInput && !enabledInput.checked)
          };

          if (slot.type === "asset" || slot.type === "media") {
            const assetInput = item.querySelector("[data-slot-field='assetId']");
            next.assetId = assetInput ? assetInput.value : (current.assetId || "");
          } else if (slot.type === "list") {
            const listInput = item.querySelector("[data-slot-field='items']");
            next.items = listInput
              ? listInput.value.split("\n").map((line) => line.trim()).filter(Boolean)
              : (Array.isArray(current.items) ? current.items : []);
          } else {
            const textInput = item.querySelector("[data-slot-field='text']");
            next.text = textInput ? textInput.value.trim() : (current.text || "");
          }

          values[slot.id] = next;
          return values;
        }, {});
      };

      const renderSlotInputHTML = (slot, value) => {
        if (slot.type === "asset" || slot.type === "media") {
          return `
            <select class="form-control" data-slot-field="assetId">
              <option value="">Chưa chọn tài nguyên</option>
              ${renderAssetOptions(value.assetId || "")}
            </select>
          `;
        }

        if (slot.type === "list") {
          const items = Array.isArray(value.items) ? value.items.join("\n") : "";
          return `
            <textarea class="form-control" rows="4" data-slot-field="items" placeholder="Mỗi dòng là một item">${escapeText(items)}</textarea>
          `;
        }

        if (slot.id === "description") {
          return `
            <textarea class="form-control" rows="3" data-slot-field="text" placeholder="Nội dung hiển thị trong slot">${escapeText(value.text || "")}</textarea>
          `;
        }

        return `
          <input type="text" class="form-control" data-slot-field="text" value="${escapeText(value.text || "")}" placeholder="Nội dung hiển thị trong slot">
        `;
      };

      const renderSlotEditorHTML = () => {
        const template = getSceneTemplate(activeSceneTemplateId);
        if (!template) {
          return `<div class="slot-editor-empty">Chưa có scene template để tạo slot.</div>`;
        }

        return `
          <div class="scene-slot-editor-grid">
            ${template.slots.map((slot) => {
              const value = activeSlotValues[slot.id] || getDefaultSlotValue(slot, feature || {});
              const allowedAnimations = (slot.allowedAnimations || []).length ? slot.allowedAnimations : slotAnimations.map((item) => item.id);
              return `
                <section class="scene-slot-editor-item" data-slot-id="${slot.id}">
                  <div class="scene-slot-editor-head">
                    <div>
                      <strong>${escapeText(slot.label)}</strong>
                      <span>${escapeText(getSlotTypeLabel(slot.type))}${slot.required ? " · bắt buộc" : " · tùy chọn"}</span>
                    </div>
                    ${slot.required ? `
                      <span class="scene-slot-required">Required</span>
                    ` : `
                      <label class="script-switch scene-slot-toggle">
                        <input type="checkbox" data-slot-field="enabled" ${value.enabled !== false ? "checked" : ""}>
                        <span class="script-switch-track" aria-hidden="true"></span>
                      </label>
                    `}
                  </div>

                  ${renderSlotInputHTML(slot, value)}

                  <div class="scene-slot-controls">
                    <label>
                      <span>Delay</span>
                      <input type="number" class="form-control" data-slot-field="delay" min="0" max="30" step="0.1" value="${escapeText(value.delay)}">
                    </label>
                    <label>
                      <span>Animation</span>
                      <select class="form-control" data-slot-field="animation">
                        ${allowedAnimations.map((animationId) => `
                          <option value="${escapeText(animationId)}" ${animationId === value.animation ? "selected" : ""}>${escapeText(getAnimationLabel(animationId))}</option>
                        `).join("")}
                      </select>
                    </label>
                  </div>
                </section>
              `;
            }).join("")}
          </div>
        `;
      };

      const modalBody = document.createElement("div");
      modalBody.innerHTML = `
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="modal-feat-type">Loại đoạn</label>
            <select id="modal-feat-type" class="form-control">
              ${segmentTypes.map((type) => `
                <option value="${type.id}" ${type.id === (feature && feature.type ? feature.type : "feature") ? "selected" : ""}>${type.label}</option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="modal-feat-duration">Thời lượng dự kiến</label>
            <input type="number" id="modal-feat-duration" class="form-control" min="3" max="30" step="1" value="${isEdit ? (feature.durationSec || 8) : 8}">
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-feat-name">Tiêu đề đoạn *</label>
          <input type="text" id="modal-feat-name" class="form-control" value="${isEdit ? escapeText(feature.name) : ''}" placeholder="Ví dụ: Demo dashboard cảnh báo trễ hạn">
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-feat-desc">Nội dung chính *</label>
          <textarea id="modal-feat-desc" class="form-control" rows="4" placeholder="Đoạn này cần nói gì...">${isEdit ? escapeText(feature.description) : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-feat-benefit">Điểm nhấn</label>
          <input type="text" id="modal-feat-benefit" class="form-control" value="${isEdit ? escapeText(feature.benefit) : ''}" placeholder="Ý quan trọng nhất của đoạn này...">
        </div>
        <div class="scene-slot-editor-panel">
          <div class="scene-slot-editor-title">
            <div>
              <span class="script-flow-eyebrow">Scene Template</span>
              <h3>Layout và slot hiển thị</h3>
            </div>
            <select id="modal-feat-scene-template" class="form-control">
              ${sceneTemplates.map((template) => `
                <option value="${template.id}" ${template.id === activeSceneTemplateId ? "selected" : ""}>${template.name}</option>
              `).join("")}
            </select>
          </div>
          <div id="modal-scene-slot-editor">
            ${renderSlotEditorHTML()}
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-feat-voice">Voice script</label>
          <textarea id="modal-feat-voice" class="form-control" rows="3" placeholder="Câu đọc riêng cho đoạn này...">${isEdit ? escapeText(feature.voiceoverScript) : ''}</textarea>
          <div id="modal-feat-voice-estimate" class="script-voice-estimate" aria-live="polite"></div>
          <div class="script-voice-preview">
            <button id="modal-feat-voice-preview-btn" class="btn btn-secondary btn-sm" type="button">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
              <span>Nghe thử</span>
            </button>
            <span id="modal-feat-voice-preview-status">Tạo audio thật từ voice script hiện tại.</span>
          </div>
          <audio id="modal-feat-voice-audio" class="script-voice-audio d-none" controls preload="metadata"></audio>
        </div>
        <div class="form-group">
          <label class="script-switch script-switch-modal" for="modal-feat-use">
          <input type="checkbox" id="modal-feat-use" ${!isEdit || feature.useInVideo ? 'checked' : ''}>
            <span class="script-switch-track" aria-hidden="true"></span>
            <span class="script-switch-text">Bật đoạn này trong video</span>
          </label>
        </div>
      `;

      showModal(
        isEdit ? "Sửa đoạn kịch bản" : "Thêm đoạn kịch bản",
        modalBody,
        [
          { text: "Hủy", class: "btn-secondary", onClick: closeModal },
          {
            text: isEdit ? "Cập nhật" : "Thêm mới",
            class: "btn-primary",
            onClick: () => {
              const type = document.getElementById("modal-feat-type").value;
              const name = document.getElementById("modal-feat-name").value.trim();
              const description = document.getElementById("modal-feat-desc").value.trim();
              const benefit = document.getElementById("modal-feat-benefit").value.trim();
              const voiceoverScript = document.getElementById("modal-feat-voice").value.trim();
              const durationSec = Math.min(30, Math.max(3, Number.parseInt(document.getElementById("modal-feat-duration").value, 10) || 8));
              const useInVideo = document.getElementById("modal-feat-use").checked;
              const sceneTemplateId = document.getElementById("modal-feat-scene-template").value;
              activeSceneTemplateId = sceneTemplateId;
              const slots = collectSlotEditorValues();
              const activeTemplate = getSceneTemplate(sceneTemplateId);

              if (!name || !description) {
                showToast("Cần nhập tiêu đề và nội dung chính của đoạn.", "error");
                return;
              }

              if (slots.title && !String(slots.title.text || "").trim()) {
                slots.title.text = name;
              }
              if (slots.description && !String(slots.description.text || "").trim()) {
                slots.description.text = description;
              }

              const missingRequiredSlots = validateRequiredSlotValues(activeTemplate, slots);
              if (missingRequiredSlots.length > 0) {
                showToast(`Thiếu slot bắt buộc: ${missingRequiredSlots.map((slot) => slot.label).join(", ")}.`, "error");
                return;
              }

              const features = [...(data.features || [])];
              const savedFeatureId = isEdit ? feature.id : "feat_" + Date.now();
              if (isEdit) {
                const idx = features.findIndex(f => f.id === feature.id);
                if (idx !== -1) {
                  features[idx] = { ...feature, type, name, description, benefit, voiceoverScript, durationSec, useInVideo, sceneTemplateId, slots };
                }
              } else {
                features.push({
                  id: savedFeatureId,
                  type,
                  name,
                  description,
                  benefit,
                  voiceoverScript,
                  durationSec,
                  useInVideo,
                  sceneTemplateId,
                  slots
                });
              }

              selectedScriptSegmentId = savedFeatureId;
              AppState.updateProjectField("features", features);
              renderFeaturesScreen(container, AppState.getProjectData());
              closeModal();
              showToast(isEdit ? "Cập nhật đoạn thành công!" : "Đã thêm đoạn mới!");
            }
          }
        ]
      );

      const voiceInput = document.getElementById("modal-feat-voice");
      const durationInput = document.getElementById("modal-feat-duration");
      const sceneTemplateInput = document.getElementById("modal-feat-scene-template");
      const slotEditor = document.getElementById("modal-scene-slot-editor");
      const estimateBox = document.getElementById("modal-feat-voice-estimate");
      const previewButton = document.getElementById("modal-feat-voice-preview-btn");
      const previewStatus = document.getElementById("modal-feat-voice-preview-status");
      const previewAudio = document.getElementById("modal-feat-voice-audio");

      const setPreviewButtonState = (isLoading) => {
        if (!previewButton) {
          return;
        }

        previewButton.disabled = isLoading;
        previewButton.innerHTML = isLoading ? `
          <span>Đang tạo...</span>
        ` : `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
          <span>Nghe thử</span>
        `;
      };

      const clearVoicePreview = () => {
        const hadPreview = Boolean(previewAudio && previewAudio.getAttribute("src"));
        if (previewAudio) {
          previewAudio.pause();
          previewAudio.removeAttribute("src");
          previewAudio.load();
          previewAudio.classList.add("d-none");
        }
        if (hadPreview && previewStatus) {
          previewStatus.textContent = "Script đã đổi, bấm Nghe thử để tạo audio mới.";
        }
      };

      const renderVoiceEstimate = (override = {}) => {
        if (!voiceInput || !durationInput || !estimateBox) {
          return;
        }

        const voiceText = voiceInput.value;
        const wordCount = countVoiceWords(voiceText);
        const sceneSeconds = Math.min(30, Math.max(3, Number.parseInt(durationInput.value, 10) || 8));
        const estimatedSeconds = estimateVoiceDurationSeconds(voiceText, currentVoiceRate);
        const voiceSeconds = Number.isFinite(override.actualSeconds) ? override.actualSeconds : estimatedSeconds;
        const fitStatus = getVoiceFitStatus(voiceSeconds, sceneSeconds);
        const durationLabel = Number.isFinite(override.actualSeconds)
          ? `audio thật ${voiceSeconds.toFixed(1)}s`
          : `khoảng ${estimatedSeconds}s đọc`;

        estimateBox.className = `script-voice-estimate ${fitStatus.className}`;
        estimateBox.innerHTML = `
          <div>
            <strong>${fitStatus.label}</strong>
            <span>${wordCount} từ · ${durationLabel} · scene ${sceneSeconds}s</span>
          </div>
          <p>${fitStatus.message} Tốc độ đọc hiện tại: ${escapeText(currentVoiceRate)}.</p>
        `;
      };

      const updateVoiceEstimate = () => renderVoiceEstimate();

      if (voiceInput) {
        voiceInput.addEventListener("input", () => {
          updateVoiceEstimate();
          clearVoicePreview();
        });
      }
      if (durationInput) {
        durationInput.addEventListener("input", updateVoiceEstimate);
        durationInput.addEventListener("change", updateVoiceEstimate);
      }
      updateVoiceEstimate();

      if (sceneTemplateInput && slotEditor) {
        sceneTemplateInput.addEventListener("change", () => {
          activeSlotValues = collectSlotEditorValues();
          activeSceneTemplateId = sceneTemplateInput.value;
          activeSlotValues = normalizeSegmentSlots({ ...(feature || {}), slots: activeSlotValues }, activeSceneTemplateId);
          slotEditor.innerHTML = renderSlotEditorHTML();
        });
      }

      if (previewAudio && previewStatus) {
        previewAudio.addEventListener("loadedmetadata", () => {
          const duration = Number.isFinite(previewAudio.duration) ? previewAudio.duration : null;
          if (Number.isFinite(duration)) {
            renderVoiceEstimate({ actualSeconds: duration });
          }
          previewStatus.textContent = `Audio thật: ${Number.isFinite(duration) ? `${duration.toFixed(1)}s` : "không rõ"}. Có thể nghe để kiểm tra nhịp đọc.`;
        });
      }

      if (previewButton) {
        previewButton.addEventListener("click", async () => {
          const script = normalizeText(voiceInput ? voiceInput.value : "");
          if (!script) {
            showToast("Nhập voice script trước khi nghe thử.", "error");
            return;
          }

          if (!AppRender.previewVoiceover) {
            showToast("Frontend chưa có API nghe thử voiceover.", "error");
            return;
          }

          setPreviewButtonState(true);
          if (previewStatus) {
            previewStatus.textContent = "Đang tạo audio preview...";
          }

          try {
            const preview = await AppRender.previewVoiceover({
              provider: currentVoiceover.provider || "edge-tts",
              language: currentVoiceover.language || "vi-VN",
              voiceId: currentVoiceover.voiceId || "vi-VN-HoaiMyNeural",
              rate: currentVoiceRate,
              volume: currentVoiceover.volume || "+0%",
              script
            });

            if (previewAudio) {
              previewAudio.src = preview.audioUrl;
              previewAudio.classList.remove("d-none");
              previewAudio.load();
            }
            if (previewStatus) {
              previewStatus.textContent = preview.cached ? "Dùng audio preview đã cache." : "Đã tạo audio preview.";
            }
          } catch (error) {
            if (previewStatus) {
              previewStatus.textContent = error.message || "Không tạo được audio preview.";
            }
            showToast(error.message || "Không tạo được audio preview.", "error");
          } finally {
            setPreviewButtonState(false);
          }
        });
      }
    };

    // Attach Event Listeners
    container.querySelectorAll(".script-display-toggle button").forEach((button) => {
      button.addEventListener("click", () => {
        AppState.updateProjectField("scriptDisplayMode", button.getAttribute("data-display-mode") || "sequence");
        renderFeaturesScreen(container, AppState.getProjectData());
      });
    });

    if (list.length === 0) {
      document.getElementById("features-empty-add-btn").addEventListener("click", () => showFeatureFormModal());
    } else {
      document.getElementById("features-add-btn").addEventListener("click", () => showFeatureFormModal());

      container.querySelectorAll(".script-segment").forEach((segment) => {
        segment.addEventListener("click", (event) => {
          if (event.target.closest("button, label, input, select, textarea")) {
            return;
          }
          selectedScriptSegmentId = segment.getAttribute("data-id");
          renderFeaturesScreen(container, AppState.getProjectData());
        });
      });

      container.querySelectorAll(".btn-view-feature").forEach(btn => {
        btn.addEventListener("click", () => {
          selectedScriptSegmentId = btn.getAttribute("data-id");
          renderFeaturesScreen(container, AppState.getProjectData());
        });
      });

      const sortableList = document.getElementById("script-sortable-list");
      if (sortableList && typeof Sortable !== "undefined") {
        Sortable.create(sortableList, {
          handle: ".script-drag-handle",
          animation: 150,
          ghostClass: "script-segment-ghost",
          chosenClass: "script-segment-chosen",
          dragClass: "script-segment-drag",
          onEnd: () => {
            const orderedIds = Array.from(sortableList.querySelectorAll(".script-segment"))
              .map((item) => item.getAttribute("data-id"));
            const currentFeatures = AppState.getProjectData().features || [];
            const reordered = orderedIds
              .map((id) => currentFeatures.find((feature) => feature.id === id))
              .filter(Boolean);
            AppState.updateProjectField("features", reordered);
            renderFeaturesScreen(container, AppState.getProjectData());
          }
        });
      }

      // Edit feature
      container.querySelectorAll(".btn-edit-feature").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const feature = data.features.find(f => f.id === id);
          if (feature) showFeatureFormModal(feature);
        });
      });

      // Delete feature
      container.querySelectorAll(".btn-delete-feature").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          showModal(
            "Xác nhận xóa đoạn",
            "Bạn có chắc chắn muốn xóa đoạn này khỏi kịch bản?",
            [
              { text: "Hủy", class: "btn-secondary", onClick: closeModal },
              {
                text: "Xóa",
                class: "btn-danger",
                onClick: () => {
                  const features = data.features.filter(f => f.id !== id);
                  if (selectedScriptSegmentId === id) {
                    selectedScriptSegmentId = features[0] ? features[0].id : null;
                  }
                  AppState.updateProjectField("features", features);
                  renderFeaturesScreen(container, AppState.getProjectData());
                  closeModal();
                  showToast("Đã xóa đoạn.", "info");
                }
              }
            ]
          );
        });
      });

      // Toggle use in video
      container.querySelectorAll(".feature-use-toggle").forEach(checkbox => {
        checkbox.addEventListener("change", () => {
          const id = checkbox.getAttribute("data-id");
          const features = data.features.map(f => {
            if (f.id === id) {
              return { ...f, useInVideo: checkbox.checked };
            }
            return f;
          });
          AppState.updateProjectField("features", features);
          renderFeaturesScreen(container, AppState.getProjectData());
        });
      });

      const detailEditBtn = document.getElementById("script-detail-edit-btn");
      if (detailEditBtn && selectedItem) {
        detailEditBtn.addEventListener("click", () => showFeatureFormModal(selectedItem));
      }

      const detailPreviewBtn = document.getElementById("script-detail-preview-btn");
      if (detailPreviewBtn) {
        detailPreviewBtn.addEventListener("click", () => AppState.setTab("preview"));
      }
    }
  };

  // 4. Legacy Timeline Handoff View
  const renderTimelineScreen = (container, data) => {
    container.innerHTML = `
      <div class="workspace-header">
        <h1>Timeline đã chuyển sang Kịch bản</h1>
        <button id="timeline-to-script-btn" class="btn btn-primary">Mở Kịch bản</button>
      </div>
      <div class="page-section-stack">
        <div class="empty-state">
          <svg class="empty-state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div class="empty-state-title">Trang Timeline cũ không còn nằm trong flow chính</div>
          <div class="empty-state-desc">Các cột mốc sẽ được gộp vào Kịch bản ở phase sau. File này vẫn được giữ để link cũ không vỡ.</div>
        </div>
      </div>
    `;
    document.getElementById("timeline-to-script-btn").addEventListener("click", () => AppState.setTab("features"));
  };

  // 5. Asset Manager View
  const renderAssetsScreen = (container, data) => {
    const list = data.assets || [];
    let currentFilter = "all";
    let selectedAssetIds = [];

    const filterList = (filter) => {
      if (filter === "all") return list;
      return list.filter(a => a.type === filter);
    };

    const updateBulkDeleteButton = () => {
      const btn = document.getElementById("assets-delete-selected-btn");
      const countSpan = document.getElementById("selected-assets-count");
      if (!btn) return;

      if (selectedAssetIds.length > 0) {
        btn.classList.remove("d-none");
        if (countSpan) {
          countSpan.textContent = selectedAssetIds.length;
        }
      } else {
        btn.classList.add("d-none");
      }
    };

    const renderGrid = (filter) => {
      const filtered = filterList(filter);
      const grid = container.querySelector(".assets-grid");
      if (!grid) return;

      if (filtered.length === 0) {
        grid.innerHTML = `
          <div class="empty-state" style="grid-column: 1 / -1;">
            <svg class="empty-state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
            <div class="empty-state-title">Thư viện trống</div>
            <div class="empty-state-desc">Không tìm thấy tài nguyên nào thuộc phân loại này.</div>
          </div>
        `;
        return;
      }

      grid.innerHTML = filtered.map(item => {
        let thumbContent = "";
        if (item.url) {
          thumbContent = `<img src="${item.url}" alt="${item.name}">`;
        } else {
          // Fallback SVG icon
          thumbContent = `
            <div class="asset-thumb-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
            </div>
          `;
        }

        const isVideo = item.type === "video";

        return `
          <div class="asset-card" data-id="${item.id}">
            <div class="asset-thumb">
              <input type="checkbox" class="asset-checkbox" data-id="${item.id}" title="Chọn tài nguyên" ${selectedAssetIds.includes(item.id) ? 'checked' : ''}>
              ${thumbContent}
              ${item.useInVideo ? `<div class="asset-use-badge" title="Đang được sử dụng trong video">✓</div>` : ''}
            </div>
            <div class="asset-info">
              <div class="asset-name" title="${item.name}">${item.name}</div>
              <div class="asset-meta">
                ${isVideo ? `
                  <span class="asset-type-badge">Video demo</span>
                ` : `
                  <select class="asset-type-select" data-id="${item.id}" title="Xác nhận phân loại tài nguyên">
                    <option value="screenshot" ${item.type === "screenshot" ? "selected" : ""}>Screenshot</option>
                    <option value="logo" ${item.type === "logo" ? "selected" : ""}>Logo</option>
                  </select>
                `}
                <span class="asset-size-badge">${item.size}</span>
              </div>
            </div>
            <div class="asset-actions">
              <button class="asset-action-btn btn-toggle-use" data-id="${item.id}">
                ${item.useInVideo ? "Bỏ dùng" : "Sử dụng"}
              </button>
              <button class="asset-action-btn btn-delete-asset" data-id="${item.id}">Xóa</button>
            </div>
          </div>
        `;
      }).join("");

      // Bind Checkbox Events
      grid.querySelectorAll(".asset-checkbox").forEach(chk => {
        chk.addEventListener("change", (e) => {
          const id = chk.getAttribute("data-id");
          if (e.target.checked) {
            if (!selectedAssetIds.includes(id)) {
              selectedAssetIds.push(id);
            }
          } else {
            selectedAssetIds = selectedAssetIds.filter(x => x !== id);
          }
          updateBulkDeleteButton();
        });
      });

      // Bind Grid Action Events
      grid.querySelectorAll(".asset-type-select").forEach(select => {
        select.addEventListener("change", (e) => {
          const id = select.getAttribute("data-id");
          const newType = e.target.value;
          const assets = data.assets.map(a => {
            if (a.id === id) {
              return { ...a, type: newType };
            }
            return a;
          });
          AppState.updateProjectField("assets", assets);
          renderAssetsScreen(container, AppState.getProjectData());
          showToast("Đã cập nhật loại tài nguyên!");
        });
      });

      grid.querySelectorAll(".btn-toggle-use").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const assets = data.assets.map(a => {
            if (a.id === id) {
              return { ...a, useInVideo: !a.useInVideo };
            }
            return a;
          });
          AppState.updateProjectField("assets", assets);
          renderAssetsScreen(container, AppState.getProjectData());
        });
      });

      grid.querySelectorAll(".btn-delete-asset").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          showModal(
            "Xác nhận xóa tài nguyên",
            "Bạn có chắc muốn xóa tệp tin này khỏi danh sách tài nguyên?",
            [
              { text: "Hủy", class: "btn-secondary", onClick: closeModal },
              {
                text: "Xóa",
                class: "btn-danger",
                onClick: () => {
                  const assets = data.assets.filter(a => a.id !== id);
                  AppState.updateProjectField("assets", assets);
                  renderAssetsScreen(container, AppState.getProjectData());
                  closeModal();
                  showToast("Đã xóa tài nguyên.", "info");
                }
              }
            ]
          );
        });
      });
    };

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Tài nguyên dự án (${list.length})</h1>
      </div>

      <input type="file" id="real-file-input" style="display:none;" accept="image/*,video/*" multiple>

      <div class="assets-filter-row">
        <div class="filter-group">
          <button class="filter-btn active" data-filter="all">Tất cả</button>
          <button class="filter-btn" data-filter="logo">Logo</button>
          <button class="filter-btn" data-filter="screenshot">Ảnh chụp màn hình</button>
          <button class="filter-btn" data-filter="video">Video demo</button>
        </div>
        <div class="assets-action-buttons">
          <button id="assets-delete-selected-btn" class="btn btn-danger d-none">
            <svg class="assets-action-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            Xóa đã chọn (<span id="selected-assets-count">0</span>)
          </button>
          <button id="assets-upload-btn" class="btn btn-primary">
            <svg class="assets-action-icon" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
            Tải tệp lên
          </button>
        </div>
      </div>

      <div class="assets-hint-row">
        <span class="text-subtle">* Chỉ ảnh và logo dùng trong video mới được render. Kéo thả file vào đây để tải lên nhanh.</span>
      </div>

      <div class="assets-grid"></div>
    `;

    renderGrid(currentFilter);

    // Bind Filter Events
    container.querySelectorAll(".filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        container.querySelectorAll(".filter-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        currentFilter = btn.getAttribute("data-filter");
        selectedAssetIds = [];
        updateBulkDeleteButton();
        renderGrid(currentFilter);
      });
    });

    // Bind Bulk Delete Event
    const bulkDeleteBtn = document.getElementById("assets-delete-selected-btn");
    if (bulkDeleteBtn) {
      bulkDeleteBtn.addEventListener("click", () => {
        if (selectedAssetIds.length === 0) return;

        showModal(
          "Xác nhận xóa tài nguyên đã chọn",
          `Bạn có chắc chắn muốn xóa ${selectedAssetIds.length} tài nguyên đã chọn?`,
          [
            { text: "Hủy", class: "btn-secondary", onClick: closeModal },
            {
              text: "Xóa",
              class: "btn-danger",
              onClick: () => {
                const assets = data.assets.filter(a => !selectedAssetIds.includes(a.id));
                AppState.updateProjectField("assets", assets);
                selectedAssetIds = [];
                renderAssetsScreen(container, AppState.getProjectData());
                closeModal();
                showToast("Đã xóa các tài nguyên đã chọn.", "info");
              }
            }
          ]
        );
      });
    }

    const realInput = document.getElementById("real-file-input");
    const uploadBtn = document.getElementById("assets-upload-btn");

    const handleFilesUpload = (files) => {
      if (files.length === 0) return;

      const originalHTML = uploadBtn ? uploadBtn.innerHTML : "Tải tệp lên";
      if (uploadBtn) {
        uploadBtn.disabled = true;
        uploadBtn.innerHTML = `⏳ Đang xử lý...`;
      }

      showToast(`Đang tải lên ${files.length} tệp tin...`, "info");

      setTimeout(() => {
        const assets = [...(data.assets || [])];

        files.forEach((file, index) => {
          const isImage = file.type.startsWith("image/");
          const isLogo = file.name.toLowerCase().includes("logo");

          let type = "screenshot";
          if (isLogo) type = "logo";
          else if (file.type.startsWith("video/")) type = "video";

          let url = "";
          if (isImage) {
            url = URL.createObjectURL(file); // Show real uploaded image preview
          }

          const newAsset = {
            id: "asset_" + (Date.now() + index),
            name: file.name,
            type: type,
            size: (file.size / 1024 / 1024).toFixed(1) + " MB",
            dateAdded: new Date().toISOString().split('T')[0],
            url: url,
            useInVideo: true
          };
          assets.push(newAsset);
        });

        AppState.updateProjectField("assets", assets);
        showToast(`Đã tải lên thành công ${files.length} tệp tài nguyên!`);
        renderAssetsScreen(container, AppState.getProjectData());
      }, 1000);
    };

    if (uploadBtn) {
      uploadBtn.addEventListener("click", () => {
        realInput.click();
      });
    }

    if (realInput) {
      realInput.addEventListener("change", (e) => {
        handleFilesUpload(Array.from(e.target.files));
      });
    }

    // HTML5 Drag and Drop Handlers on the page container
    container.addEventListener("dragover", (e) => {
      e.preventDefault();
      container.classList.add("dragover-active");
    });

    container.addEventListener("dragleave", () => {
      container.classList.remove("dragover-active");
    });

    container.addEventListener("drop", (e) => {
      e.preventDefault();
      container.classList.remove("dragover-active");

      const files = Array.from(e.dataTransfer.files).filter(file =>
        file.type.startsWith("image/") || file.type.startsWith("video/")
      );

      handleFilesUpload(files);
    });
  };

  const openVideoStyleModal = (container, styleId) => {
    const currentData = AppState.getProjectData();
    const preset = getVideoStylePreset(styleId || currentData.videoStyleId);
    const resolvedStyle = resolveVideoStyle(styleId || currentData.videoStyleId, currentData);

    if (!preset || !resolvedStyle) {
      showToast("Chưa có video style để chỉnh.", "warning");
      return;
    }

    const theme = resolvedStyle.colorTheme || {};
    const glowColor = parseCssColorOpacity(theme.glow || "rgba(34, 211, 238, 0.28)", theme.accent || "#22D3EE", 0.28);
    const styleColorState = {
      background: normalizeHexColor(theme.background || "#05070A", "#05070A"),
      surface: normalizeHexColor(theme.surface || "#101722", "#101722"),
      surfaceAlt: normalizeHexColor(theme.surfaceAlt || theme.surface || "#162033", "#162033"),
      text: normalizeHexColor(theme.text || "#F8FAFC", "#F8FAFC"),
      mutedText: normalizeHexColor(theme.mutedText || "#94A3B8", "#94A3B8"),
      accent: normalizeHexColor(theme.accent || "#22D3EE", "#22D3EE"),
      accentSoft: normalizeHexColor(theme.accentSoft || "#164E63", "#164E63"),
      border: normalizeHexColor(theme.border || "#1E3A5F", "#1E3A5F"),
      glow: normalizeHexColor(glowColor.hex, "#22D3EE")
    };
    const styleTokenDescriptions = {
      background: "Nền toàn frame/video.",
      surface: "Nền block có khung: media, logo box, list/card item.",
      surfaceAlt: "Nền phụ hoặc placeholder nhẹ hơn surface.",
      text: "Chữ chính: title, label chính, CTA chính.",
      mutedText: "Chữ phụ: description, note, caption, metadata.",
      accent: "Điểm nhấn: kicker, tag, CTA, guide line, highlight.",
      accentSoft: "Nền nhấn nhẹ cho badge/tag/active state.",
      border: "Màu viền cho item dùng Surface, Outlined, Pill hoặc Media frame."
    };
    const renderPickrColorField = (key, label) => {
      return `
        <div class="form-group style-color-field">
          <span class="style-token-head">
            <span class="form-label">${label}</span>
            <span class="style-token-hint">${escapeText(styleTokenDescriptions[key] || "")}</span>
          </span>
          <button class="style-pickr-button" type="button" data-color-key="${key}" data-color-label="${escapeAttribute(label)}" aria-label="Chọn màu ${label}">
            <span class="style-pickr-swatch" aria-hidden="true"></span>
            <span class="style-pickr-value">${escapeText(styleColorState[key])}</span>
          </button>
        </div>
      `;
    };
    const modalBody = document.createElement("div");
    modalBody.innerHTML = `
      <div class="style-editor-modal">
        <div class="style-editor-preview" id="style-editor-preview">
          <span class="style-editor-preview-surface"></span>
          <span class="style-editor-preview-title"></span>
          <span class="style-editor-preview-line"></span>
          <span class="style-editor-preview-accent"></span>
        </div>
        <div class="style-contract-note">
          <strong>Video Style chỉ là bộ token màu.</strong>
          <span>Scene Item/Slot sẽ chọn token để dùng qua Color role và Display style. Ví dụ Title dùng Text + Plain, Description dùng Muted text + Plain, Media dùng Surface + Border, Tag dùng Accent + Pill.</span>
        </div>
        <div class="style-editor-grid">
          ${renderPickrColorField("background", "Background")}
          ${renderPickrColorField("surface", "Surface")}
          ${renderPickrColorField("surfaceAlt", "Surface phụ")}
          ${renderPickrColorField("text", "Text")}
          ${renderPickrColorField("mutedText", "Muted text")}
          ${renderPickrColorField("accent", "Accent")}
          ${renderPickrColorField("accentSoft", "Accent mềm")}
          ${renderPickrColorField("border", "Border")}
        </div>
        <div class="form-group style-color-field">
          <span class="form-label">Glow</span>
          <div class="form-hint">Halo/shadow nhấn cho frame hoặc item được bật glow. Không muốn glow thì kéo opacity về 0.</div>
          <button class="style-pickr-button" type="button" data-color-key="glow" data-color-label="Glow" aria-label="Chọn màu Glow">
            <span class="style-pickr-swatch" aria-hidden="true"></span>
            <span class="style-pickr-value">${escapeText(styleColorState.glow)}</span>
          </button>
          <label class="style-opacity-row" for="style-glow-opacity">
            <span>Độ mạnh glow</span>
            <strong id="style-glow-opacity-value">${Math.round(glowColor.opacity * 100)}%</strong>
          </label>
          <input id="style-glow-opacity" class="style-opacity-range" type="range" min="0" max="1" step="0.01" value="${escapeAttribute(glowColor.opacity)}">
        </div>
        <div class="form-grid two-cols">
          <div class="form-group">
            <label class="form-label" for="style-motion-style">Motion style</label>
            <div class="form-hint">Hiện tại dùng để lưu nhịp animation chung cho renderer sau. Phase render thật chưa nối thì chưa thấy khác biệt lớn.</div>
            <select id="style-motion-style" class="form-control">
              ${["minimal", "dynamic", "soft", "sharp"].map((motion) => `
                <option value="${motion}" ${resolvedStyle.motionStyle === motion ? "selected" : ""}>${motion}</option>
              `).join("")}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label" for="style-background-style">Background style</label>
            <div class="form-hint">Định nghĩa kiểu nền cho preview/render sau này, ví dụ nền trơn, grid nhẹ hoặc ưu tiên media.</div>
            <select id="style-background-style" class="form-control">
              ${["dark-grid", "clean-surface", "media-focus", "plain", "subtle-grid"].map((background) => `
                <option value="${background}" ${resolvedStyle.backgroundStyle === background ? "selected" : ""}>${background}</option>
              `).join("")}
            </select>
          </div>
        </div>
      </div>
    `;

    const getEditedTheme = () => ({
      background: styleColorState.background,
      surface: styleColorState.surface,
      surfaceAlt: styleColorState.surfaceAlt,
      text: styleColorState.text,
      mutedText: styleColorState.mutedText,
      accent: styleColorState.accent,
      accentSoft: styleColorState.accentSoft,
      border: styleColorState.border,
      glow: hexToRgba(styleColorState.glow, document.getElementById("style-glow-opacity").value)
    });

    const getEditedStyle = () => ({
      colorTheme: getEditedTheme(),
      motionStyle: document.getElementById("style-motion-style").value,
      backgroundStyle: document.getElementById("style-background-style").value
    });

    const refreshModalPreview = () => {
      const preview = document.getElementById("style-editor-preview");
      if (!preview) {
        return;
      }

      applyStylePreviewVariables(preview, {
        ...resolvedStyle,
        ...getEditedStyle(),
        colorTheme: getEditedTheme()
      });
    };

    showModal(`Chi tiết style: ${preset.name}`, modalBody, [
      {
        text: "Khôi phục preset",
        class: "btn-secondary",
        onClick: () => {
          const projectData = AppState.getProjectData();
          const nextOverrides = { ...(projectData.videoStyleOverrides || {}) };
          delete nextOverrides[preset.id];
          AppState.setProjectData({
            ...projectData,
            videoStyleOverrides: nextOverrides,
            templateConfig: getStyleTemplateConfig(preset.id)
          });
          closeModal();
          renderTemplateScreen(container, AppState.getProjectData());
          showToast("Đã khôi phục style preset.");
        }
      },
      { text: "Hủy", class: "btn-secondary", onClick: closeModal },
      {
        text: "Lưu style",
        class: "btn-primary",
        onClick: () => {
          const editedStyle = getEditedStyle();
          const nextData = AppState.getProjectData();
          const nextOverrides = {
            ...(nextData.videoStyleOverrides || {}),
            [preset.id]: editedStyle
          };
          const nextTemplateConfig = {
            ...getStyleTemplateConfig(preset.id),
            theme: isLightHexColor(editedStyle.colorTheme.background) ? "light" : "dark"
          };

          AppState.setProjectData({
            ...nextData,
            videoStyleId: preset.id,
            videoStyleOverrides: nextOverrides,
            templateConfig: nextTemplateConfig
          });
          closeModal();
          renderTemplateScreen(container, AppState.getProjectData());
          showToast("Đã lưu style video.");
        }
      }
    ]);
    DOM.modalContainer.classList.add("is-style-editor");

    const setPickrButtonColor = (button, color) => {
      const normalized = normalizeHexColor(color, "#000000");
      const swatch = button.querySelector(".style-pickr-swatch");
      const value = button.querySelector(".style-pickr-value");
      if (swatch) {
        swatch.style.backgroundColor = normalized;
      }
      if (value) {
        value.textContent = normalized;
      }
    };

    modalBody.querySelectorAll(".style-pickr-button").forEach((button) => {
      const colorKey = button.getAttribute("data-color-key");
      const colorLabel = button.getAttribute("data-color-label") || colorKey;
      setPickrButtonColor(button, styleColorState[colorKey]);

      if (typeof Pickr === "undefined") {
        const fallbackInput = document.createElement("input");
        fallbackInput.type = "color";
        fallbackInput.value = styleColorState[colorKey];
        fallbackInput.setAttribute("aria-hidden", "true");
        fallbackInput.tabIndex = -1;
        fallbackInput.style.position = "absolute";
        fallbackInput.style.width = "1px";
        fallbackInput.style.height = "1px";
        fallbackInput.style.opacity = "0";
        fallbackInput.style.pointerEvents = "none";
        button.after(fallbackInput);
        button.title = "Dùng bộ chọn màu mặc định của trình duyệt.";
        button.addEventListener("click", () => fallbackInput.click());
        fallbackInput.addEventListener("input", () => {
          const nextColor = normalizeHexColor(fallbackInput.value, styleColorState[colorKey]);
          styleColorState[colorKey] = nextColor;
          setPickrButtonColor(button, nextColor);
          refreshModalPreview();
        });
        return;
      }

      const pickr = Pickr.create({
        el: button,
        theme: "classic",
        default: styleColorState[colorKey],
        useAsButton: true,
        components: {
          preview: true,
          opacity: false,
          hue: true,
          interaction: {
            hex: true,
            input: true,
            clear: false,
            save: false,
            cancel: false
          }
        }
      });

      button.setAttribute("aria-label", `Chọn màu ${colorLabel}`);

      pickr.on("change", (color) => {
        const nextColor = normalizeHexColor(color.toHEXA().toString(), styleColorState[colorKey]);
        styleColorState[colorKey] = nextColor;
        setPickrButtonColor(button, nextColor);
        refreshModalPreview();
      });
    });

    const glowOpacityInput = modalBody.querySelector("#style-glow-opacity");
    const glowOpacityValue = modalBody.querySelector("#style-glow-opacity-value");
    if (glowOpacityInput && glowOpacityValue) {
      glowOpacityInput.addEventListener("input", () => {
        glowOpacityValue.textContent = `${Math.round(Number.parseFloat(glowOpacityInput.value || "0") * 100)}%`;
      });
    }

    modalBody.querySelectorAll("input, select").forEach((input) => {
      input.addEventListener("input", refreshModalPreview);
      input.addEventListener("change", refreshModalPreview);
    });
    refreshModalPreview();
  };

  const openSceneItemModal = (container) => {
    const slotTypes = Array.isArray(SCENE_SLOT_TYPES) ? SCENE_SLOT_TYPES : [];
    const defaultAppearance = getSceneItemAppearanceDefaults({ type: slotTypes[0] ? slotTypes[0].id : "text" });

    const modalBody = document.createElement("div");
    modalBody.innerHTML = `
      <div class="scene-item-modal-form">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="modal-scene-item-label">Tên item *</label>
            <input id="modal-scene-item-label" class="form-control" type="text" placeholder="Ví dụ: Subtitle, Screenshot, CTA">
          </div>
          <div class="form-group">
            <label class="form-label" for="modal-scene-item-type">Loại item</label>
            <select id="modal-scene-item-type" class="form-control">
              ${slotTypes.map((type) => `
                <option value="${escapeAttribute(type.id)}">${escapeText(type.label)}</option>
              `).join("")}
            </select>
          </div>
        </div>

        <div class="scene-item-contract-box">
          <strong>Scene Item mới phải chọn cách dùng Video Style.</strong>
          <span>Type là loại dữ liệu. Color role quyết định dùng token Text/Muted/Accent. Display style quyết định có nền, border, pill hay media frame.</span>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="modal-scene-item-color-role">Color role</label>
            <select id="modal-scene-item-color-role" class="form-control">
              ${SCENE_ITEM_COLOR_ROLES.map((role) => `
                <option value="${escapeAttribute(role.id)}" ${role.id === defaultAppearance.colorRole ? "selected" : ""}>${escapeText(role.label)}</option>
              `).join("")}
            </select>
            <div class="form-hint" id="modal-scene-item-color-hint">${escapeText(getSceneItemColorRole(defaultAppearance.colorRole).hint)}</div>
          </div>
          <div class="form-group">
            <label class="form-label" for="modal-scene-item-display-style">Display style</label>
            <select id="modal-scene-item-display-style" class="form-control">
              ${SCENE_ITEM_DISPLAY_STYLES.map((style) => `
                <option value="${escapeAttribute(style.id)}" ${style.id === defaultAppearance.displayStyle ? "selected" : ""}>${escapeText(style.label)}</option>
              `).join("")}
            </select>
            <div class="form-hint" id="modal-scene-item-style-hint">${escapeText(getSceneItemDisplayStyle(defaultAppearance.displayStyle).hint)}</div>
          </div>
        </div>

        <div class="form-group">
          <label class="scene-item-toggle-row" for="modal-scene-item-enabled">
            <input id="modal-scene-item-enabled" type="checkbox" checked>
            <span class="scene-item-toggle-track" aria-hidden="true"></span>
            <span>Bật item view này trong thư viện</span>
          </label>
        </div>
      </div>
    `;

    const syncSceneItemAppearanceHints = () => {
      const roleSelect = modalBody.querySelector("#modal-scene-item-color-role");
      const styleSelect = modalBody.querySelector("#modal-scene-item-display-style");
      const roleHint = modalBody.querySelector("#modal-scene-item-color-hint");
      const styleHint = modalBody.querySelector("#modal-scene-item-style-hint");

      if (roleHint && roleSelect) {
        roleHint.textContent = getSceneItemColorRole(roleSelect.value).hint;
      }
      if (styleHint && styleSelect) {
        styleHint.textContent = getSceneItemDisplayStyle(styleSelect.value).hint;
      }
    };

    modalBody.querySelector("#modal-scene-item-type").addEventListener("change", (event) => {
      const appearance = getSceneItemAppearanceDefaults({
        type: event.target.value,
        label: modalBody.querySelector("#modal-scene-item-label").value
      });
      modalBody.querySelector("#modal-scene-item-color-role").value = appearance.colorRole;
      modalBody.querySelector("#modal-scene-item-display-style").value = appearance.displayStyle;
      syncSceneItemAppearanceHints();
    });
    modalBody.querySelector("#modal-scene-item-color-role").addEventListener("change", syncSceneItemAppearanceHints);
    modalBody.querySelector("#modal-scene-item-display-style").addEventListener("change", syncSceneItemAppearanceHints);

    showModal("Thêm Scene Item", modalBody, [
      { text: "Hủy", class: "btn-secondary", onClick: closeModal },
      {
        text: "Thêm item",
        class: "btn-primary",
        onClick: () => {
          const label = normalizeText(document.getElementById("modal-scene-item-label").value);
          const type = document.getElementById("modal-scene-item-type").value;
          const colorRole = document.getElementById("modal-scene-item-color-role").value;
          const displayStyle = document.getElementById("modal-scene-item-display-style").value;
          const enabled = document.getElementById("modal-scene-item-enabled").checked;

          if (!label) {
            showToast("Cần nhập tên item.", "error");
            return;
          }

          const baseId = label.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "")
            .slice(0, 36) || "item";
          const currentData = AppState.getProjectData();
          const existingIds = new Set([
            ...(Array.isArray(SCENE_ITEM_VIEW_PRESETS) ? SCENE_ITEM_VIEW_PRESETS : []),
            ...(Array.isArray(currentData.sceneItemViews) ? currentData.sceneItemViews : [])
          ].map((item) => item.id));
          let nextId = baseId;
          let suffix = 2;
          while (existingIds.has(nextId)) {
            nextId = `${baseId}-${suffix}`;
            suffix += 1;
          }

          const sceneItemViews = Array.isArray(currentData.sceneItemViews) ? [...currentData.sceneItemViews] : [];
          sceneItemViews.push({
            id: nextId,
            label,
            type,
            colorRole,
            displayStyle,
            enabled
          });

          AppState.updateProjectField("sceneItemViews", sceneItemViews);
          renderTemplateScreen(container, AppState.getProjectData());
          closeModal();
          showToast("Đã thêm Scene Item.");
        }
      }
    ]);
  };

  const openSceneTemplateModal = (container, templateId = null, preferredAspectRatio = templateRatioFilter) => {
    const currentData = AppState.getProjectData();
    const sceneTemplates = getProjectSceneTemplates(currentData);
    const slotTypes = Array.isArray(SCENE_SLOT_TYPES) ? SCENE_SLOT_TYPES : [];
    const animations = Array.isArray(SCENE_SLOT_ANIMATIONS) ? SCENE_SLOT_ANIMATIONS : [];
    const template = sceneTemplates.find((item) => item.id === templateId) || null;
    const isEditing = Boolean(template);
    const fallbackSlotType = slotTypes[0] ? slotTypes[0].id : "text";
    const sceneItemViews = getProjectSceneItemViews(currentData);
    const createSlug = (value, fallback = "scene-template") => {
      const base = normalizeText(value)
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 42);

      return base || fallback;
    };
    const getUniqueTemplateId = (name) => {
      const existingIds = new Set(sceneTemplates.map((item) => item.id));
      const baseId = createSlug(name);
      let nextId = baseId;
      let suffix = 2;

      while (existingIds.has(nextId)) {
        nextId = `${baseId}-${suffix}`;
        suffix += 1;
      }

      return nextId;
    };
    const clampNumber = (value, min, max) => Math.min(max, Math.max(min, Number(value) || min));
    const initialAspectRatios = getSceneTemplateAspectRatios(template);
    const initialAspectRatio = initialAspectRatios.includes(preferredAspectRatio)
      ? preferredAspectRatio
      : initialAspectRatios.includes("16:9") && !initialAspectRatios.includes("9:16")
        ? "16:9"
        : initialAspectRatios[0] || preferredAspectRatio || "9:16";
    let currentAspectRatio = initialAspectRatio;
    const getDefaultSlotLayout = (slot, index) => getSceneSlotLayout(slot, index, currentAspectRatio);

    let slotDrafts = (template && Array.isArray(template.slots) ? template.slots : [
      { id: "title", label: "Title", type: "text", required: true, defaultDelay: 0, allowedAnimations: ["fade-up"] },
      { id: "description", label: "Description", type: "text", required: false, defaultDelay: 0.8, allowedAnimations: ["fade-up"] }
    ]).map((slot, index) => ({
      id: slot.id || `slot-${index + 1}`,
      label: slot.label || `Slot ${index + 1}`,
      sourceItemLabel: slot.sourceItemLabel || slot.sceneItemLabel || slot.itemLabel || slot.label || getSlotTypeLabel(slot.type || fallbackSlotType),
      type: slot.type || fallbackSlotType,
      colorRole: slot.colorRole || getSceneItemAppearanceDefaults(slot).colorRole,
      displayStyle: slot.displayStyle || getSceneItemAppearanceDefaults(slot).displayStyle,
      required: Boolean(slot.required),
      defaultDelay: 0,
      allowedAnimations: Array.isArray(slot.allowedAnimations) && slot.allowedAnimations.length
        ? [slot.allowedAnimations[0]]
        : ["none"],
      layout: getDefaultSlotLayout(slot, index)
    }));
    let selectedSlotIndex = 0;
    let suppressPreviewClick = false;
    const modalBody = document.createElement("div");
    const getSlotTypeLabel = (typeId) => {
      const slotType = slotTypes.find((type) => type.id === typeId);
      return slotType ? slotType.label : typeId;
    };
    const renderSceneItemPalette = () => {
      if (!sceneItemViews.length) {
        return `<div class="scene-template-palette-empty">Chưa có scene item nào.</div>`;
      }

      return sceneItemViews.map((item) => `
        <button class="scene-template-palette-item slot-${escapeAttribute(item.type)}" type="button" data-palette-item-id="${escapeAttribute(item.id)}">
          <span class="scene-template-palette-preview" aria-hidden="true">
            ${renderSceneItemPreview(item)}
          </span>
          <span class="scene-template-palette-copy">
            <strong>${escapeText(item.label)}</strong>
            <small>${escapeText(getSlotTypeLabel(item.type))} · ${escapeText(getSceneItemDisplayStyle(item.displayStyle).label)}</small>
          </span>
        </button>
      `).join("");
    };
    const getPreviewSlotStyle = (slot, index) => getSceneSlotStyle(slot, index);
    const renderPreview = () => {
      const previewStage = modalBody.querySelector("#scene-template-preview-stage");
      if (!previewStage) {
        return;
      }

      previewStage.innerHTML = `
        <span class="scene-template-preview-safe is-top"></span>
        <span class="scene-template-preview-safe is-bottom"></span>
        <span class="scene-template-center-guide is-vertical" data-center-guide="vertical" aria-hidden="true"></span>
        <span class="scene-template-center-guide is-horizontal" data-center-guide="horizontal" aria-hidden="true"></span>
        ${slotDrafts.map((slot, index) => `
          <div
            class="scene-template-preview-item slot-${escapeAttribute(slot.type)} ${selectedSlotIndex === index ? "is-selected" : ""}"
            role="button"
            tabindex="-1"
            data-preview-slot-index="${index}"
            style="${getPreviewSlotStyle(slot, index)}"
            title="Kéo để đổi vị trí ${escapeAttribute(slot.label)}"
          >
            <b class="scene-template-preview-index">${index + 1}</b>
            <span>${escapeText(slot.label)}</span>
            <i class="scene-template-resize-handle" data-resize-handle="se" aria-hidden="true"></i>
          </div>
        `).join("")}
      `;
    };
    const renderSlotRow = (slot, index) => `
      <article class="scene-template-slot-row ${selectedSlotIndex === index ? "is-selected" : ""}" data-slot-index="${index}">
        <div class="scene-template-slot-head">
          <span class="scene-template-slot-number">${index + 1}</span>
          <strong>${escapeText(slot.sourceItemLabel || getSlotTypeLabel(slot.type) || slot.label || `Slot ${index + 1}`)}</strong>
          <button class="scene-template-slot-remove" type="button" data-slot-action="remove" aria-label="Xóa slot ${escapeAttribute(slot.label || `Slot ${index + 1}`)}">
            ${renderIcon("trash")}
          </button>
        </div>
        <div class="scene-template-slot-grid">
          <div class="form-group">
            <label class="form-label" for="scene-template-slot-label-${index}">Tên slot</label>
            <input id="scene-template-slot-label-${index}" class="form-control" data-slot-field="label" type="text" value="${escapeAttribute(slot.label)}">
          </div>
          <div class="form-group">
            <label class="form-label" for="scene-template-slot-delay-${index}">Delay</label>
            <input id="scene-template-slot-delay-${index}" class="form-control" data-slot-field="defaultDelay" type="number" min="0" step="0.1" value="${escapeAttribute(String(slot.defaultDelay))}">
          </div>
        </div>
        <div class="scene-template-slot-options">
          <div class="form-group scene-template-animation-field">
            <label class="form-label" for="scene-template-slot-animation-${index}">Animation</label>
            <select id="scene-template-slot-animation-${index}" class="form-control" data-slot-animation-select>
              ${animations.map((animation) => `
                <option value="${escapeAttribute(animation.id)}" ${slot.allowedAnimations.includes(animation.id) ? "selected" : ""}>${escapeText(animation.label)}</option>
              `).join("")}
            </select>
          </div>
          <label class="scene-item-toggle-row" for="scene-template-slot-required-${index}">
            <input id="scene-template-slot-required-${index}" data-slot-field="required" type="checkbox" ${slot.required ? "checked" : ""}>
            <span class="scene-item-toggle-track" aria-hidden="true"></span>
            <span>Bắt buộc</span>
          </label>
        </div>
      </article>
    `;
    const renderSlots = () => {
      const slotList = modalBody.querySelector("#scene-template-slot-list");
      if (!slotList) {
        return;
      }

      slotList.innerHTML = slotDrafts.map(renderSlotRow).join("");
      renderPreview();
    };
    const syncSlotDraftsFromForm = () => {
      const rows = Array.from(modalBody.querySelectorAll(".scene-template-slot-row"));
      slotDrafts = rows.map((row, index) => {
        const previousSlot = slotDrafts[index] || {};
        const label = normalizeText(row.querySelector('[data-slot-field="label"]')?.value || `Slot ${index + 1}`);
        const defaultAnimation = animations[0] ? animations[0].id : "none";
        const selectedAnimation = row.querySelector("[data-slot-animation-select]")?.value || defaultAnimation;

        return {
          id: createSlug(label, `slot-${index + 1}`),
          label,
          sourceItemLabel: previousSlot.sourceItemLabel || previousSlot.label || getSlotTypeLabel(previousSlot.type || fallbackSlotType),
          type: previousSlot.type || fallbackSlotType,
          colorRole: previousSlot.colorRole || getSceneItemAppearanceDefaults(previousSlot).colorRole,
          displayStyle: previousSlot.displayStyle || getSceneItemAppearanceDefaults(previousSlot).displayStyle,
          required: Boolean(row.querySelector('[data-slot-field="required"]')?.checked),
          defaultDelay: Math.max(0, Number(row.querySelector('[data-slot-field="defaultDelay"]')?.value || 0)),
          allowedAnimations: [selectedAnimation],
          layout: previousSlot.layout || getDefaultSlotLayout(previousSlot, index)
        };
      });
    };
    const focusSlotRow = (index) => {
      const modalScroller = DOM.modalBody;
      const previousModalScrollTop = modalScroller ? modalScroller.scrollTop : 0;
      selectedSlotIndex = Math.max(0, Math.min(index, slotDrafts.length - 1));
      renderPreview();
      if (modalScroller) {
        modalScroller.scrollTop = previousModalScrollTop;
      }

      modalBody.querySelectorAll(".scene-template-slot-row").forEach((row) => {
        row.classList.toggle("is-selected", Number(row.getAttribute("data-slot-index")) === selectedSlotIndex);
      });

      const slotRow = modalBody.querySelector(`.scene-template-slot-row[data-slot-index="${selectedSlotIndex}"]`);
      const slotList = modalBody.querySelector("#scene-template-slot-list");
      if (slotRow && slotList) {
        const nextScrollTop = slotRow.offsetTop
          - slotList.offsetTop
          - ((slotList.clientHeight - slotRow.offsetHeight) / 2);
        const restoreModalScroll = () => {
          if (modalScroller) {
            modalScroller.scrollTop = previousModalScrollTop;
          }
        };
        slotList.scrollTop = Math.max(0, nextScrollTop);
        requestAnimationFrame(restoreModalScroll);
        setTimeout(restoreModalScroll, 0);
      }
    };
    const selectSlotPreview = (index) => {
      selectedSlotIndex = Math.max(0, Math.min(index, slotDrafts.length - 1));
      modalBody.querySelectorAll(".scene-template-preview-item").forEach((item) => {
        item.classList.toggle("is-selected", Number(item.getAttribute("data-preview-slot-index")) === selectedSlotIndex);
      });
      modalBody.querySelectorAll(".scene-template-slot-row").forEach((row) => {
        row.classList.toggle("is-selected", Number(row.getAttribute("data-slot-index")) === selectedSlotIndex);
      });
    };
    const syncCenterGuides = (stage, layout, isActive = true) => {
      const verticalGuide = stage ? stage.querySelector("[data-center-guide='vertical']") : null;
      const horizontalGuide = stage ? stage.querySelector("[data-center-guide='horizontal']") : null;
      if (!verticalGuide || !horizontalGuide || !isActive || !layout) {
        if (verticalGuide) {
          verticalGuide.classList.remove("is-visible");
        }
        if (horizontalGuide) {
          horizontalGuide.classList.remove("is-visible");
        }
        return;
      }

      const centerX = layout.x + (layout.width / 2);
      const centerY = layout.y + (layout.height / 2);
      verticalGuide.classList.toggle("is-visible", Math.abs(centerX - 50) <= 0.01);
      horizontalGuide.classList.toggle("is-visible", Math.abs(centerY - 50) <= 0.01);
    };
    const snapLayoutToCenterGuides = (layout) => {
      const snapThreshold = 1.2;
      const nextLayout = { ...layout };
      const centerX = nextLayout.x + (nextLayout.width / 2);
      const centerY = nextLayout.y + (nextLayout.height / 2);

      if (Math.abs(centerX - 50) <= snapThreshold) {
        nextLayout.x = 50 - (nextLayout.width / 2);
      }
      if (Math.abs(centerY - 50) <= snapThreshold) {
        nextLayout.y = 50 - (nextLayout.height / 2);
      }

      nextLayout.x = Math.round(clampNumber(nextLayout.x, 0, 100 - nextLayout.width) * 10) / 10;
      nextLayout.y = Math.round(clampNumber(nextLayout.y, 0, 100 - nextLayout.height) * 10) / 10;
      return nextLayout;
    };
    const getLayoutFromDropEvent = (event, slotSize = { width: 68, height: 7 }) => {
      const stage = modalBody.querySelector("#scene-template-preview-stage");
      const rect = stage.getBoundingClientRect();
      const width = clampNumber(slotSize.width, 12, 90);
      const height = clampNumber(slotSize.height, 5, 44);
      const x = ((event.clientX - rect.left) / rect.width) * 100 - (width / 2);
      const y = ((event.clientY - rect.top) / rect.height) * 100 - (height / 2);

      return {
        x: Math.round(clampNumber(x, 0, 100 - width) * 10) / 10,
        y: Math.round(clampNumber(y, 0, 100 - height) * 10) / 10,
        width,
        height
      };
    };
    const getLayoutFromPointerResize = (event, slotIndex) => {
      const stage = modalBody.querySelector("#scene-template-preview-stage");
      const rect = stage.getBoundingClientRect();
      const current = slotDrafts[slotIndex].layout || getDefaultSlotLayout(slotDrafts[slotIndex], slotIndex);
      const width = ((event.clientX - rect.left) / rect.width) * 100 - current.x;
      const height = ((event.clientY - rect.top) / rect.height) * 100 - current.y;

      return {
        ...current,
        width: Math.round(clampNumber(width, 12, 100 - current.x) * 10) / 10,
        height: Math.round(clampNumber(height, 5, 100 - current.y) * 10) / 10
      };
    };

    modalBody.innerHTML = `
      <div class="scene-template-editor-modal">
        <div class="scene-template-meta-grid">
          <div class="form-group">
            <label class="form-label" for="scene-template-name">Tên template *</label>
            <input id="scene-template-name" class="form-control" type="text" value="${escapeAttribute(template ? template.name : "")}" placeholder="Ví dụ: KPI Summary">
          </div>
          <div class="form-group">
            <label class="form-label" for="scene-template-duration">Thời lượng gợi ý</label>
            <input id="scene-template-duration" class="form-control" type="number" min="1" step="1" value="${escapeAttribute(template ? template.recommendedDurationSec : 8)}">
          </div>
          <div class="form-group">
            <label class="form-label" for="scene-template-ratio">Tỉ lệ hỗ trợ</label>
            <select id="scene-template-ratio" class="form-control">
              <option value="9:16" ${initialAspectRatio === "9:16" ? "selected" : ""}>Dọc 9:16</option>
              <option value="16:9" ${initialAspectRatio === "16:9" ? "selected" : ""}>Ngang 16:9</option>
            </select>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="scene-template-description">Mô tả</label>
          <textarea id="scene-template-description" class="form-control" rows="3" placeholder="Template này dùng cho loại phân đoạn nào">${escapeText(template ? template.description : "")}</textarea>
        </div>

        <div class="scene-template-designer ${initialAspectRatio === "16:9" ? "is-landscape" : "is-portrait"}">
          <section class="scene-template-preview-panel" aria-label="Preview vị trí scene item">
            <div class="scene-template-editor-section-head">
              <strong>Preview view</strong>
              <span>Kéo item vào frame hoặc kéo block đang có để đổi vị trí.</span>
            </div>
            <div class="scene-template-preview-shell">
              <div class="scene-template-preview-stage ${getSceneTemplateAspectClass({ aspectRatios: [initialAspectRatio] })}" id="scene-template-preview-stage"></div>
            </div>
          </section>

          <section class="scene-template-control-panel">
            <div class="scene-template-palette">
              <div class="scene-template-editor-section-head">
                <strong>Scene items</strong>
                <span>Kéo item vào preview để tạo slot.</span>
              </div>
              <div class="scene-template-palette-list">
                ${renderSceneItemPalette()}
              </div>
            </div>

            <div class="scene-template-slot-editor">
              <div class="scene-template-slot-toolbar">
                <div>
                  <strong>Slots</strong>
                  <span>Danh sách slot trong template.</span>
                </div>
              </div>
              <div class="scene-template-slot-list" id="scene-template-slot-list"></div>
            </div>
          </section>
        </div>
      </div>
    `;

    renderSlots();

    modalBody.addEventListener("click", (event) => {
      const removeButton = event.target.closest("[data-slot-action='remove']");
      const previewItem = event.target.closest("[data-preview-slot-index]");
      const slotRow = event.target.closest(".scene-template-slot-row");

      if (previewItem) {
        event.preventDefault();
        if (suppressPreviewClick) {
          suppressPreviewClick = false;
          return;
        }
        const index = Number(previewItem.getAttribute("data-preview-slot-index"));
        if (Number.isInteger(index)) {
          focusSlotRow(index);
        }
        return;
      }

      if (!removeButton) {
        if (slotRow) {
          const index = Number(slotRow.getAttribute("data-slot-index"));
          if (Number.isInteger(index)) {
            selectedSlotIndex = index;
            renderPreview();
            modalBody.querySelectorAll(".scene-template-slot-row").forEach((row) => {
              row.classList.toggle("is-selected", Number(row.getAttribute("data-slot-index")) === index);
            });
          }
        }
        return;
      }

      syncSlotDraftsFromForm();
      const row = removeButton.closest(".scene-template-slot-row");
      const index = Number(row && row.getAttribute("data-slot-index"));
      if (slotDrafts.length <= 1) {
        showToast("Scene template cần ít nhất một slot.", "warning");
        return;
      }
      slotDrafts.splice(index, 1);
      selectedSlotIndex = Math.max(0, Math.min(selectedSlotIndex, slotDrafts.length - 1));
      renderSlots();
    });

    modalBody.addEventListener("pointerdown", (event) => {
      const handle = event.target.closest("[data-resize-handle]");
      if (!handle) {
        return;
      }

      event.preventDefault();
      event.stopPropagation();
      const previewItem = handle.closest("[data-preview-slot-index]");
      const index = Number(previewItem && previewItem.getAttribute("data-preview-slot-index"));
      if (!Number.isInteger(index) || !slotDrafts[index]) {
        return;
      }

      focusSlotRow(index);
      const activePreviewItem = modalBody.querySelector(`.scene-template-preview-item[data-preview-slot-index="${index}"]`);

      const onPointerMove = (moveEvent) => {
        slotDrafts[index].layout = getLayoutFromPointerResize(moveEvent, index);
        if (activePreviewItem) {
          activePreviewItem.style.width = `${slotDrafts[index].layout.width}%`;
          activePreviewItem.style.height = `${slotDrafts[index].layout.height}%`;
        }
      };
      const onPointerUp = () => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    });

    modalBody.addEventListener("pointerdown", (event) => {
      const previewItem = event.target.closest(".scene-template-preview-item");
      if (!previewItem || event.target.closest("[data-resize-handle]")) {
        return;
      }

      event.preventDefault();
      const index = Number(previewItem.getAttribute("data-preview-slot-index"));
      const stage = modalBody.querySelector("#scene-template-preview-stage");
      if (!Number.isInteger(index) || !slotDrafts[index] || !stage) {
        return;
      }

      syncSlotDraftsFromForm();
      selectSlotPreview(index);

      const stageRect = stage.getBoundingClientRect();
      const itemRect = previewItem.getBoundingClientRect();
      const currentLayout = slotDrafts[index].layout || getDefaultSlotLayout(slotDrafts[index], index);
      const pointerOffsetX = ((event.clientX - itemRect.left) / stageRect.width) * 100;
      const pointerOffsetY = ((event.clientY - itemRect.top) / stageRect.height) * 100;
      let didMove = false;

      const moveToPointer = (moveEvent) => {
        const x = ((moveEvent.clientX - stageRect.left) / stageRect.width) * 100 - pointerOffsetX;
        const y = ((moveEvent.clientY - stageRect.top) / stageRect.height) * 100 - pointerOffsetY;
        const rawLayout = {
          ...currentLayout,
          x: Math.round(clampNumber(x, 0, 100 - currentLayout.width) * 10) / 10,
          y: Math.round(clampNumber(y, 0, 100 - currentLayout.height) * 10) / 10
        };
        const nextLayout = snapLayoutToCenterGuides(rawLayout);

        didMove = true;
        slotDrafts[index].layout = nextLayout;
        previewItem.style.left = `${nextLayout.x}%`;
        previewItem.style.top = `${nextLayout.y}%`;
        syncCenterGuides(stage, nextLayout);
      };

      const onPointerMove = (moveEvent) => {
        moveEvent.preventDefault();
        moveToPointer(moveEvent);
      };
      const onPointerUp = (upEvent) => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        if (didMove) {
          moveToPointer(upEvent);
          syncCenterGuides(stage, null, false);
          suppressPreviewClick = true;
          setTimeout(() => {
            suppressPreviewClick = false;
          }, 120);
        } else {
          syncCenterGuides(stage, null, false);
        }
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    });

    modalBody.addEventListener("input", (event) => {
      if (!event.target.closest(".scene-template-slot-row")) {
        return;
      }

      syncSlotDraftsFromForm();
      renderPreview();
    });

    modalBody.addEventListener("change", (event) => {
      if (event.target.id !== "scene-template-ratio") {
        return;
      }

      const stage = modalBody.querySelector("#scene-template-preview-stage");
      if (!stage) {
        return;
      }

      const designer = modalBody.querySelector(".scene-template-designer");
      if (designer) {
        designer.classList.toggle("is-landscape", event.target.value === "16:9");
        designer.classList.toggle("is-portrait", event.target.value !== "16:9");
      }
      currentAspectRatio = event.target.value || "9:16";
      stage.classList.toggle("is-landscape", currentAspectRatio === "16:9");
      stage.classList.toggle("is-portrait", currentAspectRatio !== "16:9");
    });

    const addPaletteItemAsSlot = (item, sourceEvent) => {
      if (!item) {
        return false;
      }

      syncSlotDraftsFromForm();
      const nextSlot = {
        id: createSlug(item.label, `slot-${slotDrafts.length + 1}`),
        label: item.label,
        sourceItemLabel: item.label,
        type: item.type || fallbackSlotType,
        colorRole: item.colorRole || getSceneItemAppearanceDefaults(item).colorRole,
        displayStyle: item.displayStyle || getSceneItemAppearanceDefaults(item).displayStyle,
        required: false,
        defaultDelay: 0,
        allowedAnimations: ["none"],
        layout: getLayoutFromDropEvent(sourceEvent, getDefaultSlotLayout(item, slotDrafts.length))
      };

      slotDrafts.push(nextSlot);
      selectedSlotIndex = slotDrafts.length - 1;
      renderSlots();
      return true;
    };

    modalBody.addEventListener("pointerdown", (event) => {
      const paletteItem = event.target.closest("[data-palette-item-id]");
      if (!paletteItem) {
        return;
      }

      const item = sceneItemViews.find((sceneItem) => sceneItem.id === paletteItem.getAttribute("data-palette-item-id"));
      const stage = modalBody.querySelector("#scene-template-preview-stage");
      if (!item || !stage) {
        return;
      }

      event.preventDefault();
      let didMove = false;
      const ghost = paletteItem.cloneNode(true);
      ghost.classList.add("is-pointer-drag-ghost");
      ghost.style.width = `${paletteItem.getBoundingClientRect().width}px`;
      document.body.appendChild(ghost);

      const moveGhost = (moveEvent) => {
        ghost.style.transform = `translate3d(${Math.round(moveEvent.clientX + 12)}px, ${Math.round(moveEvent.clientY + 12)}px, 0)`;
      };
      moveGhost(event);

      const syncDragOverState = (moveEvent) => {
        const rect = stage.getBoundingClientRect();
        const isOverStage = moveEvent.clientX >= rect.left
          && moveEvent.clientX <= rect.right
          && moveEvent.clientY >= rect.top
          && moveEvent.clientY <= rect.bottom;
        stage.classList.toggle("is-drag-over", isOverStage);
        return isOverStage;
      };
      const onPointerMove = (moveEvent) => {
        didMove = true;
        moveGhost(moveEvent);
        syncDragOverState(moveEvent);
      };
      const onPointerUp = (upEvent) => {
        window.removeEventListener("pointermove", onPointerMove);
        window.removeEventListener("pointerup", onPointerUp);
        ghost.remove();
        const isOverStage = syncDragOverState(upEvent);
        stage.classList.remove("is-drag-over");
        if (didMove && isOverStage) {
          addPaletteItemAsSlot(item, upEvent);
        }
      };

      window.addEventListener("pointermove", onPointerMove);
      window.addEventListener("pointerup", onPointerUp);
    });

    modalBody.addEventListener("dragstart", (event) => {
      const paletteItem = event.target.closest("[data-palette-item-id]");
      const previewItem = event.target.closest("[data-preview-slot-index]");

      if (paletteItem) {
        const payload = JSON.stringify({
          source: "palette",
          itemId: paletteItem.getAttribute("data-palette-item-id")
        });
        event.dataTransfer.setData("application/json", payload);
        event.dataTransfer.setData("text/plain", payload);
        event.dataTransfer.effectAllowed = "copy";
        return;
      }

      if (previewItem) {
        if (event.target.closest("[data-resize-handle]")) {
          event.preventDefault();
          return;
        }
        const payload = JSON.stringify({
          source: "slot",
          index: Number(previewItem.getAttribute("data-preview-slot-index"))
        });
        event.dataTransfer.setData("application/json", payload);
        event.dataTransfer.setData("text/plain", payload);
        event.dataTransfer.effectAllowed = "move";
      }
    });

    modalBody.addEventListener("dragover", (event) => {
      if (!event.target.closest("#scene-template-preview-stage")) {
        return;
      }

      event.preventDefault();
      event.dataTransfer.dropEffect = "move";
      modalBody.querySelector("#scene-template-preview-stage").classList.add("is-drag-over");
    });

    modalBody.addEventListener("dragleave", (event) => {
      const stage = modalBody.querySelector("#scene-template-preview-stage");
      if (stage && !stage.contains(event.relatedTarget)) {
        stage.classList.remove("is-drag-over");
      }
    });

    modalBody.addEventListener("drop", (event) => {
      const stage = event.target.closest("#scene-template-preview-stage");
      if (!stage) {
        return;
      }

      event.preventDefault();
      stage.classList.remove("is-drag-over");
      syncSlotDraftsFromForm();

      let payload = {};
      try {
        payload = JSON.parse(event.dataTransfer.getData("application/json") || event.dataTransfer.getData("text/plain") || "{}");
      } catch (error) {
        payload = {};
      }

      if (payload.source === "slot" && Number.isInteger(payload.index) && slotDrafts[payload.index]) {
        const currentLayout = slotDrafts[payload.index].layout || getDefaultSlotLayout(slotDrafts[payload.index], payload.index);
        slotDrafts[payload.index].layout = getLayoutFromDropEvent(event, currentLayout);
        selectedSlotIndex = payload.index;
        renderSlots();
        return;
      }

      if (payload.source === "palette") {
        const item = sceneItemViews.find((sceneItem) => sceneItem.id === payload.itemId);
        addPaletteItemAsSlot(item, event);
      }
    });

    showModal(isEditing ? `Sửa Scene Template: ${template.name}` : "Thêm Scene Template", modalBody, [
      { text: "Hủy", class: "btn-secondary", onClick: closeModal },
      {
        text: isEditing ? "Lưu template" : "Thêm template",
        class: "btn-primary",
        onClick: () => {
          syncSlotDraftsFromForm();

          const name = normalizeText(document.getElementById("scene-template-name").value);
          const description = normalizeText(document.getElementById("scene-template-description").value);
          const aspectRatio = document.getElementById("scene-template-ratio").value || "9:16";
          const category = template && template.category ? template.category : (aspectRatio === "16:9" ? "landscape" : "vertical");
          const aspectRatios = [aspectRatio];
          const recommendedDurationSec = Math.max(1, Math.round(Number(document.getElementById("scene-template-duration").value || 8)));
          const slots = slotDrafts
            .map((slot, index) => ({
              ...slot,
              id: createSlug(slot.label, `slot-${index + 1}`),
              label: normalizeText(slot.label),
              layout: getSceneSlotLayout(slot, index)
            }))
            .filter((slot) => slot.label);

          if (!name) {
            showToast("Cần nhập tên scene template.", "error");
            return;
          }
          if (aspectRatios.length === 0) {
            showToast("Cần chọn ít nhất một tỉ lệ.", "error");
            return;
          }
          if (slots.length === 0) {
            showToast("Cần ít nhất một slot có tên.", "error");
            return;
          }

          const nextData = AppState.getProjectData();
          const customSceneTemplates = Array.isArray(nextData.customSceneTemplates)
            ? [...nextData.customSceneTemplates]
            : [];
          const nextTemplate = {
            id: template ? template.id : getUniqueTemplateId(name),
            name,
            description,
            category,
            aspectRatios,
            supportedAspectRatios: aspectRatios,
            recommendedDurationSec,
            slots
          };
          const existingIndex = customSceneTemplates.findIndex((item) => item.id === nextTemplate.id);

          if (existingIndex >= 0) {
            customSceneTemplates[existingIndex] = nextTemplate;
          } else {
            customSceneTemplates.push(nextTemplate);
          }

          AppState.setProjectData({
            ...nextData,
            customSceneTemplates
          });
          closeModal();
          renderTemplateScreen(container, AppState.getProjectData());
          showToast(isEditing ? "Đã lưu Scene Template." : "Đã thêm Scene Template.");
        }
      }
    ]);
    DOM.modalContainer.classList.add("is-scene-template-editor");
  };

  // 6. Template & Theme Picker View
  const renderTemplateScreen = (container, data) => {
    const videoStyles = Array.isArray(VIDEO_STYLES) ? VIDEO_STYLES : [];
    const sceneTemplates = getProjectSceneTemplates(data);
    const slotTypes = Array.isArray(SCENE_SLOT_TYPES) ? SCENE_SLOT_TYPES : [];
    const selectedVideoStyle = resolveVideoStyle(data.videoStyleId, data) || videoStyles[0];
    const filteredSceneTemplates = templateRatioFilter === "all"
      ? sceneTemplates
      : sceneTemplates.filter((template) => getSceneTemplateAspectRatios(template).includes(templateRatioFilter));
    const escapeText = (value) => String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
    const getSlotTypeLabel = (typeId) => {
      const slotType = slotTypes.find((type) => type.id === typeId);
      return slotType ? slotType.label : typeId;
    };
    const getSlotTypeIcon = (typeId) => {
      const icons = {
        text: "text",
        asset: "shapes",
        media: "image",
        list: "list",
        tag: "tag"
      };
      return icons[typeId] || "grid";
    };
    const getLegacyTemplate = () => TEMPLATES_LIST.find((template) => template.id === data.templateId) || TEMPLATES_LIST[0];
    const renderSceneWireframe = (template) => `
      <div class="scene-wireframe scene-wireframe-${template.id} ${getSceneTemplateAspectClass(template, templateRatioFilter)}" aria-hidden="true">
        <span class="scene-wire-safe-area is-top"></span>
        <span class="scene-wire-safe-area is-bottom"></span>
        ${template.slots.slice(0, 7).map((slot, index) => `
          <span class="scene-wire-slot slot-${slot.type} ${slot.required ? "is-required" : ""}" style="${getSceneSlotStyle(slot, index, templateRatioFilter)}">
            ${escapeText(slot.label)}
          </span>
        `).join("")}
      </div>
    `;
    const sceneItemViews = getProjectSceneItemViews(data);
    const renderSceneItemViews = (items) => {
      if (!Array.isArray(items) || items.length === 0) {
        return `<div class="template-empty-state">Chưa có item view trong thư viện.</div>`;
      }

      return items.map((item) => `
        <article class="scene-item-view-card slot-${item.type} scene-item-style-${escapeAttribute(item.displayStyle)}">
          <div class="scene-item-view-preview" aria-hidden="true">
            ${renderSceneItemPreview(item)}
          </div>
          <div class="scene-item-view-copy">
            <span class="scene-item-view-type">
              ${renderIcon(getSlotTypeIcon(item.type))}
              ${escapeText(getSlotTypeLabel(item.type))}
            </span>
            <strong>${escapeText(item.label)}</strong>
            <small>${escapeText(getSceneItemColorRole(item.colorRole).label)} · ${escapeText(getSceneItemDisplayStyle(item.displayStyle).label)}</small>
          </div>
        </article>
      `).join("");
    };

    container.innerHTML = `
      <div class="workspace-header template-workspace-header">
        <div>
          <h1>Template</h1>
          <p class="workspace-subtitle">Chọn style chung của video và xem thư viện layout cho từng phân đoạn.</p>
        </div>
      </div>

      <div class="template-workspace-grid">
        <div class="template-main-column">
          <section class="app-section">
            <div class="app-section-header">
              <div>
                <span class="app-section-eyebrow">${renderIcon("palette")} Video Style</span>
                <span class="app-section-helper">Style chung toàn video · Chọn preset hoặc chỉnh màu trong từng style.</span>
              </div>
            </div>
            <div class="app-section-content">
              <div class="video-style-grid">
                ${videoStyles.map((style) => `
                  <div class="video-style-card style-${style.id} ${selectedVideoStyle && selectedVideoStyle.id === style.id ? "active" : ""}" data-style-id="${style.id}">
                    <button class="video-style-select-area" type="button" data-style-id="${style.id}">
                      <span class="video-style-preview">
                        <span class="video-style-preview-surface"></span>
                        <span class="video-style-preview-line is-strong"></span>
                        <span class="video-style-preview-line"></span>
                        <span class="video-style-preview-accent"></span>
                      </span>
                      <span class="video-style-copy">
                        <strong>${escapeText(style.name)}</strong>
                        <small>${escapeText(style.description)}</small>
                      </span>
                      <span class="video-style-meta">${escapeText((resolveVideoStyle(style.id, data) || style).motionStyle)} · ${escapeText((resolveVideoStyle(style.id, data) || style).backgroundStyle)}${(resolveVideoStyle(style.id, data) || style).isCustomized ? " · đã chỉnh" : ""}</span>
                    </button>
                    <button class="video-style-edit-btn" type="button" data-style-id="${style.id}" aria-label="Sửa style ${escapeText(style.name)}">
                      ${renderIcon("pen")}
                    </button>
                  </div>
                `).join("")}
              </div>
            </div>
          </section>

          <section class="app-section">
            <div class="app-section-header">
              <div>
                <span class="app-section-eyebrow">${renderIcon("grid")} Scene Templates</span>
                <span class="app-section-helper">Layout cho từng phân đoạn</span>
              </div>
              <button class="app-section-action scene-template-create-btn" type="button">
                ${renderIcon("plus")}
                <span>Thêm template</span>
              </button>
            </div>
            <div class="app-section-content">
              <div class="filter-group template-ratio-filter" role="group" aria-label="Lọc scene template theo tỉ lệ">
                <button class="filter-btn ratio-filter-btn ${templateRatioFilter === '9:16' ? 'active' : ''}" data-ratio="9:16">Dọc 9:16</button>
                <button class="filter-btn ratio-filter-btn ${templateRatioFilter === '16:9' ? 'active' : ''}" data-ratio="16:9">Ngang 16:9</button>
              </div>

              <div class="scene-template-grid ${templateRatioFilter === "16:9" ? "is-landscape" : "is-portrait"}">
                ${filteredSceneTemplates.length === 0 ? `
                  <div class="template-empty-state">Không có scene template phù hợp tỉ lệ này.</div>
                ` : filteredSceneTemplates.map((template) => `
                  <div class="scene-template-card" data-template-id="${template.id}">
                    <button class="scene-template-select-area" type="button" data-template-id="${template.id}">
                      ${renderSceneWireframe(template)}
                      <span class="scene-template-copy">
                        <strong>${escapeText(template.name)}</strong>
                        <small>${escapeText(template.description)}</small>
                      </span>
                      <span class="scene-template-meta">
                        <span>${escapeText(template.category)}</span>
                        <span>${template.recommendedDurationSec}s</span>
                        <span>${template.slots.length} slot</span>
                      </span>
                    </button>
                    <button class="scene-template-edit-btn" type="button" data-template-id="${template.id}" aria-label="Sửa template ${escapeText(template.name)}">
                      ${renderIcon("pen")}
                    </button>
                  </div>
                `).join("")}
              </div>
            </div>
          </section>

          <section class="app-section">
            <div class="app-section-header">
              <div>
                <span class="app-section-eyebrow">${renderIcon("layers")} Scene Items</span>
                <span class="app-section-helper">Thư viện item view dùng chung. Khi sửa scene template chi tiết sẽ chọn item từ đây để đưa vào frame.</span>
              </div>
              <button class="app-section-action scene-item-create-btn" type="button">
                ${renderIcon("plus")}
                <span>Thêm item</span>
              </button>
            </div>
            <div class="app-section-content">
              <div class="scene-item-view-grid">
                ${renderSceneItemViews(sceneItemViews)}
              </div>
            </div>
          </section>
        </div>
      </div>
    `;

    container.querySelectorAll(".video-style-select-area").forEach((card) => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-style-id");
        const nextData = {
          ...AppState.getProjectData(),
          videoStyleId: id,
          templateConfig: getStyleTemplateConfig(id)
        };
        AppState.setProjectData(nextData);
        renderTemplateScreen(container, nextData);
      });
    });

    container.querySelectorAll(".video-style-card").forEach((card) => {
      applyStylePreviewVariables(card, resolveVideoStyle(card.getAttribute("data-style-id"), AppState.getProjectData()));
    });

    container.querySelectorAll(".video-style-edit-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openVideoStyleModal(container, button.getAttribute("data-style-id"));
      });
    });

    container.querySelectorAll(".scene-template-select-area").forEach((button) => {
      button.addEventListener("click", () => {
        const id = button.getAttribute("data-template-id");
        openSceneTemplateModal(container, id, templateRatioFilter);
      });
    });

    container.querySelectorAll(".scene-template-edit-btn").forEach((button) => {
      button.addEventListener("click", (event) => {
        event.stopPropagation();
        openSceneTemplateModal(container, button.getAttribute("data-template-id"), templateRatioFilter);
      });
    });

    const sceneTemplateCreateButton = container.querySelector(".scene-template-create-btn");
    if (sceneTemplateCreateButton) {
      sceneTemplateCreateButton.addEventListener("click", () => {
        openSceneTemplateModal(container, null, templateRatioFilter);
      });
    }

    const sceneItemCreateButton = container.querySelector(".scene-item-create-btn");
    if (sceneItemCreateButton) {
      sceneItemCreateButton.addEventListener("click", () => {
        openSceneItemModal(container);
      });
    }

    // Ratio filter selection click
    container.querySelectorAll(".ratio-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        templateRatioFilter = btn.getAttribute("data-ratio");
        renderTemplateScreen(container, AppState.getProjectData());
      });
    });
  };

  // 7. Scene Preview View
  let autoplayTimer = null;
  const getPreviewPlayButtonHTML = (isPlaying) => isPlaying ? `
    <svg class="preview-play-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7V5Zm6 0h4v14h-4V5Z"/></svg>
    <span>Dừng</span>
  ` : `
    <svg class="preview-play-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7-11-7Z"/></svg>
    <span>Chạy thử</span>
  `;
  let previewSceneTimeSec = 0;
  const stopPreviewAutoplay = (showMessage = false) => {
    if (!autoplayTimer) {
      return;
    }

    clearInterval(autoplayTimer);
    autoplayTimer = null;
    const playButton = document.getElementById("btn-play-preview");
    if (playButton) {
      playButton.innerHTML = getPreviewPlayButtonHTML(false);
    }
    if (showMessage) {
      showToast("Đã dừng trình chiếu thử.", "info");
    }
  };

  const renderPreviewScreen = (container, data) => {
    const activeTemplate = TEMPLATES_LIST.find(t => t.id === data.templateId) || TEMPLATES_LIST[0];
    const activeSegments = (data.features || []).filter((item) => item.useInVideo);
    const sceneTemplates = getProjectSceneTemplates(data);
    const videoStyles = Array.isArray(VIDEO_STYLES) ? VIDEO_STYLES : [];
    const selectedVideoStyle = resolveVideoStyle(data.videoStyleId, data) || videoStyles[0] || null;
    const getSceneTemplate = (templateId) => sceneTemplates.find((template) => template.id === templateId)
      || sceneTemplates.find((template) => template.id === data.defaultSceneTemplateId)
      || sceneTemplates[0]
      || null;
    const getDefaultSlotValue = (slot, segment = {}) => {
      const primaryAssetId = data.primaryAssetId || ((data.assets || [])[0] && (data.assets || [])[0].id) || "";
      const base = {
        type: slot.type,
        delay: Number.isFinite(slot.defaultDelay) ? slot.defaultDelay : 0,
        animation: (slot.allowedAnimations && slot.allowedAnimations[0]) || "fade-up",
        enabled: true
      };
      if (slot.type === "asset" || slot.type === "media") return { ...base, assetId: primaryAssetId };
      if (slot.type === "list") {
        return { ...base, items: [segment.name, segment.description, segment.benefit].map((value) => String(value || "").trim()).filter(Boolean).slice(0, 4) };
      }
      if (slot.id === "title") return { ...base, text: segment.name || "" };
      if (slot.id === "description") return { ...base, text: segment.description || "" };
      if (slot.id === "tag" || slot.id === "kicker" || slot.id === "header" || slot.id === "cta") return { ...base, text: segment.benefit || segment.type || "" };
      return { ...base, text: "" };
    };
    const normalizeSegmentSlots = (segment = {}, template) => {
      if (!template) return {};
      return template.slots.reduce((slots, slot) => {
        const existing = segment.slots && segment.slots[slot.id] ? segment.slots[slot.id] : {};
        const fallback = getDefaultSlotValue(slot, segment);
        const delay = Number.parseFloat(existing.delay);
        slots[slot.id] = {
          ...fallback,
          ...existing,
          type: slot.type,
          delay: Number.isFinite(delay) ? Math.max(0, delay) : fallback.delay,
          animation: existing.animation || fallback.animation,
          enabled: slot.required ? true : existing.enabled !== false
        };
        return slots;
      }, {});
    };
    const slotScenes = activeSegments.map((segment, index) => {
      const sceneTemplate = getSceneTemplate(segment.sceneTemplateId);
      const durationSec = Math.min(30, Math.max(3, Number.parseInt(segment.durationSec, 10) || (sceneTemplate && sceneTemplate.recommendedDurationSec) || 8));
      return {
        id: segment.id || `segment-${index + 1}`,
        title: segment.name || `Đoạn ${index + 1}`,
        desc: segment.description || "",
        durationSec,
        duration: `${durationSec}s`,
        segment,
        sceneTemplate,
        slots: normalizeSegmentSlots(segment, sceneTemplate),
        isSlotScene: true
      };
    });
    const scenes = slotScenes.length > 0 ? slotScenes : activeTemplate.scenes.map((scene) => ({
      ...scene,
      durationSec: Number.parseInt(scene.duration, 10) || 8,
      isSlotScene: false
    }));
    const selectedIdx = Math.min(AppState.getSelectedSceneIndex(), Math.max(scenes.length - 1, 0));
    const currentScene = scenes[selectedIdx] || scenes[0];
    const ratioClass = activeTemplate.ratio === "9:16" ? "is-vertical" : "is-landscape";
    const estimatedDuration = activeSegments.reduce((total, item) => total + (Number.parseInt(item.durationSec, 10) || 8), 0);
    const sceneDuration = currentScene ? currentScene.duration : "0s";
    const sceneDurationSec = currentScene ? (Number.parseInt(currentScene.durationSec, 10) || Number.parseInt(currentScene.duration, 10) || 8) : 0;
    previewSceneTimeSec = Math.min(previewSceneTimeSec, sceneDurationSec);
    const escapeText = (value) => String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
    const activeSlotCount = currentScene && currentScene.sceneTemplate ? currentScene.sceneTemplate.slots.length : 0;

    container.innerHTML = `
      <div class="workspace-header preview-workspace-header">
        <div>
          <h1>Xem trước</h1>
          <p class="workspace-subtitle">Kiểm tra nhanh template, scene và nội dung kịch bản trước khi render.</p>
        </div>
        <div class="preview-header-meta">
          <span>${activeTemplate.ratio}</span>
          <strong>${escapeText(activeTemplate.name)}</strong>
        </div>
      </div>

      <div class="preview-layout">
        <section class="preview-pane" aria-label="Khung xem trước scene">
          <div class="preview-canvas-shell ${ratioClass}">
            <div id="preview-canvas" class="preview-canvas">
            </div>
          </div>

          <div class="preview-controls">
            <button id="btn-prev-scene" class="btn btn-secondary" ${selectedIdx === 0 ? 'disabled' : ''}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m15 18-6-6 6-6"/></svg>
              Cảnh trước
            </button>
            <button id="btn-play-preview" class="btn btn-secondary">
              ${getPreviewPlayButtonHTML(Boolean(autoplayTimer))}
            </button>
            <button id="btn-next-scene" class="btn btn-secondary" ${selectedIdx === scenes.length - 1 ? 'disabled' : ''}>
              Cảnh sau
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><path d="m9 18 6-6-6-6"/></svg>
            </button>
          </div>

          ${currentScene && currentScene.isSlotScene ? `
            <div class="preview-time-control">
              <label for="preview-time-range">
                <span>Thời điểm scene</span>
                <strong>${previewSceneTimeSec.toFixed(1)}s / ${sceneDurationSec}s</strong>
              </label>
              <input id="preview-time-range" type="range" min="0" max="${sceneDurationSec}" step="0.1" value="${previewSceneTimeSec}">
            </div>
          ` : ""}
        </section>

        <aside class="preview-side-panel" aria-label="Thông tin scene xem trước">
          <section class="preview-info-card">
            <div class="preview-info-header">
              <span>Scene đang xem</span>
              <strong>${selectedIdx + 1}/${scenes.length}</strong>
            </div>
            <h2>${escapeText(currentScene ? currentScene.title : "Chưa có scene")}</h2>
            <p>${escapeText(currentScene ? currentScene.desc : "Template chưa có mô tả scene.")}</p>
            <div class="preview-info-grid">
              <div><span>Thời lượng scene</span><strong>${escapeText(sceneDuration)}</strong></div>
              <div><span>${currentScene && currentScene.isSlotScene ? "Scene template" : "Kịch bản bật"}</span><strong>${currentScene && currentScene.sceneTemplate ? escapeText(currentScene.sceneTemplate.name) : activeSegments.length}</strong></div>
              <div><span>Ước tính</span><strong>${estimatedDuration}s</strong></div>
            </div>
          </section>

          <section class="preview-scene-list" aria-label="Danh sách scene">
            <div class="preview-section-title">${slotScenes.length > 0 ? "Phân đoạn slot-based" : "Danh sách scene"}</div>
            ${scenes.map((scene, index) => `
              <button class="scene-item ${selectedIdx === index ? 'active' : ''}" data-index="${index}" type="button">
                <span class="scene-item-index">${index + 1}</span>
                <span class="scene-item-copy">
                  <strong>${escapeText(scene.title)}</strong>
                  <small>${escapeText(scene.isSlotScene && scene.sceneTemplate ? scene.sceneTemplate.name : (scene.desc || ""))}</small>
                </span>
                <span class="scene-item-duration">${escapeText(scene.duration)}</span>
              </button>
            `).join("")}
          </section>

          <section class="preview-segment-summary" aria-label="Kịch bản đang bật">
            <div class="preview-section-title">${currentScene && currentScene.isSlotScene ? `Slots đang dùng (${activeSlotCount})` : "Kịch bản đang bật"}</div>
            ${activeSegments.length === 0 ? `
              <div class="preview-empty-note">Chưa có đoạn kịch bản nào đang bật.</div>
            ` : currentScene && currentScene.isSlotScene && currentScene.sceneTemplate ? currentScene.sceneTemplate.slots.map((slot) => {
              const value = currentScene.slots[slot.id] || {};
              return `
              <div class="preview-slot-timing-item ${value.enabled === false ? "is-disabled" : ""} ${Number(value.delay) <= previewSceneTimeSec ? "is-visible" : ""}">
                <span>${escapeText(Number(value.delay || 0).toFixed(1))}s</span>
                <strong>${escapeText(slot.label)}</strong>
                <small>${escapeText(value.animation || "none")}</small>
              </div>
              `;
            }).join("") : activeSegments.slice(0, 4).map((segment, index) => `
              <div class="preview-segment-item">
                <span>${index + 1}</span>
                <strong>${escapeText(segment.name || "Đoạn chưa đặt tên")}</strong>
                <small>${Number.parseInt(segment.durationSec, 10) || 8}s</small>
              </div>
            `).join("")}
          </section>
        </aside>
          </div>
    `;

    // Clear interval when navigating away
    const clearAutoplay = () => {
      stopPreviewAutoplay(true);
    };

    // Draw canvas content
    if (currentScene && currentScene.isSlotScene) {
      drawSlotBasedPreviewCanvas(currentScene, data, selectedVideoStyle, previewSceneTimeSec, activeTemplate.ratio);
    } else {
      drawPreviewCanvas(currentScene.id, data);
    }

    // Bind Scene Item Click
    container.querySelectorAll(".scene-item").forEach(item => {
      item.addEventListener("click", () => {
        clearAutoplay();
        const idx = parseInt(item.getAttribute("data-index"));
        previewSceneTimeSec = 0;
        AppState.setSelectedSceneIndex(idx);
      });
    });

    // Control buttons bind
    document.getElementById("btn-prev-scene").addEventListener("click", () => {
      clearAutoplay();
      if (selectedIdx > 0) {
        previewSceneTimeSec = 0;
        AppState.setSelectedSceneIndex(selectedIdx - 1);
      }
    });

    document.getElementById("btn-next-scene").addEventListener("click", () => {
      clearAutoplay();
      if (selectedIdx < scenes.length - 1) {
        previewSceneTimeSec = 0;
        AppState.setSelectedSceneIndex(selectedIdx + 1);
      }
    });

    const timeRange = document.getElementById("preview-time-range");
    if (timeRange) {
      timeRange.addEventListener("input", () => {
        previewSceneTimeSec = Number.parseFloat(timeRange.value) || 0;
        renderPreviewScreen(container, AppState.getProjectData());
      });
    }

    // Play/Pause slide
    const playBtn = document.getElementById("btn-play-preview");
    playBtn.addEventListener("click", () => {
      if (autoplayTimer) {
        clearAutoplay();
      } else {
        playBtn.innerHTML = getPreviewPlayButtonHTML(true);
        showToast("Bắt đầu chạy trình chiếu các cảnh quay...");

        let localIdx = selectedIdx;
        previewSceneTimeSec = 0;
        autoplayTimer = setInterval(() => {
          const activeData = AppState.getProjectData();
          const currentDuration = currentScene && currentScene.durationSec ? currentScene.durationSec : 3;
          previewSceneTimeSec = Math.min(currentDuration, previewSceneTimeSec + 0.5);
          if (previewSceneTimeSec >= currentDuration) {
            localIdx = (localIdx + 1) % scenes.length;
            previewSceneTimeSec = 0;
            AppState.setSelectedSceneIndex(localIdx);
          } else {
            renderPreviewScreen(container, activeData);
          }
        }, 500);
      }
    });
  };

  const drawSlotBasedPreviewCanvas = (scene, data, videoStyle, currentTimeSec, previewRatio = "9:16") => {
    const canvas = document.getElementById("preview-canvas");
    if (!canvas || !scene || !scene.sceneTemplate) return;

    const escapeText = (value) => String(value == null ? "" : value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
    const theme = videoStyle && videoStyle.colorTheme ? videoStyle.colorTheme : {
      background: "#0f172a",
      surface: "#1e293b",
      surfaceAlt: "#334155",
      text: "#f8fafc",
      mutedText: "#cbd5e1",
      accent: "#1f4fd8",
      border: "#334155"
    };
    const getAsset = (assetId) => (data.assets || []).find((asset) => asset.id === assetId);
    const getSlotValue = (slotId) => scene.slots && scene.slots[slotId] ? scene.slots[slotId] : {};
    const isVisible = (value) => value.enabled !== false && Number(value.delay || 0) <= currentTimeSec;
    const slotClass = (value) => `preview-slot ${isVisible(value) ? "is-visible" : "is-pending"} anim-${escapeText(value.animation || "none")}`;
    const supportedRatios = getSceneTemplateAspectRatios(scene.sceneTemplate);
    const layoutRatio = supportedRatios.includes(previewRatio)
      ? previewRatio
      : supportedRatios.includes("16:9") && !supportedRatios.includes("9:16")
        ? "16:9"
        : "9:16";
    const slotStyle = (slot, index) => getSceneSlotStyle(slot, index, layoutRatio);
    const getSlotTextValue = (slot, value) => {
      if (slot.type === "list") {
        return "";
      }
      if (value.text) {
        return value.text;
      }
      if (slot.id === "title") {
        return scene.segment && scene.segment.name || "";
      }
      if (slot.id === "description" || slot.id === "note") {
        return scene.segment && scene.segment.description || "";
      }
      if (slot.id === "tag" || slot.id === "kicker" || slot.id === "header" || slot.id === "cta") {
        return scene.segment && (scene.segment.benefit || scene.segment.type) || slot.label;
      }
      return slot.label;
    };
    const renderTextSlot = (slotId, className = "") => {
      const value = getSlotValue(slotId);
      if (!value.text && value.enabled === false) return "";
      return `<div class="${slotClass(value)} ${className}" data-delay="${escapeText(value.delay || 0)}">${escapeText(value.text || "")}</div>`;
    };
    const renderAssetSlot = (slotId, className = "") => {
      const value = getSlotValue(slotId);
      const asset = getAsset(value.assetId);
      const label = asset ? asset.name || asset.id : "Asset";
      const src = asset && asset.url ? asset.url : "";
      if (src) {
        return `<div class="${slotClass(value)} ${className}" data-delay="${escapeText(value.delay || 0)}"><img src="${escapeText(src)}" alt="${escapeText(label)}"></div>`;
      }
      return `<div class="${slotClass(value)} ${className}" data-delay="${escapeText(value.delay || 0)}">${escapeText(label)}</div>`;
    };
    const renderListSlot = (slotId) => {
      const value = getSlotValue(slotId);
      const items = Array.isArray(value.items) ? value.items.filter(Boolean) : [];
      return `
        <div class="${slotClass(value)} preview-slot-list" data-delay="${escapeText(value.delay || 0)}">
          ${items.length === 0 ? `<span>Chưa có item</span>` : items.slice(0, 6).map((item) => `<span>${escapeText(item)}</span>`).join("")}
        </div>
      `;
    };
    const renderFreeSlot = (slot, index) => {
      const value = getSlotValue(slot.id);
      const className = `${slotClass(value)} preview-free-slot slot-${escapeAttribute(slot.type)} scene-item-style-${escapeAttribute(slot.displayStyle || getSceneItemAppearanceDefaults(slot).displayStyle)}`;
      const style = slotStyle(slot, index);

      if (slot.type === "asset" || slot.type === "media") {
        const asset = getAsset(value.assetId);
        const label = asset ? asset.name || asset.id : slot.label;
        const src = asset && asset.url ? asset.url : "";
        return `
          <div class="${className}" style="${style}" data-delay="${escapeText(value.delay || 0)}">
            ${src ? `<img src="${escapeText(src)}" alt="${escapeText(label)}">` : `<span>${escapeText(label)}</span>`}
          </div>
        `;
      }

      if (slot.type === "list") {
        const items = Array.isArray(value.items) ? value.items.filter(Boolean) : [];
        return `
          <div class="${className} preview-free-list" style="${style}" data-delay="${escapeText(value.delay || 0)}">
            ${items.length === 0 ? `<span>${escapeText(slot.label)}</span>` : items.slice(0, 6).map((item) => `<span>${escapeText(item)}</span>`).join("")}
          </div>
        `;
      }

      return `
        <div class="${className}" style="${style}" data-delay="${escapeText(value.delay || 0)}">
          <span>${escapeText(getSlotTextValue(slot, value))}</span>
        </div>
      `;
    };
    const renderMediaSlot = (slotId) => {
      const value = getSlotValue(slotId);
      const asset = getAsset(value.assetId);
      const src = asset && asset.url ? asset.url : "";
      return `
        <div class="${slotClass(value)} preview-slot-media" data-delay="${escapeText(value.delay || 0)}">
          ${src ? `<img src="${escapeText(src)}" alt="${escapeText(asset.name || "Media")}">` : `<span>Image / Video</span>`}
        </div>
      `;
    };

    canvas.style.setProperty("--preview-bg", theme.background);
    canvas.style.setProperty("--preview-surface", theme.surface);
    canvas.style.setProperty("--preview-surface-alt", theme.surfaceAlt || theme.surface);
    canvas.style.setProperty("--preview-text", theme.text);
    canvas.style.setProperty("--preview-muted", theme.mutedText);
    canvas.style.setProperty("--preview-accent", theme.accent);
    canvas.style.setProperty("--preview-border", theme.border);
    canvas.style.backgroundColor = theme.background;
    canvas.style.color = theme.text;

    const body = `
      <div class="preview-slot-layout preview-free-layout">
        ${(scene.sceneTemplate.slots || []).map(renderFreeSlot).join("")}
      </div>
    `;

    canvas.innerHTML = `
      ${body}
      <div class="preview-time-badge">${currentTimeSec.toFixed(1)}s</div>
    `;
  };

  const drawPreviewCanvas = (sceneId, data) => {
    const canvas = document.getElementById("preview-canvas");
    if (!canvas) return;

    // Apply color options based on selected template configuration
    const videoTheme = data.templateConfig.theme; // 'light' or 'dark'
    const accentId = data.templateConfig.accentColor;
    const accentObj = THEME_ACCENT_COLORS.find(c => c.id === accentId) || THEME_ACCENT_COLORS[0];
    const accentColor = accentObj.value;
    const canvasTextColor = videoTheme === 'light' ? '#1e293b' : '#f8fafc';
    const canvasMutedColor = videoTheme === 'light' ? '#475569' : '#cbd5e1';

    canvas.style.backgroundColor = videoTheme === 'light' ? '#f8f9fa' : '#0f172a';
    canvas.style.color = canvasTextColor;

    // Title Font Scale
    let titleFontSize = "24px";
    if (data.templateConfig.fontSize === 'compact') titleFontSize = "20px";
    else if (data.templateConfig.fontSize === 'large') titleFontSize = "30px";

    // Logo display config
    const showLogo = data.templateConfig.logoPosition === 'top-left';
    let logoHTML = "";
    if (showLogo) {
      const logoAsset = data.assets.find(a => a.type === 'logo' && a.useInVideo);
      const logoUrl = logoAsset ? logoAsset.url : "https://placehold.co/120x120/1f4fd8/ffffff?text=Logo";
      logoHTML = `<img src="${logoUrl}" style="position:absolute; top:12px; left:12px; height:32px; border-radius:4px; max-width:80px; object-fit:contain;">`;
    }

    let innerHTML = logoHTML;

    switch (sceneId) {
      case "intro":
        innerHTML += `
          <div style="font-size: var(--font-xs); text-transform: uppercase; color:${accentColor}; font-weight:700; margin-bottom: 8px; letter-spacing: 1px;">Giới thiệu dự án</div>
          <h1 style="font-size: ${titleFontSize}; font-weight:800; margin-bottom:12px; color:${canvasTextColor}; text-shadow: 0 2px 10px rgba(0,0,0,0.28);">${data.projectName || 'DỰ ÁN CHƯA ĐẶT TÊN'}</h1>
          <p style="font-size: var(--font-base); max-width:480px; color:${canvasTextColor}; opacity:0.9; line-height:1.4;">"${data.tagline || 'Tagline dự án...'}"</p>
          <div style="position:absolute; bottom:16px; font-size:var(--font-xs); color:${canvasMutedColor};">Đại diện: ${data.ownerTeam || 'Team phụ trách'}</div>
        `;
        break;
      case "problem":
        innerHTML += `
          <div style="font-size: var(--font-xs); text-transform: uppercase; color:var(--color-danger); font-weight:700; margin-bottom: 8px; letter-spacing: 1px;">Thực trạng & Vấn đề</div>
          <h2 style="font-size: 20px; font-weight:700; margin-bottom:16px; max-width:500px; color:${canvasTextColor};">Nỗi đau & Vấn đề gặp phải là gì?</h2>
          <p style="font-size: var(--font-base); max-content: 480px; padding: 12px var(--space-4); border-left: 4px solid var(--color-danger); background-color:${videoTheme === 'light' ? '#fee2e2' : '#7f1d1d33'}; color:${videoTheme === 'light' ? '#991b1b' : '#fca5a5'}; max-width:500px; text-align:left; border-radius: 0 4px 4px 0;">
            ${data.problemContext || 'Nội dung mô tả vấn đề đang gặp phải chưa được điền...'}
          </p>
        `;
        break;
      case "solution":
        innerHTML += `
          <div style="font-size: var(--font-xs); text-transform: uppercase; color:${accentColor}; font-weight:700; margin-bottom: 8px; letter-spacing: 1px;">Giải pháp đã phát triển</div>
          <h2 style="font-size: 20px; font-weight:700; margin-bottom:16px; color:${canvasTextColor};">Sản phẩm của chúng ta giải quyết thế nào?</h2>
          <p style="font-size: var(--font-base); max-width:480px; color:${canvasTextColor}; opacity:0.9; line-height:1.5;">
            ${data.solutionWhat || 'Nội dung mô tả giải pháp đã phát triển chưa được điền...'}
          </p>
        `;
        break;
      case "features":
        const activeFeats = data.features.filter(f => f.useInVideo).slice(0, 3);
        let featsHTML = "";

        if (activeFeats.length === 0) {
          featsHTML = `<p class="text-subtle">Chưa có tính năng nào được chọn đưa vào video.</p>`;
        } else {
          featsHTML = `
            <div style="display:flex; justify-content:center; gap:var(--space-3); width:100%; margin-top:8px;">
              ${activeFeats.map(f => `
                <div style="flex:1; background:${videoTheme === 'light' ? '#ffffff' : '#1e293b'}; border: 1px solid ${videoTheme === 'light' ? '#e2e8f0' : '#334155'}; border-radius:6px; padding: var(--space-3); text-align:left;">
                  <div style="font-weight:600; font-size:var(--font-sm); margin-bottom:4px; color:${accentColor};">${f.name}</div>
                  <div style="font-size:var(--font-xs); opacity:0.8; line-height:1.3;">${f.description.substring(0, 80)}${f.description.length > 80 ? '...' : ''}</div>
                </div>
              `).join("")}
            </div>
          `;
        }

        innerHTML += `
          <div style="font-size: var(--font-xs); text-transform: uppercase; color:${accentColor}; font-weight:700; margin-bottom: 4px; letter-spacing: 1px;">Kịch bản chính</div>
          <h2 style="font-size: 18px; font-weight:700; margin-bottom:8px; color:${canvasTextColor};">Các chức năng cốt lõi hoạt động</h2>
          ${featsHTML}
        `;
        break;
      case "timeline":
        const activeMs = data.milestones.slice(0, 3);
        let msHTML = "";

        if (activeMs.length === 0) {
          msHTML = `<p class="text-subtle">Chưa có cột mốc timeline nào.</p>`;
        } else {
          msHTML = `
            <div style="display:flex; justify-content:center; align-items:center; width:100%; position:relative; margin-top:20px; padding: 0 var(--space-4);">
              <div style="position:absolute; height:2px; background:${accentColor}; left:15%; right:15%; top:15px; z-index:1;"></div>
              ${activeMs.map(m => `
                <div style="flex:1; display:flex; flex-direction:column; align-items:center; position:relative; z-index:2;">
                  <div style="width:30px; height:30px; border-radius:50%; background:${accentColor}; color:#fff; display:flex; align-items:center; justify-content:center; font-size:10px; font-weight:700; margin-bottom:8px; border:3px solid ${videoTheme === 'light' ? '#f8f9fa' : '#0f172a'};">
                    ✓
                  </div>
                  <div style="font-weight:700; font-size:var(--font-xs);">${m.date}</div>
                  <div style="font-size:10px; font-weight:500; opacity:0.8; max-width:90px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;" title="${m.name}">${m.name}</div>
                </div>
              `).join("")}
            </div>
          `;
        }

        innerHTML += `
          <div style="font-size: var(--font-xs); text-transform: uppercase; color:${accentColor}; font-weight:700; margin-bottom: 4px; letter-spacing: 1px;">Cột mốc phát triển</div>
          <h2 style="font-size: 18px; font-weight:700; margin-bottom:4px; color:${canvasTextColor};">Hành trình xây dựng sản phẩm</h2>
          ${msHTML}
        `;
        break;
      case "impact":
        innerHTML += `
          <div style="font-size: var(--font-xs); text-transform: uppercase; color:${accentColor}; font-weight:700; margin-bottom: 8px; letter-spacing: 1px;">Kết quả & Tác động</div>
          <h2 style="font-size: 18px; font-weight:700; margin-bottom:12px; color:${canvasTextColor};">Đo lường sự thành công</h2>
          <div style="font-size: 32px; font-weight:800; color:${accentColor}; margin-bottom:12px; letter-spacing: -0.5px;">
            ${data.resultImpact ? data.resultImpact.split(' ').slice(0, 3).join(' ') : 'KẾT QUẢ ĐẠT ĐƯỢC'}
          </div>
          <p style="font-size: var(--font-base); max-width:440px; color:${canvasTextColor}; opacity:0.9;">
            ${data.resultImpact || 'Thông số kết quả cụ thể đo lường được...'}
          </p>
        `;
        break;
      case "outro":
        const logoOutro = data.assets.find(a => a.type === 'logo' && a.useInVideo);
        const logoUrlOutro = logoOutro ? logoOutro.url : "https://placehold.co/120x120/1f4fd8/ffffff?text=Logo";
        const outroLogoHTML = data.templateConfig.logoPosition !== 'none' ? `<img src="${logoUrlOutro}" style="height:48px; border-radius:4px; margin-bottom:16px; object-fit:contain;">` : "";

        innerHTML += `
          ${outroLogoHTML}
          <h2 style="font-size: 22px; font-weight:800; margin-bottom:12px; color:${canvasTextColor};">CẢM ƠN BẠN ĐÃ THEO DÕI!</h2>
          <p style="font-size: var(--font-sm); color:${canvasTextColor}; opacity:0.86; max-width:440px; line-height:1.4;">
            ${data.endingNote || 'Lời chào kết thúc video.'}
          </p>
        `;
        break;
    }

    canvas.innerHTML = innerHTML;
  };

  // 8. Render Engine View
  const renderRenderScreen = (container, data) => {
    const renderFormats = Array.isArray(RENDER_FORMATS) ? RENDER_FORMATS : [];
    const selectedVideoConfig = data.video || {};
    const selectedFormat = renderFormats.find((format) => format.id === selectedVideoConfig.formatId)
      || renderFormats.find((format) => format.templateId === data.templateId)
      || renderFormats.find((format) => format.id === "dynamic-story-vertical")
      || renderFormats[0]
      || { id: "landscape-16x9", label: "Ngang 16:9 - 1920x1080", resolution: "1920x1080", aspectRatio: "16:9" };
    const selectedFps = Number(selectedVideoConfig.fps) === 60 ? 60 : 30;
    const selectedOutputFilename = selectedVideoConfig.outputFilename || `${data.projectSlug || "project"}_video.mp4`;

    let buttonStateHTML = "";
    if (AppRender.isRendering() || (AppRender.hasActiveRenderJob && AppRender.hasActiveRenderJob())) {
      buttonStateHTML = `<button id="btn-trigger-render-start" class="btn btn-primary" disabled>Đang render...</button>`;
    } else {
      buttonStateHTML = `
        <button id="btn-trigger-render-start" class="btn btn-primary">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
          Bắt đầu Render
        </button>
      `;
    }

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Render xuất bản Video</h1>
      </div>

      <div class="render-workflow-grid">
        <div class="card render-preflight-card">
            <div class="card-header">
              <h3>Kiểm tra môi trường render</h3>
              <button id="btn-refresh-preflight" class="btn btn-secondary btn-sm">Kiểm tra lại</button>
            </div>
            <div class="card-body render-preflight-body" id="render-preflight-panel">
              <p class="text-muted">Đang kiểm tra backend, template, payload và HyperFrames runner...</p>
            </div>
        </div>

        <div class="card render-progress-card">
            <div class="card-header">
              <h3>Báo cáo tiến trình render</h3>
              <div class="render-progress-header-actions">
                ${buttonStateHTML}
              </div>
            </div>
            <div class="card-body render-progress-body">
              <div class="render-progress-bar-wrapper">
                <div id="render-progress-bar" class="render-progress-bar"></div>
              </div>
              <div class="render-progress-info">
                <div id="render-status-display" class="render-status-display"></div>
                <div id="render-progress-text" class="render-progress-text">0%</div>
              </div>

              <details id="render-log-details" class="render-log-details" open>
                <summary>Hộp thoại Log (Terminal Logs)</summary>
                <div id="render-console" class="console-box">
                  <span class="console-line text-subtle">&gt; Nhấn "Bắt đầu Render" để gửi job thật sang backend HyperFrames local...</span>
                </div>
              </details>
              <div id="render-inline-result" class="render-inline-result d-none"></div>
            </div>
        </div>
      </div>
    `;

    // Bind actions
    const progressText = document.getElementById("render-progress-text");
    const progressBar = document.getElementById("render-progress-bar");
    const renderConsole = document.getElementById("render-console");
    const preflightPanel = document.getElementById("render-preflight-panel");
    const refreshPreflightBtn = document.getElementById("btn-refresh-preflight");
    const renderLogDetails = document.getElementById("render-log-details");
    const renderInlineResult = document.getElementById("render-inline-result");

    const updateStatusDisplay = (type, text) => {
      const statusDisplay = document.getElementById("render-status-display");
      if (!statusDisplay) return;

      let iconSvg = "";
      switch (type) {
        case "idle":
          iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="render-status-icon"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
          break;
        case "running":
          iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="render-status-icon spin"><line x1="12" y1="2" x2="12" y2="6"></line><line x1="12" y1="18" x2="12" y2="22"></line><line x1="4.93" y1="4.93" x2="7.76" y2="7.76"></line><line x1="16.24" y1="16.24" x2="19.07" y2="19.07"></line><line x1="2" y1="12" x2="6" y2="12"></line><line x1="18" y1="12" x2="22" y2="12"></line><line x1="4.93" y1="19.07" x2="7.76" y2="16.24"></line><line x1="16.24" y1="7.76" x2="19.07" y2="4.93"></line></svg>`;
          break;
        case "success":
          iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="render-status-icon"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
          break;
        case "warning":
          iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="render-status-icon"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
          break;
        case "error":
          iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="render-status-icon"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
          break;
      }

      statusDisplay.className = `render-status-display is-${type}`;
      statusDisplay.innerHTML = `${iconSvg}<span class="render-status-text">${text}</span>`;
    };
    const getOutputAspectRatio = (output) => {
      if (output.aspectRatio === "9:16" || output.resolution === "1080x1920") {
        return "9/16";
      }
      return "16/9";
    };

    const getOutputFilename = (output) => {
      return output.outputPath ? output.outputPath.split("/").pop() : output.filename;
    };

    const renderOutputPreviewModal = (output) => {
      const filename = getOutputFilename(output);
      const videoUrl = filename ? `/api/outputs/${encodeURIComponent(filename)}` : "";
      const downloadUrl = videoUrl ? `${videoUrl}?download=1` : "";
      const previewClass = getOutputAspectRatio(output) === "9/16" ? "is-vertical" : "is-landscape";
      const body = document.createElement("div");

      body.innerHTML = `
        ${videoUrl ? `
          <video controls preload="metadata" src="${videoUrl}" class="render-result-video ${previewClass}"></video>
        ` : `
          <div class="render-result-video render-result-video-empty ${previewClass}">Không có file hợp lệ để preview.</div>
        `}
        <div class="render-result-details">
          <div><strong>File:</strong> ${filename || "Không rõ"}</div>
          <div><strong>Đường dẫn:</strong> ${output.outputPath || "Không rõ"}</div>
          <div><strong>Template:</strong> ${output.template || output.templateId || "Không rõ"}</div>
          <div><strong>Độ phân giải:</strong> ${output.resolution || "Không rõ"}</div>
          ${downloadUrl ? `<div><a class="btn btn-primary" href="${downloadUrl}" download>Tải MP4</a></div>` : ""}
        </div>
      `;

      showModal(
        "Video đã render",
        body,
        [
          { text: "Mở Video đã xuất", class: "btn-primary", onClick: () => AppState.setTab("outputs") },
          { text: "Đóng", class: "btn-secondary", onClick: closeModal }
        ]
      );
    };

    const renderValidationResult = (validationResults) => {
      const errors = validationResults.errors || [];
      const warnings = validationResults.warnings || [];

      if (errors.length === 0 && warnings.length === 0) {
        renderInlineResult.className = "render-inline-result is-ready d-none";
        renderInlineResult.innerHTML = "";
        updateStatusDisplay("idle", "Chưa render");
        return;
      }

      renderInlineResult.className = `render-inline-result ${errors.length > 0 ? "is-error" : "is-warning"}`;
      renderInlineResult.classList.remove("d-none");
      renderInlineResult.innerHTML = `
        <div class="render-validation-heading">
          <span class="render-validation-title">${errors.length > 0 ? "Cần sửa dữ liệu trước khi render" : "Có cảnh báo trước khi render"}</span>
          <span class="render-validation-count">${errors.length} lỗi · ${warnings.length} cảnh báo</span>
        </div>
        <div class="render-validation-list">
          ${errors.map((item) => `
            <button class="render-validation-item" type="button" data-tab="${item.tab}" data-field="${item.field}">
              <span class="render-validation-item-type">Lỗi</span>
              <span>
                <strong>${item.title}</strong>
                <small>${item.message}</small>
              </span>
            </button>
          `).join("")}
          ${warnings.map((item) => `
            <button class="render-validation-item" type="button" data-tab="${item.tab}" data-field="${item.field}">
              <span class="render-validation-item-type">Cảnh báo</span>
              <span>
                <strong>${item.title}</strong>
                <small>${item.message}</small>
              </span>
            </button>
          `).join("")}
        </div>
      `;

      if (errors.length > 0) {
        updateStatusDisplay("error", "Cần sửa dữ liệu");
      } else {
        updateStatusDisplay("warning", "Có cảnh báo");
      }

      renderInlineResult.querySelectorAll(".render-validation-item").forEach((item) => {
        item.addEventListener("click", () => {
          focusValidationError(item.getAttribute("data-tab"), item.getAttribute("data-field"));
        });
      });
    };

    const renderInlineResultContent = (output) => {
      const filename = getOutputFilename(output);
      const videoUrl = filename ? `/api/outputs/${encodeURIComponent(filename)}` : "";
      const downloadUrl = videoUrl ? `${videoUrl}?download=1` : "";

      renderInlineResult.className = "render-inline-result is-success";
      renderInlineResult.classList.remove("d-none");
      renderInlineResult.innerHTML = `
        <div class="render-inline-copy">
          <span class="render-inline-path">${output.outputPath || filename || "MP4 đã được tạo."}</span>
        </div>
        <div class="render-inline-actions">
          <button id="render-result-preview-btn" class="btn btn-primary btn-icon btn-icon-solid" title="Xem video" aria-label="Xem video">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z"></path></svg>
          </button>
          ${downloadUrl ? `
            <a class="btn btn-primary btn-icon btn-icon-solid" href="${downloadUrl}" download title="Tải xuống" aria-label="Tải xuống">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
            </a>
          ` : ""}
        </div>
      `;

      document.getElementById("render-result-preview-btn").addEventListener("click", () => {
        renderOutputPreviewModal(output);
      });
    };

    const renderPreflightPanel = (preflight) => {
      const statusClass = preflight.status === "ok" ? "status-success" : preflight.status === "warning" ? "status-warning" : "status-danger";
      const statusText = preflight.status === "ok" ? "Sẵn sàng" : preflight.status === "warning" ? "Có cảnh báo" : "Có lỗi";

      preflightPanel.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; gap: var(--space-3); margin-bottom: var(--space-4);">
          <div>
            <div style="font-weight:600;">Trạng thái render local</div>
            <div class="text-muted" style="font-size: var(--font-xs);">Lần kiểm tra: ${preflight.checkedAt}</div>
          </div>
          <span class="status-pill ${statusClass}">${statusText}</span>
        </div>
        <div class="render-preflight-list">
          ${preflight.checks.map((check) => {
            const checkClass = check.status === "ok" ? "status-success" : check.status === "warning" ? "status-warning" : "status-danger";
            return `
              <div style="display:flex; justify-content:space-between; gap: var(--space-3); align-items:flex-start; border-top:1px solid var(--color-border); padding-top: var(--space-2);">
                <div>
                  <div style="font-weight:600;">${check.label}</div>
                  <div class="text-muted" style="font-size: var(--font-xs);">${check.message}</div>
                </div>
                <span class="status-pill ${checkClass}">${check.status}</span>
              </div>
            `;
          }).join("")}
        </div>
      `;
    };

    const loadPreflight = async () => {
      preflightPanel.innerHTML = `<p class="text-muted">Đang kiểm tra môi trường render...</p>`;
      try {
        const preflight = await AppRender.getPreflight();
        renderPreflightPanel(preflight);
      } catch (error) {
        preflightPanel.innerHTML = `
          <div style="display:flex; justify-content:space-between; align-items:center; gap: var(--space-3);">
            <div>
              <div style="font-weight:600;">Không kết nối được backend render</div>
              <div class="text-muted" style="font-size: var(--font-xs);">${error.message}</div>
            </div>
            <span class="status-pill status-danger">offline</span>
          </div>
        `;
      }
    };

    const onProgress = (percent) => {
      progressText.textContent = `${percent}%`;
      progressBar.style.width = `${percent}%`;
    };

    const onLog = (type, message) => {
      const line = document.createElement("span");
      const timestamp = new Date().toLocaleTimeString();
      let colorClass = "text-subtle";

      if (type === 'SUCCESS') colorClass = "console-success";
      else if (type === 'ERROR') colorClass = "console-error";
      else if (type === 'INFO') colorClass = "console-info";
      else if (type === 'INITIALIZING') colorClass = "console-warning";

      line.className = `console-line ${colorClass}`;
      line.textContent = `[${timestamp}] [${type}] ${message}`;
      renderConsole.appendChild(line);
      renderConsole.scrollTop = renderConsole.scrollHeight;
    };

    const onComplete = (outputObj) => {
      startBtn.disabled = false;
      startBtn.textContent = "Render lại";
      renderInlineResultContent(outputObj);
      showToast(`Đã xuất video thành công: ${outputObj.outputPath || outputObj.filename}`);
      updateStatusDisplay("success", "Hoàn tất");
    };

    const onFailure = (error) => {
      startBtn.disabled = false;
      startBtn.textContent = "Thử render lại";
      renderInlineResult.className = "render-inline-result is-error";
      renderInlineResult.classList.remove("d-none");
      renderInlineResult.innerHTML = `
        <div class="render-inline-copy">
          <span class="render-inline-path">${error.message || "Render thất bại."}</span>
        </div>
      `;
      showToast(error.message || "Render thất bại.", "error");
      updateStatusDisplay("error", "Lỗi render");
    };

    const resumeActiveRender = async () => {
      if (!AppRender.resumeRender || !AppRender.hasActiveRenderJob || !AppRender.hasActiveRenderJob()) {
        return;
      }

      renderConsole.innerHTML = "";
      renderLogDetails.open = true;
      renderInlineResult.className = "render-inline-result is-running d-none";
      renderInlineResult.innerHTML = "";
      if (startBtn) {
        startBtn.disabled = true;
        startBtn.textContent = "Đang render...";
      }
      await AppRender.resumeRender(onProgress, onLog, onComplete, onFailure);
    };

    // Keep state on re-render
    const queue = AppState.getRenderQueue();
    if (queue.length > 0 && AppRender.isRendering()) {
      updateStatusDisplay("running", "Đang render");
      onProgress(queue[0].progress);
    } else {
      updateStatusDisplay("idle", "Chưa render");
    }

    const startBtn = document.getElementById("btn-trigger-render-start");
    refreshPreflightBtn.addEventListener("click", loadPreflight);
    loadPreflight();
    resumeActiveRender();

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        if (AppRender.hasActiveRenderJob && AppRender.hasActiveRenderJob()) {
          showToast("Đang có render job chạy. UI sẽ khôi phục tiến trình hiện tại thay vì tạo job mới.", "info");
          resumeActiveRender();
          return;
        }

        const formatId = selectedFormat.id;
        const fps = selectedFps;
        const filename = selectedOutputFilename.trim() || "output.mp4";
        const currentData = AppState.getProjectData();
        const validationResults = AppValidation.validate(currentData);
        AppState.setValidation(validationResults);
        renderValidationResult(validationResults);
        if (validationResults.errors.length > 0) {
          showToast("Còn lỗi dữ liệu, sửa xong rồi render lại.", "error");
          return;
        }

        const currentVoiceover = (currentData.audio && currentData.audio.voiceover) || {};
        const currentPayload = AppRender.buildRenderPayload(currentData, { formatId, fps });
        if (currentVoiceover.enabled && !(currentPayload.audio.voiceover.script || "").trim()) {
          showToast("Voiceover đang bật nhưng chưa có kịch bản đọc ở trang Thiết lập video.", "error");
          return;
        }

        renderConsole.innerHTML = "";
        renderLogDetails.open = true;
        renderInlineResult.className = "render-inline-result is-running d-none";
        renderInlineResult.innerHTML = "";
        startBtn.disabled = true;
        startBtn.textContent = "Đang render...";
        updateStatusDisplay("running", "Đang render");

        AppRender.startRender({ formatId, fps, filename }, onProgress, onLog, onComplete, onFailure);
      });
    }

  };

  // 9. Outputs / History View
  const renderOutputsScreen = (container, data) => {
    const list = AppStorage.loadOutputs();
    const getOutputAspectRatio = (output) => {
      if (output.aspectRatio === "9:16" || output.resolution === "1080x1920") {
        return "9/16";
      }
      return "16/9";
    };

    if (AppRender.listBackendOutputs && container.dataset.outputsSynced !== "true") {
      container.dataset.outputsSynced = "true";
      AppRender.listBackendOutputs()
        .then((backendOutputs) => {
          if (!backendOutputs.length) {
            return;
          }

          const currentOutputs = AppStorage.loadOutputs();
          const backendIds = new Set(backendOutputs.map((item) => item.id));
          const mergedOutputs = [
            ...backendOutputs,
            ...currentOutputs.filter((item) => !backendIds.has(item.id))
          ];
          AppStorage.saveOutputs(mergedOutputs);
          renderOutputsScreen(container, AppState.getProjectData());
        })
        .catch(() => {
          // Outputs page still works with local history when backend is not running.
        });
    }

    let contentHTML = "";
    if (list.length === 0) {
      contentHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
          <div class="empty-state-title">Chưa có video xuất bản nào</div>
          <div class="empty-state-desc">Danh sách video đã xuất thành công sẽ được liệt kê ở đây sau khi bạn render.</div>
          <button id="outputs-render-btn" class="btn btn-primary">Đi tới Render video</button>
        </div>
      `;
    } else {
      contentHTML = `
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Tên file</th>
                <th>Template</th>
                <th>Độ phân giải</th>
                <th>Dung lượng</th>
                <th>Thời gian tạo</th>
                <th style="text-align:right;">Hành động</th>
              </tr>
            </thead>
            <tbody>
              ${list.map(vid => `
                <tr>
                  <td>
                    <div style="font-weight:600;">${vid.filename}</div>
                    <div class="text-subtle" style="font-size: var(--font-xs);">${vid.outputPath || `outputs/${vid.filename}`}</div>
                  </td>
                  <td>${vid.template}</td>
                  <td>${vid.resolution}</td>
                  <td>${vid.size}</td>
                  <td class="text-muted" style="font-size: var(--font-xs);">${vid.dateCreated}</td>
                  <td style="text-align:right; display:flex; justify-content:flex-end; gap: var(--space-2);">
                    <button class="btn btn-secondary btn-sm btn-open-video" data-id="${vid.id}">Chi tiết</button>
                    <button class="btn btn-danger btn-sm btn-delete-output" data-id="${vid.id}">Xóa</button>
                  </td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        </div>
      `;
    }

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Video đã xuất (${list.length})</h1>
      </div>
      <div class="card">
        <div class="card-body">
          ${contentHTML}
        </div>
      </div>
    `;

    // Events Binds
    if (list.length === 0) {
      document.getElementById("outputs-render-btn").addEventListener("click", () => AppState.setTab("render"));
    } else {
      // Show local output details
      container.querySelectorAll(".btn-open-video").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const output = AppStorage.loadOutputs().find((item) => item.id === id);
          if (!output) return;

          const filename = output.outputPath ? output.outputPath.split("/").pop() : output.filename;
          const videoUrl = filename ? `/api/outputs/${encodeURIComponent(filename)}` : "";
          const downloadUrl = videoUrl ? `${videoUrl}?download=1` : "";
          const previewAspectRatio = getOutputAspectRatio(output);
          const mockupVideoBody = document.createElement("div");
          mockupVideoBody.innerHTML = `
            ${videoUrl ? `
              <video controls preload="metadata" src="${videoUrl}" style="width:100%; max-height:70vh; aspect-ratio:${previewAspectRatio}; background:#000; border-radius:4px; margin-bottom:12px;"></video>
            ` : `
              <div style="width:100%; aspect-ratio:${previewAspectRatio}; background:#000; border-radius:4px; display:flex; align-items:center; justify-content:center; color:#fff; flex-direction:column; margin-bottom:12px;">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                <p style="margin-top:8px; font-size:var(--font-sm); opacity:0.8;">Không có filename hợp lệ để preview.</p>
              </div>
            `}
            <div style="display:grid; gap: var(--space-2); font-size:var(--font-sm);">
              <p><strong>Job ID:</strong> ${output.jobId || output.id}</p>
              <p><strong>Đường dẫn output:</strong> ${output.outputPath || `outputs/${output.filename}`}</p>
              <p><strong>Tỷ lệ:</strong> ${output.aspectRatio || "Không rõ"}</p>
              <p><strong>Dung lượng:</strong> ${output.size}</p>
              <p><strong>Thời gian render:</strong> ${output.durationMs ? `${Math.round(output.durationMs / 1000)} giây` : "Không rõ"}</p>
              ${downloadUrl ? `<p><a class="btn btn-primary" href="${downloadUrl}" download>Tải MP4</a></p>` : ""}
              <p class="text-muted">File MP4 nằm trong thư mục local outputs/; link preview/download chỉ hoạt động khi app chạy qua backend.</p>
            </div>
          `;

          showModal(
            "Chi tiết video đã render",
            mockupVideoBody,
            [{ text: "Đóng", class: "btn-secondary", onClick: closeModal }]
          );
        });
      });

      // Delete output
      container.querySelectorAll(".btn-delete-output").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          showModal(
            "Xác nhận xóa video đã xuất",
            "Bạn có chắc muốn xóa bản ghi video này khỏi lịch sử xuất bản? (Tệp tin trên ổ đĩa sẽ không bị tác động trong bản UI tĩnh).",
            [
              { text: "Hủy", class: "btn-secondary", onClick: closeModal },
              {
                text: "Xóa",
                class: "btn-danger",
                onClick: () => {
                  const outputs = AppStorage.loadOutputs().filter(v => v.id !== id);
                  AppStorage.saveOutputs(outputs);
                  renderOutputsScreen(container, AppState.getProjectData());
                  closeModal();
                  showToast("Đã xóa bản ghi video khỏi lịch sử.", "info");
                }
              }
            ]
          );
        });
      });
    }
  };

  // 10. Settings / Options View
  const renderSettingsScreen = (container, data) => {
    const settings = AppStorage.loadSettings();

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Cài đặt hệ thống</h1>
      </div>

      <div class="grid-2 mb-6">
        <!-- Local Folders Mock configuration -->
        <div class="card">
          <div class="card-header">
            <h3>Đường dẫn thư mục</h3>
          </div>
          <div class="card-body" style="display:flex; flex-direction:column; gap: var(--space-4);">
            <div class="form-group">
              <label class="form-label" for="set-upload-dir">Thư mục tải lên tài nguyên (Uploads)</label>
              <input type="text" id="set-upload-dir" class="form-control" value="${settings.uploadFolder || 'uploads/'}">
            </div>
            <div class="form-group">
              <label class="form-label" for="set-render-dir">Thư mục lưu trữ Video đã xuất (Outputs)</label>
              <input type="text" id="set-render-dir" class="form-control" value="${settings.renderFolder || 'outputs/'}">
            </div>
            <button id="settings-save-folders" class="btn btn-primary" style="align-self:flex-end;">Lưu cấu hình</button>
          </div>
        </div>

        <!-- System Mock Statuses -->
        <div class="card">
          <div class="card-header">
            <h3>Trạng thái hệ thống (Mock)</h3>
          </div>
          <div class="card-body" style="display:flex; flex-direction:column; gap: var(--space-4);">
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Phiên bản App:</span>
              <span style="font-weight:600;">v0.1.0-MVP (Static UI)</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Công cụ render HyperFrames:</span>
              <span class="status-pill status-warning">Chưa tích hợp</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Trình giải mã FFmpeg:</span>
              <span class="status-pill status-warning">Chưa kiểm tra</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Máy chủ Node.js cục bộ:</span>
              <span class="status-pill status-info">Chưa dùng trong phase UI</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Backup, Import, and Reset Data Actions -->
      <div class="section-block mt-6">
        <h3 class="mb-4">Nhập/Xuất & Dữ liệu</h3>
        <div style="display:flex; gap: var(--space-4); flex-wrap: wrap;">
          <button id="set-btn-export" class="btn btn-secondary">Xuất Backup dự án (.JSON)</button>
          <button id="set-btn-import" class="btn btn-secondary">Nhập project từ tệp (.JSON)</button>
          <button id="set-btn-restore" class="btn btn-secondary">Khôi phục dữ liệu dự án mẫu</button>
          <button id="set-btn-clear" class="btn btn-danger">Xóa toàn bộ dữ liệu Local</button>
        </div>
      </div>
    `;

    // Save folder configurations
    document.getElementById("settings-save-folders").addEventListener("click", () => {
      const uploadFolder = document.getElementById("set-upload-dir").value.trim();
      const renderFolder = document.getElementById("set-render-dir").value.trim();

      AppStorage.saveSettings({ ...settings, uploadFolder, renderFolder });
      showToast("Đã lưu thiết lập đường dẫn thành công!");
    });

    // Export Project Backup
    document.getElementById("set-btn-export").addEventListener("click", () => {
      AppStorage.exportProjectJSON(data);
      showToast("Đã tải xuống tệp JSON backup dự án!");
    });

    // Import Project Backup
    document.getElementById("set-btn-import").addEventListener("click", () => {
      const input = document.createElement("textarea");
      input.className = "form-control";
      input.rows = 10;
      input.placeholder = "Dán chuỗi nội dung JSON của dự án vào đây...";

      showModal(
        "Nhập project JSON",
        input,
        [
          { text: "Hủy", class: "btn-secondary", onClick: closeModal },
          {
            text: "Import",
            class: "btn-primary",
            onClick: () => {
              try {
                const parsed = JSON.parse(input.value.trim());
                if (!parsed.projectName) {
                  throw new Error("JSON không đúng schema dự án Hyper Video Tool.");
                }
                AppState.setProjectData(parsed);
                showToast("Đã nhập cấu trúc dự án thành công!");
                renderSettingsScreen(container, parsed);
                closeModal();
              } catch (e) {
                showToast(`Chuỗi JSON không hợp lệ hoặc thiếu thuộc tính cấu trúc bắt buộc: ${e.message}`, "error");
              }
            }
          }
        ]
      );
    });

    // Restore Sample Data
    document.getElementById("set-btn-restore").addEventListener("click", async () => {
      const sample = await AppStorage.loadSampleData();
      AppState.setProjectData(sample);
      renderSettingsScreen(container, sample);
      showToast("Khôi phục thành công dữ liệu dự án mẫu!");
    });

    // Clear all Local Data
    document.getElementById("set-btn-clear").addEventListener("click", () => {
      showModal(
        "Cảnh báo xóa dữ liệu cục bộ",
        "Thao tác này sẽ xóa sạch dự án nháp và toàn bộ lịch sử video đã xuất khỏi Local Storage trình duyệt. Bạn chắc chắn chứ?",
        [
          { text: "Hủy", class: "btn-secondary", onClick: closeModal },
          {
            text: "Xóa sạch dữ liệu",
            class: "btn-danger",
            onClick: () => {
              AppStorage.clearLocalData();
              localStorage.removeItem("hyper_video_outputs");
              renderSettingsScreen(container, AppState.getProjectData());
              closeModal();
              showToast("Đã reset toàn bộ dữ liệu ứng dụng về mặc định.", "info");
            }
          }
        ]
      );
    });
  };

  // ================= VALIDATION BADGES =================

  const updateValidationUI = (valResults) => {
    DOM.topbarRenderBtn.disabled = false;

    // Sidebar Badges updates
    Object.values(DOM.badges).forEach((badge) => {
      if (badge) {
        badge.classList.add("d-none");
      }
    });

    const addBadgeToTab = (tab, isError) => {
      const badge = DOM.badges[tab];
      if (badge) {
        badge.classList.remove("d-none");
        if (isError) {
          badge.className = "nav-badge"; // red
          badge.textContent = "!";
        } else if (badge.className !== "nav-badge") {
          badge.className = "nav-badge status-warning"; // yellow
          badge.textContent = "!";
        }
      }
    };

    valResults.errors.forEach(e => addBadgeToTab(e.tab, true));
    valResults.warnings.forEach(w => addBadgeToTab(w.tab, false));
  };

  const focusValidationError = (tab, fieldId) => {
    AppState.setTab(tab);

    // Allow tab DOM rendering to finish
    setTimeout(() => {
      // Find element inside workspace
      const el = document.getElementById(`field-${fieldId}`) || document.getElementById(fieldId);
      if (el) {
        el.focus();
        el.classList.add("field-error");

        // Remove highlighting border after a short duration
        setTimeout(() => {
          el.classList.remove("field-error");
        }, 2000);

        // Smooth scroll to element
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
  };

  // ================= GENERAL INITIALIZERS =================

  const initTheme = () => {
    const settings = AppStorage.loadSettings();
    const savedTheme = settings.theme || "light";
    setAppTheme(savedTheme);
  };

  const setAppTheme = (theme) => {
    AppState.setTheme(theme);
    DOM.html.setAttribute("data-theme", theme);

    const sun = DOM.themeToggle.querySelector(".sun-icon");
    const moon = DOM.themeToggle.querySelector(".moon-icon");

    if (theme === 'dark') {
      sun.classList.add("d-none");
      moon.classList.remove("d-none");
    } else {
      sun.classList.remove("d-none");
      moon.classList.add("d-none");
    }

    // Save setting
    const current = AppStorage.loadSettings();
    AppStorage.saveSettings({ ...current, theme });
  };

  const initGlobalEvents = () => {
    // Top bar theme toggle clicks
    DOM.themeToggle.addEventListener("click", () => {
      const current = AppState.getActiveTheme();
      setAppTheme(current === 'light' ? 'dark' : 'light');
    });

    DOM.topbarRenderBtn.addEventListener("click", () => {
      AppState.setTab("render");
    });

    // Left Sidebar navigation click binds
    document.querySelectorAll(".nav-item").forEach(btn => {
      btn.addEventListener("click", () => {
        const tab = btn.getAttribute("data-page");
        if (tab) AppState.setCurrentPage(tab);
      });
    });

    // Mobile sidebar toggle clicks
    DOM.mobileSidebarToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      DOM.sidebar.classList.toggle("mobile-open");
    });

    // Close sidebars on clicking anywhere else
    document.addEventListener("click", () => {
      DOM.sidebar.classList.remove("mobile-open");
    });

    DOM.sidebar.addEventListener("click", (e) => e.stopPropagation());

    // Modal overlay closes when clicking on shadow
    DOM.modalContainer.addEventListener("click", (e) => {
      if (e.target === DOM.modalContainer) {
        closeModal();
      }
    });

    DOM.modalClose.addEventListener("click", closeModal);
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeModal();
      }
    });

    // Subscribe to state change events
    AppState.subscribe("tabChanged", (tab) => {
      if (tab !== "preview") {
        stopPreviewAutoplay(false);
      }
      switchTab(tab);
    });

    AppState.subscribe("projectDataChanged", (data) => {
      // Re-trigger validation check
      const valResults = AppValidation.validate(data);
      AppState.setValidation(valResults);

      // Save to localStorage automatically on changes
      AppStorage.saveLocalData(data);
      DOM.saveStatus.textContent = "Đã lưu nháp";
      DOM.saveStatus.className = "status-pill status-success ml-2";
      DOM.topbarProjectName.textContent = data.projectName || "Video chưa đặt tên";
    });

    AppState.subscribe("dirtyStateChanged", (isDirty) => {
      if (isDirty) {
        DOM.saveStatus.textContent = "Có thay đổi chưa lưu";
        DOM.saveStatus.className = "status-pill status-warning ml-2";
      } else {
        DOM.saveStatus.textContent = "Đã lưu nháp";
        DOM.saveStatus.className = "status-pill status-success ml-2";
      }
    });

    AppState.subscribe("selectedSceneIndexChanged", () => {
      // Re-render Preview scene only if we are on preview tab
      if (AppState.getTab() === 'preview') {
        renderScreen("preview");
      }
    });

    AppState.subscribe("validationChanged", (valResults) => {
      updateValidationUI(valResults);
    });
  };

  return {
    initDOM,
    initTheme,
    initGlobalEvents,
    renderScreen,
    showToast,
    showModal,
    closeModal
  };
})();
