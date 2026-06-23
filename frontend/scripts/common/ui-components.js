/* UI Controller - DOM Operations and Screen Renderers */

const AppUI = (() => {
  // DOM Cache
  const DOM = {};

  // Internal view states
  let templateRatioFilter = "all";
  let selectedScriptSegmentId = null;

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
    const projectAssets = Array.isArray(data.assets) ? data.assets : [];
    const selectedContentType = data.contentType || "feature";
    const selectedTone = data.contentTone || "technical";
    const selectedLanguage = data.contentLanguage || (savedVoiceover.language || "vi-VN");
    const selectedPrimaryAssetId = data.primaryAssetId || "";

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Nội dung video</h1>
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
              <label class="form-label" for="field-projectSlug">Mã video *</label>
              <div class="form-hint">Mã ngắn dùng để đặt tên file và định danh nội dung video.</div>
              <input type="text" id="field-projectSlug" class="form-control" value="${data.projectSlug || ''}" placeholder="ví dụ: internal-analytics-dashboard">
            </div>
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
    const estimatedDuration = list
      .filter((item) => item.useInVideo)
      .reduce((total, item) => total + (Number.parseInt(item.durationSec, 10) || 8), 0);
    const escapeText = (value) => String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");
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
        <div class="form-group">
          <label class="form-label" for="modal-feat-voice">Voice script</label>
          <textarea id="modal-feat-voice" class="form-control" rows="3" placeholder="Câu đọc riêng cho đoạn này...">${isEdit ? escapeText(feature.voiceoverScript) : ''}</textarea>
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

              if (!name || !description) {
                showToast("Cần nhập tiêu đề và nội dung chính của đoạn.", "error");
                return;
              }

              const features = [...(data.features || [])];
              if (isEdit) {
                const idx = features.findIndex(f => f.id === feature.id);
                if (idx !== -1) {
                  features[idx] = { ...feature, type, name, description, benefit, voiceoverScript, durationSec, useInVideo };
                }
              } else {
                features.push({
                  id: "feat_" + Date.now(),
                  type,
                  name,
                  description,
                  benefit,
                  voiceoverScript,
                  durationSec,
                  useInVideo
                });
              }

              AppState.updateProjectField("features", features);
              renderFeaturesScreen(container, AppState.getProjectData());
              closeModal();
              showToast(isEdit ? "Cập nhật đoạn thành công!" : "Đã thêm đoạn mới!");
            }
          }
        ]
      );
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
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: var(--space-2);"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6"/></svg>
            Xóa đã chọn (<span id="selected-assets-count">0</span>)
          </button>
          <button id="assets-upload-btn" class="btn btn-primary">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="margin-right: var(--space-2);"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
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

  // 6. Template & Theme Picker View
  const renderTemplateScreen = (container, data) => {
    const filteredTemplates = templateRatioFilter === "all"
      ? TEMPLATES_LIST
      : TEMPLATES_LIST.filter(t => t.ratio === templateRatioFilter);

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Chọn Template & Tùy chỉnh Video</h1>
      </div>

      <div class="preview-layout">
        <!-- Templates List -->
        <div class="card">
          <div class="card-header">
            <h3>1. Templates có sẵn</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Định dạng video</label>
              <div class="filter-group template-ratio-filter">
                <button class="filter-btn ratio-filter-btn ${templateRatioFilter === 'all' ? 'active' : ''}" data-ratio="all">Tất cả</button>
                <button class="filter-btn ratio-filter-btn ${templateRatioFilter === '16:9' ? 'active' : ''}" data-ratio="16:9">Ngang 16:9</button>
                <button class="filter-btn ratio-filter-btn ${templateRatioFilter === '9:16' ? 'active' : ''}" data-ratio="9:16">Dọc 9:16</button>
              </div>
            </div>

            <div class="templates-grid">
              ${filteredTemplates.length === 0 ? `
                <div class="empty-state" style="grid-column: 1 / -1; padding: var(--space-8);">
                  <div class="empty-state-title" style="font-size: var(--font-base);">Không tìm thấy template nào</div>
                </div>
              ` : filteredTemplates.map(tmpl => `
                <div class="template-card ${data.templateId === tmpl.id ? 'active' : ''}" data-id="${tmpl.id}">
                  <div class="template-preview-thumb">
                    <div class="template-preview-aspect ${tmpl.ratio === '9:16' ? 'ratio-9-16' : 'ratio-16-9'}">
                      ${tmpl.ratio}
                    </div>
                  </div>
                  <div class="template-details">
                    <div class="template-title">${tmpl.name}</div>
                    <div class="template-desc">${tmpl.desc}</div>
                    <div class="template-meta-row">
                      <span>Thời lượng: ~${tmpl.duration}</span>
                      <span>Số Scene: ${tmpl.scenes.length}</span>
                    </div>
                  </div>
                </div>
              `).join("")}
            </div>
          </div>
        </div>

        <!-- Theme customizer panel -->
        <div class="card">
          <div class="card-header">
            <h3>2. Thiết lập video</h3>
          </div>
          <div class="card-body">
            <div class="form-group">
              <label class="form-label">Theme màu video</label>
              <div class="filter-group theme-choice-wrapper">
                <button class="filter-btn btn-theme-choice ${data.templateConfig.theme === 'light' ? 'active' : ''}" data-val="light">Sáng</button>
                <button class="filter-btn btn-theme-choice ${data.templateConfig.theme === 'dark' ? 'active' : ''}" data-val="dark">Tối</button>
              </div>
            </div>

            <div class="form-group">
              <div class="accent-color-header">
                <label class="form-label">Màu nhấn chủ đạo (Accent Color)</label>
                <span class="selected-color-name" id="active-accent-color-name">
                  ${THEME_ACCENT_COLORS.find(c => c.id === data.templateConfig.accentColor)?.name || 'Mặc định'}
                </span>
              </div>
              <div class="color-swatches-group">
                ${THEME_ACCENT_COLORS.map(color => `
                  <button class="color-swatch-btn btn-color-choice ${data.templateConfig.accentColor === color.id ? 'active' : ''}"
                    data-color="${color.id}"
                    title="${color.name}"
                    style="--swatch-color: ${color.value};">
                  </button>
                `).join("")}
              </div>
            </div>

            <div class="form-group">
              <label class="form-label" for="font-scale-choice">Cỡ chữ chữ đề</label>
              <select id="font-scale-choice" class="form-control">
                <option value="compact" ${data.templateConfig.fontSize === 'compact' ? 'selected' : ''}>Gọn gàng (Compact)</option>
                <option value="default" ${data.templateConfig.fontSize === 'default' ? 'selected' : ''}>Mặc định (Default)</option>
                <option value="large" ${data.templateConfig.fontSize === 'large' ? 'selected' : ''}>Cỡ lớn (Large)</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="logo-position-choice">Vị trí hiển thị Logo</label>
              <select id="logo-position-choice" class="form-control">
                <option value="none" ${data.templateConfig.logoPosition === 'none' ? 'selected' : ''}>Không hiển thị</option>
                <option value="top-left" ${data.templateConfig.logoPosition === 'top-left' ? 'selected' : ''}>Góc trên cùng bên trái</option>
                <option value="outro" ${data.templateConfig.logoPosition === 'outro' ? 'selected' : ''}>Chỉ ở slide kết thúc</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    `;

    // Template selection clicks
    container.querySelectorAll(".template-card").forEach(card => {
      card.addEventListener("click", () => {
        const id = card.getAttribute("data-id");
        if (id !== data.templateId) {
          AppState.updateProjectField("templateId", id);
          renderTemplateScreen(container, AppState.getProjectData());
        }
      });
    });

    // Ratio filter selection click
    container.querySelectorAll(".ratio-filter-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        templateRatioFilter = btn.getAttribute("data-ratio");
        renderTemplateScreen(container, AppState.getProjectData());
      });
    });

    // Theme Choice Buttons
    container.querySelectorAll(".btn-theme-choice").forEach(btn => {
      btn.addEventListener("click", () => {
        const themeVal = btn.getAttribute("data-val");
        const config = { ...data.templateConfig, theme: themeVal };
        AppState.updateProjectField("templateConfig", config);
        renderTemplateScreen(container, AppState.getProjectData());
      });
    });

    // Accent Color Choices
    container.querySelectorAll(".btn-color-choice").forEach(btn => {
      btn.addEventListener("click", () => {
        const colorVal = btn.getAttribute("data-color");
        const config = { ...data.templateConfig, accentColor: colorVal };
        AppState.updateProjectField("templateConfig", config);
        renderTemplateScreen(container, AppState.getProjectData());
      });
    });

    // Logo & Font Select change binds
    document.getElementById("font-scale-choice").addEventListener("change", (e) => {
      const config = { ...data.templateConfig, fontSize: e.target.value };
      AppState.updateProjectField("templateConfig", config);
    });

    document.getElementById("logo-position-choice").addEventListener("change", (e) => {
      const config = { ...data.templateConfig, logoPosition: e.target.value };
      AppState.updateProjectField("templateConfig", config);
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
    const scenes = activeTemplate.scenes;
    const selectedIdx = Math.min(AppState.getSelectedSceneIndex(), Math.max(scenes.length - 1, 0));
    const currentScene = scenes[selectedIdx] || scenes[0];
    const activeSegments = (data.features || []).filter((item) => item.useInVideo);
    const ratioClass = activeTemplate.ratio === "9:16" ? "is-vertical" : "is-landscape";
    const estimatedDuration = activeSegments.reduce((total, item) => total + (Number.parseInt(item.durationSec, 10) || 8), 0);
    const sceneDuration = currentScene ? currentScene.duration : "0s";
    const escapeText = (value) => String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;");

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
              <div><span>Kịch bản bật</span><strong>${activeSegments.length}</strong></div>
              <div><span>Ước tính</span><strong>${estimatedDuration}s</strong></div>
            </div>
          </section>

          <section class="preview-scene-list" aria-label="Danh sách scene">
            <div class="preview-section-title">Danh sách scene</div>
            ${scenes.map((scene, index) => `
              <button class="scene-item ${selectedIdx === index ? 'active' : ''}" data-index="${index}" type="button">
                <span class="scene-item-index">${index + 1}</span>
                <span class="scene-item-copy">
                  <strong>${escapeText(scene.title)}</strong>
                  <small>${escapeText(scene.desc || "")}</small>
                </span>
                <span class="scene-item-duration">${escapeText(scene.duration)}</span>
              </button>
            `).join("")}
          </section>

          <section class="preview-segment-summary" aria-label="Kịch bản đang bật">
            <div class="preview-section-title">Kịch bản đang bật</div>
            ${activeSegments.length === 0 ? `
              <div class="preview-empty-note">Chưa có đoạn kịch bản nào đang bật.</div>
            ` : activeSegments.slice(0, 4).map((segment, index) => `
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
    drawPreviewCanvas(currentScene.id, data);

    // Bind Scene Item Click
    container.querySelectorAll(".scene-item").forEach(item => {
      item.addEventListener("click", () => {
        clearAutoplay();
        const idx = parseInt(item.getAttribute("data-index"));
        AppState.setSelectedSceneIndex(idx);
      });
    });

    // Control buttons bind
    document.getElementById("btn-prev-scene").addEventListener("click", () => {
      clearAutoplay();
      if (selectedIdx > 0) AppState.setSelectedSceneIndex(selectedIdx - 1);
    });

    document.getElementById("btn-next-scene").addEventListener("click", () => {
      clearAutoplay();
      if (selectedIdx < scenes.length - 1) AppState.setSelectedSceneIndex(selectedIdx + 1);
    });

    // Play/Pause slide
    const playBtn = document.getElementById("btn-play-preview");
    playBtn.addEventListener("click", () => {
      if (autoplayTimer) {
        clearAutoplay();
      } else {
        playBtn.innerHTML = getPreviewPlayButtonHTML(true);
        showToast("Bắt đầu chạy trình chiếu các cảnh quay...");

        let localIdx = selectedIdx;
        autoplayTimer = setInterval(() => {
          localIdx = (localIdx + 1) % scenes.length;
          AppState.setSelectedSceneIndex(localIdx);
        }, 3000); // Shift every 3s
      }
    });
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

    let buttonStateHTML = "";
    if (AppRender.isRendering()) {
      buttonStateHTML = `<button id="btn-trigger-render-cancel" class="btn btn-danger">Hủy bỏ xuất bản</button>`;
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

      <div class="card mb-4">
        <div class="card-header">
          <h3>Kiểm tra môi trường render</h3>
          <button id="btn-refresh-preflight" class="btn btn-secondary btn-sm">Kiểm tra lại</button>
        </div>
        <div class="card-body" id="render-preflight-panel">
          <p class="text-muted">Đang kiểm tra backend, template, payload và HyperFrames runner...</p>
        </div>
      </div>

      <div class="render-workflow-stack">
        <div class="card render-config-card">
            <div class="card-header">
              <h3>Cấu hình render</h3>
            </div>
            <div class="card-body render-config-body">
              <div id="render-validation-panel" class="render-validation-panel is-ok">
                <span class="render-validation-title">Dữ liệu sẽ được kiểm tra khi bắt đầu render.</span>
              </div>

              <div class="render-basic-grid">
                <div class="form-group">
                  <label class="form-label" for="render-format">Tỷ lệ video</label>
                  <div class="form-hint">Chọn khung hình đầu ra phù hợp nơi đăng video.</div>
                  <select id="render-format" class="form-control" ${AppRender.isRendering() ? 'disabled' : ''}>
                    ${renderFormats.map((format, index) => `
                      <option value="${format.id}" ${index === 0 ? 'selected' : ''}>${format.label}</option>
                    `).join("")}
                  </select>
                </div>

                <div class="form-group">
                  <label class="form-label" for="render-fps">Số khung hình (FPS)</label>
                  <div class="form-hint">FPS cao mượt hơn nhưng render lâu và nặng máy hơn.</div>
                  <select id="render-fps" class="form-control" ${AppRender.isRendering() ? 'disabled' : ''}>
                    <option value="30">30 FPS (Mượt mà, tốn ít tài nguyên)</option>
                    <option value="60">60 FPS (Chuyển động siêu mượt, render lâu hơn)</option>
                  </select>
                </div>

                <div class="form-group render-filename-field">
                  <label class="form-label" for="render-filename">Tên tệp tin đầu ra</label>
                  <div class="form-hint">Tên file MP4 sau khi render thành công.</div>
                  <input type="text" id="render-filename" class="form-control" value="${data.projectSlug || 'project'}_video.mp4" ${AppRender.isRendering() ? 'disabled' : ''}>
                </div>
              </div>

              <div class="render-config-status">
                <span>Trạng thái:</span>
                <span id="render-status-pill" class="status-pill status-info">Chờ bắt đầu</span>
              </div>
            </div>
            <div class="card-footer">
              ${buttonStateHTML}
            </div>
        </div>

        <div class="card render-progress-card">
            <div class="card-header">
              <h3>Báo cáo tiến trình render</h3>
              <span id="render-progress-text" style="font-weight:700;">0%</span>
            </div>
            <div class="card-body render-progress-body">
              <div class="render-progress-bar-wrapper">
                <div id="render-progress-bar" class="render-progress-bar"></div>
              </div>

              <details id="render-log-details" class="render-log-details">
                <summary>Hộp thoại Log (Terminal Logs)</summary>
                <div id="render-console" class="console-box">
                  <span class="console-line text-subtle">&gt; Nhấn "Bắt đầu Render" để gửi job thật sang backend HyperFrames local...</span>
                </div>
              </details>
              <div id="render-inline-result" class="render-inline-result">
                <span class="render-inline-status">Chưa render</span>
              </div>
            </div>
        </div>
      </div>
    `;

    // Bind actions
    const statusPill = document.getElementById("render-status-pill");
    const progressText = document.getElementById("render-progress-text");
    const progressBar = document.getElementById("render-progress-bar");
    const renderConsole = document.getElementById("render-console");
    const preflightPanel = document.getElementById("render-preflight-panel");
    const refreshPreflightBtn = document.getElementById("btn-refresh-preflight");
    const renderLogDetails = document.getElementById("render-log-details");
    const renderInlineResult = document.getElementById("render-inline-result");
    const renderValidationPanel = document.getElementById("render-validation-panel");
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
        renderValidationPanel.className = "render-validation-panel is-ok";
        renderValidationPanel.innerHTML = `
          <span class="render-validation-title">Dữ liệu hợp lệ, có thể render.</span>
        `;
        return;
      }

      renderValidationPanel.className = `render-validation-panel ${errors.length > 0 ? "is-error" : "is-warning"}`;
      renderValidationPanel.innerHTML = `
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

      renderValidationPanel.querySelectorAll(".render-validation-item").forEach((item) => {
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
      renderInlineResult.innerHTML = `
        <div class="render-inline-copy">
          <span class="render-inline-status">Hoàn tất</span>
          <span class="render-inline-path">${output.outputPath || filename || "MP4 đã được tạo."}</span>
        </div>
        <div class="render-inline-actions">
          <button id="render-result-preview-btn" class="btn btn-primary btn-sm">Xem video</button>
          ${downloadUrl ? `<a class="btn btn-secondary btn-sm" href="${downloadUrl}" download>Tải xuống</a>` : ""}
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
        <div style="display:grid; gap: var(--space-2);">
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
      statusPill.className = "status-pill status-success";
      statusPill.textContent = "Hoàn tất";
      startBtn.disabled = false;
      startBtn.textContent = "Render lại";
      renderInlineResultContent(outputObj);
      showToast(`Đã xuất video thành công: ${outputObj.outputPath || outputObj.filename}`);
    };

    const onFailure = (error) => {
      statusPill.className = "status-pill status-danger";
      statusPill.textContent = "Lỗi render";
      startBtn.disabled = false;
      startBtn.textContent = "Thử render lại";
      renderInlineResult.className = "render-inline-result is-error";
      renderInlineResult.innerHTML = `
        <div class="render-inline-copy">
          <span class="render-inline-status">Lỗi render</span>
          <span class="render-inline-path">${error.message || "Render thất bại."}</span>
        </div>
      `;
      showToast(error.message || "Render thất bại.", "error");
    };

    const onCancel = () => {
      statusPill.className = "status-pill status-danger";
      statusPill.textContent = "Bị hủy";
      progressBar.style.width = "0%";
      progressText.textContent = "0%";
      renderRenderScreen(container, AppState.getProjectData());
    };

    // Keep state on re-render
    const queue = AppState.getRenderQueue();
    if (queue.length > 0 && AppRender.isRendering()) {
      statusPill.className = "status-pill status-warning";
      statusPill.textContent = "Đang chạy";
      onProgress(queue[0].progress);
    }

    const startBtn = document.getElementById("btn-trigger-render-start");
    refreshPreflightBtn.addEventListener("click", loadPreflight);
    loadPreflight();

    if (startBtn) {
      startBtn.addEventListener("click", () => {
        const formatId = document.getElementById("render-format").value;
        const fps = parseInt(document.getElementById("render-fps").value);
        const filename = document.getElementById("render-filename").value.trim() || "output.mp4";
        const currentData = AppState.getProjectData();
        const validationResults = AppValidation.validate(currentData);
        AppState.setValidation(validationResults);
        renderValidationResult(validationResults);
        if (validationResults.errors.length > 0) {
          showToast("Còn lỗi dữ liệu, sửa xong rồi render lại.", "error");
          return;
        }

        const currentVoiceover = (currentData.audio && currentData.audio.voiceover) || {};
        const currentPayload = AppRender.buildRenderPayload(currentData, { formatId });
        if (currentVoiceover.enabled && !(currentPayload.audio.voiceover.script || "").trim()) {
          showToast("Voiceover đang bật nhưng chưa có kịch bản đọc ở trang Nội dung video.", "error");
          return;
        }

        renderConsole.innerHTML = "";
        renderLogDetails.open = false;
        renderInlineResult.className = "render-inline-result is-running";
        renderInlineResult.innerHTML = `<span class="render-inline-status">Đang render</span>`;
        statusPill.className = "status-pill status-warning";
        statusPill.textContent = "Đang render";
        startBtn.disabled = true;
        startBtn.textContent = "Đang render...";

        AppRender.startRender({ formatId, fps, filename }, onProgress, onLog, onComplete, onFailure);
      });
    }

    const cancelBtn = document.getElementById("btn-trigger-render-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        AppRender.cancelRender(onLog, onCancel);
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
                alert("Chuỗi JSON không hợp lệ hoặc thiếu thuộc tính cấu trúc bắt buộc: " + e.message);
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
