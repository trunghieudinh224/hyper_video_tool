---
description: Chạy test/verification phù hợp cho Hyper Video Tool.
---

# Daily Workflow: Test

Workflow thực thi nằm ở `.agents/skills/wf-test/SKILL.md`.

Tóm tắt:

1. Xác định scope từ diff hoặc yêu cầu user.
2. JS: chạy `node --check` file liên quan.
3. Static UI: chạy `python3 -m http.server 8019`, mở page liên quan, kiểm console và responsive nếu layout đổi.
4. Backend/render: dùng script trong `backend/package.json`, smoke render nếu có thay đổi render.
5. Test dài hơn 3 phút phải báo tiến trình định kỳ.
6. Dọn server/process tạm trước khi bàn giao.
