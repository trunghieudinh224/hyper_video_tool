---
trigger: always_on
description: Rule ranh giới cấu trúc project Hyper Video Tool: frontend, backend, data, templates và agent workspace.
---

# Project Structure Rules

File này là rule bắt buộc khi tạo, sửa, refactor hoặc review cấu trúc thư mục trong Hyper Video Tool.

## Cấu Trúc Chuẩn

```text
frontend/   UI nhiều trang HTML/CSS/JS thuần, không có build step
backend/    Backend Node.js local hiện tại, serve UI và API
data/       Dữ liệu mẫu và project JSON dùng chung
templates/  Template video/render demo
.agents/    Rule, context, workflow và task cho agent
```

## Ranh Giới Thư Mục

- `frontend/` chỉ chứa UI tĩnh: HTML, CSS, JavaScript, asset phục vụ giao diện.
- `backend/` chỉ chứa backend local: API, file service, upload service, render queue, HyperFrames adapter.
- `data/` chứa dữ liệu mẫu và dữ liệu project dạng JSON.
- `templates/` chứa template video/render, không chứa UI app chính.
- `.agents/` chỉ chứa tài liệu điều phối agent, không chứa source code runtime.

## Cấm Làm

- Không tạo lại thư mục `app/`.
- Không tạo `server.js`, `package.json`, route API hoặc backend runtime ở root khi chưa có quyết định kiến trúc mới.
- Không đặt backend code trong `frontend/`.
- Không đặt page UI chính trong `backend/`.
- Không move `data/` hoặc `templates/` vào `frontend/`; backend và render templates dùng chung các thư mục này.
- Không thêm dependency/build step vào root chỉ để phục vụ UI tĩnh.

## Backend Local Hiện Tại

- Mọi API/runtime code nằm trong `backend/`; không tạo backend mới ở root.
- Dependency và script Node nằm trong `backend/package.json`, không tạo `package.json` ở root.
- SQLite mặc định nằm ở `data/hyper-video-tool.sqlite`.
- Asset/output runtime dùng `uploads/` và `outputs/`; không commit file runtime.
- Khi đổi schema hoặc API contract, cập nhật roadmap/task tương ứng nếu scope yêu cầu.
- Không chạy migration hoặc xóa dữ liệu local nếu user chưa xác nhận.
- Không commit file output runtime như MP4, database local, upload thật hoặc cache render.

## Frontend Phase Hiện Tại

- UI hiện tại tuân thủ `.agents/rules/static-multipage-ui.md`.
- Entry UI là `frontend/index.html`.
- Mỗi màn hình chính nằm trong `frontend/pages/`.
- CSS chung và JS chung nằm trong `frontend/styles/` và `frontend/scripts/common/`.

## Khi Có Xung Đột

Nếu tài liệu cũ còn nhắc `app/` như thư mục UI chính, rule này thắng. Ghi chú lịch sử "đã chuyển từ app/ sang frontend/" thì được giữ, nhưng không dùng làm hướng dẫn thao tác mới.
