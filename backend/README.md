# Backend

Backend local hiện serve UI tĩnh, kiểm tra môi trường render và gọi HyperFrames để xuất MP4 thật.

Khi bắt đầu backend, giữ phạm vi backend trong thư mục này:

- API local đọc/ghi project JSON.
- Tích hợp HyperFrames để render video.
- Kiểm tra dependency local như FFmpeg.
- Quản lý output MP4 và metadata render.

Không sửa cấu trúc UI trong `frontend/` khi chỉ làm backend, trừ khi task yêu cầu rõ.

## Chạy local

Yêu cầu Node.js 18+.

```bash
npm --prefix backend start
```

Mặc định server chạy tại:

```text
http://127.0.0.1:3000
```

Health check:

```text
GET /api/health
```

Có thể đổi host/port bằng env:

```bash
HVT_HOST=127.0.0.1 HVT_PORT=3001 npm --prefix backend start
```

## Kiểm tra HyperFrames

HyperFrames render local cần Node.js 22+ và FFmpeg. Project có runner local để không cần cài global ngay:

```bash
npm --prefix backend run hf:setup
npm --prefix backend run hf:doctor:spike
npm --prefix backend run hf:lint:spike
npm --prefix backend run hf:render:spike
```

Composition spike tối thiểu nằm ở:

```text
templates/hyperframes-spike/
```

Output render spike mặc định:

```text
/private/tmp/hyper-video-tool-spike.mp4
```

## Render Project Showcase Qua API

Backend render async bằng queue 1 worker local. `POST /api/render-jobs` trả job ngay, UI/API poll trạng thái bằng `GET /api/render-jobs/:id`.

```bash
HVT_PORT=3011 npm --prefix backend start
```

Tạo render job từ payload mẫu:

```bash
curl -sS -X POST http://127.0.0.1:3011/api/render-jobs \
  -H 'Content-Type: application/json' \
  --data-binary @data/render-payload.sample.json
```

Response trả metadata job ban đầu:

```text
status=queued
progress=5
outputPath=outputs/{jobId}.mp4
```

Poll trạng thái:

```bash
curl -sS http://127.0.0.1:3011/api/render-jobs/{jobId}
```

Khi `status=succeeded`, MP4 nằm ở:

```text
outputs/{jobId}.mp4
```

Xem/download qua API:

```text
GET /api/outputs/{jobId}.mp4
GET /api/outputs/{jobId}.mp4?download=1
GET /api/outputs
```

## Preflight

Render page dùng endpoint:

```text
GET /api/render-preflight
```

Preflight kiểm:

- Payload sample hợp lệ.
- Template files đủ.
- Template dùng GSAP local, không phụ thuộc CDN.
- `outputs/` ghi được.
- HyperFrames local runner, FFmpeg, FFprobe có sẵn.

## Ghi Chú

- Runner local tải dependency vào `.cache/hyperframes-runner/`.
- Dependency runner được khóa bằng `backend/hyperframes-runner-package.json` và `backend/hyperframes-runner-package-lock.json`.
- `.cache/` đã được ignore khỏi git.
- File MP4 và manifest runtime trong `outputs/` không được commit.
- Job metadata/log đang lưu memory nên restart server sẽ mất trạng thái job cũ, nhưng MP4/manifest vẫn còn.
- `npm --prefix backend run check:hyperframes` vẫn dùng để kiểm tra dependency system/global nếu muốn.

## Check

```bash
npm --prefix backend run check
node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint
```

Smoke test render API thật khi backend đang chạy:

```bash
HVT_SMOKE_BASE_URL=http://127.0.0.1:3000 npm --prefix backend run smoke:render-api
```

Smoke test này sẽ:

- Gửi `POST /api/render-jobs`.
- Poll `GET /api/render-jobs/:id`.
- Kiểm `HEAD /api/outputs/{jobId}.mp4`.
- Kiểm `GET /api/outputs` có output vừa render.

Thời gian chạy thường khoảng 40-60 giây vì có render MP4 thật.

Roadmap:

- `.agents/tasks/backend-roadmap.md`
- `.agents/tasks/hyperframes-roadmap.md`
