---
trigger: on_demand
description: UI quality and anti-slop rules for web projects. Use before/after frontend implementation, redesign, taste polish, or browser review.
---

# UI Quality Rules

Mục tiêu: UI phải hợp domain, scan tốt, responsive tốt, có hierarchy rõ, không giống template AI chung chung.

## Domain Fit

- Admin/ops/dashboard: dense, quiet, utilitarian, ưu tiên scan và thao tác lặp lại.
- Ecommerce: product-first, CTA rõ, trust, price/stock/promo dễ đọc.
- Service/booking: ấm, rõ gói dịch vụ, dễ đặt lịch/liên hệ, tạo tin cậy.
- Landing/client page: first viewport phải cho thấy brand/product/service thật, không chỉ text chung chung.

## Anti-Slop

Tránh:

- Purple/blue gradient làm chủ đạo nếu không thuộc brand.
- Quá nhiều card nổi trên nền nhạt.
- Hero quá lớn cho admin/tool.
- Text marketing rỗng như "seamless experience", "unlock potential".
- Icon/emoji trang trí quá nhiều.
- Badge/pill tràn lan.
- Section lặp một nhịp: title, paragraph, three cards.
- Placeholder/lorem/fake stat không có ngữ cảnh.
- Ảnh stock tối/mờ/crop không giúp hiểu sản phẩm/dịch vụ.

## Hierarchy

- CTA chính nổi hơn CTA phụ.
- Heading scale hợp container, không dùng hero-size trong panel nhỏ.
- Table/list/card phải scan được nhanh.
- Spacing có rhythm, không cảm tính mỗi section.
- Màu có vai trò: background, surface, text, border, accent, semantic states.

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
