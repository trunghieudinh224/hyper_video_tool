---
name: wf-codegraph-callgraph
description: >
  Workflow dựng call graph cho một symbol hoặc flow cụ thể bằng CodeGraph
  callers/callees/node. Dùng để hiểu đường đi xử lý trước khi debug, review,
  hoặc bàn giao.
---

# Workflow: CodeGraph Callgraph

Sử dụng workflow này khi cần biết một hàm/class/route được gọi từ đâu và gọi tiếp những gì.

## Mục Tiêu

- Tìm definition đúng của symbol.
- Liệt kê callers và callees.
- Dựng flow ngắn theo thứ tự xử lý.
- Chỉ ra entrypoint và điểm side effect.

## Khi Nào Dùng

Kích hoạt khi user nói một trong các ý sau:

- `wf-codegraph-callgraph`
- `callgraph codegraph`
- `hàm này được gọi từ đâu`
- `hàm này gọi tiếp gì`
- `vẽ flow xử lý của symbol này`

## Input Cần Có

Cần tên symbol hoặc mô tả flow.

Ví dụ:

```text
place_order
```

```text
flow đóng position futures
```

Nếu input là mô tả flow, dùng `wf-codegraph-explore` trước để tìm symbol chính, sau đó chạy callgraph cho symbol đó.

## Quy Trình Bắt Buộc

### Bước 1: Kiểm tra status

Chạy:

```bash
codegraph status
```

Nếu chưa init, gợi ý `wf-codegraph-init`.

### Bước 2: Tìm definition

Ưu tiên dùng MCP CodeGraph node/search.

Nếu có nhiều definition cùng tên:

- Liệt kê các candidate.
- Chọn candidate phù hợp với file/module hiện tại.
- Nếu vẫn mơ hồ, hỏi user chọn symbol.

### Bước 3: Lấy callers và callees

Ưu tiên dùng MCP callers/callees/node.

Nếu dùng CLI:

```bash
codegraph callers <symbol>
codegraph callees <symbol>
```

### Bước 4: Dựng call graph dễ đọc

Báo cáo dạng tuyến tính:

```text
entrypoint_or_route
  -> caller_a
  -> target_symbol
    -> callee_a
    -> callee_b
```

Nếu flow phân nhánh, chỉ giữ các nhánh quan trọng nhất để user đọc nhanh.

### Bước 5: Chỉ ra side effects

Đánh dấu các điểm có thể tạo side effect:

- Database write.
- External API call.
- File write.
- Network request.
- Trading/order execution.
- State mutation.

## Báo Cáo Kết Quả

Kết thúc bằng format:

```markdown
CodeGraph callgraph result:
- Target:
- Definition:
- Entrypoints/callers:
- Callees:
- Flow summary:
- Side effects:
- Notes/uncertainties:
```

## Lưu Ý An Toàn

- Workflow này để hiểu flow, không mặc định sửa code.
- Nếu call graph đụng live trading, DB migration, credentials hoặc auth, báo rõ rủi ro trước khi đề xuất sửa.
- Không mở rộng phân tích sang toàn repo nếu user chỉ hỏi một symbol.
