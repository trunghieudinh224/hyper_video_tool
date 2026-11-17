# Hyper Video Tool

Công cụ nội bộ để tạo video thuyết trình dự án cá nhân/dự án nội bộ.

## Trạng thái hiện tại

MVP hiện tại đã có UI tĩnh, backend local và render MP4 thật bằng HyperFrames.

Đã có:

- UI HTML/CSS/JS thuần trong `frontend/`.
- Backend local Node.js trong `backend/`.
- Nhập brief, dựng kịch bản theo phân đoạn/scene slot, chọn video style và template, xem trước nội dung trước khi render.
- Lưu project/settings và metadata tài nguyên trong SQLite local; upload hình ảnh, video và audio vào `uploads/`.
- Tạo voiceover bằng `edge-tts` sau khi setup môi trường Python local; hỗ trợ đổi giọng theo đoạn Việt, Anh, Nhật trong cùng kịch bản và ghép nhạc nền vào MP4.
- Bật phụ đề theo từng phân đoạn: lấy từ voiceover, nhập text riêng hoặc dán SRT. Render burn phụ đề vào MP4 và tạo file SRT để tải riêng; chế độ karaoke ước lượng mốc từ khi Edge TTS chỉ trả cue theo câu.
- Chọn output ngang `16:9` hoặc dọc `9:16`; có template showcase và dynamic story tương ứng.
- Render job async qua `POST /api/render-jobs`.
- Poll trạng thái qua `GET /api/render-jobs/:id`.
- Output MP4 trong `outputs/`.
- Trang Outputs xem/download video qua backend.
- Trang Outputs có link tải SRT cho video đã render với phụ đề.

Trong Kịch bản, chọn một từ/cụm từ rồi bấm VI/EN/JA để đánh dấu giọng đọc. Ví dụ: `Xin chào [en]CodeGraph[/en] こんにちは`. Chữ Nhật tự nhận theo ký tự; từ Latin khác ngôn ngữ chính cần đánh dấu thủ công. Cùng một câu nhiều ngôn ngữ sẽ dùng nhiều voice nên âm sắc có thể thay đổi tại chỗ chuyển giọng.
- Trang Tài nguyên xem video/audio đã upload, đọc thời lượng/codec/độ phân giải bằng Mediabunny và hiển thị waveform cho audio nhỏ bằng wavesurfer.js. File media được phục vụ từ backend với HTTP byte range để trình phát seek.
- Manifest runtime `outputs/manifest.json` để khôi phục danh sách video đã render.
- Template `project-showcase-90s` dùng GSAP local, không phụ thuộc CDN.

Hai thư viện media của trang Tài nguyên được vendor local cùng license trong `frontend/vendor/media/`; không cần cài dependency frontend hoặc gọi CDN cho inspector. Font Awesome của UI cũng được lưu trong `frontend/vendor/fontawesome/`.

## Cấu trúc chính

```text
frontend/   UI tĩnh chạy local
backend/    Backend local serve UI và gọi HyperFrames
data/       Dữ liệu mẫu dùng để minh họa
templates/  Template video/render demo
.agents/    Rule, context, workflow cho agent
```

## Cài và chạy trên máy sau khi clone

Yêu cầu:

- Node.js 18+ và npm để chạy backend.
- `sqlite3` CLI có trong `PATH` để lưu project/settings.
- Python 3 có module `venv` nếu muốn tạo voiceover.
- Internet lúc cài dependency; Edge TTS vẫn cần Internet mỗi lần tạo giọng mới.

Mỗi người dùng clone repo về máy riêng, mở terminal trong thư mục project rồi chạy:

```bash
npm ci --prefix backend
npm --prefix backend run hf:setup
npm --prefix backend run audio:setup
npm --prefix backend start
```

Nếu không dùng voiceover, có thể bỏ qua `audio:setup`. Mở UI tại:

```text
http://127.0.0.1:3000
```

Backend chỉ bind địa chỉ loopback (`127.0.0.1`, hoặc `::1` nếu cấu hình rõ), đồng thời từ chối Host/Origin không phải địa chỉ local. `HVT_HOST=0.0.0.0` và địa chỉ mạng LAN bị từ chối. Có thể đổi **port** mà vẫn chỉ chạy trên máy hiện tại:

```bash
HVT_PORT=3010 npm --prefix backend start
```

Mỗi clone lưu SQLite ở `data/hyper-video-tool.sqlite`, file tải lên ở `uploads/`, MP4/SRT ở `outputs/`, dependency render/TTS ở `.cache/`. Các file runtime này được Git ignore, không đồng bộ qua repo. Dừng server bằng `Ctrl+C`; không cần tài khoản, `.env` hay dịch vụ cloud để chạy UI/backend/render local. Font Awesome và ảnh placeholder mặc định cũng được phục vụ local. Edge TTS là ngoại lệ cần mạng khi tổng hợp giọng.

Không mở port 3000 bằng port forwarding hoặc reverse proxy cho máy khác: API local không có đăng nhập.

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
