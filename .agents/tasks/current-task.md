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

## Phase Hoàn Tất - Async Render Queue MVP

### Objective

Chuyển render job từ request đồng bộ dài sang queue async tối thiểu để UI không bị treo khi bắt đầu render.

### Scope

Đã làm:

- `POST /api/render-jobs` validate payload, tạo job, đưa vào queue và trả `202` ngay.
- Backend xử lý queue 1 worker local bằng child process HyperFrames.
- `GET /api/render-jobs/:id` trả `queued/running/succeeded/failed`, `progress`, logs và metadata output.
- UI Render page gửi job rồi poll trạng thái tới khi hoàn tất.
- Output thành công vẫn ghi MP4 trong `outputs/` và manifest runtime.

Không làm trong phase này:

- Chưa có cancel job thật.
- Chưa có nhiều worker song song.
- Chưa persist full job queue/logs qua restart backend.
- Chưa có websocket/realtime push.

### Files impact

- `backend/src/render/render-runner.js`
- `backend/src/routes/render-jobs.js`
- `frontend/scripts/common/render-preview.js`
- `.agents/tasks/current-task.md`
- `.agents/tasks/hyperframes-roadmap.md`

### Test Report

Status: passed

- `node --check frontend/scripts/common/render-preview.js` pass.
- `npm --prefix backend run check` pass.
- `POST /api/render-jobs` trả `202` trong `28ms`, job ban đầu `queued`, progress `5`.
- Poll `GET /api/render-jobs/:id` quan sát job `running` nhiều vòng và kết thúc `succeeded`.
- Output API test: `outputs/46370514-be43-4921-aca6-b2b405c944c7.mp4`, `duration=74.000000`, `size=1652781`.
- `GET /api/outputs` thấy output vừa render trong manifest.
- `HEAD /api/outputs/46370514-be43-4921-aca6-b2b405c944c7.mp4` trả `200 OK`.
- Browser smoke test pass:
  - UI Render page nhận job backend.
  - Progress lên `100%`.
  - Status pill hiển thị `Hoàn tất`.
  - Console log có `Backend đã nhận job` và `Backend render thành công`.
  - `localStorage.hyper_video_outputs` có output backend `succeeded`.
  - Không có console error.

## Remaining roadmap sau phase này

- Hardening text overflow cho dữ liệu dài/ngắn.
- Local/vendor strategy cho thư viện template đang dùng CDN.
- Cancel queued/running job nếu cần UX tốt hơn.
- Persist render jobs/logs qua backend restart nếu cần audit nội bộ.
- Explore-project workflow nối sang quy trình tạo brief/script cho video.
