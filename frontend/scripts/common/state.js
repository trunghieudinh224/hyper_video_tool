/* App State Management */

const AppState = (() => {
  // Private State Variables
  const state = {
    currentTab: "overview",
    projectData: JSON.parse(JSON.stringify(INITIAL_PROJECT_DATA)),
    selectedSceneIndex: 0,
    activeTheme: "light", // 'light' or 'dark'
    renderQueue: [], // Array of render jobs
    validation: {
      errors: [],
      warnings: []
    },
    isDirty: false
  };

  // Pub/Sub listeners
  const listeners = {};

  const subscribe = (event, callback) => {
    if (!listeners[event]) {
      listeners[event] = [];
    }
    listeners[event].push(callback);
  };

  const notify = (event, data) => {
    if (listeners[event]) {
      listeners[event].forEach(callback => callback(data));
    }
  };

  // Getters
  const getTab = () => state.currentTab;
  const getProjectData = () => state.projectData;
  const getSelectedSceneIndex = () => state.selectedSceneIndex;
  const getActiveTheme = () => state.activeTheme;
  const getRenderQueue = () => state.renderQueue;
  const getValidation = () => state.validation;
  const getIsDirty = () => state.isDirty;

  // Setters/Actions
  const setTab = (tab) => {
    if (state.currentTab !== tab) {
      state.currentTab = tab;
      notify("tabChanged", tab);
    }
  };

  const setCurrentPage = (tab) => {
    state.currentTab = tab;
  };

  const setProjectData = (newData, skipDirty = false) => {
    state.projectData = newData;
    if (!skipDirty) {
      state.isDirty = true;
    }
    notify("projectDataChanged", state.projectData);
  };

  const updateProjectField = (key, value) => {
    state.projectData[key] = value;
    state.isDirty = true;
    notify("projectDataChanged", state.projectData);
  };

  const setSelectedSceneIndex = (index) => {
    state.selectedSceneIndex = index;
    notify("selectedSceneIndexChanged", index);
  };

  const setTheme = (theme) => {
    if (state.activeTheme !== theme) {
      state.activeTheme = theme;
      notify("themeChanged", theme);
    }
  };

  const setRenderQueue = (queue) => {
    state.renderQueue = queue;
    notify("renderQueueChanged", queue);
  };

  const setValidation = (validationResults) => {
    state.validation = validationResults;
    notify("validationChanged", validationResults);
  };

  const setDirty = (dirty) => {
    if (state.isDirty !== dirty) {
      state.isDirty = dirty;
      notify("dirtyStateChanged", dirty);
    }
  };

  return {
    subscribe,
    getTab,
    getProjectData,
    getSelectedSceneIndex,
    getActiveTheme,
    getRenderQueue,
    getValidation,
    getIsDirty,
    setTab,
    setCurrentPage,
    setProjectData,
    updateProjectField,
    setSelectedSceneIndex,
    setTheme,
    setRenderQueue,
    setValidation,
    setDirty
  };
})();
