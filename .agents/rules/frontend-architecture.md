---
trigger: always_on
description: Kiến trúc frontend dùng chung cho web project: layout, CSS variables, responsive, modal/toast, Grid.js, verification.
---

# Web Frontend Architecture Rules

Đọc file này khi tạo màn hình mới, sửa CSS/JS, thêm modal, thêm bảng dữ liệu, hoặc polish UI.

## Layout

- Dùng layout/component sẵn có của project.
- Không tự tạo boilerplate nếu project có layout chuẩn.
- Không nhúng lại thư viện đã inject ở layout.
- CSS/JS page-specific phải nằm ở file riêng theo convention project.
- Với Hyper Video Tool giai đoạn UI tĩnh, không gom nhiều màn hình vào một `index.html` dạng SPA tab ẩn/hiện.
- Mỗi màn hình chính phải là một trang HTML riêng, có CSS riêng và JS riêng nếu có logic riêng.
- Phần dùng chung như topbar, sidebar, validation panel, modal, toast, theme toggle và navigation phải nằm trong CSS/JS chung.
- Vì HTML thuần không có `include`/`extends` như template engine, phần "base HTML chung" phải được xử lý theo một trong hai cách:
  - Dùng file `frontend/shared/base.html` làm mẫu tham chiếu và copy shell nhất quán sang từng page khi chưa có build step.
  - Hoặc dùng `frontend/scripts/common/shell.js` để render shell/topbar/sidebar chung vào từng page. Đây là hướng ưu tiên khi vẫn muốn chạy tĩnh không cần Node.js/backend.
- `frontend/index.html` chỉ nên redirect/link sang trang mặc định, ví dụ `pages/overview.html`, không chứa toàn bộ nội dung các màn hình.

## Multi-page Static Structure

Áp dụng cấu trúc này cho UI tĩnh:

```text
frontend/
  index.html
  shared/
    base.html
  pages/
    overview.html
    content.html
    features.html
    timeline.html
    assets.html
    template.html
    preview.html
    render.html
    outputs.html
    settings.html
  styles/
    tokens.css
    base.css
    layout.css
    components.css
    pages/
      overview.css
      content.css
      features.css
      timeline.css
      assets.css
      template.css
      preview.css
      render.css
      outputs.css
      settings.css
  scripts/
    common/
      constants.js
      state.js
      storage.js
      validation.js
      shell.js
      navigation.js
      theme.js
      toast.js
      modal.js
    pages/
      overview.js
      content.js
      features.js
      timeline.js
      assets.js
      template.js
      preview.js
      render.js
      outputs.js
      settings.js
```

Quy ước import:

- Mỗi page load `tokens.css`, `base.css`, `layout.css`, `components.css`, sau đó mới load CSS riêng của page.
- Mỗi page load JS chung cần thiết trước, sau đó mới load JS riêng của page.
- JS riêng của page chỉ xử lý nội dung page đó, không chứa logic render toàn bộ app.
- Navigation dùng link thật giữa các file HTML, ví dụ `href="./content.html"`, không dùng button đổi tab bằng `data-tab`.
- Active nav được set bằng `navigation.js` dựa trên file hiện tại hoặc `data-page`.

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
