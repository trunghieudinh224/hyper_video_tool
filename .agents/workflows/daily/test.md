---
description: Chạy test/verification phù hợp cho Hyper Video Tool.
---

# Daily Workflow: Test

Run this workflow only when the user requests tests or verification.

Workflow thực thi nằm ở `.agents/skills/wf-test/SKILL.md`.

Tóm tắt:

1. Xác định scope từ diff hoặc yêu cầu user.
2. JS: chạy `node --check` file liên quan.
3. Static UI: chỉ dùng `python3 -m http.server 8019` cho page không cần API; mặc định viewport PC/laptop.
4. Backend/render: dùng script phù hợp trong `backend/package.json`; render smoke chỉ khi user yêu cầu vì tạo MP4.
5. Test dài hơn 3 phút phải báo tiến trình định kỳ.
6. Dọn server/process tạm trước khi bàn giao.
