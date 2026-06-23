# Hyper Video Tool

Công cụ nội bộ để tạo video thuyết trình dự án cá nhân/dự án nội bộ.

## Trạng thái hiện tại

MVP hiện tại đã có UI tĩnh, backend local và render MP4 thật bằng HyperFrames.

Đã có:

- UI HTML/CSS/JS thuần trong `frontend/`.
- Backend local Node.js trong `backend/`.
- Render job async qua `POST /api/render-jobs`.
- Poll trạng thái qua `GET /api/render-jobs/:id`.
- Output MP4 trong `outputs/`.
- Trang Outputs xem/download video qua backend.
- Manifest runtime `outputs/manifest.json` để khôi phục danh sách video đã render.
- Template `project-showcase-90s` dùng GSAP local, không phụ thuộc CDN.

## Cấu trúc chính

```text
frontend/   UI tĩnh chạy local
backend/    Backend local serve UI và gọi HyperFrames
data/       Dữ liệu mẫu dùng để minh họa
templates/  Template video/render demo
.agents/    Rule, context, workflow cho agent
```

## Chạy MVP Local

Yêu cầu:

- Node.js 18+ để chạy backend.
- Lần đầu cần setup HyperFrames runner local.

Setup runner:

```bash
npm --prefix backend run hf:setup
```

Chạy backend + UI:

```bash
npm --prefix backend start
```

Mở:

```text
http://127.0.0.1:3000
```

Có thể đổi port:

```bash
HVT_PORT=3010 npm --prefix backend start
```

## Test Thử Render

Trên UI:

1. Mở `http://127.0.0.1:3000`.
2. Vào tab `Render`.
3. Bấm `Kiểm tra lại` để xem preflight.
4. Chọn `Ngang 16:9 - 1920x1080` hoặc `Dọc 9:16 - 1080x1920`.
5. Bấm `Bắt đầu Render`.
6. Chờ trạng thái `Hoàn tất`.
7. Vào tab `Video đã xuất` để xem/download MP4.

Qua API:

```bash
curl -sS -X POST http://127.0.0.1:3000/api/render-jobs \
  -H 'Content-Type: application/json' \
  --data-binary @data/render-payload.sample.json
```

Response trả job id ngay. Poll:

```bash
curl -sS http://127.0.0.1:3000/api/render-jobs/{jobId}
```

Output nằm ở:

```text
outputs/{jobId}.mp4
```

## Kiểm Tra Nhanh

```bash
npm --prefix backend run check
node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-90s lint
```

Smoke test render API thật khi backend đang chạy:

```bash
HVT_SMOKE_BASE_URL=http://127.0.0.1:3000 npm --prefix backend run smoke:render-api
```

Smoke test payload dọc:

```bash
HVT_SMOKE_BASE_URL=http://127.0.0.1:3000 \
HVT_SMOKE_PAYLOAD_PATH=/private/tmp/hvt-vertical-payload.json \
HVT_SMOKE_EXPECT_RESOLUTION=1080x1920 \
npm --prefix backend run smoke:render-api
```

Lệnh smoke này sẽ tạo một MP4 thật trong `outputs/`, nên thời gian chạy thường khoảng 40-60 giây.

Lưu ý:

- `outputs/`, `.cache/`, `.DS_Store` là runtime/ignored.
- Job status/log đang lưu memory, restart backend sẽ mất job history, nhưng MP4 và manifest vẫn còn.
