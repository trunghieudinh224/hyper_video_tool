/* Shared app shell rendered into every static page */

const AppShell = (() => {
  const navItems = [
    { page: "overview", label: "Tổng quan", icon: "grid", badge: "" },
    { page: "content", label: "Nội dung dự án", icon: "file", badge: "badge-content" },
    { page: "features", label: "Tính năng", icon: "star", badge: "badge-features" },
    { page: "timeline", label: "Timeline", icon: "clock", badge: "badge-timeline" },
    { page: "assets", label: "Tài nguyên", icon: "image", badge: "badge-assets" },
    { page: "template", label: "Template", icon: "layers", badge: "badge-template" },
    { page: "preview", label: "Xem trước", icon: "film", badge: "" },
    { page: "render", label: "Render", icon: "box", badge: "badge-render" },
    { page: "outputs", label: "Video đã xuất", icon: "video", badge: "" },
    { page: "settings", label: "Cài đặt", icon: "settings", badge: "" }
  ];

  const icons = {
    grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>',
    file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    star: '<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>',
    clock: '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>',
    layers: '<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>',
    film: '<rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/><line x1="7" y1="2" x2="7" y2="22"/><line x1="17" y1="2" x2="17" y2="22"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="2" y1="7" x2="7" y2="7"/><line x1="2" y1="17" x2="7" y2="17"/><line x1="17" y1="17" x2="22" y2="17"/><line x1="17" y1="7" x2="22" y2="7"/>',
    box: '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>',
    video: '<path d="M23 7l-7 5 7 5V7z"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>'
  };

  const renderIcon = (name) => {
    return `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${icons[name]}</svg>`;
  };

  const renderNav = () => {
    return navItems.map((item) => {
      const badge = item.badge ? `<span id="${item.badge}" class="nav-badge d-none">!</span>` : "";
      return `
        <li>
          <a class="nav-item" data-page="${item.page}" href="./${item.page}.html">
            ${renderIcon(item.icon)}
            <span>${item.label}</span>
            ${badge}
          </a>
        </li>
      `;
    }).join("");
  };

  const mount = (page) => {
    const root = document.getElementById("app-shell");
    if (!root) return;

    root.innerHTML = `
      <div class="app-container">
        <aside class="sidebar" id="sidebar">
          <div class="sidebar-header">
            <img src="../assets/logo.png" alt="Hyper Video Tool Logo" class="sidebar-logo">
            <span class="logo-text">Hyper Video Tool</span>
          </div>
          <nav class="sidebar-nav">
            <ul>${renderNav()}</ul>
          </nav>
        </aside>

        <div class="app-main">
          <header class="topbar">
            <div class="topbar-left">
              <button id="mobile-sidebar-toggle" class="btn btn-icon mobile-nav-toggle" aria-label="Mở điều hướng">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12h18M3 6h18M3 18h18"/></svg>
              </button>
              <span id="topbar-project-name" class="project-name-display">Đang tải...</span>
              <span id="save-status" class="status-pill status-success ml-2">Đang tải...</span>
            </div>
            <div class="topbar-right">
              <button id="theme-toggle" class="btn btn-icon" title="Chuyển chế độ sáng/tối" aria-label="Chuyển chế độ sáng/tối">
                <svg class="sun-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
                <svg class="moon-icon d-none" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
              </button>
              <button id="topbar-render-btn" class="btn btn-primary" disabled>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                Render video
              </button>
              <button id="mobile-validation-toggle" class="btn btn-icon mobile-nav-toggle" aria-label="Mở kiểm tra dữ liệu">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </button>
            </div>
          </header>

          <div class="app-workspace">
            <main class="main-workspace">
              <div id="workspace-tabs-content" class="workspace-content">
                <section id="view-${page}" class="page-content"></section>
              </div>
            </main>

            <aside class="validation-panel" id="validation-panel" aria-label="Kiểm tra dữ liệu">
              <button id="validation-compact-toggle" class="validation-compact-toggle" type="button" aria-expanded="false" aria-controls="validation-drawer" title="Mở kiểm tra dữ liệu">
                <span class="validation-compact-icon" aria-hidden="true">✓</span>
                <span class="validation-compact-counts">
                  <span><strong id="compact-error-count">0</strong> lỗi</span>
                  <span><strong id="compact-warning-count">0</strong> cảnh báo</span>
                </span>
              </button>

              <div id="validation-drawer" class="validation-drawer">
                <div class="validation-header">
                  <h3>Kiểm tra dữ liệu</h3>
                  <button id="validation-close" class="btn btn-icon btn-sm" type="button" aria-label="Thu gọn kiểm tra dữ liệu">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6 6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div class="validation-summary">
                  <div class="summary-item error-summary">
                    <span class="count" id="error-count">0</span>
                    <span class="label">Lỗi</span>
                  </div>
                  <div class="summary-item warning-summary">
                    <span class="count" id="warning-count">0</span>
                    <span class="label">Cảnh báo</span>
                  </div>
                </div>
                <div class="validation-list" id="validation-list"></div>
              </div>
            </aside>
          </div>
        </div>
      </div>

      <div id="modal-container" class="modal-overlay d-none">
        <div class="modal">
          <div class="modal-header">
            <h3 id="modal-title">Xác nhận</h3>
            <button id="modal-close" class="modal-close-btn" aria-label="Đóng">&times;</button>
          </div>
          <div class="modal-body" id="modal-body"></div>
          <div class="modal-footer" id="modal-footer"></div>
        </div>
      </div>

      <div id="toast-container" class="toast-container"></div>
    `;

    AppNavigation.setActiveNav(page);
  };

  return { mount };
})();
