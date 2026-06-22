---
name: wf-codegraph-status
description: >
  Workflow kiểm tra trạng thái CodeGraph của project hiện tại. Dùng để xác nhận
  project đã init chưa, index có up to date không, và agent có thể dùng
  CodeGraph MCP an toàn không.
---

# Workflow: CodeGraph Status

Sử dụng workflow này khi cần kiểm tra tình trạng CodeGraph của project hiện tại.

## Mục Tiêu

- Xác nhận project hiện tại đã có `.codegraph/` chưa.
- Chạy `codegraph status`.
- Tóm tắt trạng thái index cho user theo ngôn ngữ dễ hiểu.
- Nếu chưa init, hướng user dùng `wf-codegraph-init`.

## Khi Nào Dùng

Kích hoạt khi user nói một trong các ý sau:

- `wf-codegraph-status`
- `kiểm tra codegraph`
- `codegraph status`
- `project này codegraph ổn chưa`

## Quy Trình Bắt Buộc

### Bước 1: Kiểm tra thư mục hiện tại

Chạy:

```bash
pwd
```

Xác nhận đang đứng ở thư mục gốc project.

### Bước 2: Chạy status

Chạy:

```bash
codegraph status
```

### Bước 3: Diễn giải kết quả

Nếu output cho thấy `Index is up to date`:

- Báo rằng CodeGraph đã sẵn sàng.
- Có thể tiếp tục dùng agent để explore/caller/callee/impact.

Nếu output báo chưa init:

- Báo rõ project chưa init.
- Gợi ý chạy `wf-codegraph-init`.

Nếu output báo lỗi lock:

- Gợi ý chạy `wf-codegraph-unlock`.

Nếu output báo index cũ:

- Gợi ý chạy `wf-codegraph-sync`.
- Nếu sync không giải quyết được, gợi ý `wf-codegraph-index`.

## Báo Cáo Kết Quả

Kết thúc bằng format:

```markdown
CodeGraph status:
- Project path:
- Initialized: yes | no | unknown
- Up to date: yes | no | unknown
- Files/nodes/edges:
- Recommended next step:
```

## Lưu Ý An Toàn

- Workflow này chỉ đọc trạng thái, không sửa code.
- Không tự chạy `init`, `sync`, `index`, hoặc `unlock` trong workflow status trừ khi user yêu cầu tiếp.
