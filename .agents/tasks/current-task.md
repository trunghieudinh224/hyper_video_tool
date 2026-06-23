# Task Hiện Tại

## Trạng thái workflow

completed

## Cập Nhật Cấu Trúc Thư Mục UI Và Backend

Đã chuẩn hóa cấu trúc project để chuẩn bị phase backend sau này:

- UI tĩnh chuyển từ `app/` sang `frontend/`.
- `frontend/index.html` là entry UI, dẫn tới `frontend/pages/overview.html`.
- `frontend/pages/`, `frontend/styles/`, `frontend/scripts/`, `frontend/shared/` giữ đúng mô hình multi-page tĩnh.
- Thêm `backend/README.md` làm ranh giới cho backend local ở phase sau.
- `data/` và `templates/` giữ ở root vì dữ liệu mẫu/template render sẽ được cả UI và backend dùng.
- Cập nhật `AGENTS.md`, `GEMINI.md`, rule UI và context để agent sau này không tạo UI vào `app/` nữa.

Backend vẫn chưa triển khai trong phase này.

## Roadmap Backend Và HyperFrames

Đã tạo roadmap phase-by-phase để chuẩn bị triển khai sau khi user review:

- `.agents/tasks/backend-roadmap.md`: backend local, static serve, project JSON API, asset upload, render job API mock, hardening.
- `.agents/tasks/hyperframes-roadmap.md`: research HyperFrames, render payload contract, template adapter, render runner, UI integration render thật, hardening.
- `.agents/rules/project-structure.md`: rule ranh giới `frontend/`, `backend/`, `data/`, `templates/`, `.agents/`.

Đã triển khai bước setup ban đầu theo hướng không làm full backend:

- Backend Phase 1 tối thiểu trong `backend/`: Node HTTP server, `/api/health`, serve UI từ `frontend/`.
- HyperFrames preflight script: `backend/scripts/check-hyperframes.js`.
- HyperFrames spike composition: `templates/hyperframes-spike/`.
- Ghi chú kết quả setup: `.agents/context/hyperframes-notes.md`.

Chưa làm Project JSON API, upload asset, render queue thật hoặc full backend.

### Test Report - Backend Phase 1 Và HyperFrames Setup

Status: passed for initial setup

- Passed:
  - `npm --prefix backend run check` pass.
  - Backend server chạy được với `HVT_PORT=3010 npm --prefix backend start`.
  - `GET http://127.0.0.1:3010/api/health` trả JSON success.
  - `GET http://127.0.0.1:3010/` trả `200 OK`.
  - `GET http://127.0.0.1:3010/pages/overview.html` trả `200 OK`.
  - `GET http://127.0.0.1:3010/api/unknown` trả JSON lỗi chuẩn.
  - `npx --yes hyperframes lint` trong `templates/hyperframes-spike/` pass `0 errors, 0 warnings`.
  - `npm --prefix backend run hf:setup` pass, tạo local runner trong `.cache/hyperframes-runner/` bằng lockfile.
  - `npm --prefix backend run hf:doctor:spike` pass cho local render requirements: Node 24, FFmpeg, FFprobe, Chrome. Docker thiếu nhưng optional.
  - `npm --prefix backend run hf:lint:spike` pass `0 errors, 0 warnings`.
  - `npm --prefix backend run hf:render:spike` pass, xuất `/private/tmp/hyper-video-tool-spike.mp4`.
- `.cache/hyperframes-runner/bin/ffprobe ... /private/tmp/hyper-video-tool-spike.mp4` xác nhận `duration=5.000000`, `size=425203`.
- Review fixes:
  - Runner kiểm đủ `node`, `hyperframes`, `ffmpeg-static`, `ffprobe-static` trước khi skip install.
  - Runner dùng `npm ci` từ `backend/hyperframes-runner-package-lock.json`.
  - Static server xử lý `HEAD` không stream body.
  - `/api/health` không trả absolute local path nữa.
- Known system/global limitation:
  - `npm --prefix backend run check:hyperframes` fail vì Node hệ thống là `v20.16.0`, trong khi HyperFrames docs yêu cầu Node.js 22+.
  - `npm --prefix backend run check:hyperframes` fail vì thiếu `ffmpeg`.
  - `npx --yes hyperframes render --output /private/tmp/hyper-video-tool-spike.mp4` nếu chạy trực tiếp bằng system env sẽ fail vì thiếu FFmpeg/FFprobe.

Commands run:

```bash
npm --prefix backend run check
npm --prefix backend run check:hyperframes
npm --prefix backend run hf:setup
npm --prefix backend run hf:doctor:spike
npm --prefix backend run hf:lint:spike
npm --prefix backend run hf:render:spike
rm -rf .cache/hyperframes-runner
npm --prefix backend run hf:setup
rm -rf .cache/hyperframes-runner/node_modules/ffmpeg-static
npm --prefix backend run hf:setup
HVT_PORT=3010 npm --prefix backend start
curl -s http://127.0.0.1:3010/api/health
curl -s -I http://127.0.0.1:3010/
curl -s -I http://127.0.0.1:3010/pages/overview.html
curl -s http://127.0.0.1:3010/api/unknown
npx --yes hyperframes lint
npx --yes hyperframes doctor
npx --yes hyperframes render --output /private/tmp/hyper-video-tool-spike.mp4
.cache/hyperframes-runner/bin/ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 /private/tmp/hyper-video-tool-spike.mp4
```

Remaining risks:

- Local runner hiện phục vụ spike render tốt, nhưng chưa nối vào backend render job API.
- System/global environment vẫn chưa đủ nếu user muốn gọi `npx hyperframes render` trực tiếp ngoài runner.
- Chưa làm project JSON API, upload asset, render queue hoặc render từ dữ liệu UI thật.

## Phase Hiện Tại - Render Payload Contract

### Objective

Chuẩn hóa contract JSON trung gian giữa project data và template HyperFrames. Sau phase này, `data/sample-project.json` có thể được map thành render payload ổn định, có schema validate cơ bản và sample output để template adapter phase sau sử dụng.

### Scope

Sẽ làm:

- Tạo schema validate render payload bằng JavaScript thuần, không thêm dependency.
- Tạo mapper từ project JSON sang payload gồm 7 scene MVP: intro, problem, solution, features, timeline, impact, outro.
- Tạo script sinh `data/render-payload.sample.json` từ `data/sample-project.json`.
- Thêm npm script để kiểm tra/sinh payload.
- Cập nhật Test Report sau khi chạy test.

Không làm trong phase này:

- Không refactor template HyperFrames để đọc payload.
- Không gọi render bằng payload mới.
- Không tạo API backend.
- Không nối UI Render page.

Files impact:

- `backend/src/render/render-payload-schema.js`
- `backend/src/render/project-to-render-payload.js`
- `backend/scripts/generate-render-payload-sample.js`
- `backend/scripts/test-render-payload.js`
- `backend/package.json`
- `data/render-payload.sample.json`
- `.agents/tasks/current-task.md`

Verification plan:

- `npm --prefix backend run check`
- `npm --prefix backend run payload:check`
- `npm --prefix backend run payload:write`
- So sánh sample payload sinh ra không làm dirty sau khi chạy lại.

### Test Report - Render Payload Contract

Status: passed

- Created:
  - `backend/src/render/render-payload-schema.js`
  - `backend/src/render/project-to-render-payload.js`
  - `backend/scripts/generate-render-payload-sample.js`
  - `backend/scripts/test-render-payload.js`
  - `data/render-payload.sample.json`
- Passed:
  - Mapper sinh payload từ `data/sample-project.json`.
  - Payload có đủ 7 scene MVP theo thứ tự: intro, problem, solution, features, timeline, impact, outro.
  - Payload pass schema validation.
  - Sample payload up to date.
  - Fallback payload từ input rỗng vẫn hợp lệ.
  - HyperFrames spike lint vẫn pass.

Commands run:

```bash
npm --prefix backend run payload:write
npm --prefix backend run payload:check
npm --prefix backend run payload:test
npm --prefix backend run check
npm --prefix backend run hf:lint:spike
```

Remaining risks:

- Template HyperFrames chưa đọc payload này; đó là phase tiếp theo.
- Payload contract hiện mới validate shape cơ bản, chưa enforce giới hạn độ dài text cho từng scene.

## Phase Hiện Tại - Template Adapter MVP

### Objective

Refactor template `project-showcase-90s` để đọc render payload mẫu và dựng đủ scene MVP. Sau phase này template có thể preview bằng `data/render-payload.sample.json` mà không cần sửa hardcode trong template.

### Scope

Sẽ làm:

- Template tự đọc `data/render-payload.sample.json` khi mở qua static server ở root project.
- Template hỗ trợ `postMessage` action `updatePayload` để UI/backend phase sau bơm payload mới vào preview.
- Giữ tương thích action cũ `updateData` ở mức adapter để preview UI cũ chưa bị gãy ngay.
- Map đủ 7 scene MVP: intro, problem, solution, features, timeline, impact, outro.
- Dùng DOM API và `textContent` cho nội dung động, tránh render HTML string từ dữ liệu người dùng.
- Thêm fallback khi thiếu field hoặc thiếu asset logo.
- Chỉnh CSS template để không phụ thuộc biến CSS của UI app.

Không làm trong phase này:

- Không gọi HyperFrames render thật bằng template này.
- Không làm animation phức tạp.
- Không thêm voiceover/audio.
- Không nối Render page của UI với backend.

Files impact:

- `templates/project-showcase-90s/index.html`
- `templates/project-showcase-90s/script.js`
- `.agents/tasks/current-task.md`

Verification plan:

- `node --check templates/project-showcase-90s/script.js`
- Browser smoke test mở template qua static server ở root project.
- Xác nhận template đọc sample payload, có đủ 7 scene và không lỗi console.
- `npm --prefix backend run check`
- `npm --prefix backend run payload:check`
- `npm --prefix backend run hf:lint:spike`

### Test Report - Template Adapter MVP

Status: passed

- Created/updated:
  - `templates/project-showcase-90s/index.html`
  - `templates/project-showcase-90s/style.css`
  - `templates/project-showcase-90s/script.js`
- Template tự đọc `data/render-payload.sample.json` khi mở qua static server root project.
- Template render đủ 7 scene MVP: intro, problem, solution, features, timeline, impact, outro.
- Features scene render 4 tính năng từ payload.
- Timeline scene render 5 cột mốc từ payload.
- `postMessage` action `updatePayload` đã được smoke test, đổi được nội dung title/features/timeline bằng payload động.
- Giữ adapter cho action cũ `updateData`.
- Nội dung động render bằng DOM API và `textContent`, không dùng HTML string từ dữ liệu nhập.
- Browser smoke test bằng Google Chrome headless:
  - URL: `http://127.0.0.1:8123/templates/project-showcase-90s/index.html`
  - `#intro-title`: `Internal Analytics Dashboard`
  - `.feature-item`: 4
  - `.timeline-node`: 5
  - `.scene`: 7
  - Console/page errors: none
- Visual smoke test timeline scene không còn chồng scene cũ sau transition, title timeline đọc được hơn.

Commands run:

```bash
node --check templates/project-showcase-90s/script.js
npm --prefix backend run check
npm --prefix backend run payload:check
npm --prefix backend run hf:lint:spike
python3 -m http.server 8123 --bind 127.0.0.1
```

Remaining risks:

- Template này hiện mới là preview HTML đọc payload, chưa phải HyperFrames composition production.
- Backend hiện chưa expose `templates/` và `data/`; browser smoke test phase này dùng static server root project.
- Chưa nối UI Preview/Render page với action `updatePayload`.

## Phase Hiện Tại - HyperFrames Composition Compatibility

### Objective

Làm `templates/project-showcase-90s` trở thành HyperFrames composition hợp lệ. Sau phase này template payload hiện tại phải lint và render được bằng HyperFrames local runner, thay vì chỉ preview trong browser.

### Scope

Sẽ làm:

- Thêm `data-composition-id`, width/height và metadata cần thiết cho composition root.
- Thêm clip metadata cho 7 scene theo timeline MVP.
- Đăng ký `window.__timelines["project-showcase-90s"]` để HyperFrames điều khiển scene.
- Giữ khả năng preview bằng `showScene` và `updatePayload`.
- Render thử MP4 ngoài git để chứng minh template chạy được.

Không làm trong phase này:

- Không tạo backend render API.
- Không nối UI Render page.
- Không thêm voiceover/audio.
- Không làm nhiều template.

Files impact:

- `templates/project-showcase-90s/index.html`
- `templates/project-showcase-90s/style.css`
- `templates/project-showcase-90s/script.js`
- `.agents/tasks/current-task.md`

Verification plan:

- `node --check templates/project-showcase-90s/script.js`
- `node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint`
- `node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s render --output /private/tmp/hyper-video-tool-project-showcase.mp4`
- `ffprobe` output MP4 để xác nhận duration/size.
- Browser smoke test nhanh để đảm bảo preview cũ không gãy.

### Test Report - HyperFrames Composition Compatibility

Status: passed

- Updated:
  - `templates/project-showcase-90s/index.html`
  - `templates/project-showcase-90s/script.js`
- Template `project-showcase-90s` hiện có:
  - `data-composition-id="project-showcase-90s"`
  - `data-width="1920"`
  - `data-height="1080"`
  - Clip metadata cho 7 scene theo timeline 74 giây.
  - `window.__timelines["project-showcase-90s"]` đăng ký inline trong HTML để HyperFrames lint/render nhận được.
- Template tự chọn path payload theo runtime:
  - Khi chạy qua static server root project: `../../data/render-payload.sample.json`.
  - Khi chạy trong HyperFrames working dir: `./render-payload.json`.
- Browser preview vẫn hoạt động:
  - `#intro-title`: `Internal Analytics Dashboard`
  - `.feature-item`: 4
  - `.timeline-node`: 5
  - `.scene`: 7
  - `window.__timelines["project-showcase-90s"]`: true
  - `postMessage showScene` chuyển được sang `scene-timeline`
  - Console/page errors: none
- HyperFrames render test:
  - Tạo `templates/project-showcase-90s/render-payload.json` tạm từ `data/render-payload.sample.json`.
  - Render output: `/private/tmp/hyper-video-tool-project-showcase.mp4`.
  - Xóa payload tạm sau render, không commit.
  - `ffprobe`: `duration=74.000000`, `size=1652781`.
- Ghi chú review:
  - Render thử đầu tiên từng pass nhưng dùng fallback vì HyperFrames file server không serve được `../../data/render-payload.sample.json`; kết quả đó không tính là pass.
  - Đã sửa bằng cơ chế `./render-payload.json` cho working dir, phù hợp với phase Backend Render Runner sau này.

Commands run:

```bash
node --check templates/project-showcase-90s/script.js
node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint
cp data/render-payload.sample.json templates/project-showcase-90s/render-payload.json
node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s render --output /private/tmp/hyper-video-tool-project-showcase.mp4
rm -f templates/project-showcase-90s/render-payload.json
.cache/hyperframes-runner/bin/ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 /private/tmp/hyper-video-tool-project-showcase.mp4
python3 -m http.server 8123 --bind 127.0.0.1
npm --prefix backend run check
npm --prefix backend run payload:check
npm --prefix backend run hf:lint:spike
git diff --check
```

Remaining risks:

- Backend Render Runner chưa tạo `render-payload.json` tự động; đó là phase kế tiếp.
- Template dùng GSAP CDN giống spike hiện tại; nếu offline hoàn toàn, render có thể cần vendor local ở phase hardening.

## Phase Hiện Tại - Backend Render Runner MVP

### Objective

Thêm backend render job API tối thiểu để render payload hiện tại thành MP4 thật bằng HyperFrames local runner. Sau phase này có thể gọi API local, backend tự tạo working directory, ghi `render-payload.json`, render template `project-showcase-90s` và lưu output vào `outputs/`.

### Scope

Sẽ làm:

- Thêm render runner service trong `backend/src/render/`.
- Thêm route `POST /api/render-jobs` nhận render payload JSON và render đồng bộ.
- Thêm route `GET /api/render-jobs/:id` trả metadata job trong memory.
- Validate payload bằng schema hiện có trước khi render.
- Copy template vào `.cache/render-jobs/{jobId}/composition`.
- Ghi `render-payload.json` vào working dir để template đọc khi HyperFrames render.
- Ghi MP4 vào `outputs/{jobId}.mp4`.
- Capture stdout/stderr cơ bản và sanitize project root trong log trả về.

Không làm trong phase này:

- Không nối UI Render/Outputs.
- Không làm queue async nhiều worker.
- Không persist job metadata qua restart backend.
- Không làm download endpoint riêng cho MP4.
- Không thêm auth/cloud/database.

Files impact:

- `backend/src/render/render-runner.js`
- `backend/src/routes/render-jobs.js`
- `backend/src/server.js`
- `backend/package.json`
- `.agents/tasks/current-task.md`

Verification plan:

- `npm --prefix backend run check`
- Chạy backend local.
- `POST /api/render-jobs` với `data/render-payload.sample.json`.
- Xác nhận response `status=succeeded`, output path nằm trong `outputs/`.
- `GET /api/render-jobs/:id` trả lại metadata.
- `ffprobe outputs/{jobId}.mp4` xác nhận duration/size.

### Test Report - Backend Render Runner MVP

Status: passed

- Created:
  - `backend/src/render/render-runner.js`
  - `backend/src/routes/render-jobs.js`
- Updated:
  - `backend/src/server.js`
  - `backend/package.json`
- API added:
  - `POST /api/render-jobs`
  - `GET /api/render-jobs/:id`
- Render flow verified:
  - Validate render payload bằng schema hiện có.
  - Tạo job id bằng `crypto.randomUUID()`.
  - Copy template `templates/project-showcase-90s` vào `.cache/render-jobs/{jobId}/composition`.
  - Ghi `render-payload.json` vào working dir.
  - Gọi `backend/scripts/run-hyperframes-local.js`.
  - Xuất MP4 vào `outputs/{jobId}.mp4`.
  - Job metadata lưu trong memory cho `GET /api/render-jobs/:id`.
  - Logs trả về đã sanitize project root absolute path.
- Render API smoke test:
  - Server: `HVT_PORT=3011 npm --prefix backend start`
  - Payload: `data/render-payload.sample.json`
  - Response: `success=true`, `status=succeeded`
  - Job id: `f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf`
  - Output: `outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4`
  - Output size: `1652781`
  - Render duration: `44111ms`
  - `ffprobe`: `duration=74.000000`, `size=1652781`
- `GET /api/render-jobs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf` trả lại metadata job `succeeded`.
- Invalid payload smoke test:
  - Body: `{"version":"invalid"}`
  - HTTP status: `422`
  - Response: `success=false`, message `Render payload validation failed.`

Commands run:

```bash
npm --prefix backend run check
HVT_PORT=3011 npm --prefix backend start
curl -sS -X POST http://127.0.0.1:3011/api/render-jobs -H 'Content-Type: application/json' --data-binary @data/render-payload.sample.json
curl -sS http://127.0.0.1:3011/api/render-jobs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf
.cache/hyperframes-runner/bin/ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4
printf '{"version":"invalid"}' | curl -sS -o /tmp/hvt-render-invalid-response.json -w '%{http_code}\n' -X POST http://127.0.0.1:3011/api/render-jobs -H 'Content-Type: application/json' --data-binary @-
npm --prefix backend run payload:check
node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint
npm --prefix backend run hf:lint:spike
git diff --check
```

Remaining risks:

- Render API hiện chạy đồng bộ nên request sẽ chờ khoảng 35-45 giây; phase sau nên chuyển sang async job/poll nếu nối UI.
- Job metadata đang lưu memory, restart server sẽ mất trạng thái job cũ.
- Chưa có endpoint download/serve MP4; output path hiện là local relative path.
- Output MP4 trong `outputs/` được ignore, không commit.

## Phase Hiện Tại - UI Integration Với Render Thật

### Objective

Nối màn hình Render của UI với backend render API thật. Sau phase này người dùng chạy app qua backend local, bấm Render trong UI, backend tạo MP4 bằng HyperFrames và Outputs page hiển thị metadata video đã render.

### Scope

Sẽ làm:

- Thêm frontend helper build render payload từ state UI hiện tại.
- Thêm frontend API client gọi `POST /api/render-jobs`.
- Đổi Render page từ giả lập sang gọi backend thật.
- Lưu output render thành công vào `localStorage` để Outputs page thấy video mới.
- Cập nhật Outputs page hiển thị job id, output path và size thật.
- Giữ thông báo rõ khi mở UI bằng file/static server không có backend API.

Không làm trong phase này:

- Không làm async queue/poll UI vì backend hiện vẫn render đồng bộ.
- Không thêm endpoint download/serve MP4.
- Không đổi kiến trúc backend sang persisted job store.
- Không làm responsive.

Files impact:

- `frontend/scripts/common/render-preview.js`
- `frontend/scripts/common/ui-components.js`
- `frontend/pages/render.html`
- `.agents/tasks/current-task.md`

Verification plan:

- `node --check frontend/scripts/common/render-preview.js`
- `node --check frontend/scripts/common/ui-components.js`
- `npm --prefix backend run check`
- Chạy backend local và test UI Render page bằng browser.
- Bấm Render, chờ API trả success, xác nhận Outputs page có record mới.
- `ffprobe outputs/{jobId}.mp4` xác nhận video thật.

### Test Report - UI Integration Với Render Thật

Status: passed

- Updated:
  - `frontend/scripts/common/render-preview.js`
  - `frontend/scripts/common/ui-components.js`
- Render page hiện gọi backend thật:
  - Build render payload từ state UI hiện tại.
  - `POST /api/render-jobs`.
  - Progress UI chuyển `12% -> 35% -> 100%`.
  - Console log giữ lại thông báo backend render thành công.
  - Output thành công được lưu vào `localStorage` key `hyper_video_outputs`.
- Outputs page hiện hiển thị output thật:
  - `jobId`
  - `filename`
  - `outputPath`
  - `size`
  - `durationMs`
  - modal chi tiết không còn gọi đây là mock MP4.
- Browser end-to-end test bằng Google Chrome headless:
  - URL: `http://127.0.0.1:3012/pages/overview.html`
  - Load dữ liệu mẫu bằng nút `Tải dữ liệu mẫu thử nghiệm`.
  - Vào Render page bằng nút `Đi tới Render Video`.
  - Render button enabled.
  - Click `Bắt đầu Render`.
  - API response: `POST /api/render-jobs` trả HTTP `201`.
  - Render status: `Hoàn tất`.
  - Progress: `100%`.
  - Console có `Backend render thành công`.
  - Outputs page header: `Video đã xuất (1)`.
  - Output path: `outputs/a8e20d64-965c-4034-a2e3-5060b760177e.mp4`.
- `ffprobe` output MP4 từ UI render:
  - `duration=74.000000`
  - `size=1657098`

Commands run:

```bash
node --check frontend/scripts/common/render-preview.js
node --check frontend/scripts/common/ui-components.js
npm --prefix backend run check
npm --prefix backend run payload:check
node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint
HVT_PORT=3012 npm --prefix backend start
.cache/hyperframes-runner/bin/ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 outputs/a8e20d64-965c-4034-a2e3-5060b760177e.mp4
git diff --check
```

Remaining risks:

- Backend render API vẫn chạy đồng bộ nên UI phải chờ request hoàn tất, chưa có polling/job async thật.
- UI chưa có nút download/play trực tiếp MP4 vì backend chưa expose output files.
- Outputs history vẫn lưu trong localStorage, chưa persist backend manifest.

## Phase Hiện Tại - Output Serve/Download MVP

### Objective

Cho phép UI mở xem và tải MP4 đã render qua backend local. Sau phase này Outputs page không chỉ hiển thị path, mà có thể preview video trong modal và download file từ `outputs/`.

### Scope

Sẽ làm:

- Thêm route backend `GET /api/outputs/:filename` serve file MP4 trong `outputs/`.
- Chặn path traversal và filename không hợp lệ.
- Hỗ trợ `HEAD /api/outputs/:filename`.
- Hỗ trợ download bằng query `?download=1`.
- Cập nhật Outputs modal để dùng `<video controls>` với URL backend thật.
- Thêm link tải MP4 trong modal chi tiết.

Không làm trong phase này:

- Không tạo manifest output backend.
- Không list outputs từ backend.
- Không stream range request nâng cao.
- Không xóa file MP4 thật từ UI.

Files impact:

- `backend/src/routes/outputs.js`
- `backend/src/server.js`
- `backend/package.json`
- `frontend/scripts/common/ui-components.js`
- `.agents/tasks/current-task.md`

Verification plan:

- `npm --prefix backend run check`
- Chạy backend local.
- `GET /api/outputs/{filename}.mp4` trả `200` và `Content-Type: video/mp4`.
- `HEAD /api/outputs/{filename}.mp4` trả `200`.
- `GET /api/outputs/../data/sample-project.json` không đọc được file ngoài `outputs/`.
- Browser smoke test Outputs modal có video `src` và download link đúng.

### Test Report - Output Serve/Download MVP

Status: passed

- Created:
  - `backend/src/routes/outputs.js`
- Updated:
  - `backend/src/config.js`
  - `backend/src/server.js`
  - `backend/package.json`
  - `frontend/scripts/common/ui-components.js`
- Backend API added:
  - `GET /api/outputs/:filename`
  - `HEAD /api/outputs/:filename`
  - `GET /api/outputs/:filename?download=1`
- Route safety:
  - Chỉ nhận filename match pattern `[a-zA-Z0-9_-]+.mp4`.
  - Request encoded traversal `%2e%2e%2fdata%2fsample-project.json` trả `400`.
  - Request `../data/sample-project.json` không đọc được file ngoài `outputs/`.
- Route smoke test:
  - `HEAD /api/outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4`: `200`, `Content-Type: video/mp4`.
  - `GET /api/outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4`: `200`, downloaded `1652781` bytes.
  - `GET /api/outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4?download=1`: có `Content-Disposition: attachment`.
  - `ffprobe` downloaded file: `duration=74.000000`, `size=1652781`.
- Browser smoke test Outputs modal:
  - `video src`: `/api/outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4`
  - download href: `/api/outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4?download=1`
  - modal hiển thị output path.
  - Console/page errors: none.

Commands run:

```bash
node --check frontend/scripts/common/ui-components.js
npm --prefix backend run check
HVT_PORT=3013 npm --prefix backend start
curl -sS -I http://127.0.0.1:3013/api/outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4
curl -sS -I "http://127.0.0.1:3013/api/outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4?download=1"
curl -sS -o /tmp/hvt-output-download-test.mp4 -w "%{http_code} %{size_download}\n" http://127.0.0.1:3013/api/outputs/f0294c7f-ae99-4e1e-8aa1-ea5e4cc226bf.mp4
.cache/hyperframes-runner/bin/ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 /tmp/hvt-output-download-test.mp4
curl -sS -o /tmp/hvt-traversal-2.json -w "%{http_code}\n" "http://127.0.0.1:3013/api/outputs/%2e%2e%2fdata%2fsample-project.json"
npm --prefix backend run payload:check
node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint
git diff --check
```

Remaining risks:

- Chưa có list outputs từ backend manifest; Outputs page vẫn dựa vào localStorage.
- Chưa hỗ trợ HTTP Range request tối ưu cho seek video dài.

## Phase Hiện Tại - Render Preflight MVP

### Objective

Thêm preflight check để người dùng biết môi trường render local đã sẵn sàng chưa trước khi bấm render. Sau phase này backend có endpoint kiểm tra payload sample, template, outputs folder và HyperFrames local runner; UI Render page hiển thị trạng thái này.

### Scope

Sẽ làm:

- Thêm service `backend/src/render/preflight.js`.
- Thêm route `GET /api/render-preflight`.
- Kiểm tra `data/render-payload.sample.json` có hợp lệ không.
- Kiểm tra template `project-showcase-90s` có đủ file tối thiểu không.
- Kiểm tra `outputs/` có thể tạo/ghi được không.
- Kiểm tra local runner `.cache/hyperframes-runner` đã có Node, HyperFrames, FFmpeg, FFprobe chưa.
- UI Render page gọi preflight và hiển thị status trước phần cấu hình render.

Không làm trong phase này:

- Không tự chạy `hf:setup` từ endpoint.
- Không chạy HyperFrames lint/render trong preflight vì sẽ chậm.
- Không thay render API sang async queue.
- Không sửa responsive.

Files impact:

- `backend/src/render/preflight.js`
- `backend/src/routes/render-preflight.js`
- `backend/src/server.js`
- `backend/package.json`
- `frontend/scripts/common/render-preview.js`
- `frontend/scripts/common/ui-components.js`
- `.agents/tasks/current-task.md`

Verification plan:

- `npm --prefix backend run check`
- `GET /api/render-preflight` trả JSON.
- Browser smoke test Render page có preflight panel.
- Render thật vẫn chạy được sau khi thêm preflight.

### Test Report - Render Preflight MVP

Status: passed

- Created:
  - `backend/src/render/preflight.js`
  - `backend/src/routes/render-preflight.js`
- Updated:
  - `backend/src/server.js`
  - `backend/package.json`
  - `frontend/scripts/common/render-preview.js`
  - `frontend/scripts/common/ui-components.js`
- Backend API added:
  - `GET /api/render-preflight`
- Preflight checks:
  - Render payload sample valid.
  - Template `project-showcase-90s` has `index.html`, `style.css`, `script.js`.
  - Template composition metadata and timeline registry present.
  - `outputs/` writable.
  - Local runner has Node runtime, HyperFrames CLI, FFmpeg, FFprobe.
- API smoke test:
  - `GET /api/render-preflight`: HTTP `200`.
  - `success=true`, `status=ok`, `ready=true`.
  - `checkCount=10`.
- Browser smoke test Render page:
  - Preflight panel status: `Sẵn sàng`.
  - Panel includes `Render payload sample`.
  - Panel includes `HyperFrames CLI`.
  - Refresh button calls `/api/render-preflight` again.
  - Console/page errors: none.

Commands run:

```bash
npm --prefix backend run check
HVT_PORT=3014 npm --prefix backend start
curl -sS http://127.0.0.1:3014/api/render-preflight
node --check frontend/scripts/common/render-preview.js
node --check frontend/scripts/common/ui-components.js
npm --prefix backend run payload:check
node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint
git diff --check
```

Remaining risks:

- Preflight không tự chạy `hf:setup`; nếu runner thiếu, user vẫn phải chạy command được gợi ý.
- Preflight chưa chạy HyperFrames lint/render thật để giữ endpoint nhanh.

## Yêu Cầu Mới

UI trước đây từng dựng MVP tĩnh bằng một `frontend/index.html` dạng SPA tab ẩn/hiện. Hướng này không còn đúng với yêu cầu mới.

Yêu cầu mới: refactor UI sang cấu trúc nhiều trang tĩnh. Mỗi màn hình chính phải có HTML riêng, CSS riêng và JS riêng nếu có logic riêng. Phần dùng chung như topbar, sidebar, validation panel, modal, toast, theme toggle, state, storage và navigation phải tách vào file chung.

Task chi tiết nằm ở `.agents/tasks/ui-refactor-multipage.md`. Antigravity cần đọc file đó trước khi tiếp tục sửa UI.

## Kết Quả Refactor Multi-page

Đã refactor UI từ một `frontend/index.html` dạng SPA tab sang cấu trúc nhiều trang tĩnh:

- `frontend/index.html` chỉ còn là entry dẫn tới `frontend/pages/overview.html`.
- 10 màn hình chính đã tách thành HTML riêng trong `frontend/pages/`.
- CSS page riêng nằm trong `frontend/styles/pages/`.
- JS page riêng nằm trong `frontend/scripts/pages/`.
- JS dùng chung nằm trong `frontend/scripts/common/`.
- Shell chung được render bằng `frontend/scripts/common/shell.js`.
- Navigation dùng link HTML thật, không còn `data-tab` hoặc `.tab-pane`.
- Sample data dùng embedded mock data để tránh lỗi fetch khi chạy local bằng static server hoặc file protocol.
- Đã chuẩn hóa chiều ngang content: form/list/card của các trang `content`, `features`, `timeline`, `settings` stretch theo `workspace-content`, không còn hardcode `max-width: 800px` gây trống bên phải.
- Đã polish các lỗi UI ưu tiên: preview canvas dark theme đọc rõ chữ, form nội dung dùng textarea cho field dài, status mock trong Settings phản ánh đúng phase UI, layout Render nới rộng card cấu hình.

Responsive mobile/tablet chưa làm ở phase này theo yêu cầu mới của user.

## Feature Intake

- **Hiểu yêu cầu**: Triển khai giao diện MVP tĩnh cho ứng dụng nội bộ Hyper Video Tool theo roadmap (`ui-roadmap.md`) và danh sách phần tử giao diện (`ui-items.md`). Giai đoạn này chỉ dựng UI bằng HTML/CSS/JS thuần, sử dụng dữ liệu tĩnh/mock để minh họa hoạt động và lưu trạng thái cục bộ.
- **Mục tiêu người dùng**: Người dùng mở ứng dụng local, nhập thông tin dự án, chỉnh sửa các tính năng, timeline, tải lên tài nguyên mẫu, lựa chọn template/theme, xem trước các scene video 16:9, bấm render giả lập và quản lý danh sách video đã xuất.
- **MVP đề xuất**:
  - App shell đầy đủ: top bar, sidebar nav, main workspace, validation panel.
  - 10 màn hình chính: Tổng quan, Nội dung dự án, Tính năng, Timeline, Tài nguyên, Template, Xem trước, Render, Video đã xuất, Cài đặt.
  - Hệ thống dữ liệu mẫu và cơ chế tự động lưu nháp (`localStorage`), hỗ trợ Import/Export JSON.
  - Tùy biến theme video (chữ, màu nhấn, logo) và giao diện ứng dụng (Light/Dark mode) không dùng gradient.
  - Giả lập tiến trình render với logs chi tiết và cập nhật danh sách video output.
  - Panel kiểm tra dữ liệu hoạt động theo thời gian thực (hiển thị lỗi/cảnh báo).
- **Không làm ngay**:
  - Giao diện bán hàng, landing page hoặc giới thiệu sản phẩm.
  - Tích hợp Node.js backend hay API lưu file thật trên ổ đĩa.
  - Kết nối thật với engine HyperFrames để xuất file video MP4 thực tế.
  - Trình biên tập timeline kéo thả phức tạp.
- **Khu vực ảnh hưởng**:
  - Thư mục `frontend/` chứa các tệp HTML/CSS/JS của ứng dụng.
  - Thư mục `templates/` chứa tài nguyên template demo.
  - Thư mục `data/` chứa dữ liệu dự án mẫu.
- **Rủi ro**:
  - Việc không dùng framework hoặc Tailwind CSS yêu cầu quản lý CSS thuần rất chặt chẽ để tránh xung đột hoặc vỡ layout trên các màn hình mobile/tablet.
  - Đảm bảo việc đồng bộ dữ liệu giữa form nhập liệu, validation panel và khung preview luôn mượt mà bằng vanilla JS.
- **Hướng khuyến nghị**: Xây dựng cấu trúc module hóa JS và tách riêng các file CSS (tokens, base, layout, components) để dễ quản trị và mở rộng sang giai đoạn backend sau này.

## Implementation Plan Cũ

> Plan bên dưới là plan đã dùng để dựng MVP UI lần đầu. Không dùng tiếp kiến trúc SPA trong plan này cho phase hiện tại. Phase hiện tại phải theo `.agents/tasks/ui-refactor-multipage.md`.

### Objective

Dựng toàn bộ giao diện tĩnh MVP chạy local cho Hyper Video Tool bằng vanilla HTML, CSS, và JS, đáp ứng toàn bộ checklist 10 màn hình và các tiêu chuẩn thẩm mỹ nội bộ chuyên nghiệp (Quiet SaaS, không gradient, responsive đầy đủ).

### Scope

#### Sẽ làm
- Khởi tạo cấu trúc dự án chuẩn với các file CSS và JS tách biệt theo module.
- Tạo dữ liệu mẫu đầy đủ cho dự án `Internal Analytics Dashboard`.
- Xây dựng App Shell có Topbar (tên app, tên project, status lưu, theme toggle, nút render) và Sidebar (10 tab điều hướng).
- Triển khai 10 màn hình làm việc tương ứng với các tab điều hướng.
- Viết validation logic kiểm tra tính hợp lệ của dữ liệu đầu vào và hiển thị danh sách lỗi/cảnh báo trực quan trên panel bên phải.
- Xây dựng khung Preview 16:9 hiển thị các scene thiết kế, hỗ trợ xem từng scene hoặc autoplay slide giả lập video.
- Xây dựng màn hình Render giả lập chạy tiến trình từ 0-100%, sinh logs log và lưu kết quả vào danh sách video đã xuất.
- Lưu trạng thái app và dữ liệu dự án vào `localStorage` (auto-save), hỗ trợ reset dữ liệu mẫu hoặc xóa dữ liệu local.
- Hỗ trợ đổi theme ứng dụng Light Mode / Dark Mode đồng bộ bằng CSS variables.

#### Không làm
- Giao diện bán hàng hoặc marketing.
- Ghi file video MP4 thật lên đĩa hay kết nối CLI HyperFrames.
- Viết API endpoints hoặc chạy Node.js server.
- Sử dụng Tailwind hoặc các thư viện CSS/JS bên thứ ba (ngoài bộ icon SVG đơn giản nếu cần).

### Files Impact

- **[NEW]** `data/sample-project.json`
- **[NEW]** `frontend/index.html`
- **[NEW]** `frontend/styles/tokens.css`
- **[NEW]** `frontend/styles/base.css`
- **[NEW]** `frontend/styles/layout.css`
- **[NEW]** `frontend/styles/components.css`
- **[NEW]** `frontend/scripts/constants.js`
- **[NEW]** `frontend/scripts/state.js`
- **[NEW]** `frontend/scripts/storage.js`
- **[NEW]** `frontend/scripts/validation.js`
- **[NEW]** `frontend/scripts/render-preview.js`
- **[NEW]** `frontend/scripts/ui.js`
- **[NEW]** `frontend/scripts/app.js`
- **[NEW]** `templates/project-showcase-90s/index.html`
- **[NEW]** `templates/project-showcase-90s/style.css`
- **[NEW]** `templates/project-showcase-90s/script.js`

### Logic Changes Cũ

- Ứng dụng từng chạy theo kiến trúc Single Page App (SPA) giả lập: Ẩn/hiển thị các màn hình dựa trên tab được chọn trong `state.js`. Hướng này cần được refactor sang multi-page static.
- Validation logic tự động chạy mỗi khi dữ liệu project thay đổi, cập nhật badge thông báo trên sidebar và danh sách lỗi trên validation panel.
- Tiến trình render chạy qua `setInterval` trong `render-preview.js`, đẩy logs vào màn hình render và thêm item mới vào danh sách xuất khi kết thúc thành công.

### Risk Assessment

- Tránh việc layout shift khi dữ liệu thay đổi trên preview hoặc khi hiển thị validation panel.
- Giải pháp: Sử dụng kích thước cố định (fixed dimensions hoặc aspect-ratio) cho khung preview và thiết lập grid layout ổn định.

### Dependency Map

- Không có dependency bên ngoài. Toàn bộ mã nguồn sử dụng Web APIs có sẵn trên trình duyệt hiện đại.

## Checklist

- [x] Khởi tạo thư mục và tạo file dữ liệu mẫu `data/sample-project.json`.
- [x] Thiết lập hệ thống CSS Tokens (`tokens.css`) hỗ trợ Light/Dark mode không dùng gradient.
- [x] Xây dựng App Shell (`index.html` & `layout.css`, `base.css`) gồm Topbar, Sidebar, Workspace, và Validation Panel.
- [x] Triển khai các component CSS dùng chung (`components.css`): Buttons, Inputs, Cards, Badges, Modals, Toasts.
- [x] Xây dựng logic quản lý trạng thái (`state.js`, `constants.js`) và lưu trữ cục bộ (`storage.js`).
- [x] Triển khai màn hình **Tổng quan** (Hiển thị thống kê nhanh, checklist tiến độ và nút chuyển nhanh).
- [x] Triển khai màn hình **Nội dung dự án** (Form nhập liệu đầy đủ trường, bộ đếm ký tự và validation trực quan).
- [x] Triển khai màn hình **Tính năng** và **Timeline** (Quản lý danh sách, hỗ trợ thêm, sửa, xóa, và đổi thứ tự đơn giản).
- [x] Triển khai màn hình **Tài nguyên** (Upload file giả lập, lưới tài nguyên, thumbnail, phân loại filter).
- [x] Triển khai màn hình **Template** (Lựa chọn template và bộ tùy chỉnh theme màu nhấn/chữ/vị trí logo của video).
- [x] Triển khai màn hình **Xem trước** (Khung preview aspect-ratio 16:9, danh sách scene và tính năng play/pause slide mô phỏng).
- [x] Triển khai màn hình **Render** (Tùy chỉnh cấu hình render, giả lập tiến trình render chạy log, nút Hủy).
- [x] Triển khai màn hình **Video đã xuất** (Lịch sử video mock, nút xem video hoặc xóa kèm modal xác nhận tự dựng).
- [x] Triển khai màn hình **Cài đặt** (Import/Export JSON, xóa dữ liệu local, mock status các thành phần hệ thống).
- [x] Liên kết logic Validation (`validation.js`) để hiển thị lỗi/cảnh báo thời gian thực trên Validation panel và Topbar/Sidebar.
- [x] Kiểm tra responsive trên thiết bị di động, tablet và desktop. Đảm bảo trải nghiệm đổi Light/Dark mode trơn tru.
- [x] Chạy quy trình polish giao diện (`wf-ui-taste-polish`) để đạt thẩm mỹ Quiet SaaS cao cấp.

## Verification Plan

### Manual Verification
- Mở file `frontend/index.html` bằng trình duyệt Chrome trên macOS.
- Bấm nút "Tải dữ liệu mẫu" trong Cài đặt hoặc Dự án để điền thông tin tự động.
- Chuyển đổi giữa 10 tab để kiểm tra hiển thị.
- Kiểm tra nút chuyển đổi theme Sáng/Tối ở Top bar.
- Thêm/sắp xếp/xóa tính năng và cột mốc timeline, kiểm tra sự thay đổi dữ liệu.
- Giả lập tải file lên trong màn hình tài nguyên.
- Kiểm tra việc nhảy scene trong màn hình Xem trước.
- Thực hiện chạy Render giả lập và xem kết quả lưu trong lịch sử xuất.
- Test responsive bằng cách thay đổi độ rộng cửa sổ trình duyệt (kiểm tra menu tab trên mobile và vị trí validation panel).

## Execution Notes

- Đã khởi tạo cấu trúc thư mục frontend chuẩn với các file CSS và JS tách biệt theo mô hình Quiet SaaS.
- Đã định nghĩa và nhúng dữ liệu dự án mẫu tĩnh làm fallback trực tiếp trong `storage.js` nhằm đảm bảo hoạt động ngoại tuyến và tránh lỗi CORS khi mở qua protocol `file://`.
- Đã giả lập toàn bộ tiến trình render logic trong `render-preview.js` và đồng bộ hóa với validation panel để khóa render khi dữ liệu chưa hợp lệ.
- Đã verify thành công toàn bộ luồng nghiệp vụ trên cả hai chế độ sáng/tối thông qua Chrome DevTools.

## Test Report

- **Phương pháp kiểm thử**: Chạy http server và sử dụng Browser Subagent trên Chrome để tự động hóa kiểm thử tương tác UI.
- **Kịch bản kiểm thử đã chạy**:
  1. Mở link ứng dụng, verify App Shell, Top bar và các tab bên trái. (Đạt)
  2. Bấm "Tải dữ liệu mẫu thử nghiệm", verify form tự điền và validation panel tự cập nhật từ 6 lỗi về 0 lỗi. (Đạt)
  3. Chuyển đổi qua lại giữa Light Mode và Dark Mode (kiểm tra các component đổi màu đồng bộ theo tokens). (Đạt)
  4. Mở tab Xem trước, bấm Chạy thử preview để kiểm tra autoplay slides 16:9. (Đạt)
  5. Đổi độ rộng màn hình kiểm tra responsive menu trượt mobile và responsive layout. (Đạt)
  6. Sang tab Render, bấm Bắt đầu Render, verify logs terminal giả lập và tiến trình % chạy từ 0 đến 100%. (Đạt)
  7. Sang tab Video đã xuất, bấm Mở xem video mockup và bấm Xóa bản ghi lịch sử kèm theo Modal xác nhận. (Đạt)
- **Kết quả**: PASS 100%. Console sạch không có lỗi runtime.
- **Recording kiểm thử**: [verify_static_ui_1782148260216.webp](file:///Users/dinhtrunghieu/.gemini/antigravity-ide/brain/1c5a2563-eef5-49fc-9929-37b059eca458/verify_static_ui_1782148260216.webp)

## Handoff

- **Kết quả bàn giao**: Dựng xong bộ giao diện tĩnh MVP hoàn chỉnh cho Hyper Video Tool với cấu trúc tệp sạch sẽ, đáp ứng đúng visual direction (Quiet SaaS, không gradient, 2 themes, responsive đầy đủ).
- **Trạng thái lưu trữ**: Tự động lưu nháp dữ liệu thay đổi trên localStorage. Import/Export JSON hoạt động đầy đủ.
- **Khuyến nghị cho giai đoạn tiếp theo (Phase 2)**: Tích hợp Node.js backend server để xử lý ghi file dự án JSON và gọi công cụ dòng lệnh HyperFrames kết xuất file video MP4 thực tế.
