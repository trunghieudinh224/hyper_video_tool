---
name: wf-codegraph-impact
description: >
  Workflow phân tích tác động trước khi sửa/refactor một symbol quan trọng bằng
  CodeGraph impact, callers và callees. Dùng để giảm rủi ro regression.
---

# Workflow: CodeGraph Impact

Sử dụng workflow này trước khi sửa một function/class/route/component quan trọng.

## Mục Tiêu

- Xác định nơi gọi symbol cần sửa.
- Xác định symbol đó gọi tiếp những gì.
- Ước lượng blast radius trước khi implement.
- Đề xuất test cần chạy sau thay đổi.

## Khi Nào Dùng

Kích hoạt khi user nói một trong các ý sau:

- `wf-codegraph-impact`
- `impact codegraph`
- `phân tích ảnh hưởng hàm này`
- `trước khi sửa hàm này xem ảnh hưởng tới đâu`
- `refactor symbol này an toàn không`

## Input Cần Có

Workflow cần ít nhất một trong các thông tin:

- Tên function/class/method.
- File chứa symbol.
- Dòng code hoặc mô tả flow có symbol đó.

Nếu user chưa đưa symbol cụ thể, hỏi lại ngắn gọn:

```text
Bạn muốn phân tích impact cho symbol nào?
```

## Quy Trình Bắt Buộc

### Bước 1: Kiểm tra CodeGraph status

Chạy hoặc dùng MCP:

```bash
codegraph status
```

Nếu chưa init, gợi ý `wf-codegraph-init`.

Nếu index cũ, gợi ý `wf-codegraph-sync`.

### Bước 2: Xác định symbol chính xác

Nếu symbol bị trùng tên, dùng file/path hoặc line để phân biệt.

Ưu tiên dùng MCP node/search để xác định đúng definition trước khi phân tích impact.

### Bước 3: Phân tích impact

Ưu tiên dùng MCP CodeGraph impact.

Nếu dùng CLI:

```bash
codegraph impact <symbol>
codegraph callers <symbol>
codegraph callees <symbol>
```

Nếu symbol có ký tự shell đặc biệt, quote symbol cẩn thận.

### Bước 4: Phân loại rủi ro

Phân loại từng impact thành:

- `direct caller`: gọi trực tiếp symbol.
- `downstream callee`: symbol gọi tiếp.
- `shared contract`: API/model/schema/type/response bị phụ thuộc.
- `test surface`: test hoặc smoke check cần chạy.

### Bước 5: Đề xuất cách sửa an toàn

Gợi ý:

- Sửa tối thiểu hay refactor rộng.
- Có cần feature flag/config không.
- Có cần update test không.
- Có cần approval riêng không.

## Báo Cáo Kết Quả

Kết thúc bằng format:

```markdown
CodeGraph impact result:
- Target symbol:
- Definition:
- Direct callers:
- Callees/downstream:
- Potentially affected files:
- Risk level: low | medium | high
- Suggested test coverage:
- Recommended next step:
```

## Lưu Ý An Toàn

- Không sửa code trong workflow này trừ khi user đã yêu cầu implement sau khi xem impact.
- Với trading/risk/database/auth logic, nếu impact rộng hoặc high risk, dừng xin approval rõ ràng trước khi sửa.
- Nếu CodeGraph không tìm thấy symbol, không đoán bừa; dùng search/rg để xác minh rồi báo giới hạn phân tích.
