# Task Hiện Tại

## Trạng thái workflow

in_progress

## Roadmap Phase 3 Slice 2 - Required Slot Validation Và Detail Summary

### Objective

Chặn lưu segment nếu slot bắt buộc còn thiếu dữ liệu và làm detail panel hiển thị rõ các slot đã cấu hình.

### Summary

- Slot required thiếu dữ liệu sẽ bị chặn khi lưu.
- `title` slot trống fallback từ tiêu đề đoạn.
- `description` slot trống fallback từ nội dung chính.
- `asset/media` required phải có asset.
- `list` required phải có ít nhất một item.
- Sau khi thêm/cập nhật segment, detail panel chọn đúng segment vừa lưu.
- Detail panel hiển thị slot summary gồm label, type, delay, animation và value summary.

### Test Report

Status: passed

- `node --check frontend/scripts/common/ui-components.js` pass.
- `git diff --check` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/ui-components.js frontend/styles/pages/features.css` không có hit.
- `npm --prefix backend run check` pass.
- CDP desktop smoke pass: required `Grid Items` trống bị chặn, nhập item thì lưu được, detail panel chọn đúng segment mới và slot summary có `Grid Items`/`2 item`.

## Roadmap Phase 3 Slice 1 - Segment Slot Editor MVP

### Objective

Thêm slot editor MVP vào modal thêm/sửa đoạn Kịch bản để mỗi segment lưu được `sceneTemplateId` và `slots`.

### Summary

- Modal Kịch bản có dropdown `Scene Template`.
- Đổi template sẽ render lại slot editor theo slot của template đó.
- Segment cũ chưa có slot được fallback từ `defaultSceneTemplateId` và field cũ.
- Slot `text/tag` dùng input/textarea.
- Slot `asset/media` chọn từ tài nguyên đã upload.
- Slot `list` nhập mỗi dòng một item.
- Mỗi slot có `delay`, `animation` và toggle nếu optional.
- Khi lưu segment, data có thêm `sceneTemplateId` và `slots`.
- List/detail Kịch bản hiển thị scene template đang dùng.
- Chưa nối Preview/Render trong slice này.

### Test Report

Status: passed

- `node --check frontend/scripts/common/constants.js` pass.
- `node --check frontend/scripts/common/ui-components.js` pass.
- `git diff --check` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/ui-components.js frontend/styles/pages/features.css` không có hit.
- `curl -I http://127.0.0.1:3028/pages/features.html` trả `200`.
- `npm --prefix backend run check` pass.
- CDP desktop smoke pass: mở modal, đổi `intro-stack` sang `grid-feature`, lưu segment mới, localStorage có `sceneTemplateId`, `slots.grid.items`, `slots.grid.delay`.
- Desktop screenshot modal: `/private/tmp/hvt-phase3-slot-editor-modal.png`.

## Roadmap Phase 2 - Template Page Video Style Và Scene Template Library

### Objective

Đổi trang Template thành nơi chọn Video Style toàn video và xem thư viện Scene Template cho từng phân đoạn.

### Summary

- Trang Template có `Video Style` cards: `Dark Tech`, `Clean Report`, `Product Demo`.
- Trang Template có `Scene Template Library` render từ `SCENE_TEMPLATES`.
- Mỗi scene template card hiển thị wireframe slot, mô tả, category, duration đề xuất và số slot.
- Sidebar bên phải hiển thị style đang chọn, scene template mặc định, render template legacy hiện tại và danh sách slot/delay.
- Chọn style lưu `videoStyleId` và sync `templateConfig` cũ để không phá preview/render legacy.
- Chọn scene template lưu `defaultSceneTemplateId`.
- Thêm default `videoStyleId` và `defaultSceneTemplateId` vào project data/sample data.
- Chưa nhập nội dung slot trong phase này; phần đó thuộc Phase 3.

### Test Report

Status: passed

- `node --check frontend/scripts/common/constants.js` pass.
- `node --check frontend/scripts/common/storage.js` pass.
- `node --check frontend/scripts/common/ui-components.js` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/constants.js frontend/scripts/common/storage.js frontend/scripts/common/ui-components.js frontend/styles/pages/template.css` không có hit.
- `git diff --check` pass.
- `npm --prefix backend run check` pass.
- `curl -I http://127.0.0.1:3028/pages/template.html` trả `200`.
- Chrome headless DOM dump render đủ Video Style, Scene Templates và Slots panel.
- Desktop screenshot: `/private/tmp/hvt-template-phase2-desktop.png`.

## Roadmap Phase 1 - Scene Template Và Video Style Contract

### Objective

Thêm contract dữ liệu MVP cho Video Style, Scene Template, Slot Type và Slot Animation để chuẩn bị làm lại trang Template.

### Summary

- Thêm `VIDEO_STYLES`: `dark-tech`, `clean-report`, `product-demo`.
- Thêm `SCENE_SLOT_TYPES`: `text`, `asset`, `media`, `list`, `tag`.
- Thêm `SCENE_SLOT_ANIMATIONS`: `none`, `fade-up`, `slide-left`, `scale-in`, `pop`, `typewriter`.
- Thêm `SCENE_TEMPLATES`: `intro-stack`, `media-showcase`, `grid-feature`, `step-flow`, `outro-cta`.
- Chưa đổi UI/state/render trong phase này.

### Test Report

Status: passed

- `node --check frontend/scripts/common/constants.js` pass.
- `git diff --check` pass.
- `rg -n "VIDEO_STYLES|SCENE_TEMPLATES|SCENE_SLOT_TYPES|SCENE_SLOT_ANIMATIONS" frontend/scripts/common/constants.js` pass.

## Roadmap Phase 0 - Scene Template Audit

### Objective

Audit trang Template và data/render mapping hiện tại trước khi tách Video Style, Scene Template và Slot Editor.

### Summary

- Template page hiện chọn `templateId` từ `TEMPLATES_LIST` và chỉnh `templateConfig`.
- Render page ưu tiên `video.formatId`; `RENDER_FORMATS` mới là nơi map sang HyperFrames template thật.
- Preview page dùng `TEMPLATES_LIST.scenes` làm scene danh nghĩa, chưa có scene template/slot.
- Kịch bản hiện chỉ có segment fields cũ: `type`, `name`, `description`, `benefit`, `voiceoverScript`, `durationSec`, `useInVideo`.
- Dynamic mapper đang tự suy luận scene từ brief/features/assets; chưa dùng slot contract.
- Audit phát hiện frontend render payload voice estimator còn `145 WPM`; đã đồng bộ sang `185 WPM`.

### Test Report

Status: passed

- `node --check frontend/scripts/common/render-preview.js` pass.
- `npm --prefix backend run check` pass.
- `git diff --check` pass.

## Feature - Audio Preview Cache Cleanup

### Objective

Giữ tính năng `Nghe thử` không làm `outputs/audio` phình vô hạn khi người dùng thử nhiều script/voice/rate khác nhau.

### Scope

- Tự dọn cache audio preview sau khi tạo/lấy audio preview.
- Mặc định xóa file cache quá `7` ngày.
- Mặc định giới hạn cache preview `200MB`; nếu vượt, xóa file cũ nhất trước.
- Không xóa file audio/subtitle vừa tạo cho request hiện tại.
- Cho phép chỉnh bằng env:
  - `HVT_AUDIO_CACHE_MAX_MB`
  - `HVT_AUDIO_CACHE_MAX_AGE_DAYS`

### Test Report

Status: passed

- `npm --prefix backend run voiceover:preview:test` pass.
- `node --check backend/src/routes/voiceover-preview.js` pass.
- `node --check backend/src/config.js` pass.
- `git diff --check` pass.
- `npm --prefix backend run check` pass.

## Fix - Voice Duration Estimate Calibration

### Symptom

User nghe thử thấy estimate hiển thị `6.7s` nhưng audio thật chỉ `5.6s` với đoạn 19 từ, scene 8s, rate `+10%`.

### Root Cause

Ước lượng frontend đang dùng tốc độ nền `155 WPM`, trong khi giọng `edge-tts` tiếng Việt thực tế ở mẫu này gần `185 WPM` trước khi cộng rate. Backend audio report và render payload cũng còn dùng estimate cũ `145 WPM`, làm các con số có thể lệch nhau.

### Fix

- Calibrate frontend estimate sang `185 WPM`.
- Đồng bộ estimate trong backend voiceover và render payload mapper sang `185 WPM`.
- Khi audio preview load metadata, cập nhật lại box estimate bằng `audio thật` thay vì chỉ hiện ở dòng status bên dưới.
- Cập nhật fixture `data/render-payload.sample.json` theo estimatedDuration mới.

### Test Report

Status: passed

- Case user: `19` từ, rate `+10%` tính ra `5.6s`.
- `node --check frontend/scripts/common/ui-components.js` pass.
- `npm --prefix backend run check` pass.
- `git diff --check` pass.

## Feature - Voiceover Audio Preview

### Objective

Thêm chức năng nghe thử voice script trong modal thêm/sửa đoạn kịch bản. Người dùng bấm `Nghe thử`, backend tạo MP3 bằng engine voiceover hiện có và frontend phát audio ngay trong modal để kiểm tra tốc độ đọc thực tế.

### Scope

Sẽ làm:

- Thêm API `POST /api/voiceover-preview` để tạo/cache MP3 từ text và setting voice hiện tại.
- Thêm API serve file preview an toàn từ `outputs/audio`.
- Thêm hàm frontend gọi API preview trong `AppRender`.
- Thêm nút `Nghe thử`, trạng thái loading/error và audio player trong modal voice script.
- Sau khi audio load metadata, hiển thị duration audio thật.

Không làm:

- Không tự generate audio khi người dùng đang gõ.
- Không đổi render video chính.
- Không làm waveform, subtitle preview hoặc timeline audio.
- Không đổi schema project/render payload.

### Checklist

- [x] Thêm backend route voiceover preview.
- [x] Mount route vào backend server.
- [x] Thêm frontend API helper preview voiceover.
- [x] Thêm UI nghe thử trong modal scene.
- [x] Style audio preview gọn, không vỡ mobile.
- [x] Chạy syntax/test checks.
- [x] Điền Test Report.

### Test Report

Status: passed

- `node --check frontend/scripts/common/render-preview.js` pass.
- `node --check frontend/scripts/common/ui-components.js` pass.
- `git diff --check` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/render-preview.js frontend/scripts/common/ui-components.js frontend/styles/pages/features.css backend/src/routes/voiceover-preview.js` không có hit.
- `npm --prefix backend run check` pass, gồm `voiceover:preview:test`.
- Backend smoke local:
  - `POST /api/voiceover-preview` với script rỗng trả `422` JSON đúng.
  - `HEAD /pages/features.html` trả `200`.
  - `HEAD /api/voiceover-preview/audio/not-valid.mp3` trả `400`.
- Chưa gọi happy path tạo MP3 thật trong test tự động để tránh phụ thuộc edge-tts/network; cần test thủ công bằng nút `Nghe thử` trong modal.

## Feature - Voice Script Duration Estimate

### Objective

Thêm ước lượng thời lượng đọc voice ngay trong modal thêm/sửa scene ở trang Kịch bản, dựa trên nội dung voice script, thời lượng scene và setting tốc độ đọc hiện tại.

### Scope

Sẽ làm:

- Tính số từ và giây ước lượng khi người dùng nhập voice script.
- Tính theo rate voice hiện tại trong `audio.voiceover.rate`.
- Hiển thị trạng thái `Vừa`, `Hơi ngắn`, hoặc `Quá dài` so với thời lượng scene.
- Cập nhật realtime khi đổi voice script hoặc thời lượng scene.

Không làm:

- Không generate audio thử để đo duration thật.
- Không đổi payload/schema render.
- Không đổi model scene/template.

### Test Report

Status: passed

- Web review phát hiện CSS/task note đã có nhưng JS modal chưa render estimate; đã nối lại UI + realtime update trước khi commit.
- `node --check frontend/scripts/common/ui-components.js` pass.
- `rg -n "alert\\(|confirm\\(|prompt\\(|debugger|console\\.log\\(" frontend/scripts/common/ui-components.js frontend/styles/pages/features.css` không còn hit.
- `npm --prefix backend run check` pass.
- `git diff --check` pass.
- Browser/manual UI check: chưa chạy trong task này; cần mở modal thêm/sửa scene để xác nhận estimate hiển thị đúng trên giao diện thật.

## Polish - Dynamic Motion Quality

### Symptom

User báo output dynamic chưa mượt, tiếng Việt không dấu, animation chưa rõ và spacing giữa các item quá sát.

### Fix

- Đổi fallback/sample dynamic payload sang tiếng Việt có dấu.
- Đổi fallback text trong UI dynamic payload builder sang tiếng Việt có dấu.
- Thêm font file NotoSans nội bộ template qua `@font-face` để HyperFrames render tiếng Việt ổn định.
- Tăng spacing/padding/line-height cho vertical và horizontal dynamic template.
- Tăng motion primitive trong shared animation core:
  - text reveal có blur/y/stagger rõ hơn
  - media reveal chậm và mềm hơn
  - card/item sequence có enter/exit rõ hơn
  - steps spotlight hiện theo nhịp rõ hơn

### Test Report

Status: passed

- `node --check frontend/scripts/common/render-preview.js` pass.
- `node --check templates/dynamic-story-vertical/script.js` pass.
- `node --check templates/dynamic-story-horizontal/script.js` pass.
- `JSON.parse(data/dynamic-motion-payload.sample.json)` pass.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-vertical lint` pass `0 errors, 0 warnings`.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-horizontal lint` pass `0 errors, 0 warnings`.
- `npm --prefix backend run check` pass.
- API smoke dynamic vertical pass:
  - Job: `287706d2-31ef-40cf-9e82-929c043f2b2f`.
  - Output: `outputs/287706d2-31ef-40cf-9e82-929c043f2b2f.mp4`.
  - `ffprobe`: `1080x1920`, `68s`, `size=3812800`.
  - Manual frame review: tiếng Việt có dấu, scene đổi đúng, card ổn định nét sau transition.
- API smoke dynamic horizontal pass:
  - Job: `71473e19-5c52-464f-88da-d77778b58fb4`.
  - Output: `outputs/71473e19-5c52-464f-88da-d77778b58fb4.mp4`.
  - `ffprobe`: `1920x1080`, `68s`, `size=3628261`.
  - Manual frame review: layout ngang không overlap, text có dấu, media/card/steps render đúng.

## Diagnose - Dynamic Render Đen/Blank

### Symptom

User báo dynamic render ra video đen. Kiểm output cũ xác nhận:

- `outputs/5f904c31-50d1-4016-80d0-3057f91368da.mp4`: dynamic vertical, `1080x1920`, `68s`, `174909` bytes, frame chỉ có nền/progress.
- `outputs/32bbd36d-88e8-414b-bd08-7699e8d4dac4.mp4`: dynamic vertical, `1080x1920`, `68s`, `174909` bytes, frame chỉ có nền/progress.

### Root Cause

- Bug 1 đã fix ở Phase 7: backend copy template vào workdir nhưng không copy `templates/shared`, làm dynamic template thiếu motion core khi render qua API.
- Bug 2: `templates/dynamic-story-vertical/index.html` register bootstrap timeline rỗng trước `script.js`; output sau bug 1 có nội dung nhưng đứng ở intro.

### Fix

- `backend/src/render/render-runner.js` đã copy `templates/shared` vào `.cache/render-jobs/{jobId}/shared`.
- `templates/dynamic-story-vertical/index.html` đã đổi sang load `script.js` trước bootstrap fallback, và bootstrap chỉ tạo timeline nếu timeline thật chưa tồn tại.

### Test Report

Status: passed

- `node --check templates/dynamic-story-vertical/script.js` pass.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-vertical lint` pass `0 errors, 0 warnings`.
- `npm --prefix backend run check` pass.
- API smoke dynamic vertical pass:
  - Job: `add5b5bf-148c-4c04-9fa3-a6bccad0ac9f`.
  - Output: `outputs/add5b5bf-148c-4c04-9fa3-a6bccad0ac9f.mp4`.
  - `ffprobe`: `width=1080`, `height=1920`, `avg_frame_rate=30/1`, `duration=68.000000`, `size=3630432`.
  - Manual frame review tại `10s`, `24s`, `36s` pass; scene chuyển `context -> media -> motion`.

## Dynamic Motion Video - Phase 7 Dynamic Horizontal Template

### Objective

Tạo template dynamic ngang `16:9` dùng cùng dynamic scene contract/motion core với bản dọc, nhưng layout riêng cho desktop/video ngang.

### Scope

Đã làm:

- Tạo `templates/dynamic-story-horizontal/`.
- Thêm render format UI `Ngang dynamic motion - 1920x1080`.
- Thêm backend preset/schema/preflight/test cho `dynamic-story-horizontal`.
- Sửa render runner copy `templates/shared` vào workdir để dynamic templates load được motion core qua `../shared/...`.
- Render direct và API smoke ra MP4 `1920x1080`.

Không làm trong phase này:

- Chưa làm editor scene dynamic riêng.
- Chưa làm Preview page dynamic ngang.
- Chưa làm crop/focus media nâng cao.

### Test Report

Status: passed

- `node --check templates/dynamic-story-horizontal/script.js` pass.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-horizontal lint` pass `0 errors, 0 warnings`.
- `npm --prefix backend run check` pass.
- `node --check frontend/scripts/common/constants.js` pass.
- `node -e "...getRenderPreflight()"` pass với `status=ok`, `checks=31`.
- Direct render pass:
  - Output: `/private/tmp/hvt-dynamic-story-horizontal.mp4`.
  - `ffprobe`: `width=1920`, `height=1080`, `avg_frame_rate=30/1`, `duration=68.000000`, `size=3513271`.
  - Manual frame review tại `10s`, `24s`, `36s` pass.
- API smoke render ngang pass:
  - Job: `add6e749-1b48-4b1b-b12e-2e329e2b68b2`.
  - Output: `outputs/add6e749-1b48-4b1b-b12e-2e329e2b68b2.mp4`.
  - `ffprobe`: `width=1920`, `height=1080`, `avg_frame_rate=30/1`, `duration=68.000000`, `size=3510306`.
  - Manual frame review từ API output tại `10s`, `24s`, `36s` pass.
- UI payload builder check pass:
  - `template.id=dynamic-story-horizontal`
  - `aspectRatio=16:9`
  - `resolution=1920x1080`
  - `scenes=6`

Bug bắt được:

- API render lần đầu ra MP4 hợp lệ nhưng blank vì backend không copy `templates/shared` vào render workdir.
- Đã sửa trong `backend/src/render/render-runner.js`.

## Dynamic Motion Video - Phase 0 Audit Cơ Chế Render Hiện Tại

### Objective

Làm rõ cơ chế render hiện tại của Hyper Video Tool trước khi thiết kế dynamic motion video. Phase này chỉ đọc code và cập nhật tài liệu; không sửa runtime, không thêm template mới, không đổi schema.

### Scope

Sẽ làm:

- Đọc mapper payload hiện tại.
- Đọc schema payload hiện tại.
- Đọc render runner/backend job hiện tại.
- Đọc template ngang và dọc hiện tại.
- Ghi lại flow render, điểm reuse được, điểm giới hạn.

Không làm:

- Không thêm dynamic scene contract.
- Không tạo duration resolver.
- Không tạo shared motion core.
- Không tạo template mới.
- Không nối UI/backend cho template mới.

### Files Impact

- MODIFY `.agents/tasks/current-task.md` - checklist và test report Phase 0.
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md` - cập nhật status Phase 0.

### Logic Changes

Không có thay đổi logic runtime trong Phase 0.

### Risk Assessment

- Tier Auto: đọc code và cập nhật tài liệu task.
- Rollback: revert thay đổi tài liệu nếu cần.
- Side effect runtime: không có.

### Dependency Map

Phase 0 audit -> Phase 1 dynamic scene contract -> Phase 2 duration resolver -> Phase 3 shared motion core -> Phase 4 template dọc dynamic.

### Audit Summary

Flow render hiện tại:

```text
UI/project data
-> `projectToRenderPayload()`
-> payload showcase cố định
-> `POST /api/render-jobs`
-> validate payload
-> copy template theo `payload.template.id` vào `.cache/render-jobs/{jobId}/composition`
-> ghi `render-payload.json`
-> gọi HyperFrames local runner
-> nếu bật voiceover thì generate MP3 trước render và mux audio sau render
-> ghi MP4 vào `outputs/{jobId}.mp4`
-> upsert output manifest
```

Điểm reuse được:

- Render runner đã generic ở mức copy template theo `payload.template.id`; đây là nền tốt để thêm template dynamic.
- Backend job queue, logs, output path, manifest và mux voiceover đã có sẵn.
- Template hiện tại đã đọc `render-payload.json` trong workdir và fallback sang sample payload khi preview.
- Template dọc đã có một phần item sequencing qua `features.displayMode = "sequence"` và `animateFeatureSequence()`.
- Text clamp/fallback/logo fallback đã có pattern dùng lại được.

Giới hạn cần sửa ở phase sau:

- `VIDEO_PRESETS` đang map cứng `16:9 -> project-showcase-90s` và `9:16 -> project-showcase-vertical-60s`.
- `SCENE_TYPES` bắt buộc đủ 7 scene showcase: `intro/problem/solution/features/timeline/impact/outro`.
- Mapper tạo payload bằng `SCENE_DURATIONS` hardcode, tổng thời lượng hiện là `74s`.
- Template ngang/dọc đều có `SCENE_TIMELINE` hardcode, chưa tính duration theo nội dung.
- Scene/media contract hiện chưa đủ tổng quát cho `title/text/media/cards/steps/outro`.
- Sequencing mới nằm chủ yếu ở `features` của template dọc; các scene khác vẫn reveal cụm nội dung cùng lúc.

### Checklist

- [x] Đọc flow mapper/schema/backend render runner.
- [x] Đọc template ngang `project-showcase-90s`.
- [x] Đọc template dọc `project-showcase-vertical-60s`.
- [x] Ghi summary cơ chế render hiện tại.
- [x] Ghi điểm reuse được và giới hạn cần sửa.
- [x] Cập nhật `.agents/tasks/dynamic-motion-video-roadmap.md` status Phase 0.
- [x] Điền Test Report Phase 0.

### Verification Plan

- Kiểm tra tài liệu Phase 0 có đủ summary flow, reuse points và limitations.
- Không chạy test runtime vì phase này chỉ audit tài liệu.

### Test Report

Status: passed

- Commands run:
  - `sed`/`nl` đọc `backend/src/render/project-to-render-payload.js`.
  - `sed`/`nl` đọc `backend/src/render/render-payload-schema.js`.
  - `sed`/`nl` đọc `backend/src/render/render-runner.js`.
  - `sed` đọc `backend/src/routes/render-jobs.js`.
  - `sed`/`nl` đọc `templates/project-showcase-90s/script.js`.
  - `sed`/`nl` đọc `templates/project-showcase-vertical-60s/script.js`.
  - `sed` đọc `backend/src/render/preflight.js`.
- Runtime tests: không chạy vì Phase 0 chỉ audit tài liệu, không đổi code runtime.
- Artifacts: `.agents/tasks/current-task.md` và `.agents/tasks/dynamic-motion-video-roadmap.md`.
- Remaining risks: Phase 1 cần quyết định schema dynamic nên đi song song payload riêng hay mở rộng validator backend ngay.

### Handoff

Chưa có.

## Dynamic Motion Video - Phase 1 Dynamic Scene Contract MVP

### Objective

Tạo payload mẫu cho dynamic motion video, đủ mô tả scene chỉ text, scene có media, scene có card/item, scene step-by-step và outro. Phase này không đổi backend schema để tránh ảnh hưởng render hiện tại.

### Scope

Đã làm:

- Tạo `data/dynamic-motion-payload.sample.json`.
- Định nghĩa scene fields: `id`, `type`, `headline`, `subtitle`, `body`, `items`, `media`, `motion`, `duration`.
- Định nghĩa scene types MVP: `title`, `text`, `media`, `cards`, `steps`, `outro`.
- Định nghĩa media contract: `assetId`, `type`, `placement`, `fit`, `focus`, `caption`.
- Giữ dynamic contract riêng, chưa validate bằng backend schema hiện tại.

Không làm:

- Chưa nối UI.
- Chưa thêm template mới.
- Chưa mở rộng `render-payload-schema.js`.
- Chưa migrate payload showcase cũ.

### Files Impact

- NEW `data/dynamic-motion-payload.sample.json`.
- MODIFY `.agents/tasks/current-task.md`.
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`.

### Logic Changes

Không có thay đổi logic runtime. Đây là contract/sample riêng cho phase dynamic template sau.

### Risk Assessment

- Tier Auto: thêm sample payload riêng không ảnh hưởng render hiện tại.
- Rollback: xóa `data/dynamic-motion-payload.sample.json`.

### Checklist

- [x] Tạo payload mẫu dynamic motion.
- [x] Bao phủ scene text/media/items/steps/outro.
- [x] Validate JSON parse.
- [x] Không sửa backend schema trong phase này.
- [x] Cập nhật roadmap status Phase 1.

### Test Report

Status: passed

- `node -e "JSON.parse(require('node:fs').readFileSync('data/dynamic-motion-payload.sample.json','utf8')); console.log('ok')"` pass.
- Runtime tests: không chạy vì Phase 1 chỉ thêm sample payload, chưa nối runtime.
- Remaining risks: Phase 2 cần duration resolver đọc được contract này và tính timeline plan ổn định.

## Dynamic Motion Video - Phase 2 Duration Resolver MVP

### Objective

Tạo helper tính thời lượng scene theo nội dung để template dynamic sau này không hardcode `60s/90s/120s` hoặc bảng scene cố định.

### Scope

Đã làm:

- Tạo `templates/shared/motion-core/duration.js`.
- Thêm `resolveSceneDuration(scene, options)`.
- Thêm `buildTimelinePlan(payload, options)`.
- Duration tính từ base scene type, số item, độ dài text và voiceover estimate.
- Có min/max clamp theo từng scene.
- Helper viết dạng dùng được trong Node test và browser template sau này.

Không làm:

- Chưa nối helper vào template cũ.
- Chưa tạo animation primitive.
- Chưa sync audio từng scene tuyệt đối.
- Chưa auto split text dài thành nhiều scene.

### Files Impact

- NEW `templates/shared/motion-core/duration.js`.
- NEW `templates/shared/motion-core/duration.test.js`.
- MODIFY `.agents/tasks/current-task.md`.
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`.

### Logic Changes

Chưa ảnh hưởng runtime hiện tại. Helper mới chỉ được test độc lập.

### Risk Assessment

- Tier Auto: helper mới chưa được import bởi template production.
- Rollback: xóa hai file trong `templates/shared/motion-core/`.

### Checklist

- [x] Tạo duration resolver.
- [x] Tạo timeline plan builder.
- [x] Test title scene min/max.
- [x] Test cards nhiều item dài hơn ít item.
- [x] Test media scene giữ minimum ổn định.
- [x] Test voiceover có thể kéo dài scene.
- [x] Test sample payload build timeline plan.

### Test Report

Status: passed

- `node --check templates/shared/motion-core/duration.js && node --check templates/shared/motion-core/duration.test.js` pass.
- `node templates/shared/motion-core/duration.test.js` pass: `duration tests passed`.
- Runtime render tests: chưa chạy vì helper chưa nối vào template.
- Remaining risks: Phase 3 cần animation primitives thật, không chỉ duration plan.

## Dynamic Motion Video - Phase 3 Shared Motion Core MVP

### Objective

Tạo lõi motion nhỏ dùng chung cho template dynamic: DOM helpers, duration helpers và GSAP animation primitives. Phase này vẫn chưa nối template production.

### Scope

Đã làm:

- Tạo `templates/shared/motion-core/dom.js`.
- Tạo `templates/shared/motion-core/animations.js`.
- Tạo `templates/shared/motion-core/index.js`.
- Tạo `templates/shared/motion-core/README.md`.
- Tạo `templates/shared/motion-core/motion-core.test.js`.
- Primitive hiện có:
  - `revealText`
  - `revealBlock`
  - `sequenceItems`
  - `spotlightItems`
  - `revealMedia`
  - `panMedia`
  - `transitionScene`

Không làm:

- Chưa tạo template `dynamic-story-vertical`.
- Chưa nối shared core vào template cũ.
- Chưa render MP4.
- Chưa thêm SFX/caption/background music.

### Files Impact

- NEW `templates/shared/motion-core/dom.js`.
- NEW `templates/shared/motion-core/animations.js`.
- NEW `templates/shared/motion-core/index.js`.
- NEW `templates/shared/motion-core/README.md`.
- NEW `templates/shared/motion-core/motion-core.test.js`.
- MODIFY `templates/shared/motion-core/duration.test.js` nếu cần test liên quan.
- MODIFY `.agents/tasks/current-task.md`.
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`.

### Logic Changes

Chưa ảnh hưởng runtime hiện tại. Shared core mới chỉ được test độc lập.

### Risk Assessment

- Tier Auto: shared core chưa được template production import.
- Rollback: xóa `templates/shared/motion-core/`.

### Checklist

- [x] Tạo DOM helper.
- [x] Tạo animation primitives.
- [x] Tạo entrypoint `MotionCore`.
- [x] Tạo README hướng dẫn browser usage.
- [x] Test primitive bằng fake timeline.
- [x] Chạy syntax check.

### Test Report

Status: passed

- `node --check templates/shared/motion-core/duration.js && node --check templates/shared/motion-core/dom.js && node --check templates/shared/motion-core/animations.js && node --check templates/shared/motion-core/index.js && node --check templates/shared/motion-core/duration.test.js && node --check templates/shared/motion-core/motion-core.test.js` pass.
- `node templates/shared/motion-core/duration.test.js && node templates/shared/motion-core/motion-core.test.js` pass:
  - `duration tests passed`
  - `motion core tests passed`
- Runtime render tests: chưa chạy vì Phase 4 mới tạo template dùng shared core.
- Remaining risks: cần browser/render verification ở Phase 4 vì fake timeline chưa chứng minh visual thực tế.

## Dynamic Motion Video - Phase 4 Dynamic Story Vertical Template MVP

### Objective

Tạo template dọc đầu tiên dùng dynamic scene contract và shared motion core, render được MP4 mẫu có motion theo nội dung thay vì show toàn bộ item cùng lúc.

### Scope

Đã làm:

- Tạo `templates/dynamic-story-vertical/`.
- Thêm `index.html`, `style.css`, `script.js`.
- Copy GSAP local vào `templates/dynamic-story-vertical/vendor/gsap.min.js`.
- Template đọc `render-payload.json` khi render trong workdir và fallback sang `data/dynamic-motion-payload.sample.json` khi preview trực tiếp từ project.
- Template render dynamic scene types:
  - `title`
  - `text`
  - `media`
  - `cards`
  - `steps`
  - `outro`
- Dùng `MotionCore.buildTimelinePlan()` để tính tổng duration theo payload.
- Dùng shared animation primitives:
  - `transitionScene`
  - `revealText`
  - `revealMedia`
  - `panMedia`
  - `sequenceItems`
  - `spotlightItems`
- Sửa `templates/shared/motion-core/animations.js` để `fromTo` của scene tương lai không immediate render đè scene hiện tại.
- Sửa template init timeline ngay khi script được parse để HyperFrames không bắt timeline bootstrap rỗng ở đầu video.

Không làm trong phase này:

- Chưa nối backend schema/API whitelist.
- Chưa thêm UI chọn template dynamic.
- Chưa làm template ngang.
- Chưa hỗ trợ upload asset thật trong UI.

### Files Impact

- NEW `templates/dynamic-story-vertical/index.html`
- NEW `templates/dynamic-story-vertical/style.css`
- NEW `templates/dynamic-story-vertical/script.js`
- NEW `templates/dynamic-story-vertical/vendor/gsap.min.js`
- MODIFY `templates/shared/motion-core/animations.js`
- MODIFY `data/dynamic-motion-payload.sample.json`
- MODIFY `.agents/tasks/current-task.md`
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`

### Logic Changes

- Dynamic vertical template tự dựng scene DOM từ payload.
- Duration lấy từ duration resolver thay vì timeline scene hardcode trong script.
- Item/card/step scene chạy từng item theo slot, không show hết cùng lúc.
- Media scene có reveal, caption và pan nhẹ.

### Risk Assessment

- Tier Auto: template mới chưa được backend whitelist, không ảnh hưởng template showcase hiện tại.
- Rollback: xóa `templates/dynamic-story-vertical/` và revert sửa shared animation core nếu cần.

### Checklist

- [x] Tạo template dọc dynamic.
- [x] Import GSAP local.
- [x] Import shared motion core.
- [x] Render scene từ payload mẫu.
- [x] Sequence item/card/step.
- [x] Media reveal/pan.
- [x] Lint HyperFrames pass.
- [x] Render MP4 pass.
- [x] FFprobe xác nhận `1080x1920`, `68s`.
- [x] Manual frame review xác nhận đầu video không blank.
- [x] Xóa file payload tạm trong template sau render.

### Test Report

Status: passed

- `node --check templates/dynamic-story-vertical/script.js` pass.
- `node templates/shared/motion-core/duration.test.js && node templates/shared/motion-core/motion-core.test.js` pass.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-vertical lint` pass `0 errors, 0 warnings`.
- Render command pass:
  - `node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-vertical render --output /private/tmp/hvt-dynamic-story-vertical.mp4`
- `ffprobe /private/tmp/hvt-dynamic-story-vertical.mp4`:
  - `width=1080`
  - `height=1920`
  - `avg_frame_rate=30/1`
  - `duration=68.000000`
  - `size=643436`
- Extracted frames reviewed:
  - `/tmp/hvt-dynamic-story-frames/frame_0_8.png`
  - `/tmp/hvt-dynamic-story-frames/frame_2.png`
  - `/tmp/hvt-dynamic-story-frames/frame_4.png`
  - `/tmp/hvt-dynamic-story-frames/frame_10.png`
  - `/tmp/hvt-dynamic-story-frames/frame_24.png`
- Remaining risks: backend/API chưa nhận template dynamic; đó là Phase 5.

## Dynamic Motion Video - Phase 5 Backend Template Whitelist Và API Render

### Objective

Cho backend render template `dynamic-story-vertical` qua `POST /api/render-jobs` bằng payload dynamic, không phá validator/template showcase hiện có.

### Scope

Đã làm:

- Thêm `TEMPLATE_PRESETS` trong `backend/src/render/render-payload-schema.js`.
- Whitelist `dynamic-story-vertical`.
- Giữ `VIDEO_PRESETS` làm default aspect-ratio mapping cũ cho payload showcase hiện tại.
- Thêm dynamic payload version `dynamic-motion-1.0.0`.
- Thêm dynamic scene validator riêng cho:
  - `title`
  - `text`
  - `media`
  - `cards`
  - `steps`
  - `outro`
- Preflight kiểm thêm dynamic sample payload và template dynamic.
- Mở rộng test payload để dynamic sample pass và mismatch horizontal settings fail.
- Smoke render API dynamic pass.

Không làm trong phase này:

- Chưa nối UI chọn dynamic template.
- Chưa đổi template mặc định.
- Chưa migrate showcase payload sang contract dynamic.
- Chưa làm template ngang dynamic.

### Files Impact

- MODIFY `backend/src/render/render-payload-schema.js`
- MODIFY `backend/src/render/preflight.js`
- MODIFY `backend/scripts/test-render-payload.js`
- MODIFY `.agents/tasks/current-task.md`
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`

### Logic Changes

- Backend hiện support nhiều template trên cùng aspect ratio thông qua `TEMPLATE_PRESETS`.
- `dynamic-story-vertical` dùng schema scene dynamic, còn `project-showcase-*` vẫn dùng schema showcase cũ.
- Render runner không cần đổi vì đã copy template theo `payload.template.id`.

### Risk Assessment

- Tier Confirm: validator backend thay đổi nhưng đã có regression `npm --prefix backend run check`.
- Rollback: revert schema/preflight/test nếu dynamic API cần tách route riêng về sau.

### Checklist

- [x] Whitelist template dynamic.
- [x] Validate dynamic payload sample.
- [x] Giữ showcase payload cũ pass.
- [x] Preflight kiểm template dynamic.
- [x] Backend check pass.
- [x] API smoke render dynamic pass.
- [x] FFprobe output API đúng `1080x1920`, `68s`.

### Test Report

Status: passed

- `npm --prefix backend run check` pass.
- `node -e "...getRenderPreflight()"` pass:
  - `status=ok`
  - `ready=true`
  - `checks=25`
  - `errors=[]`
- Backend local chạy tại `http://127.0.0.1:3000`.
- API smoke render dynamic pass:
  - `HVT_SMOKE_PAYLOAD_PATH=data/dynamic-motion-payload.sample.json HVT_SMOKE_EXPECT_RESOLUTION=1080x1920 HVT_SMOKE_TIMEOUT_MS=180000 npm --prefix backend run smoke:render-api`
  - Job: `32bbd36d-88e8-414b-bd08-7699e8d4dac4`
  - Output: `outputs/32bbd36d-88e8-414b-bd08-7699e8d4dac4.mp4`
  - Output size: `174909`
  - DurationMs: `31527`
- `ffprobe outputs/32bbd36d-88e8-414b-bd08-7699e8d4dac4.mp4`:
  - `width=1080`
  - `height=1920`
  - `avg_frame_rate=30/1`
  - `duration=68.000000`
- Server local đã tắt sau smoke test.
- Remaining risks: UI chưa build/gửi payload dynamic; đó là Phase 6.

## Dynamic Motion Video - Phase 6 UI Chọn Dynamic Template MVP

### Objective

Cho người dùng chọn render format dynamic trên Render page và render được MP4 `dynamic-story-vertical` từ dữ liệu UI hiện có.

### Scope

Đã làm:

- Thêm option `Dọc dynamic motion - 1080x1920` vào `RENDER_FORMATS`.
- Thêm `payloadType: "dynamic-motion"` cho format dynamic.
- Thêm nhánh `buildDynamicRenderPayload()` trong `frontend/scripts/common/render-preview.js`.
- Dynamic payload lấy dữ liệu từ:
  - brief/project metadata
  - features đang bật
  - milestones
  - logo/screenshot/video assets nếu usable
- Nếu chưa có media usable, payload dùng placeholder image để template vẫn render được.
- Sửa output manifest backend dùng `TEMPLATE_PRESETS` để output dynamic có tên `Dynamic Story Vertical`.
- UI render flow/poll/output hiện dùng lại cơ chế cũ.

Không làm trong phase này:

- Chưa làm editor scene dynamic.
- Chưa làm UI chỉnh motion preset từng scene.
- Chưa làm template ngang dynamic.
- Chưa sửa Preview page để preview dynamic scene trước render.

### Files Impact

- MODIFY `frontend/scripts/common/constants.js`
- MODIFY `frontend/scripts/common/render-preview.js`
- MODIFY `backend/src/render/output-manifest.js`
- MODIFY `.agents/tasks/current-task.md`
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`

### Logic Changes

- Render format dropdown có thêm dynamic vertical.
- Payload builder tự chọn schema showcase hoặc dynamic theo `renderFormat.payloadType`.
- Output manifest biết tên template dynamic.

### Risk Assessment

- Tier Confirm: UI payload dynamic MVP còn heuristic, chưa phải scene editor đầy đủ.
- Rollback: ẩn format `dynamic-story-vertical` khỏi `RENDER_FORMATS`.

### Checklist

- [x] Thêm option dynamic vào Render page.
- [x] Build payload dynamic từ AppState.
- [x] Syntax check frontend/backend file liên quan.
- [x] Backend check pass.
- [x] Browser smoke dropdown/payload pass.
- [x] UI end-to-end render dynamic pass.
- [x] FFprobe output UI đúng `1080x1920`, `68s`.

### Test Report

Status: passed

- `node --check frontend/scripts/common/constants.js && node --check frontend/scripts/common/render-preview.js && node --check backend/src/render/output-manifest.js` pass.
- `npm --prefix backend run check` pass.
- Browser smoke Render page pass:
  - URL: `http://127.0.0.1:3000/pages/render.html`
  - Dropdown options gồm `landscape-16x9`, `vertical-9x16`, `dynamic-story-vertical`.
  - `AppRender.buildRenderPayload(..., { formatId: "dynamic-story-vertical" })` trả payload:
    - `version=dynamic-motion-1.0.0`
    - `template.id=dynamic-story-vertical`
    - scenes `title/text/media/cards/steps/outro`
    - resolution `1080x1920`
- UI end-to-end render dynamic pass:
  - Output: `outputs/5f904c31-50d1-4016-80d0-3057f91368da.mp4`
  - Render page status `Hoàn tất`
  - Progress `100%`
  - Output local record `template=Dynamic Story Vertical`
  - Output local record `resolution=1080x1920`
- `ffprobe outputs/5f904c31-50d1-4016-80d0-3057f91368da.mp4`:
  - `width=1080`
  - `height=1920`
  - `avg_frame_rate=30/1`
  - `duration=68.000000`
- Server local đã tắt sau smoke test.
- Remaining risks: dynamic preview page chưa có; horizontal dynamic template là Phase 7.

## Goal hiện tại

Tiếp tục triển khai roadmap HyperFrames cho Hyper Video Tool theo các phase nhỏ, có review và test trước khi commit.

Project hiện đã có:

- UI tĩnh trong `frontend/`.
- Backend local Node HTTP trong `backend/`.
- Template HyperFrames `templates/project-showcase-90s/`.
- Render payload contract trong `data/render-payload.sample.json`.
- Render thật qua `POST /api/render-jobs`.
- Poll trạng thái render qua `GET /api/render-jobs/:id`.
- Preview/download MP4 qua `GET /api/outputs/:filename`.
- Danh sách output persist bằng runtime manifest `outputs/manifest.json`.
- Preflight render qua `GET /api/render-preflight`.

## Phase Hoàn Tất - Local GSAP Vendor MVP

### Objective

Loại bỏ phụ thuộc CDN GSAP trong template `project-showcase-90s` để render/preview ổn định hơn khi mạng yếu hoặc offline.

### Scope

Đã làm:

- Vendor `gsap.min.js` vào `templates/project-showcase-90s/vendor/`.
- Đổi `templates/project-showcase-90s/index.html` từ CDN sang script local.
- Cập nhật preflight để kiểm file local GSAP tồn tại.
- Cập nhật preflight để báo lỗi nếu template production dùng lại CDN GSAP.

Không làm trong phase này:

- Chưa vendor GSAP cho `templates/hyperframes-spike/` vì spike không nằm trong render flow chính.
- Chưa thay thế GSAP bằng animation runtime khác.

### Files impact

- `templates/project-showcase-90s/index.html`
- `templates/project-showcase-90s/vendor/gsap.min.js`
- `backend/src/render/preflight.js`
- `.agents/tasks/current-task.md`
- `.agents/tasks/hyperframes-roadmap.md`

### Test Report

Status: passed

- `npm --prefix backend run check` pass.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint` pass `0 errors, 0 warnings`.
- `rg` xác nhận production template dùng `vendor/gsap.min.js`, không còn CDN GSAP.
- Preflight direct check pass cho `Template local GSAP` và `Template local animation runtime`.
- HyperFrames render sample payload thật với local GSAP pass:
  - Output: `/private/tmp/hyper-video-tool-local-gsap.mp4`.
  - `duration=74.000000`.
  - `size=1540362`.
- Compile log không còn dòng `Inlined CDN script`.
- File payload tạm `templates/project-showcase-90s/render-payload.json` đã được xóa sau render test.

## Remaining roadmap sau phase này

- Cancel queued/running job nếu cần UX tốt hơn.
- Persist render jobs/logs qua backend restart nếu cần audit nội bộ.
- Explore-project workflow nối sang quy trình tạo brief/script cho video.

## Phase Vertical Video 1 - Contract Và Option Dọc

### Objective

Chuẩn hóa render payload để app hiểu cả video ngang `16:9` và video dọc `9:16` trước khi tạo template dọc.

### Scope

Đã làm:

- Thêm preset video backend cho `16:9` và `9:16`.
- Thêm metadata `video.aspectRatio` vào payload sample.
- Cho schema validate template id, aspect ratio và resolution tương ứng.
- Cho mapper sinh payload dọc `project-showcase-vertical-60s` với `1080x1920`.
- Thêm test contract cho payload dọc và case mismatch template/aspect.

Không làm trong phase này:

- Chưa tạo template dọc.
- Chưa render dọc end-to-end.
- Chưa đổi UI Render.

### Test Report

Status: passed

- `npm --prefix backend run payload:write` pass, cập nhật `data/render-payload.sample.json`.
- `npm --prefix backend run check` pass.
- Contract test xác nhận default ngang vẫn là `project-showcase-90s` `1920x1080`.
- Contract test xác nhận payload dọc là `project-showcase-vertical-60s` `1080x1920`.
- Contract test xác nhận payload dọc dùng template ngang bị reject.

Remaining risks:

- Backend runner vẫn chưa render template dọc cho tới Phase 3.

## Phase Vertical Video 2 - Template Dọc MVP

### Objective

Tạo template HyperFrames dọc `project-showcase-vertical-60s` có thể render MP4 `1080x1920` bằng payload mẫu.

### Scope

Đã làm:

- Tạo `templates/project-showcase-vertical-60s/`.
- Thêm `index.html`, `style.css`, `script.js`.
- Copy GSAP local vào `vendor/gsap.min.js`.
- Composition metadata:
  - `data-composition-id="project-showcase-vertical-60s"`
  - `data-width="1080"`
  - `data-height="1920"`
- Scene flow đủ: intro, problem, solution, features, timeline, impact, outro.
- Layout dọc một cột, feature cards và timeline dọc, text clamp chặt hơn template ngang.

Không làm trong phase này:

- Chưa nối backend runner whitelist.
- Chưa thêm UI chọn dọc/ngang.
- Chưa thêm audio/voiceover/subtitle.

### Test Report

Status: passed

- `node --check templates/project-showcase-vertical-60s/script.js` pass.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-vertical-60s lint` pass `0 errors, 0 warnings`.
- Chrome headless dump DOM pass qua `http://127.0.0.1:8017/templates/project-showcase-vertical-60s/index.html`; JS fill đủ dữ liệu sample vào scene DOM.
- Render trực tiếp trong sandbox fail ở browser probe cả template ngang và dọc; rerun ngoài sandbox pass.
- Render dọc bằng payload dọc tạm pass:
  - Output: `/private/tmp/hyper-video-tool-vertical-template-payload.mp4`.
  - `width=1080`.
  - `height=1920`.
  - `duration=74.000000`.
  - `size=2950067`.
- File payload tạm `templates/project-showcase-vertical-60s/render-payload.json` đã xóa sau test.

Remaining risks:

- Backend API chưa render dọc cho tới Phase 3.

## Phase Vertical Video 3 - Backend Render Dọc End-To-End

### Objective

Backend render runner hỗ trợ nhiều template và API render được payload dọc `project-showcase-vertical-60s` ra MP4 `1080x1920`.

### Scope

Đã làm:

- Đổi runner từ hardcode `project-showcase-90s` sang whitelist từ preset payload.
- Runner copy template theo `payload.template.id`.
- Job API trả thêm `aspectRatio`, `width`, `height`, `resolution`.
- Output manifest lưu thêm `aspectRatio`, `width`, `height`, `resolution`.
- Preflight kiểm cả template ngang và template dọc.
- Smoke script nhận payload path và expected resolution qua env để test dọc.

Không làm trong phase này:

- Chưa thêm UI chọn dọc/ngang.
- Chưa thêm cancel job thật.
- Chưa persist full job log qua restart.

### Test Report

Status: passed

- `npm --prefix backend run check` pass.
- `node -e "...getRenderPreflight()"` pass với `status=ok`, `checks=18`, `errors=[]`.
- Backend local chạy tại `http://127.0.0.1:3018`.
- `GET /api/render-preflight` pass, kiểm đủ template ngang và dọc.
- API smoke render dọc pass:
  - Command dùng `HVT_SMOKE_PAYLOAD_PATH=/private/tmp/hvt-vertical-payload.json`.
  - Job: `d594b9ec-49a2-4ea2-93d0-f0bead7f8c22`.
  - Output: `outputs/d594b9ec-49a2-4ea2-93d0-f0bead7f8c22.mp4`.
  - Manifest có `resolution=1080x1920`.
- `ffprobe outputs/d594b9ec-49a2-4ea2-93d0-f0bead7f8c22.mp4`:
  - `width=1080`.
  - `height=1920`.
  - `duration=74.000000`.
  - `size=2950067`.

Remaining risks:

- UI chưa build payload dọc cho tới Phase 4.

## Phase Vertical Video 4 - UI Chọn Dọc/Ngang End-To-End

### Objective

Người dùng chọn tỷ lệ video trên Render page và render được MP4 đúng tỷ lệ, Outputs page hiển thị đúng template/resolution.

### Scope

Đã làm:

- Thêm frontend render formats:
  - `Ngang 16:9 - 1920x1080`.
  - `Dọc 9:16 - 1080x1920`.
- Render page có selector tỷ lệ video.
- UI build payload dọc bằng template `project-showcase-vertical-60s`.
- Outputs local/backend record giữ `templateId`, `aspectRatio`, `resolution`.
- Modal preview output dùng aspect ratio `9/16` cho video dọc.
- README và backend README cập nhật cách test dọc.

Không làm trong phase này:

- Chưa thêm Preview page dọc.
- Chưa thêm nhiều style dọc.
- Chưa thêm audio/voiceover/subtitle.

### Test Report

Status: passed

- `npm --prefix backend run check` pass.
- `node --check frontend/scripts/common/constants.js && node --check frontend/scripts/common/render-preview.js && node --check frontend/scripts/common/ui-components.js` pass.
- Chrome headless Render page smoke pass:
  - Selector có `Ngang 16:9 - 1920x1080`.
  - Selector có `Dọc 9:16 - 1080x1920`.
  - Preflight panel status `Sẵn sàng`.
- UI end-to-end render dọc qua Chrome CDP pass:
  - Chọn `vertical-9x16`.
  - Bấm `Bắt đầu Render`.
  - Poll tới `Hoàn tất`, progress `100%`.
  - Output: `outputs/718e79e7-0e4e-41b6-afbb-3501271da478.mp4`.
- `ffprobe outputs/718e79e7-0e4e-41b6-afbb-3501271da478.mp4`:
  - `width=1080`.
  - `height=1920`.
  - `duration=74.000000`.
  - `size=2945527`.
- API/Outputs check pass:
  - `GET /api/outputs` có output dọc `Showcase Vertical 60s`, `aspectRatio=9:16`, `resolution=1080x1920`.
  - Outputs page smoke thấy output dọc `1080x1920`.
- Regression ngang pass:
  - `HVT_SMOKE_EXPECT_RESOLUTION=1920x1080 npm --prefix backend run smoke:render-api` pass.
  - Output: `outputs/d0e0d054-051e-47e0-91cd-5bd8627217e0.mp4`.
  - `ffprobe`: `width=1920`, `height=1080`, `duration=74.000000`, `size=1540362`.

Remaining risks:

- Preview page vẫn là preview ngang; roadmap đã để Future Scope.
