/* Asset media inspector for the local multi-page UI. */

(() => {
  const MAX_WAVEFORM_BYTES = 5 * 1024 * 1024;
  let dialog = null;
  let activeMedia = null;
  let activeWaveform = null;
  let activeInput = null;
  let requestId = 0;

  const formatBytes = (bytes) => {
    const value = Number(bytes);
    if (!Number.isFinite(value) || value < 0) return "Chưa rõ";
    if (value < 1024) return `${value} B`;
    if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
    return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  };
  const formatDuration = (seconds) => {
    if (!Number.isFinite(seconds) || seconds < 0) return "Chưa rõ";
    const total = Math.round(seconds);
    return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, "0")}`;
  };

  const setDetails = (details) => {
    const root = dialog.querySelector(".asset-inspector-details");
    root.replaceChildren();
    Object.entries(details).forEach(([label, value]) => {
      if (!value) return;
      const row = document.createElement("div");
      const term = document.createElement("dt");
      const description = document.createElement("dd");
      term.textContent = label;
      description.textContent = String(value);
      row.append(term, description);
      root.append(row);
    });
  };

  const disposeMedia = () => {
    requestId += 1;
    if (activeWaveform) activeWaveform.destroy();
    if (activeInput) activeInput.dispose();
    if (activeMedia) {
      activeMedia.pause();
      activeMedia.removeAttribute("src");
      activeMedia.load();
    }
    activeWaveform = null;
    activeInput = null;
    activeMedia = null;
  };

  const getDialog = () => {
    if (dialog) return dialog;
    dialog = document.createElement("dialog");
    dialog.className = "asset-inspector";
    dialog.setAttribute("aria-labelledby", "asset-inspector-title");
    dialog.innerHTML = `
      <div class="asset-inspector-content">
        <header class="asset-inspector-header">
          <h2 class="asset-inspector-title" id="asset-inspector-title"></h2>
          <button class="asset-inspector-close" type="button" aria-label="Đóng chi tiết tài nguyên">Đóng</button>
        </header>
        <div class="asset-inspector-media"></div>
        <p class="asset-inspector-note" role="status" aria-live="polite"></p>
        <dl class="asset-inspector-details"></dl>
      </div>
    `;
    dialog.querySelector(".asset-inspector-close").addEventListener("click", () => dialog.close());
    dialog.addEventListener("click", (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog.addEventListener("close", disposeMedia);
    document.body.append(dialog);
    return dialog;
  };

  const inspectAsset = async (asset) => {
    const popup = getDialog();
    disposeMedia();
    const currentRequest = requestId;
    const source = asset.url || asset.publicUrl || "";
    const isVideo = asset.type === "video";
    const mediaRoot = popup.querySelector(".asset-inspector-media");
    const status = popup.querySelector(".asset-inspector-note");
    popup.querySelector(".asset-inspector-title").textContent = asset.name || "Tài nguyên";
    mediaRoot.replaceChildren();
    status.textContent = source ? "Đang đọc thông tin media..." : "Tài nguyên này chưa có URL để phát.";
    const details = {
      "Loại": isVideo ? "Video" : "Âm thanh",
      "Kích thước file": formatBytes(asset.sizeBytes),
      "Thời lượng": "Chưa rõ"
    };
    setDetails(details);
    popup.showModal();
    if (!source) return;

    const media = document.createElement(isVideo ? "video" : "audio");
    activeMedia = media;
    media.controls = true;
    media.preload = "metadata";
    media.src = source;
    if (isVideo) media.playsInline = true;
    media.addEventListener("loadedmetadata", () => {
      if (requestId !== currentRequest) return;
      if (Number.isFinite(media.duration)) details["Thời lượng"] = formatDuration(media.duration);
      if (isVideo && media.videoWidth && media.videoHeight) {
        details["Độ phân giải"] = `${media.videoWidth} × ${media.videoHeight}`;
      }
      setDetails(details);
    });
    media.addEventListener("error", () => {
      if (requestId === currentRequest) status.textContent = "Trình duyệt không phát được định dạng này.";
    });
    mediaRoot.append(media);

    if (!isVideo) {
      if (asset.sizeBytes && asset.sizeBytes <= MAX_WAVEFORM_BYTES && window.WaveSurfer) {
        const waveformRoot = document.createElement("div");
        waveformRoot.className = "asset-inspector-waveform";
        waveformRoot.setAttribute("aria-label", "Dạng sóng âm thanh");
        mediaRoot.prepend(waveformRoot);
        try {
          const css = getComputedStyle(document.documentElement);
          activeWaveform = window.WaveSurfer.create({
            container: waveformRoot,
            media,
            url: source,
            height: 72,
            waveColor: css.getPropertyValue("--color-text-muted").trim() || "#888",
            progressColor: css.getPropertyValue("--color-primary").trim() || "#3679e8"
          });
          activeWaveform.on("error", () => {
            if (requestId === currentRequest) status.textContent = "Không dựng được waveform; vẫn có thể nghe bằng trình phát.";
          });
        } catch (_error) {
          waveformRoot.remove();
          activeWaveform = null;
        }
      } else {
        const hint = document.createElement("p");
        hint.className = "asset-inspector-note";
        hint.textContent = "Waveform chỉ hiển thị cho file âm thanh tối đa 5 MB.";
        mediaRoot.append(hint);
      }
    }

    if (!window.Mediabunny) {
      status.textContent = "Thông tin cơ bản lấy từ trình duyệt; bộ đọc metadata chưa sẵn sàng.";
      return;
    }
    try {
      const input = new window.Mediabunny.Input({
        source: new window.Mediabunny.UrlSource(source),
        formats: window.Mediabunny.ALL_FORMATS
      });
      activeInput = input;
      const [duration, videoTrack, audioTrack] = await Promise.all([
        input.getDurationFromMetadata(),
        input.getPrimaryVideoTrack(),
        input.getPrimaryAudioTrack()
      ]);
      if (requestId !== currentRequest) return;
      if (Number.isFinite(duration)) details["Thời lượng"] = formatDuration(duration);
      if (videoTrack) {
        const [width, height, codec] = await Promise.all([
          videoTrack.getDisplayWidth(),
          videoTrack.getDisplayHeight(),
          videoTrack.getCodec()
        ]);
        if (requestId !== currentRequest) return;
        if (width && height) details["Độ phân giải"] = `${width} × ${height}`;
        if (codec) details["Video codec"] = codec.toUpperCase();
      }
      if (audioTrack) {
        const codec = await audioTrack.getCodec();
        if (requestId !== currentRequest) return;
        if (codec) details["Audio codec"] = codec.toUpperCase();
      }
      setDetails(details);
      status.textContent = "Thông tin media đã đọc bằng Mediabunny.";
    } catch (_error) {
      if (requestId === currentRequest) status.textContent = "Không đọc được metadata mở rộng; vẫn có thể thử phát file.";
    }
  };

  document.addEventListener("DOMContentLoaded", async () => {
    await HyperVideoPage.boot("assets");
    document.getElementById("view-assets").addEventListener("click", (event) => {
      const button = event.target.closest(".btn-inspect-asset");
      if (!button) return;
      const assetId = button.getAttribute("data-id");
      const asset = (AppState.getProjectData().assets || []).find((item) => item.id === assetId);
      if (asset) void inspectAsset(asset);
    });
  });
})();
