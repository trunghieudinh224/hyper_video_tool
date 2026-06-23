"use strict";

const { getRenderPreflight } = require("../render/preflight");

function handleRenderPreflight(request, response, requestUrl, sendJson) {
  if (request.method !== "GET" || requestUrl.pathname !== "/api/render-preflight") {
    return false;
  }

  const preflight = getRenderPreflight();
  sendJson(response, preflight.ready ? 200 : 503, {
    success: preflight.ready,
    message: preflight.ready ? "Render preflight passed." : "Render preflight has blocking errors.",
    data: {
      preflight
    }
  });
  return true;
}

module.exports = { handleRenderPreflight };
