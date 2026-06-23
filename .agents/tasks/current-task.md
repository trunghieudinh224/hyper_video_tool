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
