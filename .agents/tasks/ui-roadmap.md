# UI Roadmap - Hyper Video Tool

## Objective

Xay dung UI noi bo de tao video thuyet trinh du an ca nhan trong cong ty bang HyperFrames. Tool chay local tren may ca nhan sau khi clone project ve, khong can cloud/deploy phuc tap trong MVP.

UI can de nhin, sang, gon, day du chuc nang, khong mang cam giac landing page AI. Uu tien workflow tao video nhanh, preview ro, render de theo doi.

## Product Direction

### User chinh

- Nhan vien hoac team noi bo muon tao video gioi thieu project ca nhan/cong ty.
- Nguoi dung khong can biet HyperFrames hoat dong ben duoi.
- Nguoi dung chay tool tai may ca nhan, nhap data, preview, render MP4.

### Core workflow

```text
Open app
-> create/load project
-> fill project content
-> choose template and theme
-> preview scenes
-> render video
-> download/open output
```

## Visual Direction

### Must have

- Co 2 mode: light mode va dark mode.
- Khong dung gradient lam nen, header, card, button, hero hoac primary visual.
- Khong dung orb, blob, bokeh, purple/blue gradient, glassmorphism qua tay.
- Phong cach: internal premium tool, quiet SaaS, dense vua du, scan nhanh.
- UI dung CSS variables cho token mau, spacing, radius, shadow.
- Card radius toi da 8px cho surface chinh; modal co the 10-12px neu can.
- Border nhe, shadow tiet che. Uu tien hierarchy bang spacing, border, typography, surface tone.

### Light mode direction

```css
:root {
  --color-bg: #f6f7f9;
  --color-surface: #ffffff;
  --color-surface-alt: #f0f2f5;
  --color-surface-muted: #e8ebef;
  --color-border: #d9dee7;
  --color-border-strong: #b9c1cf;
  --color-text: #111827;
  --color-text-muted: #5f6b7a;
  --color-text-subtle: #8a96a6;
  --color-primary: #1f4fd8;
  --color-primary-hover: #193fb0;
  --color-primary-soft: #e8eefc;
  --color-success: #16803c;
  --color-warning: #a16207;
  --color-danger: #c2410c;
}
```

### Dark mode direction

```css
[data-theme="dark"] {
  --color-bg: #101214;
  --color-surface: #181b1f;
  --color-surface-alt: #20242a;
  --color-surface-muted: #2a3038;
  --color-border: #303743;
  --color-border-strong: #475160;
  --color-text: #eef2f7;
  --color-text-muted: #a6b0bf;
  --color-text-subtle: #737f8f;
  --color-primary: #7aa2ff;
  --color-primary-hover: #9bbaff;
  --color-primary-soft: #1d2b4a;
  --color-success: #5cc980;
  --color-warning: #d6a63d;
  --color-danger: #e07a5f;
}
```

### Typography

- Font system: `Inter`, `SF Pro`, `Segoe UI`, `Arial`, sans-serif.
- Khong dung font display loe loet.
- H1 trong app khong qua 28-32px.
- Label, table, section title phai scan nhanh.
- Khong viet marketing copy dai trong UI.

## Information Architecture

### App shell

Layout desktop mac dinh:

```text
Top bar
  - app name
  - project status
  - theme toggle
  - render button

Left sidebar
  - Project
  - Content
  - Assets
  - Template
  - Preview
  - Render
  - Outputs

Main workspace
  - form/editor theo tab

Right inspector
  - scene summary
  - validation issues
  - render estimate
```

Mobile/tablet:

- Sidebar thanh tab ngang hoac drawer.
- Right inspector chuyen xuong duoi main content.
- Preview giu aspect ratio 16:9, khong tran ngang.

## Screens Roadmap

### Phase 1 - MVP UI skeleton

Muc tieu: co app shell dung duoc, local-first, chua can render that.

Screens:

- Dashboard / Project Home
- Project Editor
- Preview placeholder
- Render status placeholder

Acceptance:

- Co light/dark toggle luu vao `localStorage`.
- UI khong dung gradient.
- App responsive desktop va mobile.
- Co empty state khi chua co project.
- Co sample project data de nguoi dung test ngay.

### Phase 2 - Project Editor

Muc tieu: nhap du data de tao video thuyet trinh.

Sections:

- Project basics:
  - project name
  - owner/team
  - tagline
  - short summary
  - target users
  - status
- Problem / Context
- Solution / What was built
- Key features
- Tech stack
- Results / impact
- Timeline / milestones
- Call to action / ending note

Controls:

- Add/remove/reorder key features.
- Add/remove milestones.
- Inline validation.
- Save draft local JSON.
- Load sample data.

Acceptance:

- Form labels ro rang, khong placeholder thay label.
- Missing required fields hien validation trong right inspector.
- Khong dung `alert/confirm/prompt`; dung toast/modal rieng.

### Phase 3 - Asset Manager

Muc tieu: quan ly asset dung cho video.

Asset types:

- logo
- screenshots
- demo clips
- avatar/headshot neu can
- background image optional, nhung khong bat buoc

UI:

- Drag/drop upload zone.
- Asset grid dense, co thumbnail, file name, type, size.
- Empty state gon.
- Asset detail inspector.

Local MVP:

- Luu file vao local uploads qua Node server.
- UI co fallback neu asset loi load.

Acceptance:

- Thumbnail khong meo aspect ratio.
- File card khong qua to.
- Co state upload loading/error/success.

### Phase 4 - Template & Theme Picker

Muc tieu: nguoi dung chon format video ma khong can sua timeline phuc tap.

Template dau tien:

- `project-showcase-90s`
- 16:9
- 60-90 giay
- dung cho video gioi thieu project noi bo

Template cards:

- Template name
- Duration estimate
- Scene count
- Best for
- Small static preview

Theme controls:

- Light/dark video theme rieng voi app theme.
- Accent color picker gioi han san, khong cho gradient.
- Font scale: compact / default / large.
- Logo placement: none / top-left / ending slide.

Acceptance:

- Khong lam timeline editor keo tha trong MVP.
- Chi cho reorder scene/section o muc don gian.

### Phase 5 - Scene Preview

Muc tieu: xem duoc video theo tung scene truoc khi render.

Preview UI:

- 16:9 canvas/frame.
- Scene list ben duoi hoac ben trai.
- Current scene details.
- Play/pause preview neu template JS ho tro.
- Jump scene.
- Fit/100% zoom.

States:

- Empty preview.
- Loading template.
- Template error.
- Missing data warning.

Acceptance:

- Preview khong bi crop vo ly.
- Text dai phai wrap va co warning neu qua dai.
- Desktop va mobile khong horizontal scroll ngoai preview zoom co chu dich.

### Phase 6 - Render Queue

Muc tieu: bam render, theo doi tien trinh, lay MP4.

Render panel:

- Render settings:
  - resolution: 1280x720, 1920x1080
  - fps: 30
  - duration/template
  - output filename
- Job status:
  - queued
  - rendering
  - completed
  - failed
- Logs collapsed by default.
- Output actions:
  - open folder
  - download/open MP4
  - rerender

Acceptance:

- Primary render button ro nhung khong choan UI.
- Disable render khi validation fail.
- Failed state co message doc duoc, khong dump stack trace day man hinh.

### Phase 7 - Outputs History

Muc tieu: quan ly cac video da render local.

UI:

- Table/list outputs.
- File name, created time, template, duration/resolution, size.
- Actions: open, reveal, delete local output.

Acceptance:

- Delete output can modal confirm custom, khong dung browser confirm.
- Neu file da mat, hien state "missing file".

## Component Inventory

Can co cac component/class UI sau:

- App shell
- Top bar
- Sidebar nav
- Theme toggle
- Button: primary, secondary, ghost, danger
- Icon button co tooltip
- Input, textarea, select
- Checkbox/toggle
- Segmented control
- Form section
- Inline field error
- Toast
- Modal
- Empty state
- Loading skeleton
- Status pill dung tiet che
- Asset card
- Template card
- Scene list item
- Preview frame
- Validation panel
- Render job row
- Output table

## Layout Rules

- Admin tool nen dense vua phai, khong tao landing hero.
- First screen phai la tool lam viec, khong phai marketing page.
- Khong nested cards qua 1 cap.
- Section nen co border bottom hoac surface tach nhe, dung spacing thay card neu co the.
- Main content max width co chu dich; preview can giu aspect ratio.
- Button row phai wrap tren mobile.

## State & Data UX

### Data states

Can xu ly:

- no project
- unsaved changes
- invalid project data
- valid but missing optional assets
- render in progress
- render failed
- render completed

### Saving model

MVP nen local-first:

- Auto-save draft vao browser localStorage de tranh mat form.
- Nut `Save project JSON` ghi qua Node API vao `data/projects`.
- Nut `Export JSON` de backup/chia se.
- Nut `Import JSON` de load lai.

## Accessibility & Keyboard

- Moi input co label.
- Focus ring ro ca light/dark.
- Toggle co `aria-label`.
- Icon-only buttons phai co tooltip/title.
- Contrast dark/light phai doc duoc.
- Escape dong modal.
- Enter submit form chi khi hop ly, tranh render nham.

## Non-goals For MVP

Khong lam trong MVP:

- Timeline editor keo tha giong Premiere/Canva.
- Collaboration realtime.
- Cloud account/auth.
- Template marketplace.
- Gradient theme builder.
- AI generated visuals trong UI.
- Multi-user permission.

## Suggested File Structure

```text
app/
  index.html
  styles/
    tokens.css
    base.css
    layout.css
    components.css
  scripts/
    constants.js
    state.js
    storage.js
    api.js
    validation.js
    render-preview.js
    ui.js
    app.js

templates/
  project-showcase-90s/
    index.html
    style.css
    script.js

data/
  sample-project.json
  projects/

uploads/

outputs/
```

## Implementation Order For Antigravity

1. Read `AGENTS.md`, `.agents/rules/ui-quality-rules.md`, `.agents/rules/frontend-architecture.md`, and this file.
2. Build static app shell with CSS tokens and theme toggle.
3. Add sample data and project editor.
4. Add validation panel.
5. Add template picker and preview frame placeholder.
6. Add asset manager UI.
7. Add render queue UI placeholder.
8. Wire Node API and HyperFrames render after UI skeleton is stable.
9. Run desktop/mobile browser verification.
10. Run `wf-ui-taste-polish` before handoff.

## Final UI Acceptance Criteria

- Light mode va dark mode deu dung duoc, hierarchy tuong duong.
- Khong co gradient trong app UI.
- Khong co hero marketing.
- Khong co text placeholder/lorem.
- Form day du state: empty, loading, error, disabled, success.
- Preview 16:9 stable, khong lam layout shift.
- Mobile khong vo layout.
- Render action khong cho phep chay khi data invalid.
- CSS dung variables, khong rai mau lung tung.
- JS tach module ro, khong inline event handler.
