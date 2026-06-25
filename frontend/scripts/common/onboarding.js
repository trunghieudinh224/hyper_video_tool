/* Driver.js onboarding tours for each static page */

const AppOnboarding = (() => {
  const STORAGE_PREFIX = "hyper_video_onboarding_seen";
  const FLOW_KEY = "hyper_video_onboarding_flow";
  const DISABLED_KEY = "hyper_video_onboarding_disabled";
  const COMPLETED_KEY = "hyper_video_onboarding_completed";
  const AUTO_RUN_DELAY_MS = 450;
  const TOUR_ORDER = [
    "overview",
    "content",
    "features",
    "assets",
    "template",
    "preview",
    "render",
    "outputs",
    "settings"
  ];

  const bySelector = (selector) => document.querySelector(selector);
  const hasTarget = (selector) => Boolean(selector && bySelector(selector));

  let activeTour = null;
  let isNavigatingBetweenPages = false;
  let activeTourContext = null;

  const createStep = (element, title, description, side = "bottom", align = "start", meta = {}) => ({
    element,
    popover: {
      title,
      description,
      side,
      align
    },
    meta
  });

  const pageTours = {
    overview: [
      createStep(
        ".sidebar-nav",
        "Bắt đầu từ thanh điều hướng",
        "Tổng quan chỉ là dashboard kiểm tra nhanh. Các bước nhập brief, viết kịch bản, chọn tài nguyên, preview và render nằm ở các trang bên trái.",
        "right"
      ),
      createStep(
        "#topbar-render-btn",
        "Render nhanh khi dữ liệu đã đủ",
        "Nút này đưa thẳng sang trang Render. Nếu còn thiếu dữ liệu, trang Render sẽ báo lỗi hoặc cảnh báo cụ thể.",
        "bottom",
        "end"
      )
    ],
    content: [
      createStep(
        "#content-form",
        "Brief cấp video",
        "Trang này chỉ nhập thông tin chung: chủ đề, mô tả, mục tiêu, bối cảnh và kết quả. Đừng nhét toàn bộ kịch bản chi tiết vào đây.",
        "top"
      ),
      createStep(
        ".render-voiceover-panel",
        "Voiceover toàn video",
        "Bật giọng đọc, chọn ngôn ngữ, giọng, tốc độ và âm lượng. Nội dung đọc chi tiết vẫn nên nằm ở từng đoạn trong trang Kịch bản.",
        "bottom"
      ),
      createStep(
        "#field-videoFormatId",
        "Tỷ lệ video",
        "Chọn dọc hoặc ngang ngay từ phần nội dung vì lựa chọn này ảnh hưởng template, preview và render.",
        "bottom"
      ),
      createStep(
        "#field-videoFps",
        "Số khung hình",
        "Chọn 30 FPS cho render nhẹ hơn hoặc 60 FPS khi cần chuyển động mượt hơn.",
        "bottom"
      ),
      createStep(
        "#field-outputFilename",
        "Tên file đầu ra",
        "Đặt tên MP4 ngay trong phần thiết lập chung để Render chỉ tập trung chạy job.",
        "bottom"
      ),
      createStep(
        "#field-projectName",
        "Chủ đề video",
        "Đây là tên nội dung được giới thiệu trong video, ví dụ tên tính năng, module, workflow hoặc báo cáo.",
        "bottom"
      ),
      createStep(
        "#field-shortSummary",
        "Mô tả ngắn",
        "Viết một đoạn tổng quan ngắn để người xem hiểu video nói về điều gì trước khi đi vào từng phân đoạn.",
        "top"
      ),
      createStep(
        "#content-save-btn",
        "Lưu nháp",
        "Dữ liệu được lưu local trên máy bằng localStorage. Chuyển trang sẽ không mất dữ liệu đang nhập.",
        "left",
        "end"
      )
    ],
    features: [
      createStep(
        "#features-empty-add-btn",
        "Tạo đoạn đầu tiên",
        "Nếu danh sách đang trống, bắt đầu bằng nút này. Mỗi đoạn là một ý sẽ xuất hiện trong video.",
        "top"
      ),
      createStep(
        "#script-sortable-list",
        "Thứ tự xuất hiện",
        "Kéo tay nắm ở từng đoạn để đổi thứ tự. Thứ tự này sẽ đi vào render payload và template dùng đúng thứ tự đó.",
        "top"
      ),
      createStep(
        ".script-segment:first-child .feature-use-toggle",
        "Bật hoặc tắt đoạn",
        "Chỉ các đoạn đang bật mới được đưa vào preview, voice script và render video.",
        "left",
        "end"
      ),
      createStep(
        ".script-detail-panel",
        "Chi tiết đoạn",
        "Panel này cho biết nội dung chính, điểm nhấn và voice script của đoạn đang chọn. Click vào đoạn khác để xem nhanh.",
        "left"
      ),
      createStep(
        "#features-add-btn",
        "Thêm đoạn mới",
        "Mỗi đoạn nên là một ý độc lập trong video: mở đầu, demo, workflow, kết quả hoặc custom.",
        "left",
        "end"
      )
    ],
    assets: [
      createStep(
        "#assets-upload-btn",
        "Thêm tài nguyên",
        "Upload logo, ảnh chụp màn hình hoặc video demo. Giai đoạn hiện tại ưu tiên lưu local và dùng trong preview/render.",
        "left",
        "end"
      ),
      createStep(
        ".assets-filter-row",
        "Lọc tài nguyên",
        "Dùng filter để tách logo, screenshot và video demo. Khi nhiều file, thao tác này giúp chọn đúng asset nhanh hơn.",
        "bottom"
      ),
      createStep(
        ".assets-grid",
        "Chọn file dùng trong video",
        "Mỗi asset có nút sử dụng hoặc bỏ dùng. Chỉ file đang được đánh dấu sử dụng mới được ưu tiên đưa vào video.",
        "top"
      )
    ],
    template: [
      createStep(
        ".template-ratio-filter",
        "Lọc tỷ lệ video",
        "Chọn Ngang 16:9 cho demo/report bình thường, hoặc Dọc 9:16 cho TikTok/Reels/Shorts.",
        "bottom"
      ),
      createStep(
        ".templates-grid",
        "Chọn template",
        "Template quyết định bố cục scene và render composition. Click một card để chọn template đang dùng.",
        "top"
      ),
      createStep(
        ".btn-theme-choice",
        "Theme video",
        "Theme này áp dụng trong video output, không phải theme sáng/tối của giao diện app.",
        "right"
      ),
      createStep(
        ".btn-color-choice",
        "Màu nhấn",
        "Màu nhấn giúp template có nhận diện riêng nhưng vẫn giữ layout cố định và dễ đọc.",
        "top"
      ),
      createStep(
        "#logo-position-choice",
        "Vị trí logo",
        "Chọn không hiển thị, góc trên hoặc chỉ outro tùy mức độ cần brand trong video.",
        "top"
      )
    ],
    preview: [
      createStep(
        ".preview-canvas-shell",
        "Khung xem trước",
        "Đây là preview nhanh theo template và dữ liệu hiện tại. Nó giúp bắt lỗi nội dung trước khi render MP4 thật.",
        "right"
      ),
      createStep(
        ".preview-controls",
        "Điều khiển scene",
        "Dùng Cảnh trước, Chạy thử và Cảnh sau để kiểm tra flow video mà chưa cần render.",
        "top"
      ),
      createStep(
        ".preview-scene-list",
        "Danh sách scene",
        "Click từng scene để xem nội dung nào sẽ lên màn hình ở phần đó.",
        "left"
      ),
      createStep(
        ".preview-segment-summary",
        "Kịch bản đang bật",
        "Nếu thiếu đoạn hoặc thứ tự sai, quay lại trang Kịch bản để bật/tắt hoặc kéo thả lại.",
        "left"
      )
    ],
    render: [
      createStep(
        "#render-preflight-panel",
        "Kiểm tra môi trường render",
        "Preflight kiểm backend, HyperFrames, template và dependency. Có lỗi ở đây thì render thật sẽ fail.",
        "bottom"
      ),
      createStep(
        ".render-progress-body",
        "Kiểm tra dữ liệu",
        "Trước khi render, app kiểm brief, kịch bản, template và voice. Click lỗi để nhảy tới trang cần sửa.",
        "bottom"
      ),
      createStep(
        "#render-status-display",
        "Cấu hình video",
        "Render đọc tỷ lệ, FPS và tên file từ trang Thiết lập video. Muốn đổi cấu hình này thì quay lại Thiết lập video.",
        "bottom"
      ),
      createStep(
        "#btn-trigger-render-start",
        "Bắt đầu render",
        "Khi dữ liệu hợp lệ, nút này gửi job sang backend local để render MP4 thật.",
        "left",
        "end"
      ),
      createStep(
        "#render-log-details",
        "Log render",
        "Mở log khi job lỗi hoặc chạy lâu. Đây là nơi xem HyperFrames đang xử lý tới đâu.",
        "top"
      )
    ],
    outputs: [
      createStep(
        ".empty-state",
        "Chưa có video xuất",
        "Khi chưa render job nào, trang này sẽ trống. Sau khi render thành công, video MP4 sẽ xuất hiện tại đây.",
        "top"
      ),
      createStep(
        "#outputs-render-btn",
        "Đi tới Render",
        "Nếu chưa có output, dùng nút này để quay lại trang Render và tạo MP4 đầu tiên.",
        "top"
      ),
      createStep(
        ".table-wrapper",
        "Danh sách video đã xuất",
        "Các job render thành công sẽ hiện ở đây kèm template, resolution, dung lượng và thời gian tạo.",
        "top"
      ),
      createStep(
        ".btn-open-video",
        "Xem chi tiết output",
        "Mở modal để preview video, xem đường dẫn local và tải MP4 nếu app đang chạy qua backend.",
        "left",
        "end"
      ),
      createStep(
        ".btn-delete-output",
        "Xóa khỏi danh sách",
        "Nút này xóa record trong danh sách local. Hãy dùng cẩn thận nếu cần giữ lịch sử render.",
        "left",
        "end"
      )
    ],
    settings: [
      createStep(
        "#set-upload-dir",
        "Thư mục upload",
        "Đây là đường dẫn local dự kiến để lưu tài nguyên khi dùng backend/upload thật.",
        "bottom"
      ),
      createStep(
        "#set-render-dir",
        "Thư mục output",
        "MP4 render xong sẽ nằm trong thư mục output local, mặc định là outputs/.",
        "bottom"
      ),
      createStep(
        "#set-btn-export",
        "Xuất backup JSON",
        "Dùng nút này để lưu brief, kịch bản, asset và template config thành file JSON mang đi nơi khác.",
        "right"
      ),
      createStep(
        "#set-btn-import",
        "Nhập project JSON",
        "Import lại file JSON đã export để tiếp tục chỉnh hoặc render trên máy khác.",
        "right"
      ),
      createStep(
        "#set-btn-clear",
        "Xóa dữ liệu local",
        "Nút này reset dữ liệu trên trình duyệt. Chỉ dùng khi muốn làm sạch project hiện tại.",
        "top"
      )
    ]
  };

  const getDriverFactory = () => {
    return window.driver && window.driver.js && window.driver.js.driver;
  };

  const getSeenKey = (page) => `${STORAGE_PREFIX}:${page}`;

  const getNextPage = (page) => {
    const index = TOUR_ORDER.indexOf(page);
    return index >= 0 ? TOUR_ORDER[index + 1] : null;
  };

  const getPageLabel = (page) => {
    const labels = {
      overview: "Tổng quan",
      content: "Thiết lập video",
      features: "Kịch bản",
      assets: "Tài nguyên",
      template: "Template",
      preview: "Xem trước",
      render: "Render",
      outputs: "Video đã xuất",
      settings: "Cài đặt"
    };
    return labels[page] || page;
  };

  const getFlowState = () => {
    try {
      return JSON.parse(localStorage.getItem(FLOW_KEY) || "null");
    } catch (error) {
      localStorage.removeItem(FLOW_KEY);
      return null;
    }
  };

  const setFlowState = (page) => {
    localStorage.setItem(FLOW_KEY, JSON.stringify({
      active: true,
      page,
      updatedAt: Date.now()
    }));
  };

  const clearFlowState = () => {
    localStorage.removeItem(FLOW_KEY);
  };

  const isDisabled = () => localStorage.getItem(DISABLED_KEY) === "1";

  const markCompleted = () => {
    localStorage.setItem(COMPLETED_KEY, "1");
  };

  const appendNavigationStep = (page, steps) => {
    const nextPage = getNextPage(page);
    if (
      !nextPage
      || typeof AppNavigation === "undefined"
      || !AppNavigation.getPageUrl
    ) {
      return steps;
    }

    const nextSelector = `.nav-item[data-page="${nextPage}"]`;
    if (!hasTarget(nextSelector)) {
      return steps;
    }

    const navigationStep = createStep(
      nextSelector,
      `Sang ${getPageLabel(nextPage)}`,
      `Bấm Tiếp để mở trang ${getPageLabel(nextPage)} và tiếp tục phần hướng dẫn kế tiếp.`,
      "right",
      "start",
      { nextPage }
    );
    navigationStep.popover.doneBtnText = "Tiếp";

    return [...steps, navigationStep];
  };

  const getAvailableSteps = (page, options = {}) => {
    const steps = (pageTours[page] || [])
      .filter((step) => hasTarget(step.element));
    return options.continuous ? appendNavigationStep(page, steps) : steps;
  };

  const disableAll = (driver) => {
    localStorage.setItem(DISABLED_KEY, "1");
    markCompleted();
    clearFlowState();
    if (driver) {
      driver.destroy();
    }
    if (typeof AppUI !== "undefined" && AppUI.showToast) {
      AppUI.showToast("Đã tắt hướng dẫn tự động. Bấm Hướng dẫn để mở lại khi cần.", "info");
    }
  };

  const addStopButton = (popover, driver) => {
    if (!popover || !popover.footer || popover.footer.querySelector(".driver-stop-onboarding-btn")) {
      return;
    }

    const stopButton = document.createElement("button");
    stopButton.type = "button";
    stopButton.className = "driver-stop-onboarding-btn";
    stopButton.textContent = "Dừng hướng dẫn";
    stopButton.setAttribute("aria-label", "Dừng toàn bộ hướng dẫn tự động");
    stopButton.addEventListener("click", () => disableAll(driver));
    popover.footer.insertBefore(stopButton, popover.footer.firstChild);
  };

  const navigateToNextPage = (page, nextPage) => {
    if (
      !nextPage
      || typeof AppNavigation === "undefined"
      || !AppNavigation.getPageUrl
    ) {
      markCompleted();
      clearFlowState();
      return false;
    }

    localStorage.setItem(getSeenKey(page), "1");
    setFlowState(nextPage);
    isNavigatingBetweenPages = true;
    window.location.href = AppNavigation.getPageUrl(nextPage);
    return true;
  };

  const createDriver = (steps, page, options = {}) => {
    const driverFactory = getDriverFactory();
    if (!driverFactory || steps.length === 0) {
      return null;
    }
    const prefersReducedMotion = window.matchMedia
      && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    return driverFactory({
      steps,
      animate: !prefersReducedMotion,
      allowClose: true,
      allowKeyboardControl: true,
      overlayClickBehavior: "close",
      overlayOpacity: 0.58,
      stagePadding: 8,
      stageRadius: 8,
      popoverOffset: 24,
      showProgress: true,
      popoverClass: "hyper-tour-popover",
      nextBtnText: "Tiếp",
      prevBtnText: "Trước",
      doneBtnText: "Xong",
      progressText: "{{current}}/{{total}}",
      onNextClick: (element, step, context) => {
        const driver = context.driver;
        if (driver.hasNextStep()) {
          driver.moveNext();
          return;
        }

        const nextPage = step && step.meta && step.meta.nextPage;
        if (options.continuous && navigateToNextPage(page, nextPage || getNextPage(page))) {
          return;
        }

        markCompleted();
        clearFlowState();
        driver.destroy();
      },
      onCloseClick: (element, step, context) => {
        markCompleted();
        clearFlowState();
        context.driver.destroy();
      },
      onPopoverRender: (popover, context) => {
        addStopButton(popover, context.driver);
      },
      onDestroyed: () => {
        localStorage.setItem(getSeenKey(page), "1");
        if (!isNavigatingBetweenPages) {
          markCompleted();
          clearFlowState();
          activeTourContext = null;
        }
      }
    });
  };

  const start = (page, options = {}) => {
    const currentPage = page || (document.body && document.body.getAttribute("data-page")) || "overview";
    const isManual = options.manual === true;
    const isContinuous = options.continuous !== false;
    if (!isManual && isDisabled()) {
      return false;
    }

    if (activeTour && activeTour.isActive()) {
      activeTour.destroy();
    }

    const steps = getAvailableSteps(currentPage, { continuous: isContinuous });
    if (steps.length === 0) {
      if (options.notify && typeof AppUI !== "undefined" && AppUI.showToast) {
        AppUI.showToast("Trang này chưa có hướng dẫn khả dụng.", "info");
      }
      return false;
    }

    const tour = createDriver(steps, currentPage, { continuous: isContinuous });
    if (!tour) {
      return false;
    }

    if (isManual) {
      localStorage.removeItem(DISABLED_KEY);
      localStorage.removeItem(COMPLETED_KEY);
    }
    if (isContinuous) {
      setFlowState(currentPage);
    }
    isNavigatingBetweenPages = false;
    activeTour = tour;
    activeTourContext = {
      page: currentPage,
      continuous: isContinuous
    };
    tour.drive();
    localStorage.setItem(getSeenKey(currentPage), "1");
    return true;
  };

  const isEditableTarget = (target) => {
    if (!target) {
      return false;
    }
    const tagName = target.tagName ? target.tagName.toLowerCase() : "";
    return target.isContentEditable
      || tagName === "input"
      || tagName === "textarea"
      || tagName === "select";
  };

  const handleKeyboardShortcuts = (event) => {
    if (!activeTour || !activeTour.isActive() || isEditableTarget(event.target)) {
      return;
    }

    if (event.key === "<") {
      event.preventDefault();
      if (activeTour.hasPreviousStep()) {
        activeTour.movePrevious();
      }
      return;
    }

    if (event.key !== ">") {
      return;
    }

    event.preventDefault();
    if (activeTour.hasNextStep()) {
      activeTour.moveNext();
      return;
    }

    const activeStep = activeTour.getActiveStep && activeTour.getActiveStep();
    const nextPage = activeStep && activeStep.meta && activeStep.meta.nextPage;
    const page = activeTourContext && activeTourContext.page;
    const isContinuous = activeTourContext && activeTourContext.continuous;
    if (isContinuous && navigateToNextPage(page, nextPage || getNextPage(page))) {
      return;
    }

    markCompleted();
    clearFlowState();
    activeTour.destroy();
  };

  const mount = (page) => {
    const currentPage = page || (document.body && document.body.getAttribute("data-page")) || "overview";
    const helpButton = document.getElementById("topbar-help-btn");
    if (helpButton && helpButton.dataset.onboardingBound !== "true") {
      helpButton.dataset.onboardingBound = "true";
      helpButton.addEventListener("click", () => start(currentPage, {
        notify: true,
        manual: true,
        continuous: true
      }));
    }

    if (document.body.dataset.onboardingKeyboardBound !== "true") {
      document.body.dataset.onboardingKeyboardBound = "true";
      document.addEventListener("keydown", handleKeyboardShortcuts);
    }

    const flowState = getFlowState();
    if (flowState && flowState.active && flowState.page === currentPage && !isDisabled()) {
      window.setTimeout(() => {
        start(currentPage, { continuous: true });
      }, AUTO_RUN_DELAY_MS);
      return;
    }

    if (
      currentPage !== "overview"
      || isDisabled()
      || localStorage.getItem(COMPLETED_KEY) === "1"
    ) {
      return;
    }

    window.setTimeout(() => {
      start(currentPage, { continuous: true });
    }, AUTO_RUN_DELAY_MS);
  };

  return {
    getAvailableSteps,
    mount,
    start
  };
})();
