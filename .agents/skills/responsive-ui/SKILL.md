---
name: responsive-ui
description: Audit, design, and fix responsive UI for Laravel/Blade or vanilla HTML/CSS/JS projects. Use when creating or modifying layouts, breakpoints, mobile/tablet/desktop states, touch targets, responsive typography, responsive images, horizontal-scroll bugs, overlapping UI, or viewport verification. Read project rules first and follow the project's CSS/JS conventions instead of introducing a framework.
---

# Skill: Responsive UI

Dùng khi cần tạo, sửa, hoặc audit responsive cho web project dùng Blade/HTML, CSS thuần, và vanilla JS.

Skill này reusable: không hardcode business, route, layout, hoặc breakpoint của một project cụ thể. Luôn lấy convention thật từ project hiện tại.

## Context bắt buộc

Đọc trước khi sửa UI/CSS/JS:

1. `GEMINI.md` hoặc entrypoint tương đương nếu có
2. `.agents/rules/coding-rules.md`
3. `.agents/rules/project-config.md`
4. `.agents/rules/frontend_architecture.md` nếu có
5. `.agents/templates/view_file_template/css_template.css` trước khi sửa/tạo CSS nếu có
6. `.agents/templates/view_file_template/js_template.js` trước khi sửa/tạo JS nếu có
7. `DESIGN.md` nếu task liên quan client/public UI
8. `doc/admin-design.md` nếu task liên quan Admin UI
9. `doc/4_business_rule.md` nếu responsive ảnh hưởng flow nghiệp vụ

## Nguyên tắc chính

- Theo breakpoint và thứ tự media query của project; không tự đổi sang hệ breakpoint khác.
- Ưu tiên fluid layout: `width: 100%`, `max-width`, `minmax()`, `auto-fit`, `1fr`, `flex-wrap`.
- Tránh fixed width/height làm vỡ mobile, trừ icon, border, hoặc kích thước có lý do rõ ràng.
- Text không được tràn, đè, hoặc bị cắt khó hiểu trên mobile/tablet.
- Button, link dạng nút, input, select, textarea phải đủ dễ chạm: tối thiểu khoảng `44px` chiều cao hoặc vùng hit area tương đương.
- Nội dung quan trọng xuất hiện trước trên mobile; nội dung phụ có thể stack, collapse, hoặc chuyển xuống dưới.
- Không dùng inline style, không thêm Tailwind/Bootstrap nếu project không dùng.
- Không tạo file `.min.css` / `.min.js` trong local development nếu project rule cấm.

## Workflow

### 1. Xác định phạm vi

Trước khi sửa, xác định:

- Trang/component nào cần responsive.
- Scope: Admin, Client/Public, Auth, Email, hoặc module khác.
- Viewport cần đảm bảo: mobile nhỏ, mobile lớn, tablet, laptop, desktop.
- Có screenshot/mockup/Stitch source cần so sánh không.
- Có JS interaction ảnh hưởng layout không: menu, modal, tab, accordion, carousel, dynamic list, filter.

### 2. Audit nhanh hiện trạng

Kiểm tra trong Blade/CSS/JS:

- Fixed width lớn hơn viewport như `width: 1200px`, `min-width`, table/grid không wrap.
- Grid/flex thiếu `minmax(0, 1fr)`, `flex-wrap`, hoặc `overflow-wrap`.
- Text dài thiếu `word-break`, `overflow-wrap`, `min-width: 0`.
- Image/video thiếu `max-width: 100%`, `height: auto`, hoặc aspect ratio ổn định.
- Form control quá thấp hoặc nhiều field nằm ngang trên mobile.
- Modal/popup không giới hạn chiều cao hoặc không scroll trong viewport.
- Header/sidebar/nav không có trạng thái mobile rõ ràng.
- JS đang set inline style cố định hoặc đo kích thước một lần nhưng không handle resize.

### 3. Implement CSS

Theo convention của project. Nếu project dùng desktop-first `max-width`, giữ thứ tự từ lớn xuống nhỏ:

```css
.feature-grid {
    display: grid;
    grid-template-columns: minmax(0, 1fr) 20rem;
    gap: 1.5rem;
}

.feature-card {
    min-width: 0;
    overflow-wrap: anywhere;
}

.feature-image {
    display: block;
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
    object-fit: cover;
}

@media (max-width: 1200px) {
    .feature-grid {
        grid-template-columns: minmax(0, 1fr);
    }
}

@media (max-width: 576px) {
    .feature-actions {
        flex-direction: column;
        align-items: stretch;
    }

    .feature-actions .btn {
        min-height: 44px;
        width: 100%;
    }
}
```

Nếu project dùng mobile-first `min-width`, làm theo project đó. Không trộn hai hệ trong cùng file nếu không có lý do rõ.

### 4. Vanilla JS cho responsive interactions

Chỉ dùng JS khi CSS/HTML không đủ. Ưu tiên progressive enhancement:

- HTML mặc định vẫn đọc được nếu JS lỗi.
- Dùng `hidden`, `aria-expanded`, `aria-controls`, `aria-modal` khi phù hợp.
- Dùng event listener trong JS, không dùng `onclick=""`.
- Dùng `matchMedia()` cho logic theo viewport.
- Dùng `ResizeObserver` khi component phụ thuộc kích thước container, ví dụ chart/card rail.
- Debounce/throttle resize nếu handler nặng.

Skeleton:

```js
const MOBILE_QUERY = window.matchMedia('(max-width: 768px)');

function syncResponsiveState() {
    const isMobile = MOBILE_QUERY.matches;
    document.documentElement.classList.toggle('is-mobile-layout', isMobile);
}

function bindResponsiveListeners() {
    MOBILE_QUERY.addEventListener('change', syncResponsiveState);
}

document.addEventListener('DOMContentLoaded', () => {
    bindResponsiveListeners();
    syncResponsiveState();
});
```

## Pattern theo loại UI

### Layout / Dashboard

- Desktop nhiều cột, tablet giảm cột, mobile stack một cột.
- Sidebar chuyển xuống dưới, offcanvas, hoặc collapse theo convention project.
- Card/list dùng `min-width: 0` để text không ép grid tràn ngang.

### Form

- Mobile ưu tiên một cột.
- Input/select/textarea có chiều cao dễ chạm.
- Nhóm nút submit/cancel stack trên mobile nếu không đủ ngang.
- Error/hint text wrap được, không đẩy layout vỡ.

### Table / List

- Với bảng dữ liệu rộng: dùng wrapper `overflow-x: auto` có chủ đích, không để toàn trang scroll ngang.
- Nếu dữ liệu có thể chuyển dạng card/list trên mobile, ưu tiên card/list để dễ đọc.
- Header/action/filter phải wrap hoặc stack rõ ràng.

### Modal / Popup

- Modal không rộng quá viewport: `width: min(..., calc(100vw - 2rem))`.
- Có `max-height` và scroll nội dung bên trong.
- Footer action stack trên mobile nếu nút dài.

### Responsive images

- Luôn có `alt` đúng nghĩa hoặc rỗng cho ảnh trang trí.
- Dùng `width`/`height` hoặc `aspect-ratio` để giảm CLS.
- Dùng `srcset`/`sizes` hoặc `<picture>` khi ảnh lớn ảnh hưởng hiệu năng.

```html
<img
    src="/images/example-800.webp"
    srcset="/images/example-400.webp 400w, /images/example-800.webp 800w, /images/example-1200.webp 1200w"
    sizes="(max-width: 768px) 100vw, 50vw"
    width="800"
    height="600"
    alt="Mô tả ảnh"
    loading="lazy"
>
```

## Verification

Nếu có browser/Playwright khả dụng, kiểm tra ít nhất:

- 375px: mobile nhỏ
- 414px: mobile lớn
- 768px: tablet
- 1024px: laptop
- 1440px: desktop

Checklist trước khi báo xong:

- [ ] Không có horizontal scroll ngoài ý muốn trên mobile.
- [ ] Text không overlap, không bị cắt khó hiểu.
- [ ] Button/input đủ dễ chạm.
- [ ] Modal/nav/dropdown hoạt động ở mobile và desktop.
- [ ] Image không méo, không nhảy layout lớn khi load.
- [ ] Table/list có phương án mobile rõ ràng.
- [ ] Dark mode vẫn đọc được nếu project hỗ trợ dark mode.
- [ ] Không còn `console.log` debug.
- [ ] Không tạo file minified trong local dev nếu project cấm.

## Report sau khi làm responsive

Báo cáo ngắn gọn:

- Viewport đã kiểm tra.
- File Blade/CSS/JS đã sửa.
- Các lỗi responsive đã xử lý.
- Điểm còn cần user/browser verify nếu có.
- Command hoặc screenshot đã dùng để kiểm tra.
