# Roadmap HyperFrames Render

Roadmap này mô tả cách tích hợp HyperFrames để xuất video thật. Chưa triển khai code render thật trong phase hiện tại.

Tham chiếu chính: `heygen-com/hyperframes`.

## Mục Tiêu

Kết nối dữ liệu project từ Hyper Video Tool với template video và render ra MP4 local bằng HyperFrames.

Kết quả cuối cùng mong muốn:

- Project JSON được chuyển thành render payload rõ ràng.
- Template video đọc payload đó để tạo scene.
- Backend tạo render job và gọi HyperFrames.
- MP4 đầu ra nằm trong `outputs/`.
- UI Render/Outputs hiển thị trạng thái và kết quả thật.

## Nguyên Tắc

- Không gọi HyperFrames trực tiếp từ frontend.
- Backend là nơi kiểm tra dependency, tạo job, gọi render và ghi output.
- Template phải nhận dữ liệu qua payload/file JSON rõ ràng, không hardcode project vào template.
- Mỗi phase phải có một video/sample artifact hoặc log chứng minh.
- Không commit MP4 output thật.

## Phase 1 - Research Và Dependency Spike

### Objective

Hiểu cách cài, chạy và gọi HyperFrames trong môi trường local của project. Sau phase này phải có quyết định kỹ thuật rõ: dùng CLI, package API, hay wrapper script.

### Scope

Sẽ làm:

- Đọc tài liệu HyperFrames hiện tại.
- Xác định runtime/dependency cần thiết.
- Chạy render demo tối thiểu nếu dependency cho phép.
- Ghi lại lệnh chạy, input, output và lỗi thường gặp.
- Cập nhật quyết định kỹ thuật vào context.

Không làm:

- Chưa nối UI.
- Chưa render project thật.
- Chưa viết queue.
- Chưa tạo template production.

Files impact dự kiến:

- `.agents/context/hyperframes-notes.md`
- `.agents/tasks/current-task.md`
- Có thể thêm `backend/scripts/check-hyperframes.js` nếu cần spike có kiểm chứng.

Verification:

- Có lệnh kiểm tra HyperFrames chạy được hoặc report rõ blocker.
- Có ghi chú dependency chính xác.
- Nếu render demo được, output nằm ngoài git hoặc trong thư mục ignored.

Approval gate:

- User xác nhận bắt đầu research/spike trước khi cài dependency hoặc thêm Node backend.

### Status

Completed for initial setup, ngày 23/06/2026.

- Đã đọc docs chính thức và GitHub README.
- Đã tạo `templates/hyperframes-spike/`.
- `npx --yes hyperframes lint` pass `0 errors, 0 warnings`.
- Đã tạo local runner `backend/scripts/run-hyperframes-local.js`.
- `npm --prefix backend run hf:setup` tạo `.cache/hyperframes-runner/`.
- `npm --prefix backend run hf:doctor:spike` đủ Node 24, FFmpeg, FFprobe và Chrome cho local render; Docker thiếu nhưng optional.
- `npm --prefix backend run hf:lint:spike` pass `0 errors, 0 warnings`.
- `npm --prefix backend run hf:render:spike` render MP4 thành công tại `/private/tmp/hyper-video-tool-spike.mp4`.
- `ffprobe` xác nhận output `duration=5.000000`, `size=425203`.
- Node hệ thống hiện vẫn là `v20.16.0`; runner dùng Node 24 local để tránh phải cài global.

Next gate:

- Phase tiếp theo là Render Payload Contract, hoặc nối runner này vào backend render job API mock nếu user muốn.

## Phase 2 - Render Payload Contract

### Objective

Chuẩn hóa JSON contract giữa project data và template render. Sau phase này, template không phụ thuộc trực tiếp vào UI state.

### Scope

Sẽ làm:

- Định nghĩa render payload schema.
- Viết mapper từ project JSON sang payload.
- Chốt danh sách scene MVP: intro, problem, solution, features, timeline, result, outro.
- Thêm sample payload để test template.

Không làm:

- Chưa gọi render thật nếu Phase 1 chưa ổn.
- Chưa xử lý voiceover/audio.
- Chưa tạo editor timeline phức tạp.

Files impact dự kiến:

- `data/render-payload.sample.json`
- `backend/src/render/project-to-render-payload.js`
- `backend/src/render/render-payload-schema.js`
- `.agents/context/hyperframes-notes.md`
- `.agents/tasks/current-task.md`

Verification:

- Mapper tạo payload ổn định từ `data/sample-project.json`.
- Payload pass schema validation.
- Scene order đúng checklist MVP.

Approval gate:

- Chỉ implement khi Phase 1 có quyết định kỹ thuật.

## Phase 3 - Template Adapter MVP

### Objective

Làm template đọc render payload và dựng scene MVP. Sau phase này có thể render hoặc preview template với dữ liệu mẫu mà không sửa code template bằng tay.

### Scope

Sẽ làm:

- Refactor `templates/project-showcase-90s/` để đọc payload.
- Map field project vào scene.
- Bảo đảm layout template không vỡ với text tiếng Việt có dấu.
- Thêm fallback khi thiếu asset.

Không làm:

- Chưa làm nhiều template.
- Chưa làm animation phức tạp.
- Chưa thêm voiceover.

Files impact dự kiến:

- `templates/project-showcase-90s/index.html`
- `templates/project-showcase-90s/style.css`
- `templates/project-showcase-90s/script.js`
- `data/render-payload.sample.json`
- `.agents/tasks/current-task.md`

Verification:

- Mở template với sample payload.
- Tất cả scene chính có nội dung.
- Không lỗi console.
- Screenshot hoặc browser smoke test template.

Approval gate:

- Chỉ implement khi payload contract đã ổn.

### Status

Completed, ngày 23/06/2026.

- `templates/project-showcase-90s/` đã đọc được render payload sample khi preview qua static server root project.
- Template đã map đủ 7 scene MVP: intro, problem, solution, features, timeline, impact, outro.
- Template đã có HyperFrames composition metadata và timeline registry inline.
- `node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint` pass `0 errors, 0 warnings`.
- Render thử với payload tạm `render-payload.json` pass, xuất `/private/tmp/hyper-video-tool-project-showcase.mp4`.
- `ffprobe` xác nhận output `duration=74.000000`, `size=1652781`.

Next gate:

- Phase tiếp theo là Backend Render Runner: backend tạo working directory, ghi `render-payload.json`, gọi HyperFrames runner và lưu MP4 vào `outputs/`.

## Phase 4 - Backend Render Runner

### Objective

Backend có thể nhận render job, tạo payload, gọi HyperFrames và ghi MP4 vào `outputs/`.

### Scope

Sẽ làm:

- Render runner service trong `backend/`.
- Tạo working directory tạm cho mỗi job.
- Gọi HyperFrames bằng phương án đã chốt ở Phase 1.
- Ghi output MP4 và metadata.
- Capture logs, duration, exit code.

Không làm:

- Chưa queue nhiều worker.
- Chưa render cloud.
- Chưa retry phức tạp.

Files impact dự kiến:

- `backend/src/render/render-runner.js`
- `backend/src/render/render-job.js`
- `backend/src/routes/render-jobs.js`
- `outputs/.gitkeep`
- `.gitignore`
- `.agents/tasks/current-task.md`

Verification:

- Gửi render job từ API.
- Job tạo MP4 thật trong `outputs/`.
- Job failed có log rõ nếu HyperFrames lỗi.
- Không commit MP4.

Approval gate:

- Chỉ implement khi backend roadmap Phase 4 đã có render job API mock hoặc được user cho phép gộp có kiểm soát.

### Status

Completed as MVP, ngày 23/06/2026.

- Backend có `POST /api/render-jobs` nhận render payload và render đồng bộ bằng HyperFrames local runner.
- Backend có `GET /api/render-jobs/:id` đọc metadata job trong memory.
- Runner copy template vào `.cache/render-jobs/{jobId}/composition`, ghi `render-payload.json`, rồi xuất MP4 vào `outputs/{jobId}.mp4`.
- Smoke test với `data/render-payload.sample.json` pass, output `duration=74.000000`, `size=1652781`.

Remaining:

- Chưa async queue/poll thật cho UI.
- Chưa persist job metadata qua restart backend.
- Chưa có endpoint download/serve MP4.

## Phase 5 - UI Integration Với Render Thật

### Objective

UI Render và Outputs chuyển từ mock sang trạng thái render thật từ backend.

### Scope

Sẽ làm:

- Render page gọi API tạo job thật.
- Poll status/logs từ backend.
- Outputs page hiển thị file MP4 thật.
- Disable render nếu validation chưa đạt.
- Hiển thị lỗi HyperFrames rõ ràng.

Không làm:

- Chưa realtime websocket.
- Chưa batch render nhiều project.
- Chưa upload/share cloud.

Files impact dự kiến:

- `frontend/scripts/pages/render.js`
- `frontend/scripts/pages/outputs.js`
- `frontend/scripts/common/api.js`
- `frontend/styles/pages/render.css`
- `frontend/styles/pages/outputs.css`
- `.agents/tasks/current-task.md`

Verification:

- Tạo render job từ UI.
- Status/log cập nhật đúng.
- Sau khi xong, Outputs thấy video mới.
- Console không lỗi.

Approval gate:

- Chỉ implement khi backend render runner đã pass.

### Status

Completed as MVP, ngày 23/06/2026.

- Render page đã gọi `POST /api/render-jobs` thật.
- UI build render payload từ state/localStorage hiện tại.
- Browser end-to-end test pass: bấm Render từ UI, backend xuất MP4, Outputs page thấy video mới.
- Output test: `outputs/a8e20d64-965c-4034-a2e3-5060b760177e.mp4`, `duration=74.000000`, `size=1657098`.

Remaining:

- Chưa có async queue/poll UI.
- Đã có preview/download endpoint MVP cho MP4 ở phase sau.
- Outputs history vẫn lưu localStorage.

## Phase 6 - Render Quality Và Hardening

### Objective

Làm output video ổn định hơn cho dữ liệu thực tế của nhiều project nội bộ.

### Scope

Sẽ làm:

- Kiểm tra text overflow trong video scenes.
- Chuẩn hóa duration/scene pacing.
- Thêm preset chất lượng render.
- Thêm preflight check trước render.
- Ghi troubleshooting cho lỗi HyperFrames/FFmpeg.

Không làm:

- Chưa AI voiceover.
- Chưa multi-template marketplace.
- Chưa editor kéo thả timeline.

Files impact dự kiến:

- `templates/project-showcase-90s/style.css`
- `templates/project-showcase-90s/script.js`
- `backend/src/render/preflight.js`
- `backend/README.md`
- `.agents/context/hyperframes-notes.md`
- `.agents/tasks/current-task.md`

Verification:

- Render sample dài/ngắn đều không vỡ layout nghiêm trọng.
- Preflight phát hiện thiếu dependency hoặc thiếu data.
- Test report ghi rõ output artifact local.

Approval gate:

- Chỉ làm sau khi đã render được MP4 thật end-to-end.

### Status

In progress, ngày 23/06/2026.

- Đã thêm Render Preflight MVP:
  - `GET /api/render-preflight`
  - kiểm payload sample, template files, composition metadata, outputs folder, local runner files.
  - Render page hiển thị preflight panel và refresh button.
- Browser smoke test pass, endpoint trả `status=ok`, `ready=true`.

Remaining:

- Chưa kiểm text overflow nhiều bộ dữ liệu dài/ngắn.
- Chưa thêm local vendor cho GSAP CDN.
- Chưa async queue/poll render.

## Phase 7 - Output Manifest MVP

### Objective

Persist metadata video đã render ở backend để trang Outputs khôi phục được danh sách MP4 sau khi reload hoặc clear `localStorage`.

### Scope

Sẽ làm:

- Ghi `outputs/manifest.json` sau khi render job thành công.
- Thêm `GET /api/outputs` trả danh sách output còn tồn tại trên ổ đĩa.
- UI Outputs merge danh sách backend vào lịch sử local.
- Bảo đảm manifest runtime không bị commit.

Không làm:

- Chưa xóa MP4 thật từ UI.
- Chưa làm database.
- Chưa persist full render log/job queue.

Files impact dự kiến:

- `.gitignore`
- `backend/src/render/output-manifest.js`
- `backend/src/render/render-runner.js`
- `backend/src/routes/outputs.js`
- `backend/src/server.js`
- `frontend/scripts/common/render-preview.js`
- `frontend/scripts/common/ui-components.js`
- `.agents/tasks/current-task.md`

Verification:

- Render job thật tạo MP4 và ghi manifest.
- `GET /api/outputs` trả output vừa render.
- Outputs page load được video từ backend dù `localStorage` rỗng.
- Existing preview/download endpoint vẫn hoạt động.

### Status

Completed, ngày 23/06/2026.

- Backend ghi manifest runtime `outputs/manifest.json` sau render job thành công.
- `GET /api/outputs` trả danh sách output còn tồn tại.
- UI Outputs tự đồng bộ backend outputs vào lịch sử local khi mở trang.
- Manifest runtime và MP4 nằm trong `outputs/`, không commit vào git.
- Browser smoke test pass sau khi clear `localStorage`.

## Phase 8 - Async Render Queue MVP

### Objective

Chuyển render job từ request đồng bộ dài sang queue async tối thiểu để UI không bị giữ một request HTTP 40-60 giây khi bắt đầu render.

### Scope

Sẽ làm:

- `POST /api/render-jobs` tạo job và trả `202` ngay.
- Backend chạy render bằng queue 1 worker local.
- `GET /api/render-jobs/:id` trả status/progress/logs/output metadata.
- UI Render page poll job cho tới khi `succeeded` hoặc `failed`.

Không làm:

- Chưa websocket.
- Chưa nhiều worker.
- Chưa cancel job thật.
- Chưa persist full queue qua restart backend.

Files impact dự kiến:

- `backend/src/render/render-runner.js`
- `backend/src/routes/render-jobs.js`
- `frontend/scripts/common/render-preview.js`
- `.agents/tasks/current-task.md`

Verification:

- `POST /api/render-jobs` trả `202` nhanh, không chờ render xong.
- Poll job thấy trạng thái `running` rồi `succeeded`.
- MP4 vẫn được ghi vào `outputs/` và manifest.
- UI Render page hoàn tất qua polling, không console error.

### Status

Completed, ngày 23/06/2026.

- `POST /api/render-jobs` trả `202` trong test `28ms`.
- Poll job qua `GET /api/render-jobs/:id` pass, output render thành công.
- Browser smoke test Render page pass: UI nhận job, poll tới `Hoàn tất`, progress `100%`, output lưu local history.

## Future Scope

- Voiceover tự động.
- Nhiều template video.
- Render batch nhiều project.
- Render progress realtime bằng websocket.
- Desktop packaging hoặc installer.
- Tích hợp agent explore-project để tự sinh script/brief rồi đẩy vào render payload.
