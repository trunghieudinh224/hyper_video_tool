---
name: wf-codegraph-setup-project
description: >
  Setup CodeGraph cho một project cụ thể: kiểm tra MCP/global binary, thêm
  `.codegraph/` vào `.gitignore`, hướng dẫn hoặc cập nhật rule project
  (AGENTS.md/GEMINI.md/CLAUDE.md) để agent dùng workflow CodeGraph đúng quy trình.
---

# Workflow: CodeGraph Setup Project

Dùng workflow này một lần cho mỗi project sau khi đã copy các workflow CodeGraph vào skill/workflow của project.

## Mục Tiêu

- Xác nhận project có thể dùng CodeGraph.
- Đảm bảo `.codegraph/` không bị commit.
- Ghi rule ngắn vào file hướng dẫn agent của project.
- Không sửa logic ứng dụng.

## Quy Trình

1. Kiểm tra project root:

```bash
pwd
```

2. Kiểm tra CodeGraph CLI:

```bash
which codegraph
codegraph --version
```

Nếu `which codegraph` không thấy binary, báo user kiểm tra cài đặt hoặc MCP config.

3. Kiểm tra `.gitignore`.

Nếu chưa có dòng này thì thêm:

```gitignore
.codegraph/
```

4. Kiểm tra file rule của project theo thứ tự:

- `GEMINI.md`
- `AGENTS.md`
- `CLAUDE.md`

Nếu có file phù hợp, đề xuất thêm block:

```markdown
## CodeGraph Workflow

Khi bắt đầu làm việc trong dự án, ưu tiên dùng workflow CodeGraph của dự án để nghiên cứu codebase trước khi lập plan hoặc sửa code.

Quy trình mặc định:
- Project mới: `wf-codegraph-init` -> `wf-codegraph-explore`
- Project cũ: `wf-codegraph-status` -> `wf-codegraph-explore`
- Sau khi pull/sửa nhiều code: `wf-codegraph-status` -> `wf-codegraph-sync` -> `wf-codegraph-explore`
- Trước khi sửa/refactor symbol quan trọng: `wf-codegraph-impact`
- Khi cần hiểu caller/callee/flow: `wf-codegraph-callgraph`
- Khi bàn giao giữa agent: `wf-codegraph-handoff`

Các workflow nghiên cứu không được tự sửa code nếu chưa có yêu cầu hoặc approval rõ ràng.
```

5. Nếu project chưa init CodeGraph, chạy hoặc đề xuất:

```bash
codegraph init
```

Nếu đã init, chỉ chạy:

```bash
codegraph status
```

## Báo Cáo Kết Quả

```markdown
CodeGraph project setup:
- Project path:
- CLI available: yes | no
- `.gitignore` updated: yes | no | already present
- Agent rule updated: file path | skipped
- CodeGraph index: initialized | already initialized | not initialized
- Next step:
```

## Lưu Ý

- Không thêm `--path` vào MCP config global trừ khi client không detect workspace.
- Không commit `.codegraph/`.
- Không sửa code ứng dụng trong workflow này.
