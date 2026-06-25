---
trigger: on_demand
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

## Icon Buttons

- Action icon buttons trong app phải dùng icon dạng solid/filled, không dùng stroke-only outline icon.
- Icon-only action button phải có `aria-label` hoặc `title` rõ ràng.
- Icon-only action button nên có nền solid khi là hành động trực tiếp; hover chỉ được làm màu/icon/border đậm hơn hoặc nhấc nhẹ, không đổi sang background trang trí mới.
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
