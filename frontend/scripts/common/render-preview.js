/* Render payload builder and backend render API client */

const AppRender = (() => {
  let isRendering = false;

  const getRenderFormat = (renderConfig = {}) => {
    const formats = Array.isArray(window.RENDER_FORMATS) ? window.RENDER_FORMATS : RENDER_FORMATS;
    return formats.find((format) => format.id === renderConfig.formatId)
      || formats.find((format) => format.resolution === renderConfig.resolution)
      || formats[0];
  };

  const normalizeText = (value) => String(value || "").replace(/\s+/g, " ").trim();

  const normalizePercent = (value, fallback = "+0%") => {
    if (typeof value === "number" && Number.isFinite(value)) {
      return `${value >= 0 ? "+" : ""}${Math.trunc(value)}%`;
    }
    const normalized = normalizeText(value);
    return /^[+-]\d+%$/.test(normalized) ? normalized : fallback;
  };

  const estimateSpeechDurationSeconds = (value) => {
    const text = normalizeText(value);
    if (!text) {
      return 0;
    }
    const wordCount = text.split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.ceil((wordCount / 145) * 60));
  };

  const createSceneVoiceover = (type, duration, script) => {
    const normalizedScript = normalizeText(script);
    const estimatedDuration = estimateSpeechDurationSeconds(normalizedScript);
    return {
      script: normalizedScript,
      estimatedDuration,
      fits: !normalizedScript || estimatedDuration <= duration
    };
  };

  const buildVoiceoverScriptFromScenes = (scenes) => {
    return scenes
      .map((scene) => scene.voiceover && scene.voiceover.script)
      .filter(Boolean)
      .join("\n");
  };

  const getUsableAssetUrl = (asset) => {
    const url = normalizeText(asset && asset.url);
    if (!url || url.startsWith("blob:")) {
      return "";
    }
    return url;
  };

  const toDynamicAsset = (asset, fallbackRole) => ({
    id: asset.id || `asset-${fallbackRole || "media"}`,
    type: asset.type === "video" ? "video" : "image",
    role: asset.type || fallbackRole || "media",
    name: asset.name || asset.title || "Video asset",
    url: getUsableAssetUrl(asset),
    alt: asset.name || asset.title || "Video asset",
    useInVideo: asset.useInVideo !== false
  });

  const createFallbackDynamicMedia = (projectData) => ({
    id: "asset-dynamic-placeholder",
    type: "image",
    role: "screenshot",
    name: "Dynamic render placeholder",
    url: `https://placehold.co/1080x720/101214/eef2f7?text=${encodeURIComponent(projectData.projectName || "Render Preview")}`,
    alt: "Dynamic render placeholder",
    useInVideo: true
  });

  const buildDynamicScenes = (projectData, activeFeatures, milestones, mediaAsset, logoAsset) => {
    const projectName = normalizeText(projectData.projectName) || "Untitled Project";
    const mainMessage = normalizeText(projectData.mainMessage)
      || normalizeText(projectData.keyHighlight)
      || normalizeText(projectData.shortSummary)
      || "Video co motion theo tung phan noi dung.";
    const introBody = normalizeText(projectData.shortSummary)
      || normalizeText(projectData.videoGoal)
      || "Noi dung duoc chia thanh cac scene co nhip reveal rieng.";
    const contextBody = normalizeText(projectData.problemContext)
      || normalizeText(projectData.solutionWhat)
      || "Dung cho gioi thieu, tutorial, showcase, story hoac report tuy noi dung.";
    const mediaBody = normalizeText(projectData.solutionWhat)
      || normalizeText(projectData.useCase)
      || "Anh, screenshot hoac video demo duoc dua vao nhu mot phan cua cau chuyen.";
    const cardItems = activeFeatures.length > 0
      ? activeFeatures.slice(0, 4).map((feature, index) => ({
        id: feature.id || `card-${index + 1}`,
        title: feature.name || feature.title || `Diem nhan ${index + 1}`,
        body: feature.benefit || feature.description || "Noi dung nay se duoc reveal theo tung slot."
      }))
      : [
        {
          id: "card-1",
          title: normalizeText(projectData.keyHighlight) || "Headline vao truoc",
          body: "Nguoi xem can thay y chinh truoc khi vao chi tiet."
        },
        {
          id: "card-2",
          title: "Item vao lan luot",
          body: "Moi item co khoang thoi gian rieng, tranh hien tat ca cung luc."
        },
        {
          id: "card-3",
          title: "Media duoc focus",
          body: "Anh va demo clip co reveal, caption va pan nhe."
        }
      ];
    const stepItems = milestones.length > 0
      ? milestones.slice(0, 5).map((milestone, index) => ({
        id: milestone.id || `step-${index + 1}`,
        title: milestone.name || milestone.title || `Buoc ${index + 1}`,
        body: milestone.description || milestone.date || "Cot moc se duoc highlight theo thu tu."
      }))
      : [
        { id: "step-1", title: "Doc noi dung", body: "Lay brief, script, asset va cac item dang bat." },
        { id: "step-2", title: "Tinh duration", body: "Can thoi luong theo text, media va so item." },
        { id: "step-3", title: "Build motion", body: "Tao timeline reveal tung phan thay vi show het." },
        { id: "step-4", title: "Render MP4", body: "Gui payload cho HyperFrames qua backend local." }
      ];

    return [
      {
        id: "scene-title",
        type: "title",
        headline: projectName,
        subtitle: mainMessage,
        body: introBody,
        media: {
          assetId: logoAsset ? logoAsset.id : "",
          type: "image",
          placement: "badge",
          fit: "contain",
          focus: "center",
          caption: ""
        },
        motion: { preset: "headlineReveal", intensity: "medium", sequence: "headline-subtitle-body" },
        duration: { mode: "auto", min: 4, max: 8 }
      },
      {
        id: "scene-context",
        type: "text",
        headline: normalizeText(projectData.videoGoal) || "Noi dung duoc ke theo mach ro rang",
        subtitle: normalizeText(projectData.contentTone) || "Dynamic story",
        body: contextBody,
        motion: { preset: "textBuild", intensity: "low", sequence: "headline-body" },
        duration: { mode: "auto", min: 5, max: 10 }
      },
      {
        id: "scene-media",
        type: "media",
        headline: normalizeText(projectData.solutionWhat) || "Media la mot phan cua cau chuyen",
        subtitle: normalizeText(projectData.useCase) || "Khong chi nem anh len man hinh",
        body: mediaBody,
        media: {
          assetId: mediaAsset.id,
          type: mediaAsset.type,
          placement: "focus",
          fit: "cover",
          focus: "center",
          caption: mediaAsset.name || "Render preview"
        },
        motion: { preset: "mediaFocus", intensity: "medium", sequence: "media-headline-caption" },
        duration: { mode: "auto", min: 6, max: 12 }
      },
      {
        id: "scene-cards",
        type: "cards",
        headline: normalizeText(projectData.keyHighlight) || "Moi phan noi dung co nhip rieng",
        subtitle: "Card khong hien het mot phat",
        items: cardItems,
        motion: { preset: "spotlightCards", intensity: "medium", sequence: "one-by-one" },
        duration: { mode: "auto", min: 7, max: 14, perItem: 2.2 }
      },
      {
        id: "scene-steps",
        type: "steps",
        headline: "Pipeline render ro rang",
        subtitle: "Data -> duration -> motion -> MP4",
        items: stepItems,
        motion: { preset: "stepSequence", intensity: "medium", sequence: "progressive" },
        duration: { mode: "auto", min: 8, max: 16, perItem: 2 }
      },
      {
        id: "scene-outro",
        type: "outro",
        headline: normalizeText(projectData.endingNote) || "Ket thuc gon va co diem roi",
        subtitle: normalizeText(projectData.ownerTeam) || "Team phu trach",
        body: normalizeText(projectData.resultImpact) || "Video render theo noi dung, nen do dai va nhip khong bi khoa cung.",
        media: {
          assetId: logoAsset ? logoAsset.id : "",
          type: "image",
          placement: "badge",
          fit: "contain",
          focus: "center",
          caption: ""
        },
        motion: { preset: "closingHold", intensity: "low", sequence: "headline-subtitle" },
        duration: { mode: "auto", min: 4, max: 8 }
      }
    ];
  };

  const buildDynamicRenderPayload = (projectData, renderConfig = {}, renderFormat) => {
    const selectedAssets = projectData.assets || [];
    const activeAssets = selectedAssets.filter((asset) => asset.useInVideo !== false);
    const logoSource = activeAssets.find((asset) => asset.type === "logo") || null;
    const mediaSource = activeAssets.find((asset) => ["screenshot", "video"].includes(asset.type) && getUsableAssetUrl(asset))
      || activeAssets.find((asset) => ["screenshot", "video"].includes(asset.type))
      || null;
    const logoAsset = logoSource ? toDynamicAsset(logoSource, "logo") : null;
    const mediaAsset = mediaSource ? toDynamicAsset(mediaSource, "screenshot") : createFallbackDynamicMedia(projectData);
    const dynamicAssets = [logoAsset, mediaAsset].filter(Boolean);
    const activeFeatures = (projectData.features || []).filter((feature) => feature.useInVideo).slice(0, 4);
    const milestones = (projectData.milestones || []).slice(0, 5);
    const audio = projectData.audio || {};
    const voiceover = audio.voiceover || {};

    return {
      version: "dynamic-motion-1.0.0",
      source: {
        projectName: projectData.projectName || "Untitled Project",
        projectSlug: projectData.projectSlug || "untitled-project",
        ownerTeam: projectData.ownerTeam || "Team phát triển",
        presenterRole: projectData.presenterRole || "Người thuyết trình"
      },
      template: {
        id: renderConfig.templateId || renderFormat.templateId,
        variant: "default",
        config: {
          ...(projectData.templateConfig || {}),
          theme: (projectData.templateConfig && projectData.templateConfig.theme) || "dark"
        }
      },
      video: {
        aspectRatio: renderFormat.aspectRatio,
        width: renderFormat.width,
        height: renderFormat.height,
        fps: Number(renderConfig.fps || 30),
        format: "mp4",
        durationMode: "content-driven"
      },
      audio: {
        voiceover: {
          enabled: Boolean(voiceover.enabled),
          provider: voiceover.provider || "edge-tts",
          language: voiceover.language || "vi-VN",
          voiceId: voiceover.voiceId || "vi-VN-HoaiMyNeural",
          rate: normalizePercent(voiceover.rate, "+0%"),
          volume: normalizePercent(voiceover.volume, "+0%"),
          script: voiceover.script || "",
          outputPath: voiceover.outputPath || ""
        },
        backgroundMusic: {
          enabled: false,
          source: "",
          volume: 0.12,
          ducking: true
        },
        soundEffects: {
          enabled: false,
          items: []
        }
      },
      assets: {
        all: dynamicAssets
      },
      scenes: buildDynamicScenes(projectData, activeFeatures, milestones, mediaAsset, logoAsset)
    };
  };

  const buildRenderPayload = (projectData, renderConfig = {}) => {
    const renderFormat = getRenderFormat(renderConfig);
    if (renderFormat.payloadType === "dynamic-motion") {
      return buildDynamicRenderPayload(projectData, renderConfig, renderFormat);
    }

    const selectedAssets = projectData.assets || [];
    const logo = selectedAssets.find((asset) => asset.type === "logo" && asset.useInVideo) || null;
    const screenshots = selectedAssets.filter((asset) => asset.type === "screenshot" && asset.useInVideo);
    const videos = selectedAssets.filter((asset) => asset.type === "video" && asset.useInVideo);
    const activeFeatures = (projectData.features || []).filter((feature) => feature.useInVideo).slice(0, 4);
    const milestones = (projectData.milestones || []).slice(0, 5);
    const derivedHighlight = normalizeText(projectData.mainMessage)
      || normalizeText(projectData.keyHighlight)
      || normalizeText(activeFeatures[0] && (activeFeatures[0].benefit || activeFeatures[0].description || activeFeatures[0].name || activeFeatures[0].title));
    const audio = projectData.audio || {};
    const voiceover = audio.voiceover || {};
    const voiceoverState = projectData.voiceover || {};
    const sceneScripts = voiceoverState.sceneScripts || {};
    const scriptDisplayMode = projectData.scriptDisplayMode === "stack" ? "stack" : "sequence";
    const timelineMilestoneScript = milestones
      .map((milestone) => milestone.voiceoverScript || "")
      .filter(Boolean)
      .join("\n");
    const featureSegmentScript = activeFeatures
      .map((feature) => feature.voiceoverScript || "")
      .filter(Boolean)
      .join("\n");
    const scenes = [
      {
        id: "scene-intro",
        type: "intro",
        title: "Giới thiệu nội dung",
        duration: 6,
        content: {
          projectName: projectData.projectName || "Untitled Project",
          tagline: projectData.tagline || "Video giới thiệu dự án nội bộ.",
          ownerTeam: projectData.ownerTeam || "Team phát triển",
          summary: projectData.shortSummary || "Tóm tắt ngắn về giá trị dự án."
        },
        voiceover: createSceneVoiceover("intro", 6, sceneScripts.intro)
      },
      {
        id: "scene-problem",
        type: "problem",
        title: "Bối cảnh và vấn đề",
        duration: 10,
        content: {
          problem: projectData.problemContext || "Chưa có mô tả vấn đề.",
          targetUsers: projectData.targetUsers || "Người dùng nội bộ.",
          useCase: projectData.useCase || projectData.videoGoal || "Use case chính của video."
        },
        voiceover: createSceneVoiceover("problem", 10, sceneScripts.problem)
      },
      {
        id: "scene-solution",
        type: "solution",
        title: "Giải pháp",
        duration: 10,
        content: {
          solution: projectData.solutionWhat || "Chưa có mô tả giải pháp.",
          keyHighlight: derivedHighlight || "Chưa có điểm nhấn chính."
        },
        voiceover: createSceneVoiceover("solution", 10, sceneScripts.solution)
      },
      {
        id: "scene-features",
        type: "features",
        title: "Kịch bản chính",
        duration: 18,
        content: {
          displayMode: scriptDisplayMode,
          items: activeFeatures.map((feature, index) => ({
            id: feature.id || `feature_${index + 1}`,
            title: feature.name || feature.title || "Đoạn chưa đặt tên",
            description: feature.description || "",
            benefit: feature.benefit || "",
            durationSec: Math.min(30, Math.max(3, Number.parseInt(feature.durationSec, 10) || 8)),
            order: index + 1
          }))
        },
        voiceover: createSceneVoiceover("features", 18, sceneScripts.features || featureSegmentScript)
      },
      {
        id: "scene-timeline",
        type: "timeline",
        title: "Cột mốc tùy chọn",
        duration: 14,
        content: {
          milestones: milestones.map((milestone, index) => ({
            id: milestone.id || `milestone_${index + 1}`,
            title: milestone.name || milestone.title || "Cột mốc chưa đặt tên",
            date: milestone.date || "",
            description: milestone.description || "",
            status: milestone.status || "upcoming",
            voiceoverScript: milestone.voiceoverScript || ""
          }))
        },
        voiceover: createSceneVoiceover("timeline", 14, sceneScripts.timeline || timelineMilestoneScript)
      },
      {
        id: "scene-impact",
        type: "impact",
        title: "Kết quả và tác động",
        duration: 10,
        content: {
          resultImpact: projectData.resultImpact || "Chưa có mô tả kết quả đạt được.",
          highlight: derivedHighlight || "Chưa có điểm nhấn tác động."
        },
        voiceover: createSceneVoiceover("impact", 10, sceneScripts.impact)
      },
      {
        id: "scene-outro",
        type: "outro",
        title: "Kết thúc",
        duration: 6,
        content: {
          endingNote: projectData.endingNote || "Cảm ơn đã theo dõi!",
          ownerTeam: projectData.ownerTeam || "Team phát triển"
        },
        voiceover: createSceneVoiceover("outro", 6, sceneScripts.outro)
      }
    ];
    const sceneVoiceoverScript = buildVoiceoverScriptFromScenes(scenes);

    return {
      version: "1.0.0",
      source: {
        projectName: projectData.projectName || "Untitled Project",
        projectSlug: projectData.projectSlug || "untitled-project",
        ownerTeam: projectData.ownerTeam || "Team phát triển",
        presenterRole: projectData.presenterRole || "Người thuyết trình"
      },
      template: {
        id: renderConfig.templateId || renderFormat.templateId,
        config: projectData.templateConfig || {
          theme: "dark",
          accentColor: "blue",
          fontSize: "default",
          logoPosition: "top-left"
        }
      },
      video: {
        aspectRatio: renderFormat.aspectRatio,
        width: renderFormat.width,
        height: renderFormat.height,
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
      audio: {
        voiceover: {
          enabled: Boolean(voiceover.enabled),
          provider: voiceover.provider || "edge-tts",
          language: voiceover.language || "vi-VN",
          voiceId: voiceover.voiceId || "vi-VN-HoaiMyNeural",
          rate: normalizePercent(voiceover.rate, "+0%"),
          volume: normalizePercent(voiceover.volume, "+0%"),
          script: voiceover.script || sceneVoiceoverScript,
          outputPath: voiceover.outputPath || ""
        },
        backgroundMusic: {
          enabled: false,
          source: "",
          volume: 0.12,
          ducking: true
        },
        soundEffects: {
          enabled: false,
          items: []
        }
      },
      scenes
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

  const getRenderJob = async (jobId) => {
    const response = await fetch(`/api/render-jobs/${encodeURIComponent(jobId)}`, {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    let responseBody;
    try {
      responseBody = await response.json();
    } catch (_error) {
      throw new Error("Không đọc được trạng thái render job từ backend.");
    }

    if (!response.ok || !responseBody.success) {
      throw new Error(responseBody.message || "Không tải được trạng thái render job.");
    }

    return responseBody.data.job;
  };

  const wait = (ms) => new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

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
      templateId: job.templateId,
      template: config.templateName || (job.templateId === "project-showcase-90s" ? "Showcase 90s" : job.templateId),
      aspectRatio: job.aspectRatio || config.aspectRatio,
      resolution: job.resolution || config.resolution || "1920x1080",
      size: formatBytes(job.outputSize),
      outputSize: job.outputSize,
      durationMs: job.durationMs,
      audio: job.audio || null,
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
    templateId: output.templateId,
    template: output.template || (output.templateId === "project-showcase-90s" ? "Showcase 90s" : output.templateId),
    aspectRatio: output.aspectRatio || "",
    resolution: output.resolution || "1920x1080",
    size: formatBytes(output.outputSize),
    outputSize: output.outputSize,
    durationMs: output.durationMs,
    audio: output.audio || null,
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
    const renderFormat = getRenderFormat(config);
    const normalizedConfig = {
      ...config,
      formatId: renderFormat.id,
      aspectRatio: renderFormat.aspectRatio,
      resolution: renderFormat.resolution,
      templateId: renderFormat.templateId,
      templateName: renderFormat.templateName
    };
    const payload = buildRenderPayload(projectData, normalizedConfig);
    const queuedJob = {
      id: `job_${Date.now()}`,
      filename: config.filename || `${projectData.projectSlug || "project"}_video.mp4`,
      resolution: normalizedConfig.resolution,
      fps: config.fps || 30,
      projectName: projectData.projectName,
      templateId: normalizedConfig.templateId,
      status: "rendering",
      progress: 12,
      startTime: new Date().toLocaleTimeString()
    };

    AppState.setRenderQueue([queuedJob]);
    onProgress(12);
    onLog("INITIALIZING", "Đang tạo render payload từ dữ liệu UI hiện tại.");
    onLog("INFO", `Template: ${payload.template.id} | ${payload.video.width}x${payload.video.height} | ${payload.video.fps}fps.`);
    onLog("INFO", "Gửi job sang backend HyperFrames local. UI sẽ poll trạng thái cho tới khi MP4 render xong.");

    try {
      const queuedBackendJob = await createRenderJob(payload);
      const seenLogs = new Set();
      let job = queuedBackendJob;

      queuedJob.id = job.id;
      queuedJob.status = job.status;
      queuedJob.progress = job.progress || 8;
      AppState.setRenderQueue([queuedJob]);
      onProgress(queuedJob.progress);
      onLog("INFO", `Backend đã nhận job: ${job.id}.`);

      while (job.status === "queued" || job.status === "running") {
        await wait(2000);
        job = await getRenderJob(job.id);
        queuedJob.status = job.status;
        queuedJob.progress = job.progress || queuedJob.progress;
        AppState.setRenderQueue([queuedJob]);
        onProgress(queuedJob.progress);

        const logs = Array.isArray(job.logs) ? job.logs : [];
        logs.forEach((entry, index) => {
          const logKey = typeof entry === "string"
            ? `${index}:${entry}`
            : `${entry.timestamp || index}:${entry.type || "INFO"}:${entry.message || ""}`;
          if (seenLogs.has(logKey)) {
            return;
          }

          seenLogs.add(logKey);
          if (typeof entry === "string") {
            onLog("INFO", entry);
            return;
          }

          onLog(entry.type || "INFO", entry.message || "");
        });
      }

      if (job.status !== "succeeded") {
        throw new Error(job.error || "Render job thất bại.");
      }

      onProgress(100);
      onLog("SUCCESS", `Backend render thành công: ${job.outputPath}`);
      onLog("SUCCESS", `Thời gian render: ${Math.round((job.durationMs || 0) / 1000)} giây.`);

      const output = createOutputRecord(job, normalizedConfig);
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
    getRenderJob,
    listBackendOutputs,
    startRender,
    cancelRender,
    isRendering: () => isRendering
  };
})();
