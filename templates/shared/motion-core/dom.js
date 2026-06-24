(function initDomCore(globalScope) {
  "use strict";

  function normalizeText(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function toArray(value) {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.filter(Boolean);
    }
    if (typeof NodeList !== "undefined" && value instanceof NodeList) {
      return Array.from(value).filter(Boolean);
    }
    return [value].filter(Boolean);
  }

  function queryAll(root, selector) {
    if (!root || !selector || !root.querySelectorAll) {
      return [];
    }
    return Array.from(root.querySelectorAll(selector));
  }

  function clearChildren(element) {
    if (!element) {
      return;
    }
    while (element.firstChild) {
      element.removeChild(element.firstChild);
    }
  }

  function createElement(tagName, className, text) {
    const element = document.createElement(tagName);
    if (className) {
      element.className = className;
    }
    if (text !== undefined) {
      element.textContent = normalizeText(text);
    }
    return element;
  }

  function setText(element, value) {
    if (!element) {
      return;
    }
    element.textContent = normalizeText(value);
  }

  function resolveAsset(payload, assetId) {
    const assets = payload && payload.assets && Array.isArray(payload.assets.all)
      ? payload.assets.all
      : [];
    return assets.find((asset) => asset && asset.id === assetId) || null;
  }

  function getMediaUrl(payload, media) {
    if (!media) {
      return "";
    }
    if (media.url) {
      return media.url;
    }
    const asset = resolveAsset(payload, media.assetId);
    return asset && asset.url ? asset.url : "";
  }

  const api = {
    clearChildren,
    createElement,
    getMediaUrl,
    normalizeText,
    queryAll,
    resolveAsset,
    setText,
    toArray
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.MotionDom = api;
})(typeof window !== "undefined" ? window : globalThis);
