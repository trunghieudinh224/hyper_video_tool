# .agents

Thư mục này chứa cấu hình làm việc cho AI agent trong project.

## Vai trò thư mục

- `skills/`: nơi Antigravity/Codex gọi được skill và workflow thực thi. Workflow thực thi dùng tiền tố `wf-`.
- `workflows/`: mục lục/tài liệu phân nhóm workflow để người dùng nhìn nhanh; không phải nguồn gọi workflow chính.
- `rules/`: rule bắt buộc về code, UI, project config.
- `context/`: tài liệu sống về project.
- `memory/`: bài học dài hạn giúp agent tránh lặp lại lỗi.
- `tasks/`: `current-task.md` cho task đang được theo dõi, `task-history.md` cho báo cáo cũ, cùng roadmap/checklist.
- `reports/`: báo cáo handoff/review/delivery nếu task cần artifact lưu riêng.
- `templates/`: template task/report/CSS/JS.
- `scripts/`: script người dùng tự chạy; một số script khởi động server và đọc/ghi `.env`.

## Thứ Tự Tin Cậy

- `AGENTS.md` và rules xác định cách agent được phép làm việc.
- README và code hiện tại xác nhận behavior đã implement.
- `context/` là bản tóm tắt cần đối chiếu khi có dấu hiệu cũ; roadmap và changelog có thể là snapshot lịch sử.
- `.agents/skills/*/SKILL.md` là nguồn thực thi workflow. Nội dung trong `.agents/workflows/` chỉ là mục lục/tóm tắt và phải trỏ về skill tương ứng.
- `.agents/tasks/current-task.md` chỉ mô tả một task đang được theo dõi; `completed` nghĩa là không có task active trong file. Báo cáo cũ được giữ ở `.agents/tasks/task-history.md` và không quyết định task hiện tại.
- Khi bắt đầu task mới cần tracking, lưu task đã hoàn tất vào `task-history.md` rồi thay nội dung `current-task.md` bằng đúng một task theo template; không nối thêm report cũ vào file hiện tại.
- Không tự chạy script trong `.agents/scripts/`: chúng ghi `HVT_PORT` vào `.env`, mở browser và giữ process chạy. Khi agent cần khởi chạy app theo yêu cầu, ưu tiên `wf-run-web`; chỉ dùng launcher script khi user yêu cầu đích danh và chấp nhận tác động `.env`.
