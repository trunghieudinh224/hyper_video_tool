---
description: Chuẩn bị commit, chia phase và commit an toàn cho Hyper Video Tool.
---

# Daily Workflow: Commit Ready

Workflow thực thi nằm ở `.agents/skills/wf-commit-ready/SKILL.md`.

Tóm tắt:

1. Kiểm `git status --short`, `git diff --stat HEAD`, `git diff --name-only HEAD`.
2. Kiểm secret và output rác: `.env`, `outputs/`, `uploads/`, `.cache/`, log/cache/render output.
3. Chạy verification phù hợp theo diff.
4. Chia phase commit:
   - docs/rules/workflow
   - shared UI foundation
   - data/constants/storage
   - feature UI/behavior
   - preview/render/backend
5. Kiểm staged diff trước từng commit.
6. Commit bằng Conventional Commits tiếng Anh.
7. Push chỉ khi user yêu cầu hoặc xác nhận rõ.
