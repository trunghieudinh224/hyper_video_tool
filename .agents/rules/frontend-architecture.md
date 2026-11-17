---
trigger: always_on
description: Quy tắc kiến trúc frontend Hyper Video Tool; cấu trúc multi-page và viewport chi tiết nằm trong static-multipage-ui.md.
---

# Frontend Architecture Rules

Đọc file này khi tạo màn hình mới, sửa CSS/JS, thêm interaction hoặc polish UI. Luôn đọc kèm `.agents/rules/static-multipage-ui.md`; file đó là nguồn chính cho cấu trúc page và viewport.

## Ranh Giới Code

- Frontend là HTML/CSS/JavaScript thuần trong `frontend/`, không có client build step.
- Backend Node.js local hiện có serve UI và API; dùng API qua `frontend/scripts/common/api.js` khi flow cần persistence, upload, settings hoặc render.
- `frontend/scripts/common/state.js` quản lý state đang mở; `storage.js` kết nối backend và fallback/cache localStorage; `ui-components.js` chứa component/helper dùng chung.
- Code page-specific nằm trong `frontend/scripts/pages/` và `frontend/styles/pages/`. Không để logic page trong HTML hoặc phụ thuộc DOM của page khác.
- Đọc cấu trúc thực tế trước khi tạo file. Không giả định có `theme.js`, `toast.js`, `modal.js` hoặc utility riêng nếu chúng chưa tồn tại.

## CSS Và UI

- Dùng tokens/components/layout chung trước khi tạo style hoặc component mới.
- Không inline style hoặc inline event handler.
- Không hardcode màu nếu có CSS token; không thêm gradient/hero marketing.
- Dùng common `app-section` và các modal/toast/color-picker component hiện có khi phù hợp.
- Giữ loading, empty, error, disabled, focus và success states cho interaction liên quan.
- Không thêm framework hoặc dependency frontend nếu user chưa yêu cầu.

## Viewport

- Target mặc định của HVT là PC/laptop, theo `.agents/rules/static-multipage-ui.md`.
- Kiểm tra không tràn/overlap ở `1440x900`; dùng thêm `1366x768` nếu layout/modal bị ảnh hưởng.
- Tablet/mobile chỉ nằm trong scope khi user yêu cầu rõ.

## Verification

- Chỉ chạy test/browser verification khi user yêu cầu test hoặc verification.
- Khi được yêu cầu, chỉ kiểm page/flow bị ảnh hưởng; dùng `wf-test`, `wf-run-web` và `webapp-testing` phù hợp.
- Nếu chưa chạy browser, ghi rõ phần chưa được kiểm; không khẳng định runtime đã pass dựa trên đọc code.
