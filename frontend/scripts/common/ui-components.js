/* UI Controller - DOM Operations and Screen Renderers */

const AppUI = (() => {
  // DOM Cache
  const DOM = {};

  const initDOM = () => {
    DOM.themeToggle = document.getElementById("theme-toggle");
    DOM.saveStatus = document.getElementById("save-status");
    DOM.topbarProjectName = document.getElementById("topbar-project-name");
    DOM.topbarRenderBtn = document.getElementById("topbar-render-btn");
    DOM.btnQuickImport = document.getElementById("btn-quick-import");
    DOM.btnQuickExport = document.getElementById("btn-quick-export");
    DOM.sidebar = document.getElementById("sidebar");
    DOM.validationPanel = document.getElementById("validation-panel");
    DOM.mobileSidebarToggle = document.getElementById("mobile-sidebar-toggle");
    DOM.mobileValidationToggle = document.getElementById("mobile-validation-toggle");
    DOM.toastContainer = document.getElementById("toast-container");
    DOM.modalContainer = document.getElementById("modal-container");
    DOM.modalTitle = document.getElementById("modal-title");
    DOM.modalBody = document.getElementById("modal-body");
    DOM.modalFooter = document.getElementById("modal-footer");
    DOM.modalClose = document.getElementById("modal-close");
    DOM.errorCount = document.getElementById("error-count");
    DOM.warningCount = document.getElementById("warning-count");
    DOM.validationList = document.getElementById("validation-list");
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
    DOM.validationPanel.classList.remove("mobile-open");

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
    const val = AppState.getValidation();
    const errorCount = val.errors.length;
    
    // Quick checks
    const checkBasic = (data.projectName && data.shortSummary && data.problemContext && data.solutionWhat) ? "success" : "danger";
    const checkFeatures = (data.features || []).filter(f => f.useInVideo).length >= 3 ? "success" : "warning";
    const checkAssets = (data.assets || []).some(a => a.type === "screenshot" && a.useInVideo) ? "success" : "danger";
    const checkTemplate = data.templateId ? "success" : "danger";
    const checkReady = errorCount === 0 ? "success" : "danger";

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Tổng quan dự án</h1>
      </div>
      <div class="grid-2 mb-6">
        <div class="card">
          <div class="card-header">
            <h3>Thông tin chung</h3>
            <button id="overview-edit-btn" class="btn btn-secondary btn-sm">Sửa nội dung</button>
          </div>
          <div class="card-body">
            <p class="mb-2"><strong>Tên dự án:</strong> ${data.projectName || '<span class="text-danger">Chưa nhập</span>'}</p>
            <p class="mb-2"><strong>Mô tả ngắn:</strong> ${data.shortSummary || '<span class="text-danger">Chưa nhập</span>'}</p>
            <p class="mb-2"><strong>Team phụ trách:</strong> ${data.ownerTeam || '<span class="text-subtle">Không có</span>'}</p>
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
              <span>Nội dung cốt lõi (Vấn đề & Giải pháp)</span>
              <span class="status-pill status-${checkBasic}">${checkBasic === 'success' ? 'Đủ' : 'Thiếu'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Số lượng tính năng nổi bật (3-6)</span>
              <span class="status-pill status-${checkFeatures}">${checkFeatures === 'success' ? 'Đủ' : 'Cần thêm'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Tài nguyên hình ảnh bắt buộc</span>
              <span class="status-pill status-${checkAssets}">${checkAssets === 'success' ? 'Đã upload' : 'Thiếu ảnh'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center;">
              <span>Chọn Template Video</span>
              <span class="status-pill status-${checkTemplate}">${checkTemplate === 'success' ? 'Đã chọn' : 'Chưa chọn'}</span>
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; border-top: 1px solid var(--color-border); padding-top: var(--space-2); margin-top: var(--space-1); font-weight:600;">
              <span>Trạng thái sẵn sàng render</span>
              <span class="status-pill status-${checkReady}">${checkReady === 'success' ? 'Sẵn sàng' : 'Chưa sẵn sàng'}</span>
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
          <button id="quick-preview-btn" class="btn btn-secondary">Xem trước scenes (16:9)</button>
          <button id="quick-render-btn" class="btn btn-primary" ${errorCount > 0 ? 'disabled' : ''}>Đi tới Render Video</button>
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
    const sceneScripts = (data.voiceover && data.voiceover.sceneScripts) || {};

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Nội dung cốt lõi của video</h1>
        <div style="display:flex; gap: var(--space-2);">
          <button id="content-fill-btn" class="btn btn-secondary">Tải dữ liệu mẫu</button>
          <button id="content-clear-btn" class="btn btn-secondary">Xóa form</button>
          <button id="content-save-btn" class="btn btn-primary">Lưu nháp</button>
        </div>
      </div>

      <form id="content-form" class="page-form-stack">
        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="field-projectName">Tên dự án *</label>
            <input type="text" id="field-projectName" class="form-control" value="${data.projectName || ''}">
          </div>
          <div class="form-group">
            <label class="form-label" for="field-projectSlug">Đường dẫn slug *</label>
            <input type="text" id="field-projectSlug" class="form-control" value="${data.projectSlug || ''}" placeholder="ví dụ: internal-analytics-dashboard">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="field-tagline">Tagline (Khẩu hiệu giới thiệu)</label>
          <input type="text" id="field-tagline" class="form-control" value="${data.tagline || ''}" placeholder="Câu tóm tắt ngắn dưới 80 chữ...">
          <span class="char-counter"><span id="count-tagline">0</span>/80 ký tự</span>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="field-ownerTeam">Team phụ trách</label>
            <input type="text" id="field-ownerTeam" class="form-control" value="${data.ownerTeam || ''}" placeholder="ví dụ: Platform Team">
          </div>
          <div class="form-group">
            <label class="form-label" for="field-presenterRole">Vai trò của người thuyết trình</label>
            <input type="text" id="field-presenterRole" class="form-control" value="${data.presenterRole || ''}" placeholder="ví dụ: Product Owner, Lead Tech">
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="field-shortSummary">Mô tả ngắn dự án *</label>
          <textarea id="field-shortSummary" class="form-control" rows="3" placeholder="Tóm tắt bối cảnh tổng quát...">${data.shortSummary || ''}</textarea>
          <span class="char-counter"><span id="count-shortSummary">0</span>/200 ký tự</span>
        </div>
        <div class="form-group voice-script-field">
          <label class="form-label" for="voice-script-intro">Voice intro</label>
          <textarea id="voice-script-intro" class="form-control" rows="2" placeholder="Kịch bản giọng đọc cho cảnh mở đầu...">${sceneScripts.intro || ''}</textarea>
          <span class="char-counter"><span id="voice-count-intro">0</span>/6s</span>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="field-problemContext">Vấn đề / Nỗi đau khách hàng *</label>
            <textarea id="field-problemContext" class="form-control" rows="4" placeholder="Khách hàng đang gặp khó khăn gì?">${data.problemContext || ''}</textarea>
            <span class="char-counter"><span id="count-problemContext">0</span>/300 ký tự</span>
            <div class="voice-script-field is-nested">
              <label class="form-label" for="voice-script-problem">Voice vấn đề</label>
              <textarea id="voice-script-problem" class="form-control" rows="2" placeholder="Kịch bản đọc riêng cho cảnh vấn đề...">${sceneScripts.problem || ''}</textarea>
              <span class="char-counter"><span id="voice-count-problem">0</span>/10s</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="field-solutionWhat">Giải pháp đã xây dựng *</label>
            <textarea id="field-solutionWhat" class="form-control" rows="4" placeholder="Sản phẩm giải quyết nỗi đau đó như thế nào?">${data.solutionWhat || ''}</textarea>
            <span class="char-counter"><span id="count-solutionWhat">0</span>/300 ký tự</span>
            <div class="voice-script-field is-nested">
              <label class="form-label" for="voice-script-solution">Voice giải pháp</label>
              <textarea id="voice-script-solution" class="form-control" rows="2" placeholder="Kịch bản đọc riêng cho cảnh giải pháp...">${sceneScripts.solution || ''}</textarea>
              <span class="char-counter"><span id="voice-count-solution">0</span>/10s</span>
            </div>
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="field-targetUsers">Người dùng mục tiêu</label>
            <textarea id="field-targetUsers" class="form-control" rows="2" placeholder="ví dụ: Quản lý dự án, End-users">${data.targetUsers || ''}</textarea>
          </div>
          <div class="form-group">
            <label class="form-label" for="field-useCase">Bối cảnh sử dụng</label>
            <textarea id="field-useCase" class="form-control" rows="2" placeholder="ví dụ: Họp hàng tuần, Training nhân viên">${data.useCase || ''}</textarea>
          </div>
        </div>

        <div class="grid-2">
          <div class="form-group">
            <label class="form-label" for="field-keyHighlight">Điểm nổi bật nhất</label>
            <textarea id="field-keyHighlight" class="form-control" rows="2" placeholder="ví dụ: Tự động cảnh báo Slack">${data.keyHighlight || ''}</textarea>
            <div class="voice-script-field is-nested">
              <label class="form-label" for="voice-script-features">Voice tính năng</label>
              <textarea id="voice-script-features" class="form-control" rows="2" placeholder="Kịch bản đọc cho cảnh tính năng nổi bật...">${sceneScripts.features || ''}</textarea>
              <span class="char-counter"><span id="voice-count-features">0</span>/18s</span>
            </div>
          </div>
          <div class="form-group">
            <label class="form-label" for="field-resultImpact">Kết quả / Tác động đạt được</label>
            <textarea id="field-resultImpact" class="form-control" rows="2" placeholder="ví dụ: Tiết kiệm 70% thời gian báo cáo">${data.resultImpact || ''}</textarea>
            <div class="voice-script-field is-nested">
              <label class="form-label" for="voice-script-impact">Voice tác động</label>
              <textarea id="voice-script-impact" class="form-control" rows="2" placeholder="Kịch bản đọc riêng cho cảnh kết quả...">${sceneScripts.impact || ''}</textarea>
              <span class="char-counter"><span id="voice-count-impact">0</span>/10s</span>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label" for="field-endingNote">Lời kết thúc video</label>
          <textarea id="field-endingNote" class="form-control" rows="2" placeholder="Lời cảm ơn hoặc lời kêu gọi hành động...">${data.endingNote || ''}</textarea>
          <div class="voice-script-field is-nested">
            <label class="form-label" for="voice-script-outro">Voice kết thúc</label>
            <textarea id="voice-script-outro" class="form-control" rows="2" placeholder="Kịch bản đọc riêng cho cảnh kết thúc...">${sceneScripts.outro || ''}</textarea>
            <span class="char-counter"><span id="voice-count-outro">0</span>/6s</span>
          </div>
        </div>
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
    bindCounter("problemContext", 300);
    bindCounter("solutionWhat", 300);

    // Other inputs binding
    const bindSimpleInput = (id) => {
      const el = document.getElementById(`field-${id}`);
      if (el) {
        el.addEventListener("input", () => {
          AppState.updateProjectField(id, el.value);
        });
      }
    };

    ["projectName", "projectSlug", "ownerTeam", "presenterRole", "targetUsers", "useCase", "keyHighlight", "resultImpact", "endingNote"].forEach(id => {
      bindSimpleInput(id);
    });

    const estimateVoiceSeconds = (value) => {
      const text = String(value || "").replace(/\s+/g, " ").trim();
      if (!text) return 0;
      return Math.max(1, Math.ceil((text.split(/\s+/).filter(Boolean).length / 145) * 60));
    };

    const bindVoiceScript = (type, duration) => {
      const input = document.getElementById(`voice-script-${type}`);
      const counter = document.getElementById(`voice-count-${type}`);
      if (!input || !counter) return;

      const update = () => {
        const estimated = estimateVoiceSeconds(input.value);
        counter.textContent = `${estimated}s`;
        counter.style.color = estimated > duration ? "var(--color-warning)" : "var(--color-text-subtle)";
      };

      input.addEventListener("input", () => {
        const projectData = AppState.getProjectData();
        const voiceover = projectData.voiceover || {};
        AppState.updateProjectField("voiceover", {
          ...voiceover,
          sceneScripts: {
            ...(voiceover.sceneScripts || {}),
            [type]: input.value
          }
        });
        update();
      });
      update();
    };

    [
      ["intro", 6],
      ["problem", 10],
      ["solution", 10],
      ["features", 18],
      ["impact", 10],
      ["outro", 6]
    ].forEach(([type, duration]) => bindVoiceScript(type, duration));

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
      showToast("Đã lưu nháp dự án thành công!");
    });
  };

  // 3. Features Manager View
  const renderFeaturesScreen = (container, data) => {
    const list = data.features || [];

    let rowsHTML = "";
    if (list.length === 0) {
      rowsHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <div class="empty-state-title">Chưa có tính năng nào</div>
          <div class="empty-state-desc">Hãy thêm các tính năng nổi bật của dự án (khuyến nghị 3-6 tính năng) để đưa vào video.</div>
          <button id="features-empty-add-btn" class="btn btn-primary">Thêm tính năng đầu tiên</button>
        </div>
      `;
    } else {
      rowsHTML = `
        <div class="list-rows">
          ${list.map((item, index) => `
            <div class="list-row-item" data-id="${item.id}">
              <div class="row-drag-handle" title="Di chuyển">
                <button class="btn btn-icon btn-sm btn-reorder-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>▲</button>
                <button class="btn btn-icon btn-sm btn-reorder-down" data-index="${index}" ${index === list.length - 1 ? 'disabled' : ''}>▼</button>
              </div>
              <div class="row-content-fields" style="display:flex; flex-direction:column; gap: 4px; flex:1;">
                <div style="display:flex; justify-content:space-between; align-items:center;">
                  <h4 style="margin:0;">${item.name}</h4>
                  <div style="display:flex; align-items:center; gap: 8px;">
                    <label style="font-size: var(--font-xs); display:flex; align-items:center; gap: 4px; cursor:pointer;">
                      <input type="checkbox" class="feature-use-toggle" data-id="${item.id}" ${item.useInVideo ? 'checked' : ''}>
                      Đưa vào video
                    </label>
                  </div>
                </div>
                <div class="text-muted" style="font-size: var(--font-sm);">${item.description}</div>
                <div class="text-subtle" style="font-size: var(--font-xs);"><strong>Giá trị:</strong> ${item.benefit}</div>
              </div>
              <div class="row-actions">
                <button class="btn btn-secondary btn-sm btn-edit-feature" data-id="${item.id}">Sửa</button>
                <button class="btn btn-danger btn-sm btn-delete-feature" data-id="${item.id}">Xóa</button>
              </div>
            </div>
          `).join("")}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Tính năng nổi bật (${list.length})</h1>
        ${list.length > 0 ? `<button id="features-add-btn" class="btn btn-primary">Thêm tính năng</button>` : ''}
      </div>
      <div class="page-section-stack">
        ${rowsHTML}
      </div>
    `;

    // Modal Form for Add/Edit
    const showFeatureFormModal = (feature = null) => {
      const isEdit = feature !== null;
      const modalBody = document.createElement("div");
      modalBody.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="modal-feat-name">Tên tính năng *</label>
          <input type="text" id="modal-feat-name" class="form-control" value="${isEdit ? feature.name : ''}">
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-feat-desc">Mô tả ngắn *</label>
          <textarea id="modal-feat-desc" class="form-control" rows="3" placeholder="Cách hoạt động của tính năng...">${isEdit ? feature.description : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-feat-benefit">Giá trị mang lại *</label>
          <input type="text" id="modal-feat-benefit" class="form-control" value="${isEdit ? feature.benefit : ''}" placeholder="Giúp người dùng đạt được gì...">
        </div>
        <div class="form-group" style="flex-direction:row; align-items:center; gap: 8px;">
          <input type="checkbox" id="modal-feat-use" ${!isEdit || feature.useInVideo ? 'checked' : ''}>
          <label class="form-label" for="modal-feat-use" style="margin:0;">Đưa vào video giới thiệu</label>
        </div>
      `;

      showModal(
        isEdit ? "Sửa tính năng" : "Thêm tính năng mới",
        modalBody,
        [
          { text: "Hủy", class: "btn-secondary", onClick: closeModal },
          {
            text: isEdit ? "Cập nhật" : "Thêm mới",
            class: "btn-primary",
            onClick: () => {
              const name = document.getElementById("modal-feat-name").value.trim();
              const description = document.getElementById("modal-feat-desc").value.trim();
              const benefit = document.getElementById("modal-feat-benefit").value.trim();
              const useInVideo = document.getElementById("modal-feat-use").checked;

              if (!name || !description || !benefit) {
                alert("Vui lòng nhập đầy đủ các trường thông tin bắt buộc.");
                return;
              }

              const features = [...(data.features || [])];
              if (isEdit) {
                const idx = features.findIndex(f => f.id === feature.id);
                if (idx !== -1) {
                  features[idx] = { ...feature, name, description, benefit, useInVideo };
                }
              } else {
                features.push({
                  id: "feat_" + Date.now(),
                  name,
                  description,
                  benefit,
                  useInVideo
                });
              }

              AppState.updateProjectField("features", features);
              renderFeaturesScreen(container, AppState.getProjectData());
              closeModal();
              showToast(isEdit ? "Cập nhật tính năng thành công!" : "Đã thêm tính năng mới!");
            }
          }
        ]
      );
    };

    // Attach Event Listeners
    if (list.length === 0) {
      document.getElementById("features-empty-add-btn").addEventListener("click", () => showFeatureFormModal());
    } else {
      document.getElementById("features-add-btn").addEventListener("click", () => showFeatureFormModal());

      // Reorder Up
      container.querySelectorAll(".btn-reorder-up").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-index"));
          const features = [...data.features];
          // Swap idx and idx - 1
          const temp = features[idx];
          features[idx] = features[idx - 1];
          features[idx - 1] = temp;
          AppState.updateProjectField("features", features);
          renderFeaturesScreen(container, AppState.getProjectData());
        });
      });

      // Reorder Down
      container.querySelectorAll(".btn-reorder-down").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-index"));
          const features = [...data.features];
          // Swap idx and idx + 1
          const temp = features[idx];
          features[idx] = features[idx + 1];
          features[idx + 1] = temp;
          AppState.updateProjectField("features", features);
          renderFeaturesScreen(container, AppState.getProjectData());
        });
      });

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
            "Xác nhận xóa tính năng",
            "Bạn có chắc chắn muốn xóa tính năng này khỏi danh sách?",
            [
              { text: "Hủy", class: "btn-secondary", onClick: closeModal },
              {
                text: "Xóa",
                class: "btn-danger",
                onClick: () => {
                  const features = data.features.filter(f => f.id !== id);
                  AppState.updateProjectField("features", features);
                  renderFeaturesScreen(container, AppState.getProjectData());
                  closeModal();
                  showToast("Đã xóa tính năng.", "info");
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
        });
      });
    }
  };

  // 4. Timeline Manager View
  const renderTimelineScreen = (container, data) => {
    const list = data.milestones || [];

    let rowsHTML = "";
    if (list.length === 0) {
      rowsHTML = `
        <div class="empty-state">
          <svg class="empty-state-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
          <div class="empty-state-title">Chưa có cột mốc phát triển</div>
          <div class="empty-state-desc">Thêm các cột mốc quan trọng để kể câu chuyện quá trình hình thành sản phẩm của bạn.</div>
          <button id="timeline-empty-add-btn" class="btn btn-primary">Thêm cột mốc đầu tiên</button>
        </div>
      `;
    } else {
      rowsHTML = `
        <div class="list-rows">
          ${list.map((item, index) => {
            let statusPill = "";
            if (item.status === 'completed') statusPill = '<span class="status-pill status-success">Đã xong</span>';
            else if (item.status === 'active') statusPill = '<span class="status-pill status-warning">Đang làm</span>';
            else statusPill = '<span class="status-pill status-info">Sắp tới</span>';

            return `
              <div class="list-row-item" data-id="${item.id}">
                <div class="row-drag-handle">
                  <button class="btn btn-icon btn-sm btn-reorder-up" data-index="${index}" ${index === 0 ? 'disabled' : ''}>▲</button>
                  <button class="btn btn-icon btn-sm btn-reorder-down" data-index="${index}" ${index === list.length - 1 ? 'disabled' : ''}>▼</button>
                </div>
                <div class="row-content-fields" style="display:grid; grid-template-columns: 80px 2fr 1fr; align-items:center; flex:1;">
                  <span style="font-weight:600; font-size: var(--font-sm);">${item.date}</span>
                  <div style="display:flex; flex-direction:column;">
                    <span style="font-weight:600;">${item.name}</span>
                    <span class="text-muted" style="font-size: var(--font-xs);">${item.description || ''}</span>
                    ${item.voiceoverScript ? `<span class="text-subtle" style="font-size: var(--font-xs);">Voice: ${item.voiceoverScript}</span>` : ''}
                  </div>
                  <div>${statusPill}</div>
                </div>
                <div class="row-actions">
                  <button class="btn btn-secondary btn-sm btn-edit-ms" data-id="${item.id}">Sửa</button>
                  <button class="btn btn-danger btn-sm btn-delete-ms" data-id="${item.id}">Xóa</button>
                </div>
              </div>
            `;
          }).join("")}
        </div>
      `;
    }

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Các cột mốc Timeline (${list.length})</h1>
        ${list.length > 0 ? `<button id="timeline-add-btn" class="btn btn-primary">Thêm cột mốc</button>` : ''}
      </div>
      <div class="page-section-stack">
        ${rowsHTML}
      </div>
    `;

    // Modal Form for Add/Edit
    const showMilestoneFormModal = (ms = null) => {
      const isEdit = ms !== null;
      const modalBody = document.createElement("div");
      modalBody.innerHTML = `
        <div class="form-group">
          <label class="form-label" for="modal-ms-date">Thời gian *</label>
          <input type="text" id="modal-ms-date" class="form-control" value="${isEdit ? ms.date : ''}" placeholder="ví dụ: Tháng 01/2026, Q2 2026">
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-ms-name">Tên cột mốc *</label>
          <input type="text" id="modal-ms-name" class="form-control" value="${isEdit ? ms.name : ''}" placeholder="ví dụ: Khởi tạo ý tưởng, Bản MVP">
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-ms-desc">Mô tả chi tiết</label>
          <input type="text" id="modal-ms-desc" class="form-control" value="${isEdit ? (ms.description || '') : ''}">
        </div>
        <div class="form-group voice-script-field">
          <label class="form-label" for="modal-ms-voice">Voice cho cột mốc này</label>
          <textarea id="modal-ms-voice" class="form-control" rows="3" placeholder="Kịch bản đọc khi tới mốc timeline này...">${isEdit ? (ms.voiceoverScript || '') : ''}</textarea>
        </div>
        <div class="form-group">
          <label class="form-label" for="modal-ms-status">Trạng thái</label>
          <select id="modal-ms-status" class="form-control">
            <option value="completed" ${isEdit && ms.status === 'completed' ? 'selected' : ''}>Đã hoàn thành</option>
            <option value="active" ${isEdit && ms.status === 'active' ? 'selected' : ''}>Đang triển khai</option>
            <option value="upcoming" ${isEdit && ms.status === 'upcoming' ? 'selected' : ''}>Kế hoạch sắp tới</option>
          </select>
        </div>
      `;

      showModal(
        isEdit ? "Sửa cột mốc" : "Thêm cột mốc mới",
        modalBody,
        [
          { text: "Hủy", class: "btn-secondary", onClick: closeModal },
          {
            text: isEdit ? "Cập nhật" : "Thêm mới",
            class: "btn-primary",
            onClick: () => {
              const date = document.getElementById("modal-ms-date").value.trim();
              const name = document.getElementById("modal-ms-name").value.trim();
              const description = document.getElementById("modal-ms-desc").value.trim();
              const voiceoverScript = document.getElementById("modal-ms-voice").value.trim();
              const status = document.getElementById("modal-ms-status").value;

              if (!date || !name) {
                alert("Vui lòng nhập đầy đủ thời gian và tên cột mốc.");
                return;
              }

              const milestones = [...(data.milestones || [])];
              if (isEdit) {
                const idx = milestones.findIndex(m => m.id === ms.id);
                if (idx !== -1) {
                  milestones[idx] = { ...ms, date, name, description, voiceoverScript, status };
                }
              } else {
                milestones.push({
                  id: "ms_" + Date.now(),
                  date,
                  name,
                  description,
                  voiceoverScript,
                  status
                });
              }

              AppState.updateProjectField("milestones", milestones);
              renderTimelineScreen(container, AppState.getProjectData());
              closeModal();
              showToast(isEdit ? "Cập nhật mốc thành công!" : "Đã thêm mốc timeline mới!");
            }
          }
        ]
      );
    };

    // Attach Event Listeners
    if (list.length === 0) {
      document.getElementById("timeline-empty-add-btn").addEventListener("click", () => showMilestoneFormModal());
    } else {
      document.getElementById("timeline-add-btn").addEventListener("click", () => showMilestoneFormModal());

      // Reorder Up
      container.querySelectorAll(".btn-reorder-up").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-index"));
          const milestones = [...data.milestones];
          const temp = milestones[idx];
          milestones[idx] = milestones[idx - 1];
          milestones[idx - 1] = temp;
          AppState.updateProjectField("milestones", milestones);
          renderTimelineScreen(container, AppState.getProjectData());
        });
      });

      // Reorder Down
      container.querySelectorAll(".btn-reorder-down").forEach(btn => {
        btn.addEventListener("click", () => {
          const idx = parseInt(btn.getAttribute("data-index"));
          const milestones = [...data.milestones];
          const temp = milestones[idx];
          milestones[idx] = milestones[idx + 1];
          milestones[idx + 1] = temp;
          AppState.updateProjectField("milestones", milestones);
          renderTimelineScreen(container, AppState.getProjectData());
        });
      });

      // Edit ms
      container.querySelectorAll(".btn-edit-ms").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          const ms = data.milestones.find(m => m.id === id);
          if (ms) showMilestoneFormModal(ms);
        });
      });

      // Delete ms
      container.querySelectorAll(".btn-delete-ms").forEach(btn => {
        btn.addEventListener("click", () => {
          const id = btn.getAttribute("data-id");
          showModal(
            "Xác nhận xóa cột mốc",
            "Bạn có chắc muốn xóa cột mốc này?",
            [
              { text: "Hủy", class: "btn-secondary", onClick: closeModal },
              {
                text: "Xóa",
                class: "btn-danger",
                onClick: () => {
                  const milestones = data.milestones.filter(m => m.id !== id);
                  AppState.updateProjectField("milestones", milestones);
                  renderTimelineScreen(container, AppState.getProjectData());
                  closeModal();
                  showToast("Đã xóa cột mốc.", "info");
                }
              }
            ]
          );
        });
      });
    }
  };

  // 5. Asset Manager View
  const renderAssetsScreen = (container, data) => {
    const list = data.assets || [];
    let currentFilter = "all";

    const filterList = (filter) => {
      if (filter === "all") return list;
      return list.filter(a => a.type === filter);
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
        let typeLabel = "Screenshot";
        if (item.type === 'logo') typeLabel = "Logo";
        else if (item.type === 'video') typeLabel = "Demo Clip";
        
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

        return `
          <div class="asset-card" data-id="${item.id}">
            <div class="asset-thumb">
              ${thumbContent}
              ${item.useInVideo ? `<div class="asset-use-badge" title="Đang được sử dụng trong video">✓</div>` : ''}
            </div>
            <div class="asset-info">
              <div class="asset-name" title="${item.name}">${item.name}</div>
              <div class="asset-meta">
                <span>${typeLabel}</span>
                <span>${item.size}</span>
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

      // Bind Grid Action Events
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

      <!-- Drag / Drop Mock Zone -->
      <div class="upload-zone" id="mock-upload-zone">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg>
        <p style="font-weight:600; margin-bottom: 2px;">Kéo thả file hình ảnh / video demo vào đây</p>
        <p class="text-muted" style="font-size: var(--font-xs);">Hoặc click để chọn file từ máy (Giả lập upload)</p>
        <input type="file" id="real-file-input" style="display:none;" accept="image/*,video/*">
      </div>

      <div class="assets-filter-row">
        <div class="filter-group">
          <button class="filter-btn active" data-filter="all">Tất cả</button>
          <button class="filter-btn" data-filter="logo">Logo</button>
          <button class="filter-btn" data-filter="screenshot">Ảnh chụp màn hình</button>
          <button class="filter-btn" data-filter="video">Video demo</button>
        </div>
        <div class="text-subtle" style="font-size: var(--font-xs);">* Chỉ ảnh và logo dùng trong video mới được render.</div>
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
        renderGrid(currentFilter);
      });
    });

    // Mock Upload Click Events
    const dropzone = document.getElementById("mock-upload-zone");
    const realInput = document.getElementById("real-file-input");

    dropzone.addEventListener("click", () => {
      realInput.click();
    });

    realInput.addEventListener("change", (e) => {
      if (e.target.files.length === 0) return;
      const file = e.target.files[0];
      
      // Simulate file upload loading
      dropzone.innerHTML = `
        <div class="spinner" style="margin-bottom: var(--space-2);">⏳</div>
        <p style="font-weight:600;">Đang xử lý tệp: ${file.name}...</p>
        <p class="text-muted" style="font-size: var(--font-xs);">Dung lượng: ${(file.size / 1024 / 1024).toFixed(2)} MB</p>
      `;

      setTimeout(() => {
        // Create Mock Asset
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
          id: "asset_" + Date.now(),
          name: file.name,
          type: type,
          size: (file.size / 1024 / 1024).toFixed(1) + " MB",
          dateAdded: new Date().toISOString().split('T')[0],
          url: url,
          useInVideo: true
        };

        const assets = [...(data.assets || [])];
        assets.push(newAsset);
        AppState.updateProjectField("assets", assets);

        showToast(`Đã upload thành công tệp: ${file.name}`);
        renderAssetsScreen(container, AppState.getProjectData());
      }, 1200);
    });
  };

  // 6. Template & Theme Picker View
  const renderTemplateScreen = (container, data) => {
    container.innerHTML = `
      <div class="workspace-header">
        <h1>Chọn Template & Tùy chỉnh Video</h1>
      </div>

      <div class="preview-layout">
        <!-- Templates List -->
        <div style="display:flex; flex-direction:column; gap: var(--space-6);">
          <h3 class="mb-2">1. Templates có sẵn</h3>
          <div class="templates-grid" style="grid-template-columns: 1fr;">
            ${TEMPLATES_LIST.map(tmpl => `
              <div class="template-card ${data.templateId === tmpl.id ? 'active' : ''}" data-id="${tmpl.id}">
                <div class="template-preview-thumb">
                  <div class="template-preview-aspect">
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

        <!-- Theme customizer panel -->
        <div class="card">
          <div class="card-header">
            <h3>2. Thiết lập video</h3>
          </div>
          <div class="card-body" style="display:flex; flex-direction:column; gap: var(--space-5);">
            <div class="form-group">
              <label class="form-label">Theme màu video</label>
              <div class="filter-group" style="width:100%;">
                <button class="filter-btn btn-theme-choice ${data.templateConfig.theme === 'light' ? 'active' : ''}" data-val="light" style="flex:1;">Sáng</button>
                <button class="filter-btn btn-theme-choice ${data.templateConfig.theme === 'dark' ? 'active' : ''}" data-val="dark" style="flex:1;">Tối</button>
              </div>
            </div>

            <div class="form-group">
              <label class="form-label">Màu nhấn chủ đạo (Accent Color)</label>
              <div style="display:flex; gap: var(--space-2); margin-top: 4px;">
                ${THEME_ACCENT_COLORS.map(color => `
                  <button class="btn btn-secondary btn-color-choice ${data.templateConfig.accentColor === color.id ? 'active' : ''}" 
                    data-color="${color.id}" 
                    style="border-bottom: 3px solid ${color.value}; flex:1; height:40px;">
                    ${color.name}
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
  const renderPreviewScreen = (container, data) => {
    const activeTemplate = TEMPLATES_LIST.find(t => t.id === data.templateId) || TEMPLATES_LIST[0];
    const scenes = activeTemplate.scenes;
    const selectedIdx = AppState.getSelectedSceneIndex();
    const currentScene = scenes[selectedIdx] || scenes[0];

    container.innerHTML = `
      <div class="workspace-header">
        <h1>Xem trước Template Video</h1>
        <div style="font-size: var(--font-sm); color: var(--color-text-muted);">Tỉ lệ màn hình 16:9</div>
      </div>

      <div class="preview-layout">
        <!-- Preview Panel -->
        <div class="preview-pane">
          <div class="preview-canvas-wrapper">
            <div id="preview-canvas" class="preview-canvas">
              <!-- Rendered Dynamically by drawPreviewCanvas() -->
            </div>
          </div>
          <div class="preview-controls">
            <button id="btn-prev-scene" class="btn btn-secondary" ${selectedIdx === 0 ? 'disabled' : ''}>◀ Cảnh trước</button>
            <button id="btn-play-preview" class="btn btn-secondary">Chạy thử ▶</button>
            <button id="btn-next-scene" class="btn btn-secondary" ${selectedIdx === scenes.length - 1 ? 'disabled' : ''}>Cảnh sau ▶</button>
          </div>
        </div>

        <!-- Scene Navigation List -->
        <div class="card">
          <div class="card-header">
            <h3>Danh sách Scene (${scenes.length})</h3>
          </div>
          <div class="card-body scene-sidebar">
            ${scenes.map((scene, index) => `
              <div class="scene-item ${selectedIdx === index ? 'active' : ''}" data-index="${index}">
                <div class="scene-item-title">${index + 1}. ${scene.title}</div>
                <div class="scene-item-duration">${scene.duration}</div>
              </div>
            `).join("")}
          </div>
        </div>
      </div>
    `;

    // Clear interval when navigating away
    const clearAutoplay = () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
        document.getElementById("btn-play-preview").textContent = "Chạy thử ▶";
        showToast("Đã dừng trình chiếu thử.", "info");
      }
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
        playBtn.textContent = "Dừng ❚❚";
        showToast("Bắt đầu chạy trình chiếu các cảnh quay...");
        
        let localIdx = selectedIdx;
        autoplayTimer = setInterval(() => {
          localIdx = (localIdx + 1) % scenes.length;
          AppState.setSelectedSceneIndex(localIdx);
        }, 3000); // Shift every 3s
      }
    });

    // Clean up timer if we switch tab
    AppState.subscribe("tabChanged", () => {
      if (autoplayTimer) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
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
          <div style="font-size: var(--font-xs); text-transform: uppercase; color:${accentColor}; font-weight:700; margin-bottom: 4px; letter-spacing: 1px;">Tính năng nổi bật</div>
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
    const val = AppState.getValidation();
    const errorCount = val.errors.length;
    const renderFormats = Array.isArray(RENDER_FORMATS) ? RENDER_FORMATS : [];
    const voiceoverLanguages = Array.isArray(VOICEOVER_LANGUAGES) ? VOICEOVER_LANGUAGES : [];
    const voiceoverVoices = VOICEOVER_VOICES || {};
    const savedAudio = data.audio || {};
    const savedVoiceover = savedAudio.voiceover || {};
    const selectedVoiceLanguage = voiceoverVoices[savedVoiceover.language] ? savedVoiceover.language : "vi-VN";
    const selectedVoiceList = voiceoverVoices[selectedVoiceLanguage] || [];
    const selectedVoiceId = selectedVoiceList.some((voice) => voice.id === savedVoiceover.voiceId)
      ? savedVoiceover.voiceId
      : (selectedVoiceList[0] && selectedVoiceList[0].id) || "vi-VN-HoaiMyNeural";
    const escapeTextarea = (value) => String(value || "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;");
    const previewPayload = AppRender.buildRenderPayload(data, { formatId: (renderFormats[0] && renderFormats[0].id) || "landscape-16x9" });
    const voiceoverScript = previewPayload.audio.voiceover.script;
    const voiceoverSceneReports = previewPayload.scenes.map((scene) => ({
      id: scene.id,
      title: scene.title,
      duration: scene.duration,
      estimatedDuration: scene.voiceover ? scene.voiceover.estimatedDuration : 0,
      script: scene.voiceover ? scene.voiceover.script : "",
      fits: scene.voiceover ? scene.voiceover.fits : true
    }));

    let buttonStateHTML = "";
    if (AppRender.isRendering()) {
      buttonStateHTML = `<button id="btn-trigger-render-cancel" class="btn btn-danger">Hủy bỏ xuất bản</button>`;
    } else {
      buttonStateHTML = `
        <button id="btn-trigger-render-start" class="btn btn-primary" ${errorCount > 0 ? 'disabled' : ''}>
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

      <div class="preview-layout" style="grid-template-columns: minmax(360px, 1fr) minmax(0, 1.25fr);">
        <!-- Left: Render configuration settings -->
        <div style="display:flex; flex-direction:column; gap: var(--space-4);">
          <div class="card">
            <div class="card-header">
              <h3>Cấu hình render</h3>
            </div>
            <div class="card-body" style="display:flex; flex-direction:column; gap: var(--space-3);">
              <div class="form-group">
                <label class="form-label" for="render-format">Tỷ lệ video</label>
                <select id="render-format" class="form-control" ${AppRender.isRendering() ? 'disabled' : ''}>
                  ${renderFormats.map((format, index) => `
                    <option value="${format.id}" ${index === 0 ? 'selected' : ''}>${format.label}</option>
                  `).join("")}
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="render-fps">Số khung hình (FPS)</label>
                <select id="render-fps" class="form-control" ${AppRender.isRendering() ? 'disabled' : ''}>
                  <option value="30">30 FPS (Mượt mà, tốn ít tài nguyên)</option>
                  <option value="60">60 FPS (Chuyển động siêu mượt, render lâu hơn)</option>
                </select>
              </div>

              <div class="form-group">
                <label class="form-label" for="render-filename">Tên tệp tin đầu ra</label>
                <input type="text" id="render-filename" class="form-control" value="${data.projectSlug || 'project'}_video.mp4" ${AppRender.isRendering() ? 'disabled' : ''}>
              </div>

              <div class="render-voiceover-panel">
                <div class="render-voiceover-header">
                  <div>
                    <div class="render-voiceover-title">Voiceover</div>
                    <div class="render-voiceover-desc">Tạo giọng đọc bằng edge-tts, hỗ trợ Việt / Anh / Nhật.</div>
                  </div>
                  <label class="render-voiceover-toggle">
                    <input id="render-voiceover-enabled" type="checkbox" ${savedVoiceover.enabled ? "checked" : ""} ${AppRender.isRendering() ? "disabled" : ""}>
                    <span>Bật</span>
                  </label>
                </div>

                <div class="render-voiceover-grid">
                  <div class="form-group">
                    <label class="form-label" for="render-voiceover-language">Ngôn ngữ</label>
                    <select id="render-voiceover-language" class="form-control" ${AppRender.isRendering() ? "disabled" : ""}>
                      ${voiceoverLanguages.map((language) => `
                        <option value="${language.id}" ${language.id === selectedVoiceLanguage ? "selected" : ""}>${language.label}</option>
                      `).join("")}
                    </select>
                  </div>
                  <div class="form-group">
                    <label class="form-label" for="render-voiceover-voice">Giọng đọc</label>
                    <select id="render-voiceover-voice" class="form-control" ${AppRender.isRendering() ? "disabled" : ""}>
                      ${selectedVoiceList.map((voice) => `
                        <option value="${voice.id}" ${voice.id === selectedVoiceId ? "selected" : ""}>${voice.label}</option>
                      `).join("")}
                    </select>
                  </div>
                </div>

                <div class="form-group">
                  <label class="form-label" for="render-voiceover-script">Kịch bản đọc tổng hợp</label>
                  <textarea id="render-voiceover-script" class="form-control render-voiceover-script" rows="6" readonly>${escapeTextarea(voiceoverScript)}</textarea>
                  <div class="render-voiceover-scenes">
                    ${voiceoverSceneReports.map((scene) => `
                      <div class="render-voiceover-scene ${scene.script && !scene.fits ? "is-warning" : ""}">
                        <span>${scene.title}</span>
                        <strong>${scene.estimatedDuration}s / ${scene.duration}s</strong>
                      </div>
                    `).join("")}
                  </div>
                </div>
              </div>

              <div style="border-top:1px solid var(--color-border); padding-top: var(--space-4); margin-top: var(--space-2); display:flex; justify-content:space-between; align-items:center;">
                <span>Trạng thái:</span>
                <span id="render-status-pill" class="status-pill status-info">Chờ bắt đầu</span>
              </div>
            </div>
            <div class="card-footer">
              ${buttonStateHTML}
            </div>
          </div>
        </div>

        <!-- Right: Progress bar & Live terminal logs emulator -->
        <div style="display:flex; flex-direction:column; gap: var(--space-4);">
          <div class="card" style="flex:1; display:flex; flex-direction:column;">
            <div class="card-header">
              <h3>Báo cáo tiến trình render</h3>
              <span id="render-progress-text" style="font-weight:700;">0%</span>
            </div>
            <div class="card-body" style="flex:1; display:flex; flex-direction:column; gap: var(--space-4);">
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
    const voiceoverEnabledInput = document.getElementById("render-voiceover-enabled");
    const voiceoverLanguageInput = document.getElementById("render-voiceover-language");
    const voiceoverVoiceInput = document.getElementById("render-voiceover-voice");
    const voiceoverScriptInput = document.getElementById("render-voiceover-script");

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
          script: voiceoverScriptInput ? voiceoverScriptInput.value.trim() : "",
          outputPath: ""
        }
      };
      AppState.updateProjectField("audio", audio);
    };

    if (voiceoverLanguageInput && voiceoverVoiceInput) {
      voiceoverLanguageInput.addEventListener("change", () => {
        voiceoverVoiceInput.innerHTML = getVoiceOptionsHTML(voiceoverLanguageInput.value);
        saveVoiceoverSettings();
      });
    }

    [voiceoverEnabledInput, voiceoverVoiceInput, voiceoverScriptInput].forEach((input) => {
      if (!input) {
        return;
      }
      input.addEventListener(input.tagName === "TEXTAREA" ? "input" : "change", saveVoiceoverSettings);
    });

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
        saveVoiceoverSettings();
        if (voiceoverEnabledInput && voiceoverEnabledInput.checked && voiceoverScriptInput && !voiceoverScriptInput.value.trim()) {
          showToast("Voiceover đang bật nhưng chưa có kịch bản đọc.", "error");
          return;
        }

        const formatId = document.getElementById("render-format").value;
        const fps = parseInt(document.getElementById("render-fps").value);
        const filename = document.getElementById("render-filename").value.trim() || "output.mp4";

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

  // ================= VALIDATION DISPLAY =================

  const updateValidationUI = (valResults) => {
    const errorCount = valResults.errors.length;
    const warningCount = valResults.warnings.length;

    // Update summaries
    DOM.errorCount.textContent = errorCount;
    DOM.warningCount.textContent = warningCount;

    // Toggle main render buttons disabled state
    if (errorCount > 0) {
      DOM.topbarRenderBtn.disabled = true;
    } else {
      DOM.topbarRenderBtn.disabled = false;
    }

    // Sidebar Badges updates
    Object.values(DOM.badges).forEach(badge => badge.classList.add("d-none"));

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

    // Populate List panel
    DOM.validationList.innerHTML = "";

    if (errorCount === 0 && warningCount === 0) {
      DOM.validationList.innerHTML = `
        <div class="empty-state" style="padding: var(--space-4); border:none; background:transparent;">
          <span style="font-size:24px; margin-bottom:4px;">✓</span>
          <div class="empty-state-title" style="font-size:var(--font-sm);">Dữ liệu hoàn hảo!</div>
          <div class="empty-state-desc" style="font-size:var(--font-xs);">Không phát hiện lỗi hoặc cảnh báo nào. Sẵn sàng render!</div>
        </div>
      `;
      return;
    }

    // Errors Group
    valResults.errors.forEach(err => {
      const card = document.createElement("div");
      card.className = "validation-card val-error";
      card.innerHTML = `
        <div class="validation-card-header">
          <span>${err.title}</span>
          <span class="text-danger" style="font-size:10px; font-weight:700;">LỖI</span>
        </div>
        <div class="validation-card-body">${err.message}</div>
      `;
      card.addEventListener("click", () => {
        focusValidationError(err.tab, err.field);
      });
      DOM.validationList.appendChild(card);
    });

    // Warnings Group
    valResults.warnings.forEach(war => {
      const card = document.createElement("div");
      card.className = "validation-card val-warning";
      card.innerHTML = `
        <div class="validation-card-header">
          <span>${war.title}</span>
          <span class="text-warning" style="font-size:10px; font-weight:700;">CẢNH BÁO</span>
        </div>
        <div class="validation-card-body">${war.message}</div>
      `;
      card.addEventListener("click", () => {
        focusValidationError(war.tab, war.field);
      });
      DOM.validationList.appendChild(card);
    });
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

    // Top bar quick action buttons
    DOM.btnQuickExport.addEventListener("click", () => {
      AppStorage.exportProjectJSON(AppState.getProjectData());
      showToast("Đã tải tệp JSON backup dự án!");
    });

    DOM.btnQuickImport.addEventListener("click", () => {
      AppState.setTab("settings");
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
      DOM.validationPanel.classList.remove("mobile-open");
    });

    // Mobile validation panel toggle clicks
    DOM.mobileValidationToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      DOM.validationPanel.classList.toggle("mobile-open");
      DOM.sidebar.classList.remove("mobile-open");
    });

    // Close sidebars on clicking anywhere else
    document.addEventListener("click", () => {
      DOM.sidebar.classList.remove("mobile-open");
      DOM.validationPanel.classList.remove("mobile-open");
    });

    DOM.sidebar.addEventListener("click", (e) => e.stopPropagation());
    DOM.validationPanel.addEventListener("click", (e) => e.stopPropagation());

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
    AppState.subscribe("tabChanged", (tab) => switchTab(tab));
    
    AppState.subscribe("projectDataChanged", (data) => {
      // Re-trigger validation check
      const valResults = AppValidation.validate(data);
      AppState.setValidation(valResults);

      // Save to localStorage automatically on changes
      AppStorage.saveLocalData(data);
      DOM.saveStatus.textContent = "Đã lưu nháp";
      DOM.saveStatus.className = "status-pill status-success ml-2";
      DOM.topbarProjectName.textContent = data.projectName || "Dự án chưa đặt tên";
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
