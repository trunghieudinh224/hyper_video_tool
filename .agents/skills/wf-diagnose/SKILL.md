---
name: wf-diagnose
description: >
Workflow debug có kỷ luật cho bug khó, lỗi runtime, test fail, hoặc
  performance regression. Dùng evidence/repro để tránh đoán; không tự chạy test/server nếu user chưa yêu cầu verification.
---

# Workflow: Diagnose

Dùng khi user báo lỗi, test fail, hành vi sai, hoặc performance regression.

## Nguyên Tắc Chính

Không đoán trước khi đọc evidence có sẵn. Chỉ chạy test, script, browser hoặc server khi user yêu cầu test/verification; bug report không tự động cho phép chạy chúng.

## Quy Trình

### 1. Dựng feedback loop

Tìm feedback loop từ log/output/repro user đã cung cấp hoặc code path. Các cách dưới đây chỉ chạy khi user yêu cầu verification:

- Failing test.
- CLI/script với fixture.
- HTTP/curl request.
- Browser/e2e script.
- Replay log/payload.
- Harness nhỏ gọi trực tiếp code path.

Nếu không dựng được loop, báo rõ đã thử gì và cần artifact nào từ user.

### 2. Xác Nhận Symptom

Nếu đã được yêu cầu chạy verification, chạy loop và xác nhận:

- Lỗi đúng với mô tả của user.
- Lỗi tái hiện được nhiều lần, hoặc flake rate đủ cao để debug.
- Có symptom cụ thể: error, diff output, timing, log.

### 3. Hypothesis

Tạo 3-5 giả thuyết có thứ tự ưu tiên.

Mỗi giả thuyết phải falsifiable:

```text
Nếu nguyên nhân là X, thì thay đổi/quan sát Y sẽ làm lỗi biến mất hoặc rõ hơn.
```

### 4. Instrument

Kiểm tra từng giả thuyết, một biến mỗi lần.

Ưu tiên:

1. Debugger/REPL.
2. Log có tag rõ ràng.
3. Timing/profiler/query plan cho performance.

Nếu thêm log tạm, dùng tag duy nhất:

```text
[DEBUG-xxxx]
```

### 5. Fix + regression

- Sửa tối thiểu theo scope.
- Chỉ thêm/chạy regression test khi user yêu cầu test/TDD/verification.
- Nếu không được yêu cầu chạy, ghi loop/test chưa chạy thay vì nói fix đã pass.

### 6. Cleanup

Trước khi báo xong:

- Ghi rõ symptom đã được xác nhận bằng evidence nào.
- Ghi regression test/loop đã chạy hoặc `Not run` kèm lý do.
- Xóa mọi debug log/prototype tạm.
- Ghi nguyên nhân thật sự và test đã chạy.

## Báo Cáo Kết Quả

```markdown
Diagnosis report:
- Symptom:
- Feedback loop:
- Repro status:
- Winning hypothesis:
- Fix summary:
- Regression coverage:
- Commands run:
- Remaining risks:
```
