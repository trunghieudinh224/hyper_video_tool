/* Static page navigation helpers */

const AppNavigation = (() => {
  const pageMap = {
    overview: "overview.html",
    content: "content.html",
    features: "features.html",
    timeline: "timeline.html",
    assets: "assets.html",
    template: "template.html",
    preview: "preview.html",
    render: "render.html",
    outputs: "outputs.html",
    settings: "settings.html"
  };

  const getPageUrl = (page) => {
    return `./${pageMap[page] || pageMap.overview}`;
  };

  const getCurrentPage = () => {
    return document.body.getAttribute("data-page") || "overview";
  };

  const setActiveNav = (page = getCurrentPage()) => {
    document.querySelectorAll(".nav-item").forEach((item) => {
      item.classList.toggle("active", item.getAttribute("data-page") === page);
    });
  };

  return {
    getPageUrl,
    getCurrentPage,
    setActiveNav
  };
})();
