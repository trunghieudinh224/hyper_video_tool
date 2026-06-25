# Roadmap Scene Template, Video Style Và Slot Editor

## Mục Tiêu

Roadmap này định nghĩa hướng làm mới trang Template và luồng biên tập từng phân đoạn theo mô hình:

```text
Video Style chung toàn video
-> Scene Template cho từng screen/phân đoạn
-> Slot cố định trong template
-> User nhập nội dung/chọn asset/chỉnh delay/animation cho từng slot
-> Preview/render dùng đúng layout và timing đó
```

Mục tiêu là làm người dùng hiểu rõ: nội dung nào sẽ xuất hiện ở đâu, xuất hiện lúc nào, dùng animation gì. Không biến tool thành video editor kéo timeline phức tạp trong MVP.

## Khái Niệm Chuẩn

### Video Style

Video Style là bộ quy tắc nhìn chung cho cả video:

- `aspectRatio`: dọc `9:16` hoặc ngang `16:9`.
- `colorTheme`: một bộ màu, không phải một màu đơn.
- `fontStyle`: kiểu chữ chính/phụ.
- `motionStyle`: nhịp motion chung, ví dụ minimal, dynamic, sharp, soft.
- `backgroundStyle`: nền trơn, nền tối, grid nhẹ, media blur nhẹ.

Ví dụ `colorTheme`:

```json
{
  "background": "#05070A",
  "surface": "#101722",
  "text": "#F8FAFC",
  "mutedText": "#94A3B8",
  "accent": "#22D3EE",
  "accentSoft": "#164E63",
  "border": "#1E3A5F",
  "glow": "rgba(34, 211, 238, 0.28)"
}
```

### Scene Template

Scene Template là layout cho một screen/phân đoạn, không phải template cả video.

Ví dụ:

- `Intro Stack`: logo, kicker, title, description, tag.
- `Media Showcase`: header, logo, title, image/video, description.
- `Grid Feature`: header, title, grid items, description.
- `Step Flow`: title, steps, note.
- `Outro CTA`: logo, title, CTA, tag.

### Slot

Slot là từng vùng nhập liệu trong Scene Template.

Slot có:

- `id`: ví dụ `logo`, `header`, `title`, `description`, `media`, `grid.item1`.
- `type`: `text`, `asset`, `media`, `list`, `tag`.
- `label`: tên hiển thị cho user.
- `required`: có bắt buộc không.
- `defaultDelay`: mặc định xuất hiện lúc nào trong scene.
- `allowedAnimations`: animation được chọn.

### Slot Delay

Slot Delay là thời điểm slot bắt đầu xuất hiện tính từ đầu scene.

Ví dụ scene 8 giây:

```text
logo delay 0s
header delay 0s
text1 delay 2s
text2 delay 4s
```

Đây không phải timeline editor. User chỉ chỉnh delay đơn giản theo giây hoặc step preset.

## Nguyên Tắc

- Trang Template phải giải thích và preview được style/layout trước khi user vào Kịch bản.
- Nội dung cụ thể của từng scene nằm ở trang Kịch bản, không nhập nội dung thật trong thư viện template.
- Scene Template định nghĩa layout và slot; user chỉ fill slot trong từng phân đoạn.
- Video Style áp dụng toàn video để đổi màu/font/motion đồng bộ.
- MVP không làm kéo thả timeline, resize tự do, keyframe, hoặc editor giống After Effects.
- Slot Delay chỉ là input số/preset đơn giản, ví dụ `0`, `0.5`, `1`, `2`, `4`.
- Render dọc ưu tiên trước, nhưng contract không khóa chết vào `9:16`.

## Quyết Định Sản Phẩm Cho MVP

### Template Page Là Gì

Trang Template không phải nơi nhập nội dung thật của video.

Trang này chỉ có 2 trách nhiệm:

- Chọn `Video Style` cho toàn video.
- Browse/chọn `Scene Template` mẫu để hiểu mỗi phân đoạn có layout và slot nào.

Nội dung thật như header, title, ảnh, logo, grid item, description sẽ nằm ở trang Kịch bản theo từng phân đoạn.

### Scene Template Là Gì

Scene Template là layout cho một phân đoạn/screen, không phải template của cả video.

Ví dụ video 5 phân đoạn có thể dùng:

```text
Scene 1 -> intro-stack
Scene 2 -> media-showcase
Scene 3 -> grid-feature
Scene 4 -> step-flow
Scene 5 -> outro-cta
```

Mỗi scene có slot riêng. User fill nội dung vào slot của scene đó.

### Delay Là Gì

Delay là thời điểm slot bắt đầu xuất hiện tính từ đầu scene.

Ví dụ scene có 4 slot:

```text
logo delay 0s     -> hiện ngay
header delay 0s   -> hiện ngay
text1 delay 2s    -> sau 2 giây mới hiện
text2 delay 4s    -> sau 4 giây mới hiện
```

Delay không chỉnh duration tổng của scene. Duration scene vẫn do `durationSec` hoặc voice timing quyết định.

### Video Style Là Gì

Video Style là một bộ quy tắc nhìn chung, không phải một màu đơn.

Một style gồm:

- Color theme: background, surface, text, muted text, accent, border, glow.
- Font style: font chính/phụ, weight, scale.
- Motion style: nhịp chuyển động chung.
- Background style: kiểu nền.

Trong MVP, style chỉ là preset. Chưa làm editor tự pha màu/font/motion chi tiết.

### Ranh Giới MVP

MVP chỉ làm để user trả lời được 4 câu:

- Scene này dùng layout nào?
- Slot nào sẽ hiện trên video?
- Slot đó chứa nội dung/asset gì?
- Slot đó xuất hiện sau bao nhiêu giây và bằng animation nào?

Những thứ như kéo thả layout, resize slot, custom keyframe, timeline waveform, split text tự động sẽ để sau.

## Kiến Trúc Mục Tiêu

```text
frontend/constants sceneTemplates + videoStyles
-> Template page preview library
-> Kịch bản chọn sceneTemplateId cho từng segment
-> Slot values lưu trong segment
-> Preview page render layout theo slot values
-> Mapper tạo dynamic render payload
-> Template HyperFrames đọc scene layout/slots/timing
```

Data shape mục tiêu:

```json
{
  "videoStyleId": "dark-tech",
  "features": [
    {
      "id": "scene_1",
      "name": "CodeGraph là bản đồ hiểu code",
      "durationSec": 8,
      "sceneTemplateId": "intro-stack",
      "slots": {
        "logo": {
          "type": "asset",
          "assetId": "asset_1",
          "animation": "scale-in",
          "delay": 0
        },
        "title": {
          "type": "text",
          "text": "CodeGraph trong Migration Agent",
          "animation": "fade-up",
          "delay": 0.5
        },
        "description": {
          "type": "text",
          "text": "Bản đồ symbol và call graph giúp agent đọc đúng code trước khi migrate.",
          "animation": "fade-up",
          "delay": 2
        }
      },
      "voiceoverScript": "CodeGraph là bản đồ symbol và call graph cục bộ giúp agent hiểu code nhanh hơn trước khi migrate."
    }
  ]
}
```

## Phase 0 - Audit Template Page Và Data Hiện Tại

### Objective

Làm rõ trang Template hiện đang lưu gì, render preview gì, field nào đang dùng cho render payload và field nào chỉ là UI. Phase này chỉ đọc code và ghi nhận; không sửa UI.

### Scope

Sẽ làm:

- Đọc `frontend/pages/template.html`.
- Đọc `frontend/scripts/common/constants.js`.
- Đọc `frontend/scripts/common/ui-components.js` phần template/features/preview.
- Đọc mapper `frontend/scripts/common/render-preview.js`.
- Ghi mapping hiện tại giữa template UI, segment data và render payload.

Không làm:

- Chưa sửa trang Template.
- Chưa đổi schema dữ liệu.
- Chưa đổi render payload.

### Files Impact

- MODIFY `.agents/tasks/scene-template-slot-editor-roadmap.md` - cập nhật audit summary/status.
- LIKELY MODIFY `.agents/tasks/current-task.md` - nếu phase này được chuyển thành task thực thi.

### Verification

- Có summary rõ: hiện field nào đại diện cho video template, field nào cần đổi thành scene template.
- Không cần test runtime vì chỉ audit.

### Audit Summary

Flow Template hiện tại:

```text
Template page
-> user chọn `templateId` từ `TEMPLATES_LIST`
-> user chỉnh `templateConfig`
-> Render page chọn `video.formatId`
-> `RENDER_FORMATS` quyết định HyperFrames template thật
-> `AppRender.buildRenderPayload()` tạo payload theo render format
```

Field hiện có:

- `projectData.templateId`: template toàn video dạng cũ, ví dụ `project-showcase-90s`.
- `projectData.templateConfig`: config visual đơn giản gồm `theme`, `accentColor`, `fontSize`, `logoPosition`.
- `projectData.video.formatId`: format render thật đang được ưu tiên, ví dụ `dynamic-story-vertical`.
- `TEMPLATES_LIST`: list template cũ, mỗi item chứa scenes cố định để UI preview.
- `RENDER_FORMATS`: map format render sang `templateId` HyperFrames thật.
- `features[]`: segment/kịch bản hiện chỉ có `type`, `name`, `description`, `benefit`, `voiceoverScript`, `durationSec`, `useInVideo`; chưa có `sceneTemplateId` hoặc `slots`.

Mapping hiện tại:

- Template page chọn `templateId`, nhưng Render page có thể override bằng `video.formatId`.
- Preview page dùng `TEMPLATES_LIST.scenes` để hiển thị scene danh nghĩa, chưa dùng scene template/slot.
- Dynamic render mapper trong `frontend/scripts/common/render-preview.js` tự dựng scene generic `title/text/media/cards/steps/outro` từ brief, features, milestones và asset.
- Legacy render mapper vẫn dựng scene cố định `intro/problem/solution/features/timeline/impact/outro`.
- Nội dung hiển thị hiện vẫn được suy luận từ `projectName`, `shortSummary`, `mainMessage`, `features`, `milestones`; chưa có slot cụ thể như `logo/header/title/media/gridItem`.

Gap cần xử lý ở phase sau:

- Cần tách `templateId` video cũ khỏi `sceneTemplateId` từng segment.
- Cần thêm `videoStyleId` thay cho `templateConfig.theme/accentColor` rời rạc.
- Cần thêm `SCENE_TEMPLATES` và slot definitions trong constants.
- Cần migration/fallback cho segment cũ khi chưa có `sceneTemplateId/slots`.
- Cần Preview page đọc slot data thay vì chỉ đọc scene list từ `TEMPLATES_LIST`.
- Cần Render payload mapper nhận `sceneTemplateId + slots + slot delay`.

Phát hiện và xử lý trong audit:

- `frontend/scripts/common/render-preview.js` còn dùng estimator `145 WPM` cho scene voiceover trong payload builder, lệch với calibration `185 WPM` đã áp dụng ở UI/backend. Đã sửa đồng bộ trong Phase 0 để tránh payload estimate tiếp tục sai.

### Status

Completed.

### Test Report

Status: passed

- Đã đọc `frontend/pages/template.html`.
- Đã đọc `frontend/scripts/common/constants.js`.
- Đã đọc `frontend/scripts/common/ui-components.js` phần Template/Preview.
- Đã đọc `frontend/scripts/common/render-preview.js` mapper dynamic/legacy.
- Đã đọc `frontend/scripts/common/state.js` và `frontend/scripts/common/validation.js`.
- `node --check frontend/scripts/common/render-preview.js` pass.
- `npm --prefix backend run check` pass.
- `git diff --check` pass.

## Phase 1 - Scene Template Và Video Style Contract

### Objective

Định nghĩa contract dữ liệu cho Video Style, Scene Template và Slot. Sau phase này project có danh sách style/layout mẫu đủ để UI preview và Kịch bản dùng lại.

### Scope

Sẽ làm:

- Thêm danh sách `VIDEO_STYLES` MVP.
- Thêm danh sách `SCENE_TEMPLATES` MVP.
- Định nghĩa slot type: `text`, `asset`, `media`, `list`, `tag`.
- Định nghĩa animation preset MVP: `none`, `fade-up`, `slide-left`, `scale-in`, `pop`, `typewriter`.
- Định nghĩa delay defaults theo từng slot.
- Thêm helper validate/normalize slot values nếu cần.

Không làm:

- Chưa làm slot editor UI.
- Chưa nối render HyperFrames.
- Chưa upload asset mới.
- Chưa làm custom template builder.

### Files Impact

- MODIFY `frontend/scripts/common/constants.js` - thêm video styles, scene templates, slot definitions.
- LIKELY MODIFY `frontend/scripts/common/state.js` - default fields nếu cần `videoStyleId` hoặc `sceneTemplateId`.
- LIKELY MODIFY `frontend/scripts/common/validation.js` - validate slot required nếu cần.
- MODIFY `.agents/tasks/current-task.md` - checklist/test report.
- MODIFY `.agents/tasks/scene-template-slot-editor-roadmap.md` - status phase.

### Logic Changes

- Tách khái niệm template toàn video khỏi scene template từng phân đoạn.
- Segment có thể tham chiếu `sceneTemplateId`.
- Slot có metadata dùng chung cho UI và render mapper.

### Risk Assessment

- Tier Auto: thêm constants và helper chưa dùng rộng.
- Tier Confirm: nếu đổi shape dữ liệu lưu localStorage ngay trong phase này thì cần migration nhẹ hoặc fallback.
- Rollback: revert constants/helper.

### Verification

- `node --check frontend/scripts/common/constants.js`
- Nếu sửa validation/state: `node --check frontend/scripts/common/state.js frontend/scripts/common/validation.js`
- Browser smoke chưa bắt buộc nếu chưa render UI mới.

### Status

Completed.

### Implementation Summary

Đã thêm contract MVP trong `frontend/scripts/common/constants.js`:

- `VIDEO_STYLES`:
  - `dark-tech`
  - `clean-report`
  - `product-demo`
- `SCENE_SLOT_TYPES`:
  - `text`
  - `asset`
  - `media`
  - `list`
  - `tag`
- `SCENE_SLOT_ANIMATIONS`:
  - `none`
  - `fade-up`
  - `slide-left`
  - `scale-in`
  - `pop`
  - `typewriter`
- `SCENE_TEMPLATES`:
  - `intro-stack`
  - `media-showcase`
  - `grid-feature`
  - `step-flow`
  - `outro-cta`

Chưa đổi UI, state, validation hoặc render mapper trong phase này để giữ slice nhỏ và rollback dễ.

### Test Report

Status: passed

- `node --check frontend/scripts/common/constants.js` pass.
- `git diff --check` pass.
- `rg -n "VIDEO_STYLES|SCENE_TEMPLATES|SCENE_SLOT_TYPES|SCENE_SLOT_ANIMATIONS" frontend/scripts/common/constants.js` xác nhận đủ constants.

## Phase 2 - Làm Lại Trang Template Thành Video Style + Scene Template Library

### Objective

Đổi trang Template thành nơi chọn Video Style và xem thư viện Scene Template. User nhìn được các layout dạng wireframe như hình đã gửi, hiểu mỗi scene template có slot nào.

### Scope

Sẽ làm:

- Trang Template có section `Video Style`.
- Trang Template có section `Scene Template Library`.
- Mỗi Scene Template card có:
  - tên
  - mô tả dùng cho loại scene nào
  - hỗ trợ ratio nào
  - preview wireframe slot
  - danh sách slot chính
- Chọn Video Style lưu vào project data.
- Chọn default Scene Template nếu cần, nhưng chưa fill nội dung scene ở trang này.

Không làm:

- Không edit nội dung slot ở trang Template.
- Không chỉnh delay/animation ở trang Template.
- Không render MP4 thật trong phase này.

### Files Impact

- MODIFY `frontend/scripts/common/ui-components.js` - render Template page mới.
- MODIFY `frontend/styles/pages/template.css` - layout/style page.
- LIKELY MODIFY `frontend/scripts/common/constants.js` - bổ sung metadata preview nếu thiếu.
- MODIFY `.agents/tasks/current-task.md` - checklist/test report.
- MODIFY `.agents/tasks/scene-template-slot-editor-roadmap.md` - status phase.

### Logic Changes

- Trang Template không còn chỉ là chọn template render cũ; nó có trách nhiệm chọn style toàn video và browse scene layouts.
- Preview wireframe slot không dùng dữ liệu thật, chỉ dùng definition.

### Risk Assessment

- Tier Auto: UI page và local state.
- Side effect: nếu template page hiện đang được validation/render dùng, cần giữ backward-compatible `templateId`.
- Rollback: revert UI/CSS/constants.

### Verification

- `node --check frontend/scripts/common/ui-components.js`
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/ui-components.js frontend/styles/pages/template.css`
- Browser smoke:
  - mở `/pages/template.html`
  - chọn Video Style
  - xem cards Scene Template
  - reload vẫn giữ style
  - kiểm desktop/mobile không vỡ layout

### Status

Completed.

### Implementation Summary

Đã làm lại trang Template theo mô hình mới:

- Thêm `Video Style` cards: `Dark Tech`, `Clean Report`, `Product Demo`.
- Thêm `Scene Template Library` dùng data từ `SCENE_TEMPLATES`.
- Mỗi scene template card có wireframe slot, mô tả, category, duration đề xuất và số slot.
- Sidebar bên phải hiển thị style đang chọn, scene template mặc định, render template legacy hiện tại và danh sách slot/delay.
- Chọn style lưu `videoStyleId` và vẫn sync `templateConfig` cũ để không phá preview/render legacy.
- Chọn scene template lưu `defaultSceneTemplateId`.
- Thêm default `videoStyleId` và `defaultSceneTemplateId` cho project data/sample data.
- Giữ trang Template chỉ là nơi chọn style/layout; chưa nhập nội dung slot trong phase này.

### Test Report

Status: passed

- `node --check frontend/scripts/common/constants.js` pass.
- `node --check frontend/scripts/common/storage.js` pass.
- `node --check frontend/scripts/common/ui-components.js` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/constants.js frontend/scripts/common/storage.js frontend/scripts/common/ui-components.js frontend/styles/pages/template.css` không có hit.
- `git diff --check` pass.
- `npm --prefix backend run check` pass.
- `curl -I http://127.0.0.1:3028/pages/template.html` trả `200`.
- Chrome headless DOM dump `/pages/template.html` render đủ Video Style, Scene Templates và Slots panel.
- Desktop screenshot: `/private/tmp/hvt-template-phase2-desktop.png`.
- Mobile không dùng làm gate theo yêu cầu user hiện tại; có fix scoped để giảm overflow nhưng chưa coi là tiêu chí bàn giao phase này.

## Phase 3 - Slot Editor Trong Trang Kịch Bản

### Objective

Cho mỗi phân đoạn trong Kịch bản chọn Scene Template, hiện preview layout slot, click slot để nhập nội dung/chọn asset/chỉnh delay/animation.

### Scope

Sẽ làm:

- Mỗi segment có dropdown `Scene Template`.
- Khi chọn template, tạo slot values mặc định.
- Hiện preview wireframe slot trong modal hoặc detail panel.
- Click slot mở editor phù hợp:
  - text/tag: textarea/input.
  - asset/media: chọn từ tài nguyên đã có.
  - list/grid: nhập list item MVP.
- Slot editor có:
  - delay giây
  - animation preset
  - toggle bật/tắt slot nếu optional
- Lưu slot values vào segment data.

Không làm:

- Không kéo thả slot position.
- Không resize slot.
- Không timeline kéo thả.
- Không tạo asset upload mới trong slot editor; chỉ chọn asset đã có.

### Files Impact

- MODIFY `frontend/scripts/common/ui-components.js` - Kịch bản modal/detail slot editor.
- MODIFY `frontend/styles/pages/features.css` - layout slot preview/editor.
- LIKELY MODIFY `frontend/scripts/common/state.js` - default/migration slot values.
- LIKELY MODIFY `frontend/scripts/common/validation.js` - validate required slots.
- MODIFY `.agents/tasks/current-task.md`.
- MODIFY `.agents/tasks/scene-template-slot-editor-roadmap.md`.

### Logic Changes

- Segment data không chỉ có `name/description/benefit/voiceoverScript`; nó có thêm `sceneTemplateId` và `slots`.
- Nội dung hiển thị trên scene lấy từ slots, không còn template tự đoán từ `name/description/benefit` về lâu dài.
- `voiceoverScript` vẫn riêng, chỉ dùng cho voice.

### Risk Assessment

- Tier Confirm: thay đổi shape segment data có ảnh hưởng localStorage và mapper.
- Cần fallback/migration: segment cũ phải map tạm sang slots mặc định.
- Rollback: có thể revert UI, nhưng data mới trong localStorage cần được ignored an toàn.

### Verification

- `node --check frontend/scripts/common/ui-components.js`
- `node --check frontend/scripts/common/state.js frontend/scripts/common/validation.js` nếu sửa.
- Browser smoke:
  - tạo/sửa segment.
  - đổi Scene Template.
  - click text slot nhập nội dung.
  - click media slot chọn asset.
  - chỉnh delay/animation.
  - reload page vẫn còn slot data.
  - mobile modal không overflow.

### Status

In progress.

### Slice 1 - Modal Slot Editor MVP

Status: completed

Đã làm:

- Segment modal có dropdown `Scene Template`.
- Khi đổi template, slot editor đổi theo đúng slot của template mới.
- Segment cũ chưa có `sceneTemplateId/slots` được fallback từ `defaultSceneTemplateId` và field cũ.
- Slot type `text/tag` dùng input/textarea.
- Slot type `asset/media` chọn từ tài nguyên đã upload.
- Slot type `list` nhập mỗi dòng một item.
- Mỗi slot có `delay` và `animation`.
- Slot optional có toggle bật/tắt; slot required luôn bật.
- Khi lưu segment, data có thêm:
  - `sceneTemplateId`
  - `slots`
- List/detail Kịch bản hiển thị scene template đang dùng.

Chưa làm trong slice này:

- Chưa có preview wireframe tương tác/click slot trong detail panel.
- Chưa validate required slot thiếu dữ liệu.
- Chưa nối slot data sang Preview/Render.

### Slice 1 Test Report

Status: passed

- `node --check frontend/scripts/common/constants.js` pass.
- `node --check frontend/scripts/common/ui-components.js` pass.
- `git diff --check` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/ui-components.js frontend/styles/pages/features.css` không có hit.
- `curl -I http://127.0.0.1:3028/pages/features.html` trả `200`.
- `npm --prefix backend run check` pass.
- CDP desktop smoke trên Chrome headless:
  - mở `/pages/features.html`.
  - bấm thêm đoạn.
  - modal có `#modal-feat-scene-template`.
  - slot ban đầu của `intro-stack`: `logo`, `kicker`, `title`, `description`, `tag`.
  - đổi sang `grid-feature`, slot đổi thành `header`, `title`, `grid`, `description`.
  - lưu segment mới với `sceneTemplateId = grid-feature`.
  - localStorage lưu `slots.grid.items = ["Item 1", "Item 2"]`.
  - localStorage lưu `slots.grid.delay = 2`.
- Desktop screenshot modal: `/private/tmp/hvt-phase3-slot-editor-modal.png`.

### Slice 2 - Required Slot Validation Và Detail Slot Summary

Status: completed

Đã làm:

- Khi lưu segment, slot required thiếu dữ liệu sẽ bị chặn.
- Slot `title` trống tự fallback từ tiêu đề đoạn.
- Slot `description` trống tự fallback từ nội dung chính.
- Slot `asset/media` required bắt buộc có asset.
- Slot `list` required bắt buộc có ít nhất một item.
- Sau khi thêm/cập nhật segment, detail panel tự chọn đúng segment vừa lưu.
- Detail panel hiển thị summary từng slot:
  - label
  - type
  - delay
  - animation
  - value summary

Chưa làm trong slice này:

- Chưa preview timing/animation trực quan.
- Chưa nối slot summary sang trang Preview.

### Slice 2 Test Report

Status: passed

- `node --check frontend/scripts/common/ui-components.js` pass.
- `git diff --check` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/ui-components.js frontend/styles/pages/features.css` không có hit.
- `npm --prefix backend run check` pass.
- CDP desktop smoke:
  - chọn `grid-feature`.
  - để `Grid Items` trống rồi lưu bị chặn.
  - toast báo `Thiếu slot bắt buộc: Grid Items.`
  - nhập `Grid Items` rồi lưu thành công.
  - detail panel chọn đúng segment vừa lưu.
  - detail slot summary có `Grid Items` và `2 item`.

## Phase 4 - Preview Theo Scene Template Và Slot Delay

### Objective

Trang Xem trước phải phản ánh Scene Template và Slot Delay thay vì chỉ preview nội dung generic. User nhìn được slot nào xuất hiện tại mốc nào.

### Scope

Sẽ làm:

- Preview page render selected segment theo `sceneTemplateId`.
- Áp Video Style vào preview.
- Áp slot values vào layout.
- Có chế độ scrub/play đơn giản theo scene time:
  - item delay `0s` hiện ngay.
  - item delay `2s` hiện sau mốc 2s.
  - item delay `4s` hiện sau mốc 4s.
- Hiển thị danh sách slot + delay bên cạnh preview.

Không làm:

- Không render animation GSAP thật 100% trong UI nếu tốn công.
- Không kéo timeline.
- Không preview audio waveform.

### Files Impact

- MODIFY `frontend/scripts/common/ui-components.js` - Preview page renderer.
- MODIFY `frontend/styles/pages/preview.css` - slot preview layout.
- LIKELY MODIFY `frontend/scripts/common/render-preview.js` - helper map slot to preview state.
- MODIFY `.agents/tasks/current-task.md`.
- MODIFY `.agents/tasks/scene-template-slot-editor-roadmap.md`.

### Logic Changes

- Preview không còn dựa chủ yếu vào template cũ; nó dùng `sceneTemplateId + slots + videoStyleId`.
- Delay ảnh hưởng trạng thái visible trong preview.

### Risk Assessment

- Tier Auto: UI preview.
- Side effect: có thể làm preview cũ thay đổi; cần giữ fallback nếu segment chưa có scene template.

### Verification

- `node --check frontend/scripts/common/ui-components.js`
- Browser smoke:
  - preview segment có slot data.
  - delay 0/2/4 hiển thị đúng khi play.
  - đổi style đổi màu preview.
  - fallback segment cũ vẫn xem được.

### Status

In progress.

### Slice 1 - Slot-Based Preview UI

Status: completed.

Summary:

- Preview page ưu tiên active segments trong `features` và tạo scene preview từ `sceneTemplateId + slots`.
- Nếu chưa có active segments, preview vẫn fallback về scene generic cũ.
- Áp `videoStyleId` vào màu nền, surface, text, accent, border và glow trong preview canvas.
- Hỗ trợ preview layout cho `intro-stack`, `media-showcase`, `grid-feature`, `step-flow`, `outro-cta`.
- Thêm scrub scene time để kiểm tra slot delay.
- Slot có `delay` nhỏ hơn hoặc bằng thời gian hiện tại sẽ visible; slot chưa tới delay hiển thị pending.
- Panel bên phải hiển thị slot timing, animation và trạng thái visible/pending.
- Chưa đổi render payload và chưa đổi HyperFrames render thật.

Test Report:

- `node --check frontend/scripts/common/ui-components.js` pass.
- `git diff --check` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/ui-components.js frontend/styles/pages/preview.css` không có hit.
- `curl -I http://127.0.0.1:3028/pages/preview.html` trả `200`.
- `npm --prefix backend run check` pass.
- CDP desktop smoke:
  - inject project có segment `grid-feature`.
  - preview render `.preview-slot-layout`.
  - tại `0s`, grid list chưa visible.
  - scrub tới `2s`, grid list visible.
  - time control hiển thị `2.0s / 8s`.
  - slot timing hiển thị các mốc `0.0s`, `0.5s`, `2.0s`, `4.0s`.
- Desktop screenshot: `/private/tmp/hvt-phase4-slot-preview.png`.

## Phase 5 - Render Payload Mapping Cho Slot-Based Scenes

### Objective

Mapper render tạo payload từ Scene Template + Slot Values + Slot Delay để HyperFrames template dynamic dùng được, không còn phải đoán từ `name/description/benefit`.

### Scope

Sẽ làm:

- Extend dynamic render payload để chứa:
  - `videoStyle`
  - `sceneTemplateId`
  - `slots`
  - `slotTiming`
  - `slotAnimations`
- Fallback map segment cũ sang slot mặc định.
- Validate payload slot tối thiểu.
- Không phá render template cũ.

Không làm:

- Chưa build renderer cho mọi scene template.
- Chưa hỗ trợ custom user layout.
- Chưa sync frame-perfect với audio.

### Files Impact

- MODIFY `frontend/scripts/common/render-preview.js` - project to render payload.
- LIKELY MODIFY `backend/src/render/render-payload-schema.js` - validate slot payload nếu backend cần.
- LIKELY MODIFY `data/dynamic-motion-payload.sample.json` - sample slot-based payload.
- LIKELY MODIFY `backend/scripts/test-render-payload.js` hoặc thêm test mới.
- MODIFY `.agents/tasks/current-task.md`.
- MODIFY `.agents/tasks/scene-template-slot-editor-roadmap.md`.

### Logic Changes

- Render payload chuyển từ scene generic text/media/items sang slot-based scene.
- Slot delay và animation trở thành dữ liệu render được.

### Risk Assessment

- Tier Confirm: backend schema/render payload thay đổi, có thể ảnh hưởng render job.
- Cần giữ backward compatibility với dynamic payload cũ.
- Rollback: revert mapper/schema/sample.

### Verification

- `npm --prefix backend run check`
- `node --check frontend/scripts/common/render-preview.js`
- Payload sample parse pass.
- API smoke render sau khi template renderer có support.

### Status

Pending.

## Phase 6 - HyperFrames Renderer Cho Scene Templates MVP

### Objective

Template dynamic dọc/ngang render được một tập Scene Template MVP bằng slot values, delay và animation preset.

### Scope

Sẽ làm:

- Support tối thiểu 3 scene templates:
  - `intro-stack`
  - `media-showcase`
  - `grid-feature`
- Áp Video Style vào CSS variables của template.
- Render slot text/media/list.
- Áp delay theo slot.
- Áp animation preset MVP.
- Render dọc trước, ngang sau nếu cần tách.

Không làm:

- Không renderer cho toàn bộ layout nâng cao.
- Không custom position.
- Không timeline editor.

### Files Impact

- MODIFY `templates/dynamic-story-vertical/script.js`.
- MODIFY `templates/dynamic-story-vertical/styles.css`.
- LIKELY MODIFY `templates/dynamic-story-horizontal/script.js`.
- LIKELY MODIFY `templates/dynamic-story-horizontal/styles.css`.
- LIKELY MODIFY `templates/shared/motion-core.js` nếu cần helper slot.
- MODIFY `.agents/tasks/current-task.md`.
- MODIFY `.agents/tasks/scene-template-slot-editor-roadmap.md`.

### Logic Changes

- Template HyperFrames không render scene bằng type generic đơn giản nữa; nó render theo `sceneTemplateId`.
- Slot delay điều khiển timeline reveal item.

### Risk Assessment

- Tier Confirm: ảnh hưởng output render thật.
- Cần smoke render và frame check, không chỉ nhìn job succeeded.
- Rollback: revert template changes.

### Verification

- `node --check templates/dynamic-story-vertical/script.js`
- HyperFrames lint template.
- API smoke render vertical.
- Extract/check frames tại các mốc delay `0s`, `2s`, `4s`.
- Nếu làm ngang: API smoke render horizontal.

### Status

Pending.

## MVP Đề Xuất Thực Thi Trước

Không nên nhảy thẳng tới Phase 6. Thin slice đầu tiên nên là:

```text
Phase 0 -> Phase 1 -> Phase 2
```

Kết quả sau slice đầu:

- Có contract rõ.
- Trang Template có Video Style và Scene Template Library.
- User nhìn được các layout/slot như hình đã gửi.
- Chưa phá Kịch bản/render hiện tại.

Sau khi user duyệt UI/khái niệm, mới làm:

```text
Phase 3 -> Phase 4
```

Sau khi slot editor/preview ổn, mới nối render:

```text
Phase 5 -> Phase 6
```

## Future Scope

- Scene template builder cho user tự tạo layout.
- Drag/drop slot position.
- Resize slot.
- Timeline kéo thả.
- Animation curve/easing nâng cao.
- Auto-fit text theo slot.
- Auto-split text dài thành nhiều scene.
- Import/export scene template pack.
- AI đề xuất scene template từ voice script hoặc brief.

## Definition Of Done Theo Từng Giai Đoạn

### Done Phase 2

- Trang Template hiển thị rõ `Video Style`.
- Trang Template hiển thị rõ `Scene Template Library`.
- Mỗi scene template có wireframe slot dễ nhìn.
- Chọn style/template lưu được vào project data.
- Reload không mất lựa chọn.
- Mobile/desktop không vỡ layout.
- Render hiện tại chưa bị ảnh hưởng.

### Done Phase 3

- Mỗi phân đoạn chọn được `sceneTemplateId`.
- Slot editor sinh đúng slot theo template.
- User nhập text/tag/list được.
- User chọn asset/media đã upload được.
- User chỉnh `delay` và `animation` theo từng slot được.
- Reload vẫn giữ slot data.
- Segment cũ chưa có slot vẫn mở/sửa được bằng fallback.

### Done Phase 4

- Trang Preview hiển thị đúng layout theo scene template.
- Preview dùng nội dung thật từ slots.
- Delay `0s/2s/4s` nhìn thấy khác nhau khi play/scrub.
- Video Style đổi màu/font/nền preview.
- Segment cũ vẫn có preview fallback.

### Done Phase 5

- Render payload có `videoStyleId`, `sceneTemplateId`, `slots`, `delay`, `animation`.
- Payload cũ vẫn render được.
- Validation bắt lỗi slot required thiếu dữ liệu.
- Sample payload parse/pass check.

### Done Phase 6

- HyperFrames vertical render được tối thiểu:
  - `intro-stack`
  - `media-showcase`
  - `grid-feature`
- Slot delay ảnh hưởng thật tới thời điểm xuất hiện trong video.
- Animation preset render thật, không chỉ preview UI.
- Smoke render có frame check ở các mốc delay.
- Nếu horizontal chưa hoàn chỉnh thì phải fallback sạch, không còn frame dọc nằm giữa video ngang.
