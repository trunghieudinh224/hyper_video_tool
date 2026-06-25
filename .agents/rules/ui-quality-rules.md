---
trigger: always_on
description: UI quality and anti-slop rules for web projects. Use before/after frontend implementation, redesign, taste polish, or browser review.
---

# UI Quality Rules

Mục tiêu: UI phải hợp domain, scan tốt, responsive tốt, có hierarchy rõ, không giống template AI chung chung.

## Domain Fit

- Admin/ops/dashboard: dense, quiet, utilitarian, ưu tiên scan và thao tác lặp lại.
- Hyper Video Tool là công cụ nội bộ: không làm giao diện bán hàng, booking, landing page hoặc trang marketing.
- First viewport phải là màn hình làm việc thật: dashboard/editor/preview/render, không phải hero giới thiệu.

## Anti-Slop

Tránh:

- Purple/blue gradient làm chủ đạo nếu không thuộc brand.
- Bất kỳ gradient nào trong app UI. Project này đã chốt không dùng gradient.
- Quá nhiều card nổi trên nền nhạt.
- Hero quá lớn cho admin/tool.
- Text marketing rỗng như "seamless experience", "unlock potential".
- Icon/emoji trang trí quá nhiều.
- Badge/pill tràn lan.
- Section lặp một nhịp: title, paragraph, three cards.
- Placeholder/lorem/fake stat không có ngữ cảnh.
- Ảnh stock tối/mờ/crop không giúp hiểu sản phẩm/dịch vụ.
- Copywriting kiểu bán hàng, conversion, pricing, promo, trust badge.

## Hierarchy

- CTA chính nổi hơn CTA phụ.
- Với tool này, CTA chính thường là `Render video`, `Lưu project`, hoặc `Xem trước`.
- Heading scale hợp container, không dùng hero-size trong panel nhỏ.
- Table/list/card phải scan được nhanh.
- Spacing có rhythm, không cảm tính mỗi section.
- Màu có vai trò: background, surface, text, border, accent, semantic states.

## Section Panels

- Các section/panel nội dung trong app phải dùng common component `app-section`.
- Cấu trúc chuẩn:
  - Container: `app-section`, thêm `is-compact` khi dùng panel phụ/sidebar.
  - Header: `app-section-header`.
  - Eyebrow/title nhỏ: `app-section-eyebrow`.
  - Helper/subtitle: `app-section-helper`.
  - Body: `app-section-content`.
- Không tạo page-local panel mới như `*-panel`, `*-panel-header`, `*-panel-content` nếu common `app-section` đáp ứng được.
- Page CSS chỉ được override layout nội dung bên trong section, không copy lại border, radius, padding, background, header rhythm của `app-section`.
- Nếu bắt buộc tạo biến thể section riêng, phải ghi lý do trong task/report.

## Icon Buttons

- Action icon buttons trong app bắt buộc dùng icon dạng solid/filled, không dùng stroke-only outline icon.
- Icon-only action button chỉ sử dụng màu của icon (color), không sử dụng màu nền (no background color).
- Icon-only action button phải có `aria-label` hoặc `title` rõ ràng.
- Quy định nếu sử dụng cho các nút hành động như save, edit, xóa thì hãy sử dụng các class FontAwesome đồng bộ sau:
  - Sửa (edit): `fa-solid fa-pen`
  - Lưu (save): `fa-solid fa-floppy-disk`
  - Xóa (delete): `fa-solid fa-trash`
- Hover chỉ đổi màu icon đậm hơn hoặc nhạt hơn (như `var(--color-primary-hover)`) và nhấc nhẹ (ví dụ `transform: translateY(-1px)`); active/pressed có thể lún nhẹ. Không đổi hoặc thêm background trong hover/active.
- Active/pressed state nên có hiệu ứng lún nhẹ để người dùng thấy phản hồi.
- Không dùng icon chỉ để trang trí nếu không giúp scan hoặc thao tác.

## Responsive

- Mobile không chỉ là desktop thu nhỏ.
- Ưu tiên lại nội dung trên mobile.
- Touch target đủ lớn.
- Không horizontal scroll ngoài các bảng có chủ đích.
- Button text phải wrap hoặc rút gọn có chủ đích.

## Final UI Pass

Trước khi bàn giao:

- Không còn placeholder.
- Không có text tràn/overlap.
- Form/modal/dropdown/table dùng được.
- Desktop/mobile đã được kiểm.
- Console không có lỗi liên quan thay đổi.
- Nếu có dark mode, hierarchy light/dark tương đương.
