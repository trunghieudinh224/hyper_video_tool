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
- Backend local: chưa làm trong giai đoạn UI
- Render engine: HyperFrames để phase sau
- Video output: MP4 để phase sau
- Dữ liệu MVP: dữ liệu tĩnh/mock trong frontend
- Database sau MVP: JSON local hoặc SQLite nếu cần quản lý nhiều project/output
- Upload: mô phỏng bằng UI trước, thư mục local `uploads/` để phase sau
- Output: mô phỏng bằng UI trước, thư mục local `outputs/` để phase sau

## Cổng Và URL Local

- Giai đoạn UI có thể mở trực tiếp `frontend/index.html`.
- Nếu dùng static server, cổng gợi ý là `3000`.
- Chưa cần route preview riêng.

## Đường Dẫn Dự Kiến

- UI app: `frontend/`
- CSS: `frontend/styles/`
- JavaScript: `frontend/scripts/`
- Backend local phase sau: `backend/`
- Template video: `templates/`
- Dữ liệu mẫu: `data/sample-project.json`
- Project JSON thật: `data/projects/` ở phase sau.
- Upload thật: `uploads/` ở phase sau.
- Video xuất ra thật: `outputs/` ở phase sau.

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

## API Response Dự Kiến Cho Phase Backend Sau

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
