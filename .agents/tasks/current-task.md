# Task Hiện Tại

## Trạng thái workflow

completed

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
