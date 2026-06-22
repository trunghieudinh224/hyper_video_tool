---
trigger: always
description: Rule bắt buộc cho UI tĩnh Hyper Video Tool: multi-page HTML/CSS/JS thuần, không SPA gom view, không backend/build step ở phase hiện tại.
---

# Static Multi-page UI Rules

File này là rule bắt buộc khi tạo, sửa, refactor hoặc review UI trong thư mục `frontend/`.

## Nguyên Tắc Chính

- Hyper Video Tool giai đoạn hiện tại là UI tĩnh chạy local bằng HTML, CSS và JavaScript thuần.
- Không thêm Node.js, Vite, React, Vue, Tailwind, backend, API server hoặc build step nếu user chưa yêu cầu rõ.
- Không gom nhiều màn hình vào một `frontend/index.html` dạng SPA tab ẩn/hiện.
- Không dùng route giả bằng hash, ví dụ `#/preview`, để thay cho page thật.
- Không dùng `data-tab` + `.tab-pane` để điều hướng giữa các màn hình chính.
- Mỗi màn hình chính phải là một file HTML riêng trong `frontend/pages/`.
- CSS riêng từng màn hình phải nằm trong `frontend/styles/pages/`.
- JS riêng từng màn hình phải nằm trong `frontend/scripts/pages/`.
- Phần dùng chung phải nằm trong `frontend/styles/` và `frontend/scripts/common/`.

## Cấu Trúc Chuẩn

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
      ui-components.js
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

## Base HTML Và Shell Chung

HTML thuần không có `include` hoặc `extends`, nên không được giả định browser tự import `base.html`.

Áp dụng một trong hai hướng sau:

- Hướng ưu tiên: dùng `frontend/scripts/common/shell.js` render shell chung vào từng page.
- Hướng fallback: dùng `frontend/shared/base.html` làm template tham chiếu và copy shell nhất quán sang từng page.

`frontend/shared/base.html` là tài liệu mẫu nội bộ, không phải file browser tự load.

Shell chung gồm:

- Sidebar navigation.
- Topbar.
- Project status.
- Theme toggle.
- Nút render nhanh.
- Validation panel.
- Modal container.
- Toast container.

## Quy Ước Cho Page HTML

Mỗi page phải có:

- `body data-page="<page-name>"`.
- Link CSS chung trước, CSS page riêng sau.
- Script chung trước, script page riêng sau.
- Nội dung chính của page nằm trong container rõ ràng, ví dụ `main.page-content`.

Ví dụ:

```html
<body data-page="overview">
  <div id="app-shell"></div>
  <main class="page-content" id="page-overview"></main>

  <script src="../scripts/common/constants.js"></script>
  <script src="../scripts/common/state.js"></script>
  <script src="../scripts/common/storage.js"></script>
  <script src="../scripts/common/theme.js"></script>
  <script src="../scripts/common/navigation.js"></script>
  <script src="../scripts/common/shell.js"></script>
  <script src="../scripts/pages/overview.js"></script>
</body>
```

## Navigation

- Sidebar item phải là link thật giữa các file HTML, ví dụ `href="./preview.html"`.
- `navigation.js` set active item dựa vào `body[data-page]`.
- Không dùng button nav nếu hành động đó là chuyển màn hình chính.
- `frontend/index.html` chỉ là entry gọn: redirect hoặc link tới `frontend/pages/overview.html`.

## CSS

- CSS chung:
  - `tokens.css`: màu, spacing, typography, radius, shadow, semantic state.
  - `base.css`: reset, body, typography, focus, accessibility base.
  - `layout.css`: app shell, sidebar, topbar, responsive layout.
  - `components.css`: button, input, card, modal, toast, status pill, table, empty state.
- CSS page riêng chỉ chứa layout/variation của page đó.
- Không inline style.
- Không hardcode màu nếu đã có CSS variable.
- Không dùng gradient trong app UI.
- Không dùng hero marketing.
- Không dùng emoji trang trí.

## JavaScript

- JS chung:
  - `constants.js`: cấu hình, enum, sample defaults.
  - `state.js`: state app và helpers cập nhật state.
  - `storage.js`: localStorage/import/export JSON.
  - `validation.js`: validate project data.
  - `theme.js`: light/dark mode.
  - `navigation.js`: active nav, link helpers.
  - `shell.js`: render shell chung.
  - `toast.js`: feedback ngắn.
  - `modal.js`: confirm/custom modal.
  - `ui-components.js`: helpers render component nhỏ dùng lại.
- JS page riêng chỉ init DOM và behavior của page đó.
- Page JS không được query DOM của page khác.
- Common JS không được phụ thuộc vào DOM chỉ tồn tại ở một page, trừ khi có guard rõ.
- Không dùng `alert`, `confirm`, `prompt`; dùng modal/toast chung.
- Không để console debug linh tinh khi bàn giao.

## Dữ Liệu Và State

- Giai đoạn hiện tại dùng dữ liệu mock và `localStorage`.
- Page nào cũng phải đọc/ghi qua common state/storage, không tự tạo key localStorage riêng lẻ nếu chưa có lý do.
- Chuyển page không được làm mất dữ liệu đang nhập.
- Import/export JSON là UI local, chưa ghi file thật qua backend.

## Refactor Bắt Buộc Theo Slice

Khi refactor từ SPA hiện tại sang multi-page, không đổi toàn bộ một lần.

Thứ tự:

1. Tạo shell chung và `overview.html` trước.
2. Verify index, navigation, theme và overview không lỗi.
3. Tách các page nhập liệu: content, features, timeline.
4. Verify state/localStorage/validation.
5. Tách assets, template, preview, render, outputs, settings.
6. Xóa cơ chế SPA cũ sau khi mọi page riêng đã chạy.

Không được xóa `frontend/index.html` cũ hoặc logic cũ trước khi page thay thế đã hoạt động.

## Verification Bắt Buộc

Trước khi bàn giao UI:

- Mở `frontend/index.html`, xác nhận vào được `pages/overview.html`.
- Mở trực tiếp từng page HTML, không lỗi runtime.
- Click sidebar qua đủ 10 page.
- Reload từng page, theme và dữ liệu vẫn ổn.
- Light mode và dark mode đều đọc được.
- Desktop 1440px, tablet 768px, mobile 390px không vỡ layout.
- Không có horizontal scroll ngoài vùng có chủ đích.
- Console không có lỗi runtime.
- Không có gradient, hero marketing hoặc copy bán hàng.

## Nếu Có Xung Đột Rule

Nếu file khác còn nhắc tới SPA, tab ẩn/hiện hoặc `index.html` chứa toàn bộ màn hình, rule này thắng cho phase UI hiện tại.
