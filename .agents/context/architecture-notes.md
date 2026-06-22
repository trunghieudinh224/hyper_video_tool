# Ghi Chú Kiến Trúc

## Hướng MVP

MVP nên dùng HTML, CSS, JavaScript thuần và Node.js server. Không cần React/Next.js ở giai đoạn đầu vì mục tiêu là tool nội bộ chạy local, ít người dùng, ít yêu cầu cộng tác.

## Cấu Trúc Dự Kiến

```text
app/
  index.html
  styles/
  scripts/

templates/
  project-showcase-90s/

data/
  sample-project.json
  projects/

uploads/

outputs/

server.js
package.json
```

## Frontend

- Tách CSS thành token, base, layout và components.
- Tách JavaScript theo nhóm: constants, state, storage, api, validation, ui, preview.
- Không dùng inline event handler.
- Không dùng inline style.
- Không hardcode màu rải rác, phải dùng CSS variables.

## Backend Local

Node server cần xử lý:

- Serve app UI.
- Lưu và đọc project JSON.
- Nhận upload tài nguyên.
- Liệt kê tài nguyên.
- Gọi HyperFrames để render.
- Liệt kê video đã xuất.
- Cung cấp trạng thái render.

## Render

Luồng render dự kiến:

```text
Project JSON
-> tạo hoặc truyền dữ liệu vào template HyperFrames
-> gọi HyperFrames render
-> ghi MP4 vào outputs/
-> cập nhật trạng thái render cho UI
```

## Lưu Trữ

Giai đoạn đầu ưu tiên:

- Project data: JSON.
- Upload: file local.
- Output: MP4 local.

SQLite chỉ nên thêm khi JSON bắt đầu khó quản lý, ví dụ có nhiều project, nhiều output và cần query lịch sử tốt hơn.

## Ràng Buộc

- Không lưu secret trong repo.
- Không commit `.codegraph/`, `node_modules/`, file MP4 output hoặc database local.
- Không tạo cloud/auth trong MVP.
