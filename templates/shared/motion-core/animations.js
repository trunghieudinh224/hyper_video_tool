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
        y: getNumber(options.y, 44),
        filter: options.filter === false ? "none" : "blur(10px)"
      },
      {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: getNumber(options.duration, 0.68),
        stagger: getNumber(options.stagger, 0.12),
        ease: options.ease || "power3.out",
        immediateRender: false
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
        y: getNumber(options.y, 46),
        scale: getNumber(options.fromScale, 0.96),
        filter: options.filter === false ? "none" : "blur(8px)"
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        filter: "blur(0px)",
        duration: getNumber(options.duration, 0.7),
        stagger: getNumber(options.stagger, 0.1),
        ease: options.ease || "power3.out",
        immediateRender: false
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
    const slotDuration = Math.max(1.1, (sceneDuration - padding) / items.length);

    timeline.set(items, {
      opacity: 0,
      x: getNumber(options.enterX, 34),
      y: getNumber(options.enterY, 54),
      scale: getNumber(options.fromScale, 0.94),
      filter: "blur(10px)",
      pointerEvents: "none"
    }, sceneStart);
    items.forEach((item, index) => {
      const itemStart = sceneStart + padding + (index * slotDuration);
      const itemEnd = Math.min(sceneStart + sceneDuration - 0.18, itemStart + slotDuration - 0.22);
      timeline.fromTo(
        item,
        {
          opacity: 0,
          x: getNumber(options.enterX, 34),
          y: getNumber(options.enterY, 54),
          scale: getNumber(options.fromScale, 0.94),
          filter: "blur(10px)"
        },
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: getNumber(options.inDuration, 0.58),
          ease: options.ease || "power3.out",
          pointerEvents: "auto",
          immediateRender: false
        },
        itemStart
      );
      if (options.exit !== false) {
        timeline.to(
          item,
          {
            opacity: getNumber(options.exitOpacity, 0),
            x: getNumber(options.exitX, -24),
            y: getNumber(options.exitY, -30),
            scale: getNumber(options.exitScale, 0.97),
            filter: "blur(8px)",
            duration: getNumber(options.outDuration, 0.34),
            ease: options.exitEase || "power2.in",
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
    const slotDuration = Math.max(1.15, sceneDuration / items.length);

    timeline.set(items, {
      opacity: 0,
      x: getNumber(options.enterX, 28),
      y: getNumber(options.enterY, 24),
      scale: 0.96,
      filter: "blur(8px)"
    }, sceneStart);
    items.forEach((item, index) => {
      const itemStart = sceneStart + (index * slotDuration) + getNumber(options.padding, 0.25);
      const itemEnd = Math.min(sceneStart + sceneDuration - 0.1, itemStart + slotDuration * 0.82);
      timeline.to(
        item,
        {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: getNumber(options.focusDuration, 0.5),
          ease: options.ease || "power3.out"
        },
        itemStart
      );
      timeline.to(
        item,
        {
          opacity: getNumber(options.dimOpacity, 0.46),
          x: getNumber(options.dimX, -8),
          scale: 0.98,
          duration: getNumber(options.dimDuration, 0.32),
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
        y: getNumber(options.y, 34),
        filter: options.filter === false ? "none" : "blur(10px)"
      },
      {
        opacity: 1,
        scale: 1,
        y: 0,
        filter: "blur(0px)",
        duration: getNumber(options.duration, 0.82),
        ease: options.ease || "power3.out",
        immediateRender: false
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
