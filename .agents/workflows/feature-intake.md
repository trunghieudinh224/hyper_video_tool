# Workflow: Tiếp Nhận Tính Năng Mới

Workflow thực thi nằm ở:

```text
.agents/skills/wf-feature-intake/SKILL.md
```

Dùng khi người dùng đưa yêu cầu tính năng mới cho Hyper Video Tool nhưng scope chưa rõ.

Ví dụ:

- Làm màn hình upload tài nguyên.
- Thêm template video mới.
- Thêm preview scene.
- Thêm render queue.
- Thêm import/export JSON.
- Nâng cấp UI một màn hình cụ thể.

Nguyên tắc:

- Intake trước, code sau.
- Luôn đọc `plan-quality`.
- Luôn cập nhật `.agents/tasks/current-task.md` sau khi người dùng duyệt.
- Không mở rộng sang cloud/auth/timeline editor phức tạp nếu chưa được yêu cầu rõ.
- Không dùng gradient hoặc landing page trong task UI.
