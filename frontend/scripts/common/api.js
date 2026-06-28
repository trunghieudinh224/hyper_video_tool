/* Backend API helper */

const AppBackendApi = (() => {
  const API_BASE_URL = "";

  const isBackendAvailable = () => window.location.protocol === "http:" || window.location.protocol === "https:";

  const requestJson = async (path, options = {}) => {
    if (!isBackendAvailable()) {
      throw new Error("Backend API is not available from this page origin.");
    }

    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Accept": "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...(options.headers || {})
      }
    });
    const payload = await response.json().catch(() => null);

    if (!response.ok || !payload || payload.success === false) {
      const message = payload && payload.message ? payload.message : `Request failed with status ${response.status}.`;
      throw new Error(message);
    }

    return payload.data || {};
  };

  const loadCurrentProject = async () => {
    const data = await requestJson("/api/projects/current");
    return data.project || null;
  };

  const loadActiveProject = async () => {
    const data = await requestJson("/api/projects/active");
    return {
      project: data.project || null,
      meta: data.meta || null
    };
  };

  const listProjects = async (options = {}) => {
    const includeArchived = options.includeArchived ? "?includeArchived=1" : "";
    const data = await requestJson(`/api/projects${includeArchived}`);
    return Array.isArray(data.projects) ? data.projects : [];
  };

  const createProject = async (project, options = {}) => {
    const data = await requestJson("/api/projects", {
      method: "POST",
      body: JSON.stringify({
        project,
        activate: options.activate !== false
      })
    });
    return {
      project: data.project || null,
      meta: data.meta || null
    };
  };

  const setActiveProject = async (projectId) => {
    const data = await requestJson("/api/projects/active", {
      method: "PUT",
      body: JSON.stringify({ projectId })
    });
    return {
      project: data.project || null,
      meta: data.meta || null
    };
  };

  const loadProject = async (projectId) => {
    const data = await requestJson(`/api/projects/${encodeURIComponent(projectId)}`);
    return {
      project: data.project || null,
      meta: data.meta || null
    };
  };

  const saveProject = async (projectId, project) => {
    const data = await requestJson(`/api/projects/${encodeURIComponent(projectId)}`, {
      method: "PUT",
      body: JSON.stringify({ project })
    });
    return {
      project: data.project || project,
      meta: data.meta || null
    };
  };

  const saveCurrentProject = async (project) => {
    const data = await requestJson("/api/projects/current", {
      method: "PUT",
      body: JSON.stringify({ project })
    });
    return data.project || project;
  };

  const loadSettings = async () => {
    const data = await requestJson("/api/settings");
    return data.settings || null;
  };

  const saveSettings = async (settings) => {
    const data = await requestJson("/api/settings", {
      method: "PUT",
      body: JSON.stringify({ settings })
    });
    return data.settings || settings;
  };

  const loadAssets = async (projectId = "current") => {
    const data = await requestJson(`/api/projects/${encodeURIComponent(projectId)}/assets`);
    return Array.isArray(data.assets) ? data.assets : [];
  };

  const loadOutputs = async (projectId = "current") => {
    const data = await requestJson(`/api/projects/${encodeURIComponent(projectId)}/outputs`);
    return Array.isArray(data.outputs) ? data.outputs : [];
  };

  const uploadAssets = async (files, options = {}) => {
    if (!isBackendAvailable()) {
      throw new Error("Backend API is not available from this page origin.");
    }
    const formData = new FormData();
    Array.from(files || []).forEach((file) => {
      formData.append("files", file, file.name);
    });
    if (options.type) {
      formData.append("type", options.type);
    }

    const response = await fetch(`/api/projects/${encodeURIComponent(options.projectId || "current")}/assets`, {
      method: "POST",
      body: formData
    });
    const payload = await response.json().catch(() => null);
    if (!response.ok || !payload || payload.success === false) {
      const message = payload && payload.message ? payload.message : `Upload failed with status ${response.status}.`;
      throw new Error(message);
    }
    return Array.isArray(payload.data && payload.data.assets) ? payload.data.assets : [];
  };

  const deleteAsset = async (assetId, projectId = "current") => {
    const data = await requestJson(`/api/projects/${encodeURIComponent(projectId)}/assets/${encodeURIComponent(assetId)}`, {
      method: "DELETE"
    });
    return Array.isArray(data.assets) ? data.assets : [];
  };

  return {
    isBackendAvailable,
    loadCurrentProject,
    loadActiveProject,
    listProjects,
    createProject,
    setActiveProject,
    loadProject,
    saveProject,
    saveCurrentProject,
    loadSettings,
    saveSettings,
    loadAssets,
    loadOutputs,
    uploadAssets,
    deleteAsset
  };
})();
