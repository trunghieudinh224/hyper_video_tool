---
name: wf-project-health-check
description: >
  Kiểm tra nhanh sau khi onboarding project mới để xác nhận cấu trúc `.agents`,
  rule, skill, memory, CodeGraph, mục lục workflow và file entrypoint đã đầy đủ.
---

# Workflow: Project Health Check

Dùng workflow này sau khi chạy `wf-project-onboarding-setup` hoặc khi mở lại một project đã setup trước đó và muốn kiểm tra nền agent có đầy đủ chưa.

## Mục Tiêu

Xác nhận project có đủ các phần quan trọng:

- `AGENTS.md`
- `GEMINI.md`
- `.agents/README.md`
- `.agents/skills/`
- `.agents/workflows/README.md`
- `.agents/rules/`
- `.agents/context/project-profile.md`
- `.agents/context/shared-setup-version.md`
- `.agents/memory/learnings.md`
- `.codegraph/README.md` nếu project bật CodeGraph
- `.gitignore` có `.codegraph/` nếu project dùng CodeGraph

## Quy Trình

### 1. Xác nhận project root

Chạy `pwd` và kiểm tra dấu hiệu project root:

```text
.git/
composer.json
artisan
package.json
README.md
.agents/
AGENTS.md
GEMINI.md
```

Nếu không chắc đang ở project root, hỏi người dùng trước khi kiểm tra tiếp.

### 2. Kiểm tra file entrypoint

Kiểm tra:

```bash
test -f AGENTS.md
test -f GEMINI.md
```

Nếu thiếu:

- Báo rõ file nào thiếu.
- Gợi ý chạy lại `wf-project-onboarding-setup`.
- Không tự tạo file nếu người dùng chỉ yêu cầu kiểm tra.

### 3. Kiểm tra cấu trúc `.agents`

Kiểm tra tối thiểu:

```text
.agents/README.md
.agents/skills/
.agents/workflows/
.agents/workflows/README.md
.agents/rules/
.agents/context/
.agents/context/project-profile.md
.agents/context/shared-setup-version.md
.agents/tasks/current-task.md
.agents/reports/
.agents/templates/
```

### 4. Kiểm tra memory

Nếu project dùng memory, kiểm tra:

```text
.agents/memory/README.md
.agents/memory/learnings.md
.agents/skills/wf-update-learnings/
```

Nếu thiếu `learnings.md`, báo đây là phần nên bổ sung vì giúp agent tránh lặp lỗi cũ.

### 5. Kiểm tra CodeGraph

Nếu project dùng CodeGraph, kiểm tra:

```text
.codegraph/README.md
.agents/skills/wf-codegraph-init/
.agents/skills/wf-codegraph-status/
.agents/skills/wf-codegraph-sync/
.agents/skills/wf-codegraph-explore/
.agents/skills/wf-codegraph-impact/
```

Kiểm tra `.gitignore` có dòng:

```gitignore
.codegraph/
```

Nếu có CLI CodeGraph, có thể chạy:

```bash
codegraph status
```

Nếu command không tồn tại, báo rõ là CLI/MCP CodeGraph chưa sẵn sàng.

### 6. Kiểm tra skill theo loại project

Đọc `.agents/context/project-profile.md`, sau đó kiểm tra gợi ý:

Laravel:

```text
.agents/skills/laravel-best-practices/
.agents/skills/database-migration/
.agents/skills/wf-laravel-feature-intake/
.agents/skills/wf-laravel-debug/
.agents/skills/wf-laravel-review/
.agents/rules/coding-rules.md
.agents/rules/database-conventions.md
```

Python web:

```text
.agents/skills/modern-python/
.agents/skills/wf-python-pytest/
.agents/skills/wf-sqlalchemy-safe-migration/
```

Web UI:

```text
.agents/skills/frontend-design/
.agents/skills/responsive-ui/
.agents/skills/webapp-testing/
.agents/skills/wf-ui-taste-polish/
```

### 7. Báo cáo kết quả

Kết thúc bằng báo cáo ngắn:

```markdown
Project health check:
- Project path:
- Entrypoints:
- .agents structure:
- Skills:
- Rules:
- Memory:
- CodeGraph:
- Version file:
- Missing/needs attention:
- Recommended next actions:
```

## Quy Tắc

- Workflow này mặc định chỉ kiểm tra, không tự overwrite.
- Nếu cần tạo/bổ sung file thiếu, hỏi người dùng trước rồi chạy `wf-project-onboarding-setup` hoặc script setup phù hợp.
- Không chạy migration, install dependency, deploy, restore backup, hoặc sửa code ứng dụng.
