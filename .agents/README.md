# .agents

Thư mục này chứa cấu hình làm việc cho AI agent trong project.

## Vai trò thư mục

- `skills/`: nơi Antigravity/Codex gọi được skill và workflow thực thi. Workflow thực thi dùng tiền tố `wf-`.
- `workflows/`: mục lục/tài liệu phân nhóm workflow để người dùng nhìn nhanh; không phải nguồn gọi workflow chính.
- `rules/`: rule bắt buộc về code, UI, project config.
- `context/`: tài liệu sống về project.
- `memory/`: bài học dài hạn giúp agent tránh lặp lại lỗi.
- `tasks/`: task hiện tại, checklist, ghi chú thực thi.
- `reports/`: handoff/review/delivery reports.
- `templates/`: template task/report/CSS/JS.
