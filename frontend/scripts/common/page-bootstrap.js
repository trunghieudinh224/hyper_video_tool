/* Static page entry point */

const HyperVideoPage = (() => {
  const boot = (page) => {
    const currentPage = page || AppNavigation.getCurrentPage();

    AppShell.mount(currentPage);
    AppState.setCurrentPage(currentPage);

    AppUI.initDOM();
    AppUI.initTheme();
    AppUI.initGlobalEvents();

    let projectData = AppStorage.loadLocalData();

    if (projectData) {
      AppState.setProjectData(projectData, true);
    } else {
      AppState.setProjectData(JSON.parse(JSON.stringify(INITIAL_PROJECT_DATA)), true);
    }

    const valResults = AppValidation.validate(AppState.getProjectData());
    AppState.setValidation(valResults);
    AppUI.renderScreen(currentPage);

    const checkMobileDisplay = () => {
      const isMobile = window.innerWidth <= 768;
      const sidebarToggle = document.getElementById("mobile-sidebar-toggle");
      const valToggle = document.getElementById("mobile-validation-toggle");

      if (sidebarToggle && valToggle) {
        if (isMobile) {
          sidebarToggle.style.display = "flex";
          valToggle.style.display = "flex";
        } else {
          sidebarToggle.style.display = "none";
          valToggle.style.display = "none";
          document.getElementById("sidebar").classList.remove("mobile-open");
          document.getElementById("validation-panel").classList.remove("mobile-open");
        }
      }
    };

    window.addEventListener("resize", checkMobileDisplay);
    checkMobileDisplay();
  };

  return { boot };
})();
