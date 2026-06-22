---
name: wf-codegraph-sync
description: >
  Workflow cập nhật CodeGraph index sau khi pull code, sửa/thêm/xóa file, hoặc
  quay lại project cũ. Dùng `codegraph sync` để cập nhật nhanh thay đổi mới.
---

# Workflow: CodeGraph Sync

Sử dụng workflow này khi project đã init CodeGraph và cần cập nhật index theo thay đổi mới.

## Mục Tiêu

- Kiểm tra project đã init CodeGraph.
- Chạy `codegraph sync` để cập nhật index nhanh.
- Chạy `codegraph status` sau sync.
- Báo lại kết quả rõ ràng cho user.

## Khi Nào Dùng

Kích hoạt khi user nói một trong các ý sau:

- `wf-codegraph-sync`
- `sync codegraph`
- `vừa pull code, cập nhật codegraph`
- `cập nhật index codegraph`

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

- Không chạy `sync`.
- Báo user dùng `wf-codegraph-init` trước.

### Bước 3: Chạy sync

Nếu status cho thấy project đã init, chạy:

```bash
codegraph sync
```

### Bước 4: Kiểm tra lại status

Chạy:

```bash
codegraph status
```

Tóm tắt index hiện tại cho user.

## Báo Cáo Kết Quả

Kết thúc bằng format:

```markdown
CodeGraph sync result:
- Project path:
- Action: synced | skipped | failed
- Current index status:
- Recommended next step:
```

## Lưu Ý An Toàn

- `sync` chỉ cập nhật `.codegraph/`, không sửa mã nguồn.
- Nếu sync lỗi hoặc output có vẻ không đúng, gợi ý `wf-codegraph-index`.
- Nếu gặp stale lock, gợi ý `wf-codegraph-unlock`.
