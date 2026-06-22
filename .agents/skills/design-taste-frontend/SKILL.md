---
name: design-taste-frontend
description: Anti-slop frontend design taste for Hyper Video Tool. Use when creating, redesigning, or polishing the local internal UI so the result feels intentional, restrained, responsive, and not like generic AI-generated frontend.
---

# Design Taste Frontend

Dùng skill này khi cần tạo UI mới, polish giao diện, hoặc review UI bị "mùi AI".

Mục tiêu: UI phải có chủ đích, hợp domain công cụ nội bộ, dùng design system của project, không dùng pattern generic như card dày đặc, gradient, hero marketing vô nghĩa, icon/emoji trang trí quá tay, text placeholder, spacing thiếu nhất quán.

## Context bắt buộc

Đọc trước khi quyết định visual:

1. `GEMINI.md`, `AGENTS.md`, hoặc entrypoint rule tương đương nếu có
2. `.agents/rules/project-config.md` nếu có
3. `.agents/rules/frontend_architecture.md` hoặc `.agents/rules/frontend-architecture.md` nếu có
4. `.agents/rules/design-presets.md` hoặc `DESIGN.md` nếu có
5. `.agents/context/ui-direction.md`
6. UI/HTML/CSS/JS hiện tại liên quan
7. Screenshot/mockup/reference image nếu user cung cấp

Nếu project đã có design system, không tự phát minh lại brand. Hãy cải thiện trong biên độ của system đó.

## Brief inference

Trước khi code, xác định nhanh:

- Domain: công cụ nội bộ tạo video thuyết trình dự án.
- User: nhân viên nội bộ, team lead, người muốn tạo video MP4 từ dữ liệu dự án.
- Tone: quiet utility, internal premium tool, technical dashboard.
- Density: dùng lặp lại hằng ngày nên gọn, scan nhanh, không quá thưa.
- Main job: nhập dữ liệu, quản lý tài nguyên, chọn template, xem trước, render, kiểm tra output.

UI tốt là UI đúng việc. Đừng làm admin dashboard như landing page.

## Anti-slop rules

Tránh các dấu hiệu sau trừ khi project yêu cầu rõ:

- Bất kỳ gradient nào trong app UI.
- Quá nhiều card nổi trên background nhạt.
- Hero quá lớn cho tool/dashboard/admin page.
- Text marketing chung chung: "Unlock your potential", "Seamless experience", "Powerful insights".
- Icon quá nhiều nhưng không giúp scan.
- Badge/pill dày đặc không có mục đích.
- Placeholder content, lorem ipsum, fake stat không có ngữ cảnh.
- Section lặp lại cùng một rhythm: title, paragraph, three cards.
- Ảnh stock/tối/mờ/crop không giúp người dùng hiểu dự án hoặc video preview.
- Mobile chỉ thu nhỏ desktop, không sắp xếp lại ưu tiên.

## Taste checklist

Trước khi implement hoặc polish, chọn ít nhất một hướng visual rõ:

- Quiet utilitarian: giao diện gọn, rõ, ưu tiên thao tác.
- Internal premium tool: sang vừa đủ, không màu mè, không marketing.
- Technical control room: phù hợp preview/render/status/log.

Sau đó kiểm tra:

- Typography có hierarchy rõ, không scale theo viewport width.
- Spacing có rhythm, không cân bằng bằng cảm tính mỗi section.
- Color có vai trò: background, surface, text, border, accent, danger/success/warning.
- CTA chính rõ hơn CTA phụ.
- Form state đầy đủ: default, focus, error, disabled, loading.
- Empty/loading/error states không bị bỏ quên.
- Table/list/card scan được nhanh.
- Dark mode khớp hierarchy nếu project có dark mode.
- UI không trông như template mẫu mặc định.

## Implementation guardrails

Với HTML/CSS/JS thuần:

- Dùng CSS file riêng theo convention project.
- Không inline style trong HTML.
- Dùng CSS variables/tokens sẵn có.
- Không thêm framework mới nếu project đang dùng vanilla CSS/JS.
- Không phá layout/component có sẵn nếu chỉ cần polish.
- Nếu cần icon, dùng icon library project đang có.
- Nếu có image, dùng ảnh thật/reference/generated bitmap phù hợp thay vì background trang trí vô nghĩa.

## Required final pass

Không xem UI là xong nếu chưa có pass này:

- Desktop, tablet, mobile không overlap/tràn text.
- Nút/form/input có state cần thiết.
- Không còn placeholder, mock text vô nghĩa, hoặc section làm nửa vời.
- Screenshot/browser verify nếu project có thể chạy local.
- Nếu sửa UI đang tồn tại, báo rõ đã giữ lại gì và đã modernize gì.
