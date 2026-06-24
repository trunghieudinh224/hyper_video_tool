(function initMotionCore(globalScope) {
  "use strict";

  const duration = globalScope.MotionDuration || (typeof require === "function" ? require("./duration") : {});
  const dom = globalScope.MotionDom || (typeof require === "function" ? require("./dom") : {});
  const animations = globalScope.MotionAnimations || (typeof require === "function" ? require("./animations") : {});

  const api = {
    animations,
    duration,
    dom,
    buildTimelinePlan: duration.buildTimelinePlan,
    resolveSceneDuration: duration.resolveSceneDuration
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.MotionCore = api;
})(typeof window !== "undefined" ? window : globalThis);
