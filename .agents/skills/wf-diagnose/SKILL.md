---
name: wf-diagnose
description: >
  Workflow debug có kỷ luật cho bug khó, lỗi runtime, test fail, hoặc
  performance regression. Bắt buộc dựng feedback loop/repro trước khi đoán và sửa.
---

# Workflow: Diagnose

Dùng khi user báo lỗi, test fail, hành vi sai, hoặc performance regression.

## Nguyên Tắc Chính

Không đoán trước khi có feedback loop. Một vòng lặp pass/fail nhanh và đáng tin cậy là phần quan trọng nhất của debug.

## Quy Trình

### 1. Dựng feedback loop

Tìm cách tái hiện lỗi bằng một trong các cách:

- Failing test.
- CLI/script với fixture.
- HTTP/curl request.
- Browser/e2e script.
- Replay log/payload.
- Harness nhỏ gọi trực tiếp code path.

Nếu không dựng được loop, báo rõ đã thử gì và cần artifact nào từ user.

### 2. Reproduce

Chạy loop và xác nhận:

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

- Nếu có seam test đúng, viết regression test fail trước.
- Sửa tối thiểu để test pass.
- Chạy lại loop gốc.

### 6. Cleanup

Trước khi báo xong:

- Loop gốc không còn reproduce lỗi.
- Regression test pass hoặc ghi rõ vì sao chưa có seam test đúng.
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
