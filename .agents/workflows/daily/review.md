---
description: Rà soát toàn bộ thay đổi chưa commit trong Hyper Video Tool.
---

# Daily Workflow: Review

Workflow thực thi nằm ở `.agents/skills/wf-review/SKILL.md`.

Tóm tắt:

1. Chạy `git status --short`, `git diff --name-only HEAD`, `git diff --stat HEAD`.
2. Phân loại diff theo frontend, backend, templates, data, docs/rules.
3. Review theo checklist Hyper Video Tool:
   - Static multi-page UI rules.
   - JS state/localStorage/event behavior.
   - Preview/render/template consistency.
   - Video Style - Scene Item contract.
   - Secrets/runtime output.
4. Báo findings theo severity trước summary.
5. Nếu user yêu cầu fix, chỉ sửa lỗi thuộc scope review và chạy verification liên quan.
