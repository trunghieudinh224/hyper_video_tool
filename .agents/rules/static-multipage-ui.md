---
trigger: always_on
description: Rule bắt buộc cho frontend Hyper Video Tool: multi-page HTML/CSS/JS thuần, không SPA gom view hoặc build framework; dùng backend local hiện có khi flow cần API.
---

# Static Multi-page UI Rules

File này là rule bắt buộc khi tạo, sửa, refactor hoặc review UI trong thư mục `frontend/`.

## Nguyên Tắc Chính

- Frontend vẫn là HTML/CSS/JavaScript thuần, multi-page, không có client build step.
- App được backend Node.js local hiện có serve cho các flow cần API. Dùng API hiện tại khi feature cần persistence/upload/render; không tạo backend/server/framework/build pipeline mới nếu user chưa yêu cầu.
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
  vendor/
    Sortable.min.js
    driver/
      driver.css
      driver.js.iife.js
    media/
      README.md
      mediabunny-1.66.0.min.js
      mediabunny-LICENSE.txt
      wavesurfer-8.1.0.min.js
      wavesurfer-LICENSE.txt
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
      api.js
      constants.js
      navigation.js
      onboarding.js
      page-bootstrap.js
      render-preview.js
      shell.js
      state.js
      storage.js
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
  <script src="../scripts/common/api.js"></script>
  <script src="../scripts/common/storage.js"></script>
  <script src="../scripts/common/validation.js"></script>
  <script src="../scripts/common/render-preview.js"></script>
  <script src="../scripts/common/navigation.js"></script>
  <script src="../scripts/common/shell.js"></script>
  <script src="../vendor/driver/driver.js.iife.js"></script>
  <script src="../scripts/common/ui-components.js"></script>
  <script src="../scripts/common/onboarding.js"></script>
  <script src="../scripts/common/page-bootstrap.js"></script>
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
- Action icon button phải dùng icon solid/filled, không dùng stroke-only outline icon. Icon-only button phải có `aria-label` hoặc `title`. Không tự thêm background cho icon button nếu user không yêu cầu; hover chỉ đổi màu icon đậm hơn và/hoặc nhấc nhẹ/lún nhẹ, không đổi hoặc thêm background.
- Section/panel nội dung phải dùng common component `app-section` trong `frontend/styles/components.css` với cấu trúc `app-section-header`, `app-section-eyebrow`, `app-section-helper`, `app-section-content`. Không tạo/copy style page-local `*-panel` nếu common section đáp ứng được.
- Color picker phải đồng bộ toàn app: dùng cùng control dạng swatch + mã màu và cùng popup chọn màu đã duyệt. Nếu page không load thư viện picker, fallback không được rơi về native RGB picker của browser khi UX hiện tại đang dùng picker dạng gradient + hue + ô `HEXA`. Khi thêm field màu mới, phải tái dùng helper/component hiện có hoặc tách helper chung trước, không tự tạo một kiểu popup khác.

## JavaScript

- JS chung:
  - `constants.js`: cấu hình, enum, sample defaults.
  - `state.js`: state app và helpers cập nhật state.
  - `storage.js`: localStorage/import/export JSON.
  - `validation.js`: validate project data.
  - `navigation.js`: active nav, link helpers.
  - `shell.js`: render shell chung.
  - `api.js`: request tới backend local.
  - `page-bootstrap.js`: khởi tạo shell, state, storage, validation và page.
  - `ui-components.js`: component/helper UI dùng chung, gồm feedback và modal.
  - `onboarding.js`, `render-preview.js`: hướng dẫn UI và preview helper dùng chung.
- JS page riêng chỉ init DOM và behavior của page đó.
- Page JS không được query DOM của page khác.
- Common JS không được phụ thuộc vào DOM chỉ tồn tại ở một page, trừ khi có guard rõ.
- Không dùng `alert`, `confirm`, `prompt`; dùng modal/toast chung.
- Không để console debug linh tinh khi bàn giao.
- Khi user yêu cầu verification cho color picker, kiểm cả các field màu hiện có trong cùng modal/page: chọn màu, nhập `HEXA`, đóng bằng `Esc`, và trạng thái disabled liên quan.

## Dữ Liệu Và State

- Khi chạy qua backend, dùng API/persistence hiện có; `storage.js` còn giữ localStorage cache/fallback và embedded sample cho static/file mode.
- Page dùng common state/storage/API, không tự tạo key localStorage riêng nếu chưa có lý do.
- Luồng chuyển page phải giữ dữ liệu qua backend hoặc storage layer.
- Không mô tả import/export hay persistence là mock nếu code của feature đã nối backend; kiểm tra implementation hiện tại.

## Khi Chuyển Một Màn Hình Cũ Sang Multi-page

Nếu có màn hình/flow cũ còn gộp kiểu SPA, chuyển theo slice nhỏ; các page hiện tại đã là multi-page.

Thứ tự:

1. Tạo shell chung và `overview.html` trước.
2. Verify index, navigation, theme và overview không lỗi.
3. Tách các page nhập liệu: content, features, timeline.
4. Verify state/localStorage/validation.
5. Tách assets, template, preview, render, outputs, settings.
6. Xóa cơ chế SPA cũ sau khi mọi page riêng đã chạy.

Không được xóa `frontend/index.html` cũ hoặc logic cũ trước khi page thay thế đã hoạt động.

## Viewport Và Verification

### Phạm Vi Thiết Bị

- Hyper Video Tool chỉ hỗ trợ PC/laptop; không coi tablet/mobile là target product.
- Browser/UI smoke mặc định chỉ chạy viewport desktop/laptop, ưu tiên `1440x900`; có thể dùng thêm `1366x768` khi thay đổi ảnh hưởng layout hoặc modal.
- Không test viewport tablet/mobile (`768px`, `390px`), không làm responsive mobile và không tốn thời gian sửa lỗi chỉ xuất hiện ngoài phạm vi PC/laptop.
- Chỉ test tablet/mobile khi người dùng yêu cầu rõ hoặc task có scope riêng cho thiết bị đó.

Khi user yêu cầu verification, dùng `wf-test`/`webapp-testing` và chỉ kiểm scope bị ảnh hưởng. Không tự chạy browser/test khi user chưa yêu cầu; thay vào đó ghi rõ phần chưa verify.

Trong phạm vi UI đã yêu cầu:

- Kiểm tra page bị ảnh hưởng; kiểm entry/sidebar đủ pages khi thay đổi shell hoặc navigation.
- Kiểm tra reload/state ở các page bị ảnh hưởng.
- Light mode và dark mode đều đọc được.
- Desktop/laptop `1440x900` và khi cần `1366x768` không vỡ layout.
- Không có horizontal scroll ngoài vùng có chủ đích.
- Console không có lỗi runtime liên quan thay đổi.
- Không có gradient, hero marketing hoặc copy bán hàng.

## Nếu Có Xung Đột Rule

Nếu file khác còn nhắc tới SPA, tab ẩn/hiện hoặc `index.html` chứa toàn bộ màn hình, rule này thắng cho phase UI hiện tại.
