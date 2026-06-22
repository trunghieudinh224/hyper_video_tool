# Mục Lục Workflow

> Workflow thực thi nằm trong `.agents/skills/wf-*`.
> Thư mục `.agents/workflows/` chỉ dùng để xem nhanh, không phải nguồn gọi workflow chính.

## Planning

- `wf-feature-intake` — Tiếp nhận yêu cầu tính năng mới, chốt phạm vi MVP và cập nhật `.agents/tasks/current-task.md` sau khi được duyệt.
- `plan-quality` — Kiểm tra chất lượng kế hoạch trước khi triển khai việc lớn.
- `domain-glossary` — Thống nhất thuật ngữ nghiệp vụ khi tên gọi còn mơ hồ.

## Engineering

- `wf-diagnose` — Debug lỗi runtime, test fail hoặc hành vi khó hiểu.
- `wf-tdd-slice` — Làm feature/fix theo lát cắt nhỏ có kiểm thử.
- `wf-architecture-review` — Rà soát kiến trúc trước refactor hoặc khi code bắt đầu khó sửa.

## UI

- `design-taste-frontend` — Định hướng giao diện gọn, sang, không giống template AI.
- `web-design-guidelines` — Quy tắc thiết kế web chung.
- `responsive-ui` — Kiểm tra và sửa responsive desktop/tablet/mobile.
- `wf-ui-taste-polish` — Polish giao diện sau khi UI chạy được.

## Web

- `webapp-testing` — Kiểm thử UI/web app local bằng browser hoặc script phù hợp.
- `wf-web-review` — Review thay đổi HTML/CSS/JS và UI behavior; Node API/render endpoint chỉ xét ở phase sau.

## Memory

- `wf-update-learnings` — Cập nhật bài học kỹ thuật tái sử dụng vào `.agents/memory/learnings.md`.
