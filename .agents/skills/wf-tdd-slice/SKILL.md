---
name: wf-tdd-slice
description: >
  Workflow phát triển hoặc sửa bug theo TDD dạng vertical slice/tracer bullet:
  một behavior test -> minimal implementation -> refactor. Dùng khi user muốn
  test-first hoặc khi thay đổi logic rủi ro cao cần guardrail.
---

# Workflow: TDD Slice

Dùng khi cần xây feature/fix bug theo test-first, đặc biệt với logic quan trọng.

## Nguyên Tắc

Test hành vi qua public interface, không test implementation detail. Làm từng lát dọc nhỏ, không viết toàn bộ test rồi mới viết toàn bộ code.

## Quy Trình

### 1. Chọn behavior đầu tiên

Xác định một behavior nhỏ, có giá trị, kiểm chứng được end-to-end hoặc qua interface cao nhất có thể.

Trước khi viết code, xác nhận:

- Interface public nào sẽ được test.
- Behavior nào quan trọng nhất.
- Edge case nào nằm trong/out of scope.

### 2. RED

Viết một test cho đúng một behavior.

Test tốt:

- Mô tả điều hệ thống làm, không mô tả cách làm.
- Gọi public API/function/CLI/route phù hợp.
- Fail vì behavior chưa có hoặc bug còn tồn tại.

### 3. GREEN

Viết code tối thiểu để test pass.

Không thêm feature dự đoán tương lai. Không refactor lớn khi test đang đỏ.

### 4. Repeat

Lặp lại mỗi behavior:

```text
RED -> GREEN -> RED -> GREEN
```

Mỗi vòng chỉ thêm một test và phần code tối thiểu tương ứng.

### 5. Refactor

Khi toàn bộ test xanh:

- Loại duplication.
- Làm module sâu hơn nếu tự nhiên.
- Giữ interface ổn định.
- Chạy test sau mỗi refactor đáng kể.

## Checklist Mỗi Vòng

```markdown
- [ ] Test mô tả behavior, không bám implementation.
- [ ] Test fail đúng lý do.
- [ ] Code chỉ đủ để pass test hiện tại.
- [ ] Không thêm speculative feature.
- [ ] Test pass sau fix.
```

## Báo Cáo Kết Quả

```markdown
TDD slice report:
- Behavior covered:
- Public interface tested:
- Tests added:
- Implementation summary:
- Refactor done:
- Commands run:
- Remaining risks:
```
