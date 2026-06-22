# Ghi Chú Kiến Trúc

## Hướng MVP Hiện Tại

MVP hiện tại chỉ tập trung dựng UI tĩnh bằng HTML, CSS và JavaScript thuần. Dữ liệu dùng để hiển thị là dữ liệu tĩnh/mock. Chưa cần Node.js server, backend API, upload thật, lưu file thật hoặc render HyperFrames thật.

Không cần React/Next.js ở giai đoạn đầu vì mục tiêu là tool nội bộ chạy local, ít người dùng, ít yêu cầu cộng tác.

## Cấu Trúc Hiện Tại

```text
frontend/
  index.html
  pages/
  styles/
  scripts/
  shared/

backend/
  README.md

templates/
  project-showcase-90s/

data/
  sample-project.json
```

`frontend/` là UI tĩnh hiện tại. `backend/` là chỗ dành cho API local, HyperFrames integration và quản lý render ở phase sau. Không tạo `server.js`, `package.json`, API routes hoặc backend runtime ở root nếu chưa có quyết định kiến trúc mới.

Các thư mục dữ liệu runtime để phase backend sau:

- `data/projects/`
- `uploads/`
- `outputs/`

## Frontend

- Tách CSS thành token, base, layout và components.
- Tách JavaScript theo nhóm: constants, state, storage, api, validation, ui, preview.
- Không dùng inline event handler.
- Không dùng inline style.
- Không hardcode màu rải rác, phải dùng CSS variables.

## Backend Local

Chưa làm trong giai đoạn UI. Khi chuyển sang backend phase, server local trong `backend/` có thể xử lý:

- Serve UI tĩnh từ `frontend/`.
- Lưu và đọc project JSON.
- Nhận upload tài nguyên.
- Liệt kê tài nguyên.
- Gọi HyperFrames để render.
- Liệt kê video đã xuất.
- Cung cấp trạng thái render.

Roadmap triển khai backend nằm ở `.agents/tasks/backend-roadmap.md`.

## Render

Chưa gọi HyperFrames thật trong giai đoạn UI. Màn hình Render chỉ mô phỏng trạng thái.

Luồng render dự kiến cho phase sau:

```text
Project JSON
-> tạo hoặc truyền dữ liệu vào template HyperFrames
-> gọi HyperFrames render
-> ghi MP4 vào outputs/
-> cập nhật trạng thái render cho UI
```

Roadmap tích hợp HyperFrames nằm ở `.agents/tasks/hyperframes-roadmap.md`.

## Lưu Trữ

Giai đoạn UI:

- Dùng dữ liệu tĩnh/mock để minh họa.
- Có thể lưu nháp bằng `localStorage` nếu cần, nhưng không bắt buộc.

Giai đoạn backend sau này:

- Project data: JSON.
- Upload: file local.
- Output: MP4 local.

SQLite chỉ nên thêm khi JSON bắt đầu khó quản lý, ví dụ có nhiều project, nhiều output và cần query lịch sử tốt hơn.

## Ràng Buộc

- Không lưu secret trong repo.
- Không commit `.codegraph/`, `node_modules/`, file MP4 output hoặc database local.
- Không tạo cloud/auth trong MVP.
