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

## Phase Hoàn Tất - Template Text Hardening MVP

### Objective

Giảm rủi ro chữ tiếng Việt dài/ngắn làm vỡ layout video trong template `project-showcase-90s`.

### Scope

Đã làm:

- Thêm giới hạn text theo từng loại nội dung trong `templates/project-showcase-90s/script.js`.
- Chuẩn hóa whitespace trước khi render text.
- Gắn `data-truncated="true"` và `title` khi nội dung bị cắt.
- Thêm CSS `line-clamp`, `overflow-wrap`, `overflow hidden`, max width/height cho các block dễ tràn.
- Bảo vệ các scene: intro, problem, solution, features, timeline, impact, outro.

Không làm trong phase này:

- Chưa làm auto font scaling theo pixel chính xác.
- Chưa thêm screenshot regression test cố định vào repo.
- Chưa xử lý multi-template vì hiện MVP chỉ có `project-showcase-90s`.

### Files impact

- `templates/project-showcase-90s/script.js`
- `templates/project-showcase-90s/style.css`
- `.agents/tasks/current-task.md`
- `.agents/tasks/hyperframes-roadmap.md`

### Test Report

Status: passed

- `node --check templates/project-showcase-90s/script.js` pass.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint` pass `0 errors, 0 warnings`.
- `npm --prefix backend run check` pass.
- Browser stress test với payload cực dài pass:
  - 7 scene đều `sceneFitsVertical=true`.
  - 7 scene đều `sceneFitsHorizontal=true`.
  - Không có element tràn ngoài `#video-container`.
  - Có truncation đúng chỗ: intro 4, problem 3, solution 2, features 12, timeline 10, impact 2, outro 2.
  - Không có console error.
- HyperFrames render sample payload thật pass:
  - Output: `/private/tmp/hyper-video-tool-text-hardening-sample.mp4`.
  - `duration=74.000000`.
  - `size=1540362`.
- Ghi chú: có một render fallback trước đó cũng completed, nhưng test chính thức dùng sample payload tạm `render-payload.json` và đã xóa file tạm sau render.

## Remaining roadmap sau phase này

- Local/vendor strategy cho thư viện template đang dùng CDN.
- Cancel queued/running job nếu cần UX tốt hơn.
- Persist render jobs/logs qua backend restart nếu cần audit nội bộ.
- Explore-project workflow nối sang quy trình tạo brief/script cho video.
