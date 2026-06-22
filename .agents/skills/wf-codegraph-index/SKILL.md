---
name: wf-codegraph-index
description: >
  Workflow dựng lại chỉ mục CodeGraph cho project hiện tại. Dùng khi chỉ mục có vẻ cũ,
  sync không giải quyết được, hoặc cần dựng lại toàn bộ chỉ mục.
---

# Workflow: CodeGraph Index

Sử dụng workflow này khi cần dựng lại chỉ mục CodeGraph của project hiện tại.

## Mục Tiêu

- Xác nhận project đã init CodeGraph.
- Chạy `codegraph index` để dựng lại chỉ mục.
- Chạy `codegraph status` sau khi dựng lại chỉ mục.
- Báo lại kết quả cho người dùng.

## Khi Nào Dùng

Kích hoạt khi người dùng nói một trong các ý sau:

- `wf-codegraph-index`
- `re-index codegraph`
- `build lại index codegraph`
- `codegraph index`
- `sync không ăn, index lại đi`

## Quy Trình Bắt Buộc

### Bước 1: Kiểm tra thư mục hiện tại

Chạy:

```bash
pwd
```

Xác nhận đang đứng ở thư mục gốc project.

### Bước 2: Kiểm tra project đã init

Chạy:

```bash
codegraph status
```

Nếu project chưa init:

- Không chạy `index`.
- Báo người dùng dùng `wf-codegraph-init` trước.

### Bước 3: Chạy index

Nếu project đã init, chạy:

```bash
codegraph index
```

### Bước 4: Kiểm tra lại status

Chạy:

```bash
codegraph status
```

Tóm tắt số files/nodes/edges và trạng thái cuối cùng.

## Báo Cáo Kết Quả

Kết thúc bằng format:

```markdown
CodeGraph index result:
- Project path:
- Action: indexed | skipped | failed
- Files/nodes/edges:
- Current index status:
- Recommended next step:
```

## Lưu Ý An Toàn

- `index` rebuild dữ liệu trong `.codegraph/`, không sửa mã nguồn.
- Nếu project rất lớn và tác vụ dự kiến chạy lâu hơn quy định của project, hỏi người dùng xác nhận tần suất báo cáo tiến độ trước khi chạy.
- Nếu gặp stale lock, dùng `wf-codegraph-unlock` trước.
