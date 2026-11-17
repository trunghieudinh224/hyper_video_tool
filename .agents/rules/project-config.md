# Cấu Hình Dự Án

File này ghi thông tin vận hành riêng của Hyper Video Tool. Không lưu credential, token, password hoặc secret thật trong file này.

## Định Danh

- Tên dự án: Hyper Video Tool
- Slug: hyper-video-tool
- Loại dự án: công cụ nội bộ chạy local
- Mục đích: tạo video thuyết trình dự án cá nhân/nội bộ bằng HyperFrames
- Đối tượng dùng: nhân viên hoặc team nội bộ
- URL local mặc định: `http://127.0.0.1:3000`

## Công Nghệ Hiện Tại

- Frontend: HTML, CSS, JavaScript thuần
- Backend: Node.js local trong `backend/`, chạy bằng `npm --prefix backend start`
- Persistence: SQLite local qua SQLite CLI; project/settings và metadata nằm trong DB
- Runtime cần có lệnh `sqlite3` khả dụng hoặc cấu hình `HVT_SQLITE_BIN`
- Asset: binary files local dưới `uploads/`, metadata qua backend API
- Render: HyperFrames local, tạo MP4 dưới `outputs/`
- Voiceover: `edge-tts` cài trong venv local; mỗi lần tổng hợp giọng mới vẫn gọi dịch vụ online; xem `backend/README.md`
- Dependencies/version: backend yêu cầu Node.js 18+; HyperFrames runner có runtime requirement riêng trong README

## Cổng Và URL Local

- Mặc định chạy `127.0.0.1:3000` bằng backend.
- `HVT_HOST` chỉ nhận `127.0.0.1` hoặc `::1`; IP LAN và `0.0.0.0` bị từ chối. `HVT_PORT` có thể đổi.
- Mỗi người dùng clone và setup dependency trên máy riêng; không cấu hình cloud deploy, reverse proxy hoặc port forwarding cho backend không có đăng nhập này.
- Static/file mode chỉ dùng cho phần UI có fallback và không cần API.

## Đường Dẫn Hiện Tại

- UI app: `frontend/`
- CSS: `frontend/styles/`
- JavaScript: `frontend/scripts/`
- Backend local: `backend/`
- Template video: `templates/`
- Dữ liệu mẫu: `data/sample-project.json`
- SQLite database mặc định: `data/hyper-video-tool.sqlite`.
- Asset upload runtime: `uploads/`.
- Video output runtime: `outputs/`.

## Quy Tắc Giao Diện

- Có light mode và dark mode.
- Không dùng gradient.
- Không làm landing page.
- Không dùng hero section.
- Không làm giao diện bán hàng.
- Không dùng emoji trang trí.
- Ưu tiên giao diện công cụ nội bộ: rõ, gọn, sang, dễ scan.

## Quy Tắc Lưu Trữ

- Không commit `node_modules/`.
- Không commit `.codegraph/`.
- Không commit file MP4 output.
- Không commit database local.
- Không commit secret.

## API Response Envelope Hiện Tại

Thành công:

```json
{
  "success": true,
  "message": "Đã xử lý thành công.",
  "data": {}
}
```

Lỗi:

```json
{
  "success": false,
  "message": "Không thể xử lý yêu cầu.",
  "errors": null
}
```

`errors` có thể là object validation hoặc `null` tùy endpoint.
