---
trigger: on_demand
description: Kiến trúc frontend dùng chung cho web project: layout, CSS variables, responsive, modal/toast, Grid.js, verification.
---

# Web Frontend Architecture Rules

Đọc file này khi tạo màn hình mới, sửa CSS/JS, thêm modal, thêm bảng dữ liệu, hoặc polish UI.

## Layout

- Dùng layout/component sẵn có của project.
- Không tự tạo boilerplate nếu project có layout chuẩn.
- Không nhúng lại thư viện đã inject ở layout.
- CSS/JS page-specific phải nằm ở file riêng theo convention project.

## CSS

- Không inline style.
- Không hardcode màu nếu project có CSS variables/design tokens.
- Không dùng class styling tùy tiện nếu project đã có class/component chung.
- Responsive theo `max-width`, từ breakpoint lớn xuống nhỏ.
- Không scale font bằng viewport width.
- Text không được tràn/overlap ở mobile, tablet, desktop.
- Dùng stable dimensions cho toolbar, grid, card, tile, button, board, modal để hover/loading/dynamic text không làm shift layout.

## JavaScript

- Tách rõ Constants, State, Helpers, UI, API, Events, Init.
- Không inline event handler trong template.
- Không để debug log trong production.
- Không dùng alert/confirm/prompt nếu project có modal/toast.
- Dynamic list/table/grid phải dùng event delegation.

## UI State

Mọi UI quan trọng cần đủ state:

- Loading
- Empty
- Error
- Disabled
- Focus
- Hover/active
- Success/failure feedback

Form cần:

- Label rõ
- Required marker nếu cần
- Error message
- Focus state
- Disabled/loading state

## Browser Verification

Khi project chạy local được, verify UI bằng browser/Playwright/CDP:

- Desktop viewport
- Mobile viewport
- Console errors
- Network/API errors nếu có
- Horizontal scroll
- Text overflow/overlap
- Modal/dropdown/table/list interaction

Nếu không chạy được browser/server, báo rõ lý do và checklist đã kiểm bằng code.
