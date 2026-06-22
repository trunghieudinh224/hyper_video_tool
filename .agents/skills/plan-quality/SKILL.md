---
name: plan-quality
description: >
  Use this skill before creating or reviewing any implementation plan,
  feature-intake plan, roadmap phase plan, or task checklist — across any
  project. Enforces small scope, clear boundaries, file-level impact, risk
  tiers, approval gates, and test/report requirements before coding starts.
---

# Plan Quality

**Kích hoạt khi:** user yêu cầu lên plan, bắt đầu feature mới, tiếp tục một phase, review plan có sẵn, hoặc chạy workflow `feature-intake`.

**Mục tiêu:** Ngăn plan quá rộng. Một plan tốt là **nhỏ, có thể hành động, có thể kiểm thử,** và dễ để user approve hoặc reject trong một lần đọc.

---

## 1. Core Rules

1. Plan **một feature, một phase, hoặc một task có scope rõ ràng** tại một thời điểm.
2. Không gộp các hạng mục lớn không liên quan vào cùng một plan.
3. Ưu tiên **MVP trước** — đẩy mọi cải tiến không thiết yếu vào `Future Scope`.
4. **Không chỉnh sửa code trong giai đoạn lập kế hoạch.**
5. Luôn dừng và **đợi approval rõ ràng** từ user trước khi bắt đầu implement.
6. Plan phải đủ chi tiết để checklist item có thể tick `[x]` trong quá trình thực thi.
7. Mỗi task hoàn thành phải có **Test Report** trước khi chuyển sang task hoặc phase tiếp theo.

---

## 2. Plan Sizing — Định Nghĩa Plan "Quá Lớn"

Một plan bị coi là **quá lớn** nếu thỏa mãn **bất kỳ** điều kiện nào:

| Chỉ số | Ngưỡng tối đa cho 1 plan |
| :--- | :---: |
| Số file thay đổi | **> 7 file** |
| Thời gian thực thi ước tính | **> 1 ngày làm việc** (≈ 6–8h code thực) |
| Số concern độc lập cần giữ đồng thời | **> 3** (xem Rule of Three) |
| Số checklist item | **> 15 item** |
| Số module/layer bị ảnh hưởng | **> 3 module** |

> **Rule of Three:** Nếu một task yêu cầu agent đồng thời giữ hơn 3 mối quan tâm độc lập (ví dụ: thay đổi DB schema + cập nhật API + render UI mới + viết test), task đó **bắt buộc phải tách nhỏ**.

**Khi plan quá lớn, thực hiện:**
1. Xác định **thin vertical slice** — phần nhỏ nhất có giá trị có thể ship độc lập.
2. Đẩy phần còn lại vào `Future Scope` với ghi chú lý do hoãn.
3. Trình bày lại plan đã tách cho user confirm trước khi tiếp tục.

---

## 3. Required Plan Structure

Mỗi plan bắt buộc có đủ các section theo thứ tự sau:

---

### 3.1 Objective
Một đoạn ngắn (2–4 câu) mô tả **kết quả cụ thể** sau khi task xong.
Không viết tham vọng — chỉ viết những gì thực sự sẽ xảy ra.

---

### 3.2 Scope

**✅ In Scope — Sẽ làm:**
- Liệt kê cụ thể, có thể đo lường.

**❌ Out of Scope — Sẽ không làm:**
- Liệt kê rõ các hạng mục hấp dẫn nhưng bị loại khỏi task này.
- Mục đích: ngăn scope creep trong quá trình thực thi.

**🕐 Future Scope — Để làm sau:**
- Các cải tiến có giá trị nhưng không thuộc MVP này.
- Mỗi item ghi rõ lý do hoãn.

---

### 3.3 Files Impact

Liệt kê file dự kiến bị ảnh hưởng với tag rõ ràng:

```
MODIFY        src/services/analytics.py     — thêm field max_drawdown vào response
NEW           tests/test_analytics.py       — unit test cho các case PnL trung tính
DELETE        src/legacy/old_calculator.py  — đã được thay thế
LIKELY MODIFY src/api/routes.py             — cần xác nhận sau khi xem cấu trúc hiện tại
```

> ⚠️ Nếu tổng số file **> 7**, phải tách plan trước khi tiếp tục.

---

### 3.4 Logic Changes

Giải thích thay đổi hành vi **thực tế**:
- Công thức, ngưỡng, state transitions quan trọng.
- Thay đổi contract của API endpoint hoặc luồng UI.
- Phải đủ cụ thể để người implement không cần hỏi lại.

---

### 3.5 Risk Assessment

Phân loại **từng rủi ro** theo tier:

| Tier | Loại hành động | Ví dụ điển hình | Quyết định |
| :---: | :--- | :--- | :--- |
| 🟢 **Auto** | Đọc file, tính toán, render UI | Thêm API field, thêm card hiển thị | Tự làm |
| 🟡 **Confirm** | Thay đổi logic nghiệp vụ, thêm index DB, sửa config | Thay công thức, thêm cột DB | Hỏi user 1 lần trước |
| 🔴 **Block** | Xóa dữ liệu, thay đổi core logic, schema migration, credentials | DROP TABLE, thay đổi auth flow, API key mới | **DỪNG hoàn toàn, escalate, chờ approval rõ ràng** |

> Nếu plan có bất kỳ item **🔴 Block** nào → tách thành plan riêng, escalate trước khi làm bất cứ thứ gì khác.

Ghi rõ thêm:
- Có thể **rollback** không? Nếu không → ghi rõ là non-reversible.
- Có **side effect** đến module khác không?

---

### 3.6 Dependency Map

Liệt kê thứ tự phụ thuộc giữa checklist items:

```
Task A (tạo API endpoint)
  → Task B (viết unit test cho A)
  → Task C (render UI dùng data từ A)
Task D (refactor helper function) — độc lập, làm song song được
```

Nếu không có dependency đáng kể → ghi: *"Các task độc lập, thực hiện tuần tự theo checklist."*

---

### 3.7 Checklist

Checklist item phải **nhỏ, có thể hành động, có pass/fail rõ ràng**.

**❌ Checklist kém:**
```
- [ ] Update backend
- [ ] Update frontend
- [ ] Test
```

**✅ Checklist tốt:**
```
- [ ] Thêm field `max_drawdown` vào response của `GET /api/analytics`.
- [ ] Render card "Max Drawdown" trong dashboard dùng giá trị từ backend (không tính lại ở client).
- [ ] Viết unit test cho trường hợp PnL = 0.
- [ ] Chạy `pytest tests/test_analytics.py -v` — tất cả pass.
- [ ] Cập nhật Test Report trong file task của project.
```

> ⚠️ Nếu checklist **> 15 item** → tách plan.

Luôn bao gồm item cho:
- Cập nhật tài liệu task của project (tên file tùy project quy định).
- Chạy test tự động.
- Điền Test Report.

---

### 3.8 Verification Plan

Liệt kê cụ thể cách kiểm thử:
- **Lệnh test tự động** (pytest, jest, go test, ...) — ghi chính xác lệnh sẽ chạy.
- **Smoke test thủ công** — click UI, gọi API, xem log.
- **Artifact** — screenshot, log output, file export nếu liên quan.

---

### 3.9 Approval Gate

Kết thúc plan bằng câu hỏi xác nhận. **Không bắt đầu code trước khi có approval.**

```
Bạn xác nhận plan này thì tôi mới bắt đầu triển khai.
Nếu muốn điều chỉnh scope, hãy cho tôi biết trước khi tiếp tục.
```

---

### 3.10 Test Report *(để trống khi planning — điền sau khi hoàn thành)*

```markdown
### Test Report

Status: passed | failed | partial

- Total checks/tests:
- Passed:
- Failed:

Commands run:
- `<test command>`

Manual/UI checks:
- [ ] Check performed here.

Artifacts:
- Path to screenshot or log, or `None`.

Remaining risks:
- Risk description, or `None`.
```

---

## 4. Discovery Protocol — Xử Lý Vấn Đề Phát Hiện Ngoài Scope

Trong quá trình phân tích hoặc implement, agent thường phát hiện các vấn đề liên quan hoặc cơ hội cải tiến.

**Quy tắc bắt buộc:**

| Tình huống | Hành động |
| :--- | :--- |
| Phát hiện bug **blocking** task hiện tại | Dừng, báo cáo ngay, đợi user chỉ định |
| Phát hiện cải tiến **không blocking** | Ghi vào `Future Scope`, tiếp tục task hiện tại |
| Phát hiện vấn đề kỹ thuật thú vị ngoài scope | Tạo note riêng, **không mở rộng scope hiện tại** |

> ❌ Tuyệt đối không tự ý mở rộng scope để xử lý vấn đề vừa phát hiện.

**Ví dụ báo cáo đúng cách:**
> "Trong quá trình sửa module analytics, tôi phát hiện hàm `calculate_pnl()` có thể tối ưu thêm 30%. Đã ghi vào Future Scope. Tôi sẽ tiếp tục task hiện tại và đề xuất task tối ưu này trong plan tiếp theo."

---

## 5. Do / Don't Reference

| ❌ Don't | ✅ Do |
| :--- | :--- |
| Gộp nhiều feature lớn vào 1 plan | Tách thành plan nhỏ, mỗi plan là 1 thin vertical slice |
| Checklist mơ hồ: "Update backend" | Ghi cụ thể: file nào, function nào, behavior thay đổi thế nào |
| Chỉ liệt kê risk, không phân loại | Dùng Risk Tier 🟢/🟡/🔴 với quyết định rõ ràng |
| Phát hiện vấn đề ngoài scope → làm luôn | Ghi vào Future Scope, báo cáo user |
| Bắt đầu code ngay sau khi viết plan | Đợi user phê duyệt rõ ràng |
| Checklist > 15 item | Tách plan, giữ mỗi plan ≤ 15 item |
| Plan ảnh hưởng > 7 file | Tách plan theo thin vertical slice |
| Thay đổi 🔴 Block mà không escalate | Luôn dừng và hỏi user trước |
| Viết plan tham vọng, nghe hay nhưng khó test | Viết plan nhỏ, có thể verify trong 1 buổi |

---

## 6. Hướng Dẫn Customize Cho Project Mới

Skill này **không hardcode** đường dẫn hay quy tắc của project cụ thể nào.  
Khi copy sang project mới, cần customize **3 điểm** sau:

### Bước 1 — Copy file
```bash
mkdir -p <project>/.agent/skills/plan-quality
cp ~/shared-skills/plan-quality/SKILL.md <project>/.agent/skills/plan-quality/SKILL.md
```

### Bước 2 — Cập nhật section này (Section 6)
Thay thế section này bằng đường dẫn tài liệu thực tế của project:
```markdown
## 6. Documentation Rules (Project-specific)
- Cập nhật `<path/to/current-task.md>` sau mỗi task.
- Với roadmap dài hạn: append vào `<path/to/progress.md>`.
- Không tạo file plan ở root nếu project đã có quy ước riêng.
```

### Bước 3 — Cập nhật Risk Tier examples (Section 3.5)
Thêm cột hoặc điều chỉnh ví dụ trong Risk Tier table cho phù hợp với domain của project (web app, mobile, data pipeline, trading bot, v.v.).

### Bước 4 — Đăng ký trong GEMINI.md / AGENTS.md
Thêm dòng tham chiếu skill này vào bảng tài liệu của project.

---

## 7. Planning Tone

Viết plan theo phong cách **trực tiếp và có ranh giới rõ ràng**:
- Nói rõ sẽ làm gì **bây giờ**.
- Nói rõ sẽ không làm gì **trong task này**.
- Nói rõ điều gì cần user xác nhận trước.
- Tránh viết plan tham vọng nghe hay nhưng khó thực thi và khó test.
