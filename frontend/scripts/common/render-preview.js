/* Render payload builder and backend render API client */

const AppRender = (() => {
  let isRendering = false;

  const buildRenderPayload = (projectData, renderConfig = {}) => {
    const selectedAssets = projectData.assets || [];
    const logo = selectedAssets.find((asset) => asset.type === "logo" && asset.useInVideo) || null;
    const screenshots = selectedAssets.filter((asset) => asset.type === "screenshot" && asset.useInVideo);
    const videos = selectedAssets.filter((asset) => asset.type === "video" && asset.useInVideo);
    const activeFeatures = (projectData.features || []).filter((feature) => feature.useInVideo).slice(0, 4);
    const milestones = (projectData.milestones || []).slice(0, 5);

    return {
      version: "1.0.0",
      source: {
        projectName: projectData.projectName || "Untitled Project",
        projectSlug: projectData.projectSlug || "untitled-project",
        ownerTeam: projectData.ownerTeam || "Team phát triển",
        presenterRole: projectData.presenterRole || "Người thuyết trình"
      },
      template: {
        id: projectData.templateId || "project-showcase-90s",
        config: projectData.templateConfig || {
          theme: "dark",
          accentColor: "blue",
          fontSize: "default",
          logoPosition: "top-left"
        }
      },
      video: {
        width: renderConfig.resolution === "1280x720" ? 1280 : 1920,
        height: renderConfig.resolution === "1280x720" ? 720 : 1080,
        fps: Number(renderConfig.fps || 30),
        format: "mp4",
        estimatedDuration: 74
      },
      assets: {
        logo,
        screenshots,
        videos,
        all: selectedAssets
      },
      scenes: [
        {
          id: "scene-intro",
          type: "intro",
          title: "Giới thiệu dự án",
          duration: 6,
          content: {
            projectName: projectData.projectName || "Untitled Project",
            tagline: projectData.tagline || "Video giới thiệu dự án nội bộ.",
            ownerTeam: projectData.ownerTeam || "Team phát triển",
            summary: projectData.shortSummary || "Tóm tắt ngắn về giá trị dự án."
          }
        },
        {
          id: "scene-problem",
          type: "problem",
          title: "Bối cảnh và vấn đề",
          duration: 10,
          content: {
            problem: projectData.problemContext || "Chưa có mô tả vấn đề.",
            targetUsers: projectData.targetUsers || "Người dùng nội bộ.",
            useCase: projectData.useCase || "Use case chính của dự án."
          }
        },
        {
          id: "scene-solution",
          type: "solution",
          title: "Giải pháp",
          duration: 10,
          content: {
            solution: projectData.solutionWhat || "Chưa có mô tả giải pháp.",
            keyHighlight: projectData.keyHighlight || "Chưa có điểm nhấn chính."
          }
        },
        {
          id: "scene-features",
          type: "features",
          title: "Tính năng nổi bật",
          duration: 18,
          content: {
            items: activeFeatures.map((feature, index) => ({
              id: feature.id || `feature_${index + 1}`,
              title: feature.name || feature.title || "Tính năng chưa đặt tên",
              description: feature.description || "",
              benefit: feature.benefit || ""
            }))
          }
        },
        {
          id: "scene-timeline",
          type: "timeline",
          title: "Timeline phát triển",
          duration: 14,
          content: {
            milestones: milestones.map((milestone, index) => ({
              id: milestone.id || `milestone_${index + 1}`,
              title: milestone.name || milestone.title || "Cột mốc chưa đặt tên",
              date: milestone.date || "",
              description: milestone.description || "",
              status: milestone.status || "upcoming"
            }))
          }
        },
        {
          id: "scene-impact",
          type: "impact",
          title: "Kết quả và tác động",
          duration: 10,
          content: {
            resultImpact: projectData.resultImpact || "Chưa có mô tả kết quả đạt được.",
            highlight: projectData.keyHighlight || "Chưa có điểm nhấn tác động."
          }
        },
        {
          id: "scene-outro",
          type: "outro",
          title: "Kết thúc",
          duration: 6,
          content: {
            endingNote: projectData.endingNote || "Cảm ơn đã theo dõi!",
            ownerTeam: projectData.ownerTeam || "Team phát triển"
          }
        }
      ]
    };
  };

  const createRenderJob = async (payload) => {
    const response = await fetch("/api/render-jobs", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    let responseBody;
    try {
      responseBody = await response.json();
    } catch (_error) {
      throw new Error("Backend không trả JSON hợp lệ. Hãy chạy UI qua backend local, không mở file HTML trực tiếp.");
    }

    if (!response.ok || !responseBody.success) {
      const details = Array.isArray(responseBody.errors)
        ? responseBody.errors.map((error) => `${error.path}: ${error.message}`).join("; ")
        : "";
      throw new Error(details || responseBody.message || "Render job thất bại.");
    }

    return responseBody.data.job;
  };

  const getPreflight = async () => {
    const response = await fetch("/api/render-preflight", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    let responseBody;
    try {
      responseBody = await response.json();
    } catch (_error) {
      throw new Error("Không đọc được preflight từ backend. Hãy chạy UI qua backend local.");
    }

    if (!response.ok && !responseBody.data) {
      throw new Error(responseBody.message || "Render preflight thất bại.");
    }

    return responseBody.data.preflight;
  };

  const formatBytes = (bytes) => {
    if (!Number.isFinite(bytes)) {
      return "Không rõ";
    }

    if (bytes < 1024 * 1024) {
      return `${(bytes / 1024).toFixed(1)} KB`;
    }

    return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
  };

  const createOutputRecord = (job, config) => {
    const completedAt = job.completedAt ? new Date(job.completedAt) : new Date();

    return {
      id: job.id,
      jobId: job.id,
      filename: job.outputPath ? job.outputPath.split("/").pop() : `${job.id}.mp4`,
      outputPath: job.outputPath,
      template: job.templateId === "project-showcase-90s" ? "Showcase 90s" : job.templateId,
      resolution: config.resolution || "1920x1080",
      size: formatBytes(job.outputSize),
      outputSize: job.outputSize,
      durationMs: job.durationMs,
      dateCreated: completedAt.toISOString().replace("T", " ").substring(0, 19),
      status: job.status,
      source: "backend"
    };
  };

  const normalizeBackendOutput = (output) => ({
    id: output.id || output.jobId,
    jobId: output.jobId || output.id,
    filename: output.filename,
    outputPath: output.outputPath || (output.filename ? `outputs/${output.filename}` : ""),
    template: output.template || (output.templateId === "project-showcase-90s" ? "Showcase 90s" : output.templateId),
    resolution: output.resolution || "1920x1080",
    size: formatBytes(output.outputSize),
    outputSize: output.outputSize,
    durationMs: output.durationMs,
    dateCreated: output.dateCreated || (output.completedAt || output.createdAt || "").replace("T", " ").substring(0, 19),
    status: output.status || "succeeded",
    source: "backend"
  });

  const listBackendOutputs = async () => {
    const response = await fetch("/api/outputs", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    let responseBody;
    try {
      responseBody = await response.json();
    } catch (_error) {
      throw new Error("Không đọc được danh sách video từ backend. Hãy chạy UI qua backend local.");
    }

    if (!response.ok || !responseBody.success) {
      throw new Error(responseBody.message || "Không tải được danh sách video đã xuất.");
    }

    return (responseBody.data.outputs || []).map(normalizeBackendOutput);
  };

  const startRender = async (config, onProgress, onLog, onComplete, onFailure) => {
    if (isRendering) return;

    isRendering = true;
    const projectData = AppState.getProjectData();
    const payload = buildRenderPayload(projectData, config);
    const queuedJob = {
      id: `job_${Date.now()}`,
      filename: config.filename || `${projectData.projectSlug || "project"}_video.mp4`,
      resolution: config.resolution || "1920x1080",
      fps: config.fps || 30,
      projectName: projectData.projectName,
      templateId: projectData.templateId,
      status: "rendering",
      progress: 12,
      startTime: new Date().toLocaleTimeString()
    };

    AppState.setRenderQueue([queuedJob]);
    onProgress(12);
    onLog("INITIALIZING", "Đang tạo render payload từ dữ liệu UI hiện tại.");
    onLog("INFO", `Template: ${payload.template.id} | ${payload.video.width}x${payload.video.height} | ${payload.video.fps}fps.`);
    onLog("INFO", "Gửi job sang backend HyperFrames local. Request sẽ chờ cho đến khi MP4 render xong.");

    try {
      onProgress(35);
      const job = await createRenderJob(payload);
      onProgress(100);
      onLog("SUCCESS", `Backend render thành công: ${job.outputPath}`);
      onLog("SUCCESS", `Thời gian render: ${Math.round((job.durationMs || 0) / 1000)} giây.`);

      const output = createOutputRecord(job, config);
      const outputs = AppStorage.loadOutputs();
      AppStorage.saveOutputs([output, ...outputs.filter((item) => item.id !== output.id)]);
      AppState.setRenderQueue([]);
      isRendering = false;
      onComplete(output);
    } catch (error) {
      onProgress(0);
      onLog("ERROR", error.message);
      AppState.setRenderQueue([]);
      isRendering = false;
      if (onFailure) {
        onFailure(error);
      }
    }
  };

  const cancelRender = (onLog, onCancel) => {
    onLog("ERROR", "Backend render hiện chạy đồng bộ nên không thể hủy request đang chạy từ UI MVP.");
    if (onCancel) {
      onCancel();
    }
  };

  return {
    buildRenderPayload,
    getPreflight,
    listBackendOutputs,
    startRender,
    cancelRender,
    isRendering: () => isRendering
  };
})();
