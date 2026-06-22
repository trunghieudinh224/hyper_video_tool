/* Mock Video Render Process Manager */

const AppRender = (() => {
  let renderInterval = null;
  let currentProgress = 0;
  let renderJob = null; // Store current job config

  const startRender = (config, onProgress, onLog, onComplete, onFailure) => {
    if (renderInterval) return; // Prevent multiple runs

    currentProgress = 0;
    renderJob = {
      id: "job_" + Date.now(),
      filename: config.filename || "output.mp4",
      resolution: config.resolution || "1920x1080",
      fps: config.fps || 30,
      projectName: AppState.getProjectData().projectName,
      templateId: AppState.getProjectData().templateId,
      status: "rendering",
      progress: 0,
      startTime: new Date().toLocaleTimeString()
    };

    // Update state to lock render buttons
    const activeQueue = [renderJob];
    AppState.setRenderQueue(activeQueue);

    onLog("INITIALIZING", `Khởi tạo tiến trình xuất bản video cho dự án: "${renderJob.projectName}"...`);
    onLog("INFO", `Cấu hình: Độ phân giải ${renderJob.resolution} | Tốc độ khung hình ${renderJob.fps} fps | Định dạng MP4.`);
    
    // Simulate steps in rendering
    const logSteps = [
      { progress: 5, type: "INFO", message: "Đang phân tích cấu trúc Project JSON..." },
      { progress: 10, type: "INFO", message: `Đang nạp cấu hình Template: "${renderJob.templateId}"` },
      { progress: 20, type: "INFO", message: "Đang chuẩn bị thư mục assets & tải ảnh chụp màn hình lên cache..." },
      { progress: 30, type: "INFO", message: "Đang dựng Scene 1 (Mở đầu): Render text & căn lề logo..." },
      { progress: 40, type: "INFO", message: "Đang dựng Scene 2 (Vấn đề): Xử lý bối cảnh & mô tả..." },
      { progress: 50, type: "INFO", message: "Đang dựng Scene 3 (Giải pháp): Xây dựng hoạt ảnh giải pháp..." },
      { progress: 65, type: "INFO", message: "Đang dựng Scene 4 (Tính năng): Tạo slides demo tính năng..." },
      { progress: 75, type: "INFO", message: "Đang dựng Scene 5 (Timeline): Bố trí các mốc phát triển..." },
      { progress: 85, type: "INFO", message: "Đang dựng Scene 6 (Kết quả): Xử lý biểu đồ & chỉ số..." },
      { progress: 90, type: "INFO", message: "Đang tổng hợp Scene 7 (Kết thúc): Ghi chú và kêu gọi hành động..." },
      { progress: 95, type: "INFO", message: "Đang nạp nhạc nền và mã hóa âm thanh AAC..." },
      { progress: 98, type: "INFO", message: "Đang ghép nối toàn bộ phân cảnh và xuất luồng video qua FFmpeg..." }
    ];

    let logIndex = 0;

    renderInterval = setInterval(() => {
      // Slow down rendering near 99% to wait for FFmpeg completion step
      let increment = Math.floor(Math.random() * 8) + 2;
      if (currentProgress >= 90) {
        increment = 1;
      }
      
      currentProgress += increment;
      if (currentProgress > 100) currentProgress = 100;

      onProgress(currentProgress);
      renderJob.progress = currentProgress;

      // Trigger logs based on progress threshold
      while (logIndex < logSteps.length && currentProgress >= logSteps[logIndex].progress) {
        onLog(logSteps[logIndex].type, logSteps[logIndex].message);
        logIndex++;
      }

      if (currentProgress === 100) {
        clearInterval(renderInterval);
        renderInterval = null;

        // Render Success Actions
        onLog("SUCCESS", `[Render engine] Tạo video thành công!`);
        onLog("SUCCESS", `Video được lưu vào thư mục đầu ra: outputs/${renderJob.filename}`);

        // Add to outputs history
        const mockOutput = {
          id: "vid_" + Date.now(),
          filename: renderJob.filename,
          template: renderJob.templateId === "project-showcase-90s" ? "Showcase 90s" : "Tech Deep Dive",
          resolution: renderJob.resolution,
          size: (Math.random() * 8 + 6).toFixed(1) + " MB",
          dateCreated: new Date().toISOString().replace('T', ' ').substring(0, 19),
          status: "exists"
        };

        const currentOutputs = AppStorage.loadOutputs();
        currentOutputs.unshift(mockOutput);
        AppStorage.saveOutputs(currentOutputs);

        AppState.setRenderQueue([]);
        onComplete(mockOutput);
      }
    }, 400);
  };

  const cancelRender = (onLog, onCancel) => {
    if (!renderInterval) return;

    clearInterval(renderInterval);
    renderInterval = null;
    currentProgress = 0;

    onLog("ERROR", "TIẾN TRÌNH BỊ HỦY BỞI NGƯỜI DÙNG.");
    onLog("ERROR", "Đang dọn dẹp tài nguyên render tạm thời...");

    AppState.setRenderQueue([]);
    renderJob = null;
    onCancel();
  };

  return {
    startRender,
    cancelRender,
    isRendering: () => renderInterval !== null
  };
})();
