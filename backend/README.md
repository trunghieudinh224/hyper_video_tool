# Backend

Backend local hiện serve UI tĩnh, kiểm tra môi trường render và gọi HyperFrames để xuất MP4 thật.

Asset file `GET/HEAD /api/assets/:id/file` hỗ trợ một HTTP byte range (`206 Partial Content`) để trình phát video/audio seek; request không gửi Range vẫn nhận toàn bộ file (`200`). Range không hợp lệ trả `416`.

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

Có thể đổi port; host chỉ chấp nhận loopback (`127.0.0.1` hoặc `::1`):

```bash
HVT_HOST=127.0.0.1 HVT_PORT=3001 npm --prefix backend start
```

`HVT_HOST=0.0.0.0`, IP LAN hoặc hostname khác sẽ bị từ chối. Request có Host không phải loopback hoặc Origin khác địa chỉ app cũng bị từ chối. Backend này không có đăng nhập, nên không đặt sau reverse proxy hoặc port forwarding.

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

## Voiceover Local

Voiceover MVP dùng `edge-tts` trong venv local tại `.cache/edge-tts-venv/`, không cài Python package global. Dịch vụ tổng hợp giọng của Edge TTS vẫn cần mạng:

```bash
npm --prefix backend run audio:setup
```

Lệnh này cần network để tải package Python. Sau khi setup xong, Render page có thể bật Voiceover, chọn tiếng Việt/Anh/Nhật, nhập kịch bản đọc và xuất MP4 có audio track.

Setup khóa `edge-tts==7.3.1`. Bản 7.2.8 cũ trả HTTP 403 do handshake của dịch vụ thay đổi; nếu máy đã có venv cũ, chạy lại `npm --prefix backend run audio:setup` để nâng phiên bản.

Voice script có thể trộn giọng trong một câu bằng `[vi]...[/vi]`, `[en]...[/en]`, `[ja]...[/ja]`. Chữ Nhật tự nhận theo ký tự; từ Latin như `CodeGraph` giữa câu Việt cần đánh dấu bằng nút VI/EN/JA ở trang Kịch bản. Backend tạo từng đoạn bằng voice cùng giới tính với giọng chính, ghép audio và dời mốc SRT theo độ dài thật của từng đoạn. Chỗ chuyển giọng có thể đổi âm sắc; nghe thử trước khi render.

## Phụ đề

Trong trang Kịch bản, bật Phụ đề cho từng phân đoạn và chọn nguồn: voiceover, text tùy chỉnh hoặc SRT. SRT nhập trong phân đoạn dùng mốc thời gian tính từ đầu phân đoạn đó. Nguồn voiceover cần bật voiceover của video.

Preview hiển thị cue đang chạy; render dùng FFmpeg/libass burn chữ vào MP4 và ghi thêm `outputs/{tên-video}.srt`. Có thể tải SRT từ trang Video đã xuất hoặc qua `GET /api/outputs/{tên-video}.srt?download=1`.

Edge TTS có thể chỉ trả một cue cho cả câu hoặc SRT rỗng. Khi đó HVT chia câu và ước lượng thời gian từng từ theo độ dài; karaoke không phải căn từ chính xác. Nếu cần timing chuẩn, nhập SRT đã căn sẵn.

## Render Project Showcase Qua API

Backend render async bằng queue 1 worker local. `POST /api/render-jobs` trả job ngay, UI/API poll trạng thái bằng `GET /api/render-jobs/:id`.

Với dynamic story, workdir render đặt `data-duration` theo tổng thời lượng scene của payload trước khi gọi HyperFrames; không dùng thời lượng 68 giây của HTML mẫu.

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
GET /api/outputs/{jobId}.srt?download=1
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
- Script setup đối chiếu manifest và version package đã cài; khi repo đổi lockfile, chạy lại `hf:setup` để đồng bộ runner local.
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

Smoke test render dọc dùng payload tạm:

```bash
HVT_SMOKE_BASE_URL=http://127.0.0.1:3000 \
HVT_SMOKE_PAYLOAD_PATH=/private/tmp/hvt-vertical-payload.json \
HVT_SMOKE_EXPECT_RESOLUTION=1080x1920 \
npm --prefix backend run smoke:render-api
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
