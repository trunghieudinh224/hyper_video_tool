---
name: wf-ui-taste-polish
description: Workflow audit và polish chất lượng UI cho web project bằng design-taste-frontend, responsive-ui và browser verification. Dùng khi UI trông generic, giống AI, chưa chuyên nghiệp, thiếu nhất quán, cần nâng cấp hoặc cần premium hơn mà không đổi business logic.
---

# Workflow: UI Taste Polish

Dùng workflow này khi cần cải thiện giao diện hiện có hoặc polish UI vừa implement. Mục tiêu là nâng chất lượng UI mà không làm lệch logic/backend.

## Nguyên tắc

- Audit trước, sửa sau.
- Không redesign ngoài scope nếu người dùng chỉ yêu cầu polish.
- Không đổi brand/design system nếu project đã có.
- Không thêm framework UI mới nếu project không dùng.
- Không sửa business logic trừ khi UI bug bắt buộc cần.

## Bước 1 - Đọc context

Đọc các file có liên quan:

1. `GEMINI.md`, `AGENTS.md`, hoặc rule entrypoint của project
2. `.agents/rules/project-config.md`
3. `.agents/rules/frontend_architecture.md` hoặc `.agents/rules/frontend-architecture.md`
4. `.agents/rules/design-presets.md` và `.agents/context/ui-direction.md` nếu có
5. HTML/CSS/JS đang cần polish
6. Screenshot/mockup/feedback của người dùng nếu có

## Bước 2 - Audit UI hiện tại

Báo cáo ngắn gọn theo các mục:

- Purpose: màn hình này giúp người dùng làm gì?
- Current tone: UI hiện tại đang tạo cảm giác gì?
- Mismatch: điểm nào không hợp domain/người dùng?
- Slop signals: card/gradient/icon/text/spacing/layout nào trông generic?
- Functional risk: chỗ nào có thể gây nhầm lẫn, khó scan, khó click, khó đọc?
- Responsive risk: chỗ nào dễ vỡ trên mobile/tablet?

Nếu người dùng yêu cầu implement ngay, có thể audit ngắn trong nội bộ rồi tiến hành, nhưng vẫn phải tôn trọng các phát hiện đó.

## Bước 3 - Chọn hướng polish

Chọn một hướng rõ ràng:

- Internal tool: dense vừa đủ, quiet, scan-friendly, restrained color.
- Dashboard/editor: hierarchy rõ, form dễ đọc, trạng thái rõ ràng.
- Preview/render: ưu tiên readability, progress, lỗi dễ hiểu.

Nếu có nhiều hướng khả thi thì trình bày 2 phương án ngắn cho người dùng. Nếu scope rõ, tự chọn hướng hợp nhất và làm.

## Bước 4 - Implement polish

Sửa theo thứ tự ưu tiên:

1. Layout/hierarchy: grid, spacing, density, order of information.
2. Typography: title/body/meta/button size, weight, line-height.
3. Color/surface/border/shadow: dùng token project, giảm màu thừa.
4. Components: button, card, form, table, modal, nav, empty/loading/error.
5. Interaction: hover/focus/active/loading/disabled.
6. Responsive: mobile/tablet/desktop, touch target, text wrap.
7. Asset quality: image/icon/media phù hợp ngữ cảnh.

Với Hyper Video Tool:

- HTML chỉ giữ cấu trúc.
- CSS riêng trong `frontend/styles/...`.
- JS riêng trong `frontend/scripts/...`.
- Không thêm framework mới nếu HTML/CSS/JS thuần đã đủ.

## Bước 5 - Verify

Chạy verify phù hợp:

- Static check: đọc lại Blade/HTML/CSS/JS.
- Browser check nếu app chạy local: desktop + mobile screenshots.
- Console/network check nếu có JS/API.
- Kiểm tra text overflow, overlap, horizontal scroll, modal/dropdown, form focus.

Nếu không chạy được browser/server, báo rõ lý do và nếu được thì ghi checklist đã kiểm tra bằng code.

## Bước 6 - Report

Báo cáo ngắn:

- File đã sửa.
- Hướng visual đã chọn.
- Các vấn đề UI đã giải quyết.
- Verify đã chạy.
- Việc cần người dùng xem bằng mắt nếu có.

Nếu polish tạo ra learning/convention mới, gọi `wf-update-learnings` hoặc workflow update docs của project nếu có.
