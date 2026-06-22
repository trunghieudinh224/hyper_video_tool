---
name: wf-codegraph-handoff
description: >
  Workflow tạo báo cáo bàn giao dựa trên kết quả CodeGraph khi chuyển việc giữa
  Antigravity và Codex hoặc giữa các agent. Ghi rõ query, files, symbols, flow,
  risks, assumptions và next actions.
---

# Workflow: CodeGraph Handoff

Sử dụng workflow này khi cần bàn giao ngữ cảnh CodeGraph cho agent khác hoặc cho phiên làm việc tiếp theo.

## Mục Tiêu

- Chắt lọc kết quả explore/impact/callgraph thành báo cáo ngắn.
- Giúp agent tiếp theo bắt đầu đúng điểm.
- Ghi rõ những gì đã biết, chưa biết, và việc tiếp theo.

## Khi Nào Dùng

Kích hoạt khi user nói một trong các ý sau:

- `wf-codegraph-handoff`
- `tạo handoff codegraph`
- `bàn giao cho Codex`
- `bàn giao cho Antigravity`
- `tóm tắt kết quả codegraph để phiên sau làm tiếp`

## Input Nên Có

- Yêu cầu gốc của user.
- Query CodeGraph đã dùng.
- File/symbol đã explore.
- Kết quả impact hoặc callgraph nếu có.
- Plan hoặc quyết định hiện tại.

Nếu thiếu thông tin, dùng CodeGraph explore/status bổ sung nhưng không mở rộng scope quá xa.

## Quy Trình Bắt Buộc

### Bước 1: Kiểm tra trạng thái project

Chạy:

```bash
codegraph status
```

Ghi lại project path và trạng thái index.

### Bước 2: Gom ngữ cảnh đã có

Tổng hợp:

- User request.
- Agent đang bàn giao từ đâu sang đâu.
- CodeGraph queries đã dùng.
- Files/symbols chính.
- Flow hiện tại.
- Rủi ro và constraints.
- Open questions.

### Bước 3: Nếu cần, explore bổ sung tối thiểu

Chỉ explore thêm nếu còn thiếu thông tin cốt lõi để agent tiếp theo làm việc.

Không mở task mới, không sửa code trong workflow handoff.

### Bước 4: Viết handoff report

Báo cáo phải đủ để agent tiếp theo có thể tiếp tục mà không phải hỏi lại phần đã rõ.

Nếu project có file handoff/task chuẩn, hỏi user trước khi ghi file. Nếu user chỉ cần output chat, trả trực tiếp trong chat.

## Format Handoff

```markdown
# CodeGraph Handoff

## Context
- Project:
- From agent:
- To agent:
- User request:
- CodeGraph status:

## CodeGraph Queries Used
- `<query or command>`

## Relevant Files
- `path/to/file.py` — lý do liên quan

## Key Symbols
- `symbol_name` — vai trò trong flow

## Current Flow
1. Step one
2. Step two
3. Step three

## Risks / Constraints
- Risk or rule to respect

## Open Questions
- Question or `None`

## Recommended Next Actions
1. Next action
2. Next action

## Suggested Verification
- Test/check command or manual check
```

## Lưu Ý An Toàn

- Không tự tạo/sửa file handoff nếu user chưa yêu cầu ghi ra file.
- Không tự implement trong lúc handoff.
- Với dự án có rule approval, nhắc rõ trạng thái approval hiện tại: chưa có | đã có | cần approval riêng.
