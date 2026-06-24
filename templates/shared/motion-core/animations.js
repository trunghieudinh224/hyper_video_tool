(function initAnimationCore(globalScope) {
  "use strict";

  function getElements(targets) {
    const domApi = globalScope.MotionDom;
    if (domApi && domApi.toArray) {
      return domApi.toArray(targets);
    }
    if (!targets) {
      return [];
    }
    return Array.isArray(targets) ? targets.filter(Boolean) : [targets];
  }

  function getNumber(value, fallback) {
    return Number.isFinite(value) ? value : fallback;
  }

  function revealText(timeline, targets, start, options = {}) {
    const elements = getElements(targets);
    if (!timeline || elements.length === 0) {
      return timeline;
    }

    timeline.fromTo(
      elements,
      {
        opacity: 0,
        y: getNumber(options.y, 26)
      },
      {
        opacity: 1,
        y: 0,
        duration: getNumber(options.duration, 0.45),
        stagger: getNumber(options.stagger, 0.08),
        ease: options.ease || "power2.out"
      },
      getNumber(start, 0)
    );
    return timeline;
  }

  function revealBlock(timeline, targets, start, options = {}) {
    const elements = getElements(targets);
    if (!timeline || elements.length === 0) {
      return timeline;
    }

    timeline.fromTo(
      elements,
      {
        opacity: 0,
        y: getNumber(options.y, 34),
        scale: getNumber(options.fromScale, 0.98)
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: getNumber(options.duration, 0.5),
        stagger: getNumber(options.stagger, 0.06),
        ease: options.ease || "power2.out"
      },
      getNumber(start, 0)
    );
    return timeline;
  }

  function sequenceItems(timeline, targets, start, duration, options = {}) {
    const items = getElements(targets);
    if (!timeline || items.length === 0) {
      return timeline;
    }

    const sceneStart = getNumber(start, 0);
    const sceneDuration = Math.max(1, getNumber(duration, items.length * 2));
    const padding = getNumber(options.padding, 0.6);
    const slotDuration = Math.max(0.6, (sceneDuration - padding) / items.length);

    timeline.set(items, { opacity: 0, y: getNumber(options.enterY, 30), pointerEvents: "none" }, sceneStart);
    items.forEach((item, index) => {
      const itemStart = sceneStart + padding + (index * slotDuration);
      const itemEnd = Math.min(sceneStart + sceneDuration - 0.1, itemStart + slotDuration - 0.12);
      timeline.fromTo(
        item,
        { opacity: 0, y: getNumber(options.enterY, 30) },
        {
          opacity: 1,
          y: 0,
          duration: getNumber(options.inDuration, 0.35),
          ease: options.ease || "power2.out",
          pointerEvents: "auto"
        },
        itemStart
      );
      if (options.exit !== false) {
        timeline.to(
          item,
          {
            opacity: getNumber(options.exitOpacity, 0),
            y: getNumber(options.exitY, -18),
            duration: getNumber(options.outDuration, 0.22),
            ease: options.exitEase || "power1.in",
            pointerEvents: "none"
          },
          itemEnd
        );
      }
    });
    return timeline;
  }

  function spotlightItems(timeline, targets, start, duration, options = {}) {
    const items = getElements(targets);
    if (!timeline || items.length === 0) {
      return timeline;
    }

    const sceneStart = getNumber(start, 0);
    const sceneDuration = Math.max(1, getNumber(duration, items.length * 2));
    const slotDuration = sceneDuration / items.length;

    timeline.set(items, { opacity: getNumber(options.dimOpacity, 0.32), scale: 0.96 }, sceneStart);
    items.forEach((item, index) => {
      const itemStart = sceneStart + (index * slotDuration);
      const itemEnd = Math.min(sceneStart + sceneDuration - 0.1, itemStart + slotDuration * 0.82);
      timeline.to(
        item,
        {
          opacity: 1,
          scale: 1,
          duration: getNumber(options.focusDuration, 0.32),
          ease: options.ease || "power2.out"
        },
        itemStart
      );
      timeline.to(
        item,
        {
          opacity: getNumber(options.dimOpacity, 0.32),
          scale: 0.96,
          duration: getNumber(options.dimDuration, 0.24),
          ease: options.exitEase || "power1.out"
        },
        itemEnd
      );
    });
    return timeline;
  }

  function revealMedia(timeline, targets, start, options = {}) {
    const elements = getElements(targets);
    if (!timeline || elements.length === 0) {
      return timeline;
    }

    timeline.fromTo(
      elements,
      {
        opacity: 0,
        scale: getNumber(options.fromScale, 1.04),
        y: getNumber(options.y, 24)
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        duration: getNumber(options.duration, 0.65),
        ease: options.ease || "power2.out"
      },
      getNumber(start, 0)
    );
    return timeline;
  }

  function panMedia(timeline, targets, start, duration, options = {}) {
    const elements = getElements(targets);
    if (!timeline || elements.length === 0) {
      return timeline;
    }

    timeline.to(
      elements,
      {
        scale: getNumber(options.scale, 1.06),
        x: getNumber(options.x, 0),
        y: getNumber(options.y, -18),
        duration: Math.max(0.8, getNumber(duration, 4)),
        ease: options.ease || "none"
      },
      getNumber(start, 0)
    );
    return timeline;
  }

  function transitionScene(timeline, target, start, duration, options = {}) {
    const elements = getElements(target);
    if (!timeline || elements.length === 0) {
      return timeline;
    }

    const sceneStart = getNumber(start, 0);
    const sceneDuration = Math.max(0.1, getNumber(duration, 1));
    timeline.set(elements, { opacity: 1, pointerEvents: "auto" }, sceneStart);
    timeline.to(
      elements,
      {
        opacity: 0,
        duration: getNumber(options.outDuration, 0.28),
        ease: options.ease || "power1.in",
        pointerEvents: "none"
      },
      Math.max(sceneStart, sceneStart + sceneDuration - getNumber(options.outDuration, 0.28))
    );
    return timeline;
  }

  const api = {
    panMedia,
    revealBlock,
    revealMedia,
    revealText,
    sequenceItems,
    spotlightItems,
    transitionScene
  };

  if (typeof module !== "undefined" && module.exports) {
    module.exports = api;
  }

  globalScope.MotionAnimations = api;
})(typeof window !== "undefined" ? window : globalThis);
