# Motion Core

Shared helpers for dynamic motion templates.

## Purpose

This folder keeps reusable motion logic out of individual templates:

- `duration.js` calculates scene duration and timeline start/end.
- `dom.js` contains small DOM helpers for template scripts.
- `animations.js` contains GSAP timeline primitives.
- `index.js` exposes the combined `MotionCore` API.

Templates still own layout, visual style and scene-specific DOM. Motion core only handles reusable timing and animation primitives.

## Browser Usage

Load files before the template script:

```html
<script src="../shared/motion-core/duration.js"></script>
<script src="../shared/motion-core/dom.js"></script>
<script src="../shared/motion-core/animations.js"></script>
<script src="../shared/motion-core/index.js"></script>
```

Then use:

```js
const plan = MotionCore.buildTimelinePlan(payload);
MotionCore.animations.revealText(tl, headlineElements, scene.start);
MotionCore.animations.sequenceItems(tl, cardElements, scene.start, scene.duration);
```

## Node Tests

Run:

```bash
node templates/shared/motion-core/duration.test.js
node templates/shared/motion-core/motion-core.test.js
```
