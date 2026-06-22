---
name: wf-codegraph-unlock
description: >
  Workflow gỡ stale lock của CodeGraph khi lần index/sync trước bị dừng đột
  ngột hoặc CodeGraph báo có lock file đang chặn indexing.
---

# Workflow: CodeGraph Unlock

Sử dụng workflow này khi CodeGraph báo stale lock hoặc indexing/syncing bị kẹt do lock.

## Mục Tiêu

- Xác nhận project hiện tại là đúng project.
- Chỉ chạy unlock khi có dấu hiệu lock/stale lock.
- Chạy `codegraph unlock`.
- Kiểm tra lại bằng `codegraph status`.
- Gợi ý bước tiếp theo: `wf-codegraph-sync` hoặc `wf-codegraph-index`.

## Khi Nào Dùng

Kích hoạt khi user nói một trong các ý sau:

- `wf-codegraph-unlock`
- `codegraph bị lock`
- `stale lock`
- `unlock codegraph`
- `index bị kẹt`

## Quy Trình Bắt Buộc

### Bước 1: Kiểm tra thư mục hiện tại

Chạy:

```bash
pwd
```

Xác nhận đang đứng ở thư mục gốc project.

### Bước 2: Kiểm tra status/lỗi

Chạy:

```bash
codegraph status
```

Nếu output không có dấu hiệu lock/stale lock:

- Báo user rằng hiện chưa thấy lock.
- Không bắt buộc chạy unlock.
- Gợi ý workflow phù hợp hơn nếu cần, ví dụ `wf-codegraph-sync` hoặc `wf-codegraph-index`.

Nếu output có lock/stale lock, tiếp tục bước 3.

### Bước 3: Chạy unlock

Chạy:

```bash
codegraph unlock
```

### Bước 4: Kiểm tra lại status

Chạy:

```bash
codegraph status
```

Nếu status ổn, gợi ý user chạy:

```bash
codegraph sync
```

Hoặc nếu cần rebuild toàn bộ:

```bash
codegraph index
```

## Báo Cáo Kết Quả

Kết thúc bằng format:

```markdown
CodeGraph unlock result:
- Project path:
- Lock detected: yes | no | unknown
- Action: unlocked | skipped | failed
- Current status:
- Recommended next step:
```

## Lưu Ý An Toàn

- Chỉ gỡ lock của CodeGraph, không xóa dữ liệu project.
- Không xóa toàn bộ `.codegraph/` trừ khi user yêu cầu rõ.
- Nếu unlock xong vẫn lỗi, báo nguyên văn lỗi quan trọng cho user.
