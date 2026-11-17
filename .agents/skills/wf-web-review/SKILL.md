---
name: wf-web-review
description: >
  Workflow review thay đổi web app cho Hyper Video Tool: HTML/CSS/JS thuần,
  Node API local, templates, forms, preview và render endpoints.
---

# Workflow: Web Review

Dùng khi cần rà soát thay đổi frontend/backend web trước khi bàn giao hoặc commit.

## Mục Tiêu

- Review route/form/API/UI thay đổi.
- Tìm lỗi hành vi, security cơ bản, accessibility, viewport regression và integration.
- Đề xuất test hoặc browser check cần chạy.

## Quy Trình

### 1. Xác định diff

Chạy:

```bash
git status --short
git diff --name-only HEAD
```

Phân loại file:

- Routes/controllers/API handlers.
- Templates/views/components.
- CSS.
- JS.
- Tests.
- Config/migrations.

### 2. Checklist backend local của HVT

- Route/method và response contract có đúng không?
- Request validation có đủ cho payload và file input không?
- Asset API có kiểm project association, MIME/size, safe path và rollback batch không?
- Render payload có khớp schema và template contract không?
- Error handling có trả lỗi rõ mà không lộ path/secret không?
- File writes/asset batches có rollback phù hợp không?

### 3. Checklist frontend

- Form/control payload và submit behavior khớp với API/local storage contract.
- JS không phụ thuộc selector dễ vỡ nếu template đổi.
- Không dùng `alert/confirm` nếu project có toast/modal chuẩn.
- Không gây overflow hoặc overlap ở desktop/laptop `1440x900`; thêm `1366x768` nếu layout/modal thay đổi đáng kể.
- Loading/error/empty states đủ cho workflow chính.
- Không còn `console.log` debug không cần thiết.

### 4. Gợi ý browser/API verification

Các bước dưới đây là gợi ý kiểm tra. Chỉ chạy browser check hoặc gọi API khi user yêu cầu test/verification; nếu không, review contract và test coverage bằng cách đọc code.

Nếu có UI:

- Mở trang local.
- Click workflow chính.
- Kiểm tra console errors.
- Dùng viewport desktop/laptop theo `.agents/rules/static-multipage-ui.md`; chỉ kiểm tra tablet/mobile nếu người dùng yêu cầu.

Nếu API:

- Gọi endpoint với happy path và một invalid input.

### 5. Báo cáo

Nếu review API hoặc UI cần backend, dùng `wf-run-web`. Review toàn bộ diff chưa commit thì dùng `wf-review`; workflow này dành cho một phạm vi web cụ thể.

Review theo thứ tự severity:

```markdown
Web review:
- Files reviewed:

Findings:
- [High] file:line — issue and impact
- [Medium] file:line — issue and impact
- [Low] file:line — issue and impact

Verification suggested:
- Command/browser check

Summary:
- Short summary
```

Nếu không có issue, nói rõ `Không phát hiện lỗi blocking`, rồi ghi remaining risks/test gaps.
