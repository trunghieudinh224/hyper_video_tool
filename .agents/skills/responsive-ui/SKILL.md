---
name: responsive-ui
description: Audit và sửa layout HTML/CSS/JS của Hyper Video Tool ở viewport PC/laptop; chỉ mở rộng sang tablet/mobile khi user yêu cầu.
---

# Skill: Viewport Layout

Dùng khi layout bị tràn/overlap, breakpoint desktop/laptop hoạt động sai, hoặc user yêu cầu audit/sửa responsive. Với HVT, responsive mặc định nghĩa là dùng tốt trong dải màn hình PC/laptop, không phải hỗ trợ mobile.

## Context Bắt Buộc

Đọc trước khi sửa:

1. `AGENTS.md`
2. `.agents/rules/static-multipage-ui.md`
3. `.agents/rules/frontend-architecture.md`
4. `.agents/context/ui-direction.md` nếu task ảnh hưởng visual direction
5. HTML/CSS/JS thực tế của page hoặc component liên quan

## Quy Trình

1. Xác định page/component và viewport thuộc scope.
2. Kiểm tra layout container, grid/flex min-width, fixed sizing, text wrap, media ratio, modal/scroll và state do JS điều khiển.
3. Sửa theo breakpoint/token/convention hiện có; không thêm framework hoặc breakpoint hệ mới nếu chưa cần.
4. Giữ multi-page structure; page-specific CSS/JS không chuyển sang file chung nếu không có consumer thực tế.
5. Tóm tắt nguyên nhân, file ảnh hưởng và viewport đã được kiểm bằng code.

## Viewport HVT

- Mặc định: `1440x900`.
- Thêm `1366x768` khi thay đổi layout, modal hoặc vùng làm việc có chiều cao giới hạn.
- Tablet/mobile chỉ kiểm tra hoặc sửa khi user yêu cầu rõ.
- Không thêm mobile-only layout, touch target hoặc breakpoint nếu task không yêu cầu.

## Verification

Chỉ chạy browser/screenshot verification khi user yêu cầu test/verification. Khi được yêu cầu, dùng `wf-run-web` nếu flow cần API, rồi `webapp-testing` ở viewport thuộc scope. Không dùng static server cho flow cần backend.

## Báo Cáo

- Page/component và file đã xem/sửa.
- Lỗi layout và cách sửa.
- Viewport đã kiểm; nếu chưa chạy browser thì ghi rõ chưa verify runtime.
