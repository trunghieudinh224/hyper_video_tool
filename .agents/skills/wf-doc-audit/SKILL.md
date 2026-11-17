---
name: wf-doc-audit
description: Đối chiếu tài liệu Hyper Video Tool với code và các quyết định đã chốt, tìm chỗ thiếu, cũ hoặc mâu thuẫn trong phạm vi xác định.
---

# Workflow: Doc Audit

## Khi dùng

- Người dùng yêu cầu rà soát/cập nhật tài liệu.
- Có dấu hiệu README, context, roadmap hoặc rule không còn khớp với implementation.
- Sau thay đổi đáng kể về kiến trúc, API, data model, render flow hoặc hành vi sản phẩm khi tài liệu nằm trong scope task hoặc user yêu cầu audit/cập nhật.

## Chọn phạm vi

- **Working tree:** dùng `git status --short`, `git diff --name-only HEAD` và đọc diff liên quan.
- **Một module/feature:** tìm route, page, state, service, schema, template, test và tài liệu liên quan bằng `rg`.
- **Toàn project:** rà các nhóm chính một cách có giới hạn; nếu không thể đọc hết trong một lượt thì chia module và ghi rõ phần còn pending.

## Quy trình

1. Đọc `AGENTS.md`, `.agents/context/project-overview.md`, `.agents/context/known-issues.md`, `.agents/tasks/current-task.md` và tài liệu có liên quan đến scope.
2. Tìm implementation hiện tại trong code. Với HVT, cân nhắc đối chiếu `README.md`, `backend/README.md`, `backend/src/`, `frontend/scripts/`, `data/` và `templates/` tùy feature.
3. Đối chiếu từng phát biểu tài liệu với code, test/report gần nhất và quyết định đã được người dùng chốt.
4. Phân loại: đúng; thiếu; lỗi thời; mâu thuẫn; hoặc chưa xác minh. Không suy ra trạng thái runtime/deploy chỉ từ code hoặc báo cáo cũ.
5. Chỉ sửa tài liệu khi task yêu cầu cập nhật docs hoặc tài liệu được đưa rõ vào scope. Code change đơn thuần không tự cho phép sửa docs. Nếu yêu cầu chỉ audit/review, không sửa file.
6. Khi code mâu thuẫn với rule hoặc quyết định sản phẩm đã chốt, báo conflict; không âm thầm sửa tài liệu để hợp thức hóa code.
7. Với tài liệu chỉ thay đổi, không chạy full test. Báo rõ file đã đối chiếu/cập nhật và các điểm còn mở.

## Nguồn sự thật

- Code hiện tại là bằng chứng cho hành vi implementation.
- Rule và quyết định người dùng đã xác nhận là nguồn cho hành vi dự kiến.
- README, context, roadmap, changelog và test report là snapshot; kiểm tra ngày/phạm vi của chúng trước khi dựa vào.
- Nếu các nguồn mâu thuẫn, giữ nguyên conflict trong báo cáo cho tới khi được giải quyết.

## An toàn

- Không đọc secret hoặc `.env`.
- Không sửa code ứng dụng trong workflow audit tài liệu.
- Không chạy migration, seed, deploy, restore backup, cài dependency hoặc render video.
- Không ghi nội dung suy đoán thành sự thật đã xác minh.

## Báo cáo

- Phạm vi audit và nhóm code/docs đã đọc.
- Tài liệu đúng, lỗi thời, thiếu hoặc mâu thuẫn.
- Tài liệu đã cập nhật (nếu được yêu cầu).
- Conflict, phần chưa xác minh và bước cần làm tiếp.
