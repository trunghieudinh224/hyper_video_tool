# Cấu Hình Dự Án

File này ghi thông tin vận hành riêng của Hyper Video Tool. Không lưu credential, token, password hoặc secret thật trong file này.

## Định Danh

- Tên dự án: Hyper Video Tool
- Slug: hyper-video-tool
- Loại dự án: công cụ nội bộ chạy local
- Mục đích: tạo video thuyết trình dự án cá nhân/nội bộ bằng HyperFrames
- Đối tượng dùng: nhân viên hoặc team nội bộ
- Domain local dự kiến: internal.local

## Công Nghệ Dự Kiến

- Frontend: HTML, CSS, JavaScript thuần
- Backend local: Node.js
- Render engine: HyperFrames
- Video output: MP4
- Dữ liệu MVP: JSON local
- Database sau MVP: SQLite nếu cần quản lý nhiều project/output
- Upload: thư mục local `uploads/`
- Output: thư mục local `outputs/`

## Cổng Và URL Local

- Cổng mặc định: `3000`
- URL app: `http://127.0.0.1:3000`
- URL preview dự kiến: `http://127.0.0.1:3000/preview`

## Đường Dẫn Dự Kiến

- UI app: `app/`
- CSS: `app/styles/`
- JavaScript: `app/scripts/`
- Template video: `templates/`
- Dữ liệu mẫu: `data/sample-project.json`
- Project JSON: `data/projects/`
- Upload: `uploads/`
- Video xuất ra: `outputs/`

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

## API Response Dự Kiến

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
  "errors": {}
}
```
