# HyperFrames Notes

Ghi chú setup và kiểm thử HyperFrames cho Hyper Video Tool.

## Tài Liệu Nguồn Đã Kiểm Tra

- GitHub: `https://github.com/heygen-com/hyperframes`
- Quickstart: `https://hyperframes.heygen.com/quickstart`

Thông tin chính từ docs hiện tại:

- HyperFrames biến HTML/CSS/media/animation thành MP4.
- CLI chạy bằng `npx hyperframes`.
- Render local cần Node.js 22+ và FFmpeg.
- Lệnh cơ bản:
  - `npx hyperframes preview`
  - `npx hyperframes lint`
  - `npx hyperframes render --output output.mp4`
  - `npx hyperframes doctor`
- Composition root cần `data-composition-id`, `data-width`, `data-height`.
- Clip trên timeline cần `class="clip"`, `data-start`, `data-duration`, `data-track-index`.
- Animation timeline cần register vào `window.__timelines[compositionId]`.

## Trạng Thái Local Hiện Tại

Kiểm tra ngày 23/06/2026:

- Node hệ thống: `v20.16.0`.
- npm: `10.8.1`.
- FFmpeg: chưa có trên PATH.
- HyperFrames CLI: gọi được qua `npx --yes hyperframes --help`, phiên bản ghi nhận `0.7.1`.
- HyperFrames doctor báo thiếu FFmpeg/FFprobe và Docker; Chrome hệ thống có sẵn.

Kết luận:

- System/global environment chưa đủ để render trực tiếp bằng `npx hyperframes render`.
- Project đã có local runner để chạy HyperFrames bằng Node 24, FFmpeg và FFprobe trong `.cache/hyperframes-runner/`.
- Runner dùng `backend/hyperframes-runner-package-lock.json` để pin transitive dependencies.
- Không cần cài global để chạy spike render hiện tại.

## Spike Template

Đã thêm spike composition tối thiểu:

```text
templates/hyperframes-spike/
  meta.json
  index.html
  style.css
```

Kết quả:

- `npm --prefix backend run hf:setup`: pass, tạo local runner tại `.cache/hyperframes-runner/` bằng `npm ci` từ lockfile.
- `npm --prefix backend run hf:doctor:spike`: đủ Node 24, FFmpeg, FFprobe và Chrome cho local render; Docker thiếu nhưng không bắt buộc.
- `npm --prefix backend run hf:lint:spike`: pass, `0 errors, 0 warnings`.
- `npm --prefix backend run hf:render:spike`: pass, xuất MP4 tại `/private/tmp/hyper-video-tool-spike.mp4`.
- `.cache/hyperframes-runner/bin/ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 /private/tmp/hyper-video-tool-spike.mp4`: `duration=5.000000`, `size=425203`.

## Lệnh Kiểm Tra Project

Runner local khuyến nghị:

```bash
cd backend
npm run hf:setup
npm run hf:doctor:spike
npm run hf:lint:spike
npm run hf:render:spike
```

Kiểm tra system/global environment:

```bash
cd backend
npm run check:hyperframes
```

Script này kiểm:

- Node.js >= 22.
- npm.
- FFmpeg.
- HyperFrames CLI reachable.

## Quyết Định Hiện Tại

Không tự cài FFmpeg hoặc nâng Node global trên máy user. Thay vào đó dùng local runner trong `.cache/hyperframes-runner/` để có Node 24, HyperFrames, FFmpeg và FFprobe phục vụ spike render.
