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
- Preview/download MP4 qua `GET /api/outputs/:filename`.
- Preflight render qua `GET /api/render-preflight`.

## Phase Hoàn Tất - Output Manifest MVP

### Objective

Backend lưu metadata video đã render vào manifest runtime để trang Outputs không phụ thuộc hoàn toàn vào `localStorage` của trình duyệt.

### Scope

Sẽ làm:

- Ghi manifest runtime sau khi render MP4 thành công.
- Thêm `GET /api/outputs` để trả danh sách video đã xuất.
- UI Outputs tự đồng bộ danh sách từ backend khi mở trang.
- Không commit MP4 hoặc manifest runtime.

Không làm trong phase này:

- Chưa xóa file MP4 thật từ UI.
- Chưa làm async render queue/poll.
- Chưa persist toàn bộ render job logs qua restart backend.

### Files impact

- `.gitignore`
- `backend/package.json`
- `backend/src/server.js`
- `backend/src/routes/outputs.js`
- `backend/src/render/render-runner.js`
- `backend/src/render/output-manifest.js`
- `frontend/scripts/common/render-preview.js`
- `frontend/scripts/common/ui-components.js`
- `.agents/tasks/current-task.md`
- `.agents/tasks/hyperframes-roadmap.md`

### Verification plan

Status: passed

- `node --check frontend/scripts/common/render-preview.js` pass.
- `node --check frontend/scripts/common/ui-components.js` pass.
- `npm --prefix backend run check` pass.
- `npm --prefix backend run payload:check` pass.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint` pass `0 errors, 0 warnings`.
- Render job thật qua `POST /api/render-jobs` pass.
- Output test: `outputs/a2f309b3-ef58-4e76-bafd-ee7fa1668774.mp4`, `duration=74.000000`, `size=1652781`.
- `GET /api/outputs` trả output vừa render.
- `HEAD /api/outputs/a2f309b3-ef58-4e76-bafd-ee7fa1668774.mp4` trả `200 OK`.
- Path traversal encoded vào `/api/outputs/%2e%2e%2fdata%2fsample-project.json` trả `400`.
- Browser smoke test pass: clear `localStorage`, mở `pages/outputs.html`, UI tự sync backend manifest và hiển thị video, không có console error.

## Remaining roadmap sau phase này

- Async queue/poll render để UI không bị request dài.
- Hardening text overflow cho dữ liệu dài/ngắn.
- Local/vendor strategy cho thư viện template đang dùng CDN.
- Explore-project workflow nối sang quy trình tạo brief/script cho video.
