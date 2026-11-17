# Task Hiện Tại

## Trạng thái workflow

completed

## Objective

Nâng cấp luồng xem asset video/audio local. Người dùng mở tài nguyên để xem/phát file, đọc metadata video/audio và thấy waveform của audio đủ nhỏ; video có thể seek qua backend mà không phải tải cả file.

## Scope

### Slice 1 - Asset streaming

- GET/HEAD `/api/assets/:id/file` hỗ trợ một byte range, trả 206/416 đúng; giữ GET nguyên file như cũ.
- Thêm test trường hợp range/suffix/HEAD/invalid trong test asset hiện có.
- File: `backend/src/routes/assets.js`, `backend/scripts/test-assets.js`.

### Slice 2 - Media inspector

- Vendor bản cố định Mediabunny 1.66.0 và wavesurfer.js 8.1.0 cùng license trong `frontend/vendor/media/`.
- Trên trang Tài nguyên, thêm thao tác xem chi tiết video/audio; video phát bằng native player, audio có waveform khi kích thước phù hợp.
- Mediabunny đọc duration, kích thước hình, codec/track ở browser; lỗi codec/metadata không chặn playback.
- File: `frontend/pages/assets.html`, `frontend/scripts/common/ui-components.js`, `frontend/scripts/pages/assets.js`, `frontend/styles/pages/assets.css` và 4 file vendor.

## Ngoài phạm vi

- Không đổi schema/JSON project, template, HyperFrames hay pipeline xuất MP4.
- Không thêm timeline nhiều track, ASR, scene detection hay cloud API.
- Các repo WebAV/Remotion chỉ nghiên cứu cho feature biên tập/render khác sau này.

## Logic và rủi ro

- Slice 1 là thay đổi HTTP response cho asset file; các client GET không gửi Range vẫn nhận 200 như trước. Reversible bằng revert.
- Slice 2 chỉ thêm UI inspection; browser không hỗ trợ WebCodecs vẫn dùng native player. Reversible bằng bỏ vendor/UI.
- Không có migration hoặc thay đổi dữ liệu local. Dependency tải từ npm về thư mục tạm, vendor bản build và license vào frontend.

## Checklist

- [x] Hỗ trợ GET/HEAD byte range cho asset file.
- [x] Test range, invalid range và GET cũ.
- [x] Vendor bản build và license của hai repo đúng version.
- [x] Thêm nút xem chi tiết vào card video/audio.
- [x] Thêm inspector playback, metadata và waveform với fallback.
- [x] Kiểm tra syntax/diff và test backend phạm vi asset.
- [x] Cập nhật tài liệu khả năng hiện tại và báo kết quả.
- [ ] Browser smoke trang Tài nguyên trên server thật: môi trường hiện tại chặn khởi chạy server/Chromium.

## Verification Plan

- `node --check` cho JS đã sửa, `npm --prefix backend run assets:test`, `git diff --check`.
- Browser smoke với asset mẫu trên local backend: mở inspector, seek video, play audio/waveform, kiểm console.
- Không chạy render MP4 thật vì render payload/template không thay đổi.

## Test Report

Status: partial

- `npm --prefix backend run assets:test`: pass (GET nguyên file, range, suffix, HEAD, 416 và upload/rollback cũ).
- `npm --prefix backend run server:routing:test`: pass.
- `node --check` cho route/test backend, assets page JS, shared UI JS và hai vendor build: pass.
- `git diff --check`: pass.
- SHA-256 hai bản vendor khớp byte-for-byte với package npm đã tải; license được giữ trong cùng thư mục.
- Mediabunny bản vendored đọc đúng MP4 mẫu (2 giây, AVC/AAC, 320×180) và MP3 mẫu (~2 giây, MP3); `UrlSource` chạy qua response byte range mô phỏng đọc đúng MP4.
- Đã cập nhật `README.md`, `backend/README.md`, context repo và bài học HTTP range trong `.agents/memory/learnings.md`.
- Browser smoke: **not run**. Backend không bind được `127.0.0.1:4188` trong sandbox (`EPERM`); bộ duyệt tự động từ chối quyền chạy ngoài sandbox vì workspace hết credits. Chromium headless trong sandbox cũng bị macOS chặn Mach port (`Permission denied`), và browser UI không khả dụng cho chat này.
- Render MP4 thật: not run vì không đổi render payload/template và không thể khởi chạy backend test.
- Rủi ro còn lại: chưa xác nhận bằng thao tác browser thật rằng dialog, playback và waveform hoạt động trên máy đích. Không báo UI smoke pass cho tới khi chạy lại với browser/server khả dụng.
