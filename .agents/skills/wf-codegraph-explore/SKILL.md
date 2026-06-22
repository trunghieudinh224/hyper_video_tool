---
name: wf-codegraph-explore
description: >
  Workflow dùng CodeGraph để nghiên cứu khu vực code liên quan tới một yêu cầu,
  bug, feature, hoặc flow nghiệp vụ trước khi lập plan hoặc sửa code. Ưu tiên
  dùng MCP CodeGraph explore; fallback sang CLI/search nếu MCP không có.
---

# Workflow: CodeGraph Explore

Sử dụng workflow này khi bắt đầu một task mới và cần hiểu codebase trước khi hành động.

## Mục Tiêu

- Dùng CodeGraph để tìm đúng khu vực code liên quan.
- Liệt kê file chính, symbol chính, flow hiện tại và rủi ro.
- Tạo nền tảng cho plan/handoff mà chưa sửa code.

## Khi Nào Dùng

Kích hoạt khi user nói một trong các ý sau:

- `wf-codegraph-explore`
- `dùng codegraph explore`
- `nghiên cứu flow này bằng codegraph`
- `tìm khu vực code liên quan`
- `trước khi plan, explore bằng codegraph`

## Quy Trình Bắt Buộc

### Bước 1: Xác nhận project sẵn sàng

Chạy hoặc dùng MCP để kiểm tra:

```bash
codegraph status
```

Nếu project chưa init, dừng và gợi ý chạy `wf-codegraph-init`.

Nếu index cũ, gợi ý chạy `wf-codegraph-sync` trước khi explore.

### Bước 2: Xác định câu hỏi explore

Tóm tắt yêu cầu thành một query ngắn, ví dụ:

```text
order execution futures position sync close trade history
```

Hoặc:

```text
login auth session middleware user route
```

Nếu yêu cầu quá mơ hồ, hỏi user 1 câu ngắn để làm rõ flow/module cần explore.

### Bước 3: Dùng CodeGraph explore

Ưu tiên dùng MCP CodeGraph explore với query tự nhiên hoặc danh sách symbol/file.

Nếu không có MCP tool, fallback bằng CLI:

```bash
codegraph query "<keyword>"
codegraph files
```

Không đọc lan man toàn repo. Chỉ mở thêm file khi CodeGraph chỉ ra liên quan trực tiếp.

### Bước 4: Tổng hợp phát hiện

Báo cáo cần có:

- File/module liên quan.
- Symbol chính: function, class, route, component.
- Flow hiện tại theo thứ tự xử lý.
- Dữ liệu/state quan trọng đi qua flow.
- Rủi ro khi sửa.
- Điểm chưa rõ cần hỏi user.

### Bước 5: Kết luận bước tiếp theo

Nếu user đang ở giai đoạn planning:

- Đề xuất plan ngắn hoặc chuyển sang workflow plan của project.

Nếu user đang debug:

- Đề xuất vị trí kiểm tra/sửa tối thiểu.

Nếu user cần bàn giao:

- Gợi ý chạy `wf-codegraph-handoff`.

## Báo Cáo Kết Quả

Kết thúc bằng format:

```markdown
CodeGraph explore result:
- Query:
- Project status:
- Main files:
- Main symbols:
- Current flow:
- Risks:
- Open questions:
- Recommended next step:
```

## Lưu Ý An Toàn

- Workflow này mặc định chỉ nghiên cứu, không sửa code.
- Với dự án có rule approval, không được implement trước khi plan được duyệt.
- Nếu phát hiện cần thay đổi DB schema, credentials, live trading, hoặc risk logic, phải báo rõ là rủi ro cần approval riêng.
