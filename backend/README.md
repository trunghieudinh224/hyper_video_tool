# Backend

Thư mục này dành cho backend local ở phase sau.

Backend Phase 1 đã có server local tối thiểu bằng Node.js built-in HTTP module. Chưa có API lưu file thật hoặc render HyperFrames thật.

Khi bắt đầu backend, giữ phạm vi backend trong thư mục này:

- API local đọc/ghi project JSON.
- Tích hợp HyperFrames để render video.
- Kiểm tra dependency local như FFmpeg.
- Quản lý output MP4 và metadata render.

Không sửa cấu trúc UI trong `frontend/` khi chỉ làm backend, trừ khi task yêu cầu rõ.

## Chạy local

Yêu cầu Node.js 18+.

```bash
cd backend
npm start
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
HVT_HOST=127.0.0.1 HVT_PORT=3001 npm start
```

## Kiểm tra HyperFrames

HyperFrames render local cần Node.js 22+ và FFmpeg. Project có runner local để không cần cài global ngay:

```bash
cd backend
npm run hf:setup
npm run hf:doctor:spike
npm run hf:lint:spike
npm run hf:render:spike
```

Composition spike tối thiểu nằm ở:

```text
templates/hyperframes-spike/
```

Output render spike mặc định:

```text
/private/tmp/hyper-video-tool-spike.mp4
```

## Render project showcase qua API

Backend đã có render API MVP chạy đồng bộ:

```bash
HVT_PORT=3011 npm start
```

Tạo render job từ payload mẫu:

```bash
curl -sS -X POST http://127.0.0.1:3011/api/render-jobs \
  -H 'Content-Type: application/json' \
  --data-binary @../data/render-payload.sample.json
```

Response trả metadata job, trong đó `outputPath` trỏ tới file MP4 local:

```text
outputs/{jobId}.mp4
```

Đọc lại metadata khi server còn chạy:

```bash
curl -sS http://127.0.0.1:3011/api/render-jobs/{jobId}
```

Ghi chú:

- Phase hiện tại render đồng bộ, request có thể chờ khoảng 35-45 giây.
- Job metadata lưu trong memory nên restart server sẽ mất trạng thái job cũ.
- File MP4 trong `outputs/` không được commit.

Ghi chú:

- Runner local tải dependency vào `.cache/hyperframes-runner/`.
- Dependency runner được khóa bằng `backend/hyperframes-runner-package.json` và `backend/hyperframes-runner-package-lock.json`.
- `.cache/` đã được ignore khỏi git.
- `npm run check:hyperframes` vẫn dùng để kiểm tra dependency system/global nếu muốn.

Roadmap triển khai:

- `.agents/tasks/backend-roadmap.md`
- `.agents/tasks/hyperframes-roadmap.md`
