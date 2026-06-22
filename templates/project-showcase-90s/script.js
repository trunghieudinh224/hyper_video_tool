/* Template transition controller script */

window.addEventListener("message", (event) => {
  // Listen for message from main app shell parent
  const { action, sceneId, data } = event.data;

  if (action === "showScene") {
    showScene(sceneId);
  }

  if (action === "updateData") {
    updateTemplateData(data);
  }
});

function showScene(sceneId) {
  document.querySelectorAll(".scene").forEach(scene => {
    scene.classList.remove("active");
  });

  const activeScene = document.getElementById(`scene-${sceneId}`);
  if (activeScene) {
    activeScene.classList.add("active");
  }
}

function updateTemplateData(data) {
  // Update texts
  document.getElementById("intro-title").textContent = data.projectName || "TÊN DỰ ÁN";
  document.getElementById("intro-tagline").textContent = data.tagline || "Tagline dự án...";
  document.getElementById("intro-team").textContent = data.ownerTeam || "Team phát triển";

  document.getElementById("problem-content").textContent = data.problemContext || "Chưa điền mô tả thực trạng bối cảnh...";
  document.getElementById("solution-content").textContent = data.solutionWhat || "Chưa điền mô tả giải pháp...";

  // Render Features list
  const featuresList = document.getElementById("features-list-target");
  const activeFeats = (data.features || []).filter(f => f.useInVideo).slice(0, 3);
  featuresList.innerHTML = "";
  if (activeFeats.length === 0) {
    featuresList.innerHTML = `<p style="grid-column:1/-1; opacity:0.6;">Chưa chọn tính năng nào đưa vào video.</p>`;
  } else {
    activeFeats.forEach(f => {
      const item = document.createElement("div");
      item.className = "feature-item";
      item.innerHTML = `
        <div class="feature-title">${f.name}</div>
        <div class="feature-desc">${f.description}</div>
      `;
      featuresList.appendChild(item);
    });
  }

  // Render Timeline milestones
  const timelineTarget = document.getElementById("timeline-target");
  const activeMs = (data.milestones || []).slice(0, 3);
  timelineTarget.innerHTML = "";
  if (activeMs.length === 0) {
    timelineTarget.innerHTML = `<p style="opacity:0.6;">Chưa có mốc timeline phát triển nào.</p>`;
  } else {
    activeMs.forEach((m, idx) => {
      const item = document.createElement("div");
      item.className = "timeline-node";
      item.innerHTML = `
        <div class="node-dot">${idx + 1}</div>
        <div class="node-date">${m.date}</div>
        <div class="node-title">${m.name}</div>
      `;
      timelineTarget.appendChild(item);
    });
  }

  // Render Impact results
  document.getElementById("impact-value").textContent = data.resultImpact ? data.resultImpact.split(' ').slice(0, 3).join(' ') : 'KẾT QUẢ ĐẠT ĐƯỢC';
  document.getElementById("impact-description").textContent = data.resultImpact || 'Mô tả kết quả đạt được cụ thể...';

  document.getElementById("outro-note").textContent = data.endingNote || 'Cảm ơn đã theo dõi!';
}
