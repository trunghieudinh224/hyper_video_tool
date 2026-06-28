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

  return {
    isBackendAvailable,
    loadCurrentProject,
    saveCurrentProject,
    loadSettings,
    saveSettings
  };
})();
