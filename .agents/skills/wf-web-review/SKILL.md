---
name: wf-web-review
description: >
  Workflow review thay đổi web app chung cho HTML/CSS/JS, templates, routes,
  forms và API endpoints. Dùng được cho code thuần, Laravel, Python web hoặc
  stack web tương tự.
---

# Workflow: Web Review

Dùng khi cần rà soát thay đổi frontend/backend web trước khi bàn giao hoặc commit.

## Mục Tiêu

- Review route/form/API/UI thay đổi.
- Tìm lỗi hành vi, security cơ bản, accessibility/responsive, và regression.
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

### 2. Checklist backend web

- Route/method đúng chưa?
- Request validation có đủ chưa?
- Auth/permission có bị bypass không?
- Error handling trả response hợp lý không?
- Không hardcode secrets/env.
- Database write có transaction/rollback phù hợp không?

### 3. Checklist frontend

- Form action/method/CSRF hợp lý.
- JS không phụ thuộc selector dễ vỡ nếu template đổi.
- Không dùng `alert/confirm` nếu project có toast/modal chuẩn.
- CSS không gây overflow ngang trên mobile.
- Loading/error/empty states đủ cho workflow chính.
- Không còn `console.log` debug không cần thiết.

### 4. Browser/API verification

Nếu có UI:

- Mở trang local.
- Click workflow chính.
- Kiểm tra console errors.
- Kiểm tra mobile width nếu layout thay đổi.

Nếu API:

- Gọi endpoint với happy path và một invalid input.

### 5. Báo cáo

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
