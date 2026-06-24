/* Static page entry point */

const HyperVideoPage = (() => {
  const isBlankProjectData = (data) => {
    if (!data || typeof data !== "object") {
      return true;
    }

    const textFields = [
      "projectName",
      "projectSlug",
      "shortSummary",
      "problemContext",
      "solutionWhat"
    ];

    const hasText = textFields.some((field) => String(data[field] || "").trim());
    const hasCollections = [data.features, data.milestones, data.assets].some((items) => Array.isArray(items) && items.length > 0);

    return !hasText && !hasCollections;
  };

  const boot = (page) => {
    const currentPage = page || AppNavigation.getCurrentPage();

    AppShell.mount(currentPage);
    AppState.setCurrentPage(currentPage);

    AppUI.initDOM();
    AppUI.initTheme();
    AppUI.initGlobalEvents();

    const projectData = AppStorage.loadLocalData();
    const initialProjectData = isBlankProjectData(projectData) ? AppStorage.loadSampleData() : projectData;
    AppState.setProjectData(initialProjectData, true);

    const valResults = AppValidation.validate(AppState.getProjectData());
    AppState.setValidation(valResults);
    AppUI.renderScreen(currentPage);
    if (typeof AppOnboarding !== "undefined") {
      AppOnboarding.mount(currentPage);
    }

    const checkMobileDisplay = () => {
      const isMobile = window.innerWidth <= 768;
      const sidebarToggle = document.getElementById("mobile-sidebar-toggle");

      if (sidebarToggle) {
        if (isMobile) {
          sidebarToggle.style.display = "flex";
        } else {
          sidebarToggle.style.display = "none";
          document.getElementById("sidebar").classList.remove("mobile-open");
        }
      }
    };

    window.addEventListener("resize", checkMobileDisplay);
    checkMobileDisplay();
  };

  return { boot };
})();
