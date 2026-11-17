# Workflow: Tiếp Nhận Tính Năng Mới

Workflow thực thi duy nhất nằm ở:

```text
.agents/skills/wf-feature-intake/SKILL.md
```

Dùng chỉ khi còn quyết định sản phẩm/scope quan trọng chưa rõ. Nếu yêu cầu triển khai đã rõ và có authorization, bỏ intake.

Ví dụ:

- Làm màn hình upload tài nguyên.
- Thêm template video mới.
- Thêm preview scene.
- Thêm render queue.
- Thêm import/export JSON.
- Nâng cấp UI một màn hình cụ thể.

Nguyên tắc:

- Intake chỉ làm rõ mục tiêu/MVP; implementation plan thuộc `plan-quality`.
- Không hỏi duyệt lần hai nếu user đã yêu cầu triển khai và không còn quyết định chặn.
- Chỉ ghi `.agents/tasks/current-task.md` khi task cần tracking hoặc user yêu cầu.
- Chi tiết thực thi: `.agents/skills/wf-feature-intake/SKILL.md`.
