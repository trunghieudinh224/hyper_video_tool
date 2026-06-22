# Task: Refactor UI Tĩnh Sang Multi-page

## Objective

Refactor giao diện hiện tại từ một file `frontend/index.html` dạng SPA tab ẩn/hiện sang cấu trúc nhiều trang tĩnh. Mỗi màn hình chính có HTML riêng, CSS riêng và JS riêng khi cần; phần dùng chung như theme, sidebar, topbar, modal, toast, validation và dữ liệu mock được gom vào module chung.

Mục tiêu là để code dễ đọc, dễ mở rộng, phù hợp tool nội bộ chạy local bằng HTML/CSS/JS thuần, chưa cần Node.js, backend hoặc build step.

## Bối Cảnh Hiện Tại

Antigravity đã dựng được UI MVP, nhưng đang gom nhiều màn hình vào một `frontend/index.html`:

- `view-overview`
- `view-content`
- `view-features`
- `view-timeline`
- `view-assets`
- `view-template`
- `view-preview`
- `view-render`
- `view-outputs`
- `view-settings`

Cách này chạy được, nhưng không đúng hướng dự án vì file HTML quá lớn, khó bảo trì và dễ biến thành SPA nửa vời.

Tham khảo pattern từ project `crypto-trading-bot`:

- `web/templates/base.html` giữ shell/layout chung.
- Mỗi page có template riêng như `dashboard.html`, `reports.html`, `settings.html`.
- CSS chung nằm ở `web/static/css/common.css`.
- CSS/JS riêng từng page nằm ở `web/static/css/<page>.css` và `web/static/js/<page>.js`.

Vì Hyper Video Tool hiện tại là HTML tĩnh không có template engine, áp dụng pattern tương đương bằng `frontend/shared/base.html` và JS chung để render shell.

## Scope

### Sẽ làm

- Tách 10 màn hình chính thành 10 file HTML riêng trong `frontend/pages/`.
- Giữ `frontend/index.html` thật gọn, chỉ chuyển hướng hoặc dẫn người dùng tới `frontend/pages/overview.html`.
- Tạo `frontend/shared/base.html` làm mẫu shell chung để agent/dev nhìn được cấu trúc chuẩn.
- Tạo hoặc refactor JS chung vào `frontend/scripts/common/`.
- Tạo hoặc refactor CSS riêng từng page vào `frontend/styles/pages/`.
- Chuyển sidebar navigation từ `button data-tab` sang link thật giữa các trang HTML.
- Giữ dữ liệu mock/localStorage hiện có, nhưng không để từng page tự copy logic lưu trữ.
- Giữ đầy đủ light mode/dark mode và quy tắc không dùng gradient.
- Giữ validation panel, modal và toast là component chung.

### Không làm

- Không thêm Node.js, Vite, React, backend hoặc build step.
- Không tích hợp HyperFrames render thật.
- Không thay đổi mục tiêu sản phẩm hoặc thêm màn hình mới ngoài roadmap hiện tại.
- Không biến UI thành landing page.
- Không viết lại toàn bộ design nếu UI hiện tại đã ổn; chỉ refactor cấu trúc và chỉnh những điểm vỡ do tách page.

### Để sau

- Nếu sau này cần backend, có thể chuyển `frontend/shared/base.html` thành template thật.
- Nếu sau này cần nhiều component động hơn, có thể cân nhắc build step nhẹ, nhưng không thuộc phase này.

## Target Files Impact

Đây là danh sách file mục tiêu sau khi refactor xong toàn bộ UI. Không triển khai một lần hết danh sách này nếu chưa có checkpoint trung gian.

```text
MODIFY frontend/index.html
NEW    frontend/shared/base.html
NEW    frontend/pages/overview.html
NEW    frontend/pages/content.html
NEW    frontend/pages/features.html
NEW    frontend/pages/timeline.html
NEW    frontend/pages/assets.html
NEW    frontend/pages/template.html
NEW    frontend/pages/preview.html
NEW    frontend/pages/render.html
NEW    frontend/pages/outputs.html
NEW    frontend/pages/settings.html
MOVE   frontend/scripts/constants.js -> frontend/scripts/common/constants.js
MOVE   frontend/scripts/state.js -> frontend/scripts/common/state.js
MOVE   frontend/scripts/storage.js -> frontend/scripts/common/storage.js
MOVE   frontend/scripts/validation.js -> frontend/scripts/common/validation.js
MOVE   frontend/scripts/ui.js -> frontend/scripts/common/ui-components.js hoặc tách nhỏ hơn
MOVE   frontend/scripts/render-preview.js -> frontend/scripts/pages/preview.js hoặc frontend/scripts/common/render-preview.js nếu dùng chung
MOVE   frontend/scripts/app.js -> frontend/scripts/common/shell.js và frontend/scripts/common/navigation.js
NEW    frontend/scripts/common/theme.js
NEW    frontend/scripts/common/toast.js
NEW    frontend/scripts/common/modal.js
NEW    frontend/scripts/pages/*.js
NEW    frontend/styles/pages/*.css
MODIFY frontend/styles/tokens.css
MODIFY frontend/styles/base.css
MODIFY frontend/styles/layout.css
MODIFY frontend/styles/components.css
```

## Implementation Slices

Refactor này chạm nhiều file nên phải chia nhỏ. Mỗi slice xong phải smoke test trước khi qua slice tiếp theo.

### Slice 1 - Shell Và Trang Tổng Quan

Mục tiêu: chứng minh multi-page pattern chạy được với một page đầu tiên.

Files impact tối đa:

```text
MODIFY frontend/index.html
NEW    frontend/shared/base.html
NEW    frontend/pages/overview.html
NEW    frontend/scripts/common/shell.js
NEW    frontend/scripts/common/navigation.js
NEW    frontend/scripts/common/theme.js
NEW    frontend/scripts/pages/overview.js
```

Acceptance:

- `frontend/index.html` dẫn tới `frontend/pages/overview.html`.
- Sidebar/topbar hiển thị từ shell chung.
- Active nav đúng ở trang Tổng quan.
- Light/Dark mode hoạt động và giữ khi reload.
- Không có lỗi console.

### Slice 2 - Common State Và Page Nhập Liệu

Mục tiêu: tách các module dữ liệu dùng chung và port các page có form.

Pages:

- `content.html`
- `features.html`
- `timeline.html`

Acceptance:

- Dữ liệu mock/localStorage dùng chung.
- Form vẫn validate được.
- Chuyển page không mất dữ liệu.

### Slice 3 - Asset, Template, Preview, Render, Outputs, Settings

Mục tiêu: tách các page còn lại và xóa hoàn toàn cơ chế SPA cũ.

Pages:

- `assets.html`
- `template.html`
- `preview.html`
- `render.html`
- `outputs.html`
- `settings.html`

Acceptance:

- Không còn `.tab-pane`, `data-tab`, `workspace-tabs-content`.
- Preview, render mock và outputs mock còn chạy.
- Desktop/mobile không vỡ layout.

## Cấu Trúc Mong Muốn

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

## Quy Ước Cho Mỗi Page

Mỗi page HTML cần có:

- `data-page="<page-name>"` trên `body`.
- Link CSS chung trước, CSS riêng sau.
- Container rõ cho shell và page content.
- Script chung trước, script riêng sau.

Ví dụ hướng cấu trúc:

```html
<body data-page="overview">
  <div id="app-shell"></div>

  <main class="page-content" id="page-overview">
    <!-- Nội dung riêng của trang Tổng quan -->
  </main>

  <script src="../scripts/common/constants.js"></script>
  <script src="../scripts/common/state.js"></script>
  <script src="../scripts/common/storage.js"></script>
  <script src="../scripts/common/theme.js"></script>
  <script src="../scripts/common/navigation.js"></script>
  <script src="../scripts/common/shell.js"></script>
  <script src="../scripts/pages/overview.js"></script>
</body>
```

## Logic Changes

- Bỏ cơ chế `data-tab` và `.tab-pane active`.
- Navigation chuyển thành link thật giữa các page HTML.
- `navigation.js` tự set active nav dựa vào `body[data-page]`.
- `shell.js` render sidebar, topbar, validation panel, modal container và toast container dùng chung.
- State/localStorage vẫn là nguồn dữ liệu chung cho toàn app.
- Mỗi page chỉ init phần việc của page đó:
  - `overview.js`: summary, checklist, quick actions.
  - `content.js`: form nội dung dự án, counter, validation.
  - `features.js`: danh sách tính năng, thêm/xóa/sắp xếp.
  - `timeline.js`: mốc thời gian, thêm/xóa/sắp xếp.
  - `assets.js`: asset mock, filter, trạng thái upload giả lập.
  - `template.js`: chọn template và theme video.
  - `preview.js`: preview 16:9, scene list, play/pause giả lập.
  - `render.js`: cấu hình render và job mock.
  - `outputs.js`: danh sách video đã xuất mock.
  - `settings.js`: import/export JSON, reset localStorage, cấu hình app.

## Risk Assessment

- Rủi ro cao nhất là tách file làm gãy đường dẫn tương đối `../styles/...`, `../scripts/...`, `../assets/...`.
- Rủi ro thứ hai là logic từng nằm trong `app.js` hoặc `ui.js` đang phụ thuộc vào DOM của tất cả tab cùng lúc.
- Giảm rủi ro bằng cách tách theo từng page, mỗi page chỉ query DOM tồn tại trong page đó.
- Không được xóa logic cũ khi chưa đảm bảo page tương ứng đã hoạt động lại.

## Dependency Map

```text
1. Tạo cấu trúc thư mục mới
  -> 2. Tạo shell/common CSS/JS
  -> 3. Tách overview page làm mẫu
  -> 4. Tách các page còn lại theo cùng pattern
  -> 5. Kiểm tra navigation, theme, localStorage, validation
  -> 6. Smoke test desktop/mobile
```

## Checklist

- [x] Tạo `frontend/shared/base.html` mô tả shell chuẩn.
- [x] Đổi `frontend/index.html` thành trang entry gọn, dẫn tới `pages/overview.html`.
- [x] Tạo `frontend/pages/overview.html` và port nội dung Tổng quan sang page riêng.
- [x] Tạo `frontend/scripts/common/shell.js`, `navigation.js`, `theme.js`, `toast.js`, `modal.js`.
- [x] Di chuyển state/storage/validation/constants sang `frontend/scripts/common/`.
- [x] Tạo `frontend/styles/pages/overview.css` và `frontend/scripts/pages/overview.js`.
- [x] Verify overview page chạy được độc lập qua browser.
- [x] Tách lần lượt các page: content, features, timeline, assets, template, preview, render, outputs, settings.
- [x] Xóa cơ chế `.tab-pane`, `data-tab`, `workspace-tabs-content` sau khi tất cả page đã tách xong.
- [x] Kiểm tra light/dark mode còn lưu và áp dụng đúng khi chuyển page.
- [x] Kiểm tra navigation active đúng ở từng page.
- [x] Kiểm tra validation panel không lỗi khi page không có form.
- [x] Kiểm tra desktop/basic runtime cho 10 page.
- [ ] Kiểm tra responsive mobile/tablet. Bỏ qua ở phase này theo yêu cầu mới của user.
- [x] Cập nhật `current-task.md` với Test Report sau khi xong.

## Verification Plan

### Manual

- Mở `frontend/index.html`, xác nhận chuyển được tới `frontend/pages/overview.html`.
- Bấm từng item sidebar, xác nhận URL đổi sang từng HTML riêng.
- Reload trực tiếp từng page, xác nhận không lỗi runtime.
- Đổi Light/Dark mode ở một page, chuyển sang page khác, xác nhận theme vẫn giữ.
- Thử dữ liệu mock/localStorage ở content/features/timeline, chuyển page rồi quay lại, xác nhận dữ liệu không mất.
- Kiểm tra preview 16:9 không vỡ layout.
- Chạy render mock, chuyển page outputs, xác nhận output mock hiển thị.

### Browser Checks

- Desktop: 1440px.
- Tablet: 768px.
- Mobile: 390px.
- Console không có lỗi runtime.
- Không có horizontal scroll ngoài ý muốn.

## Approval Gate

Antigravity chỉ triển khai refactor này, không thêm backend/Node.js/HyperFrames thật. Nếu cần đổi sang build step hoặc template engine thật, phải hỏi lại trước.

## Test Report

Status: passed

- Total checks/tests: 3 nhóm kiểm tra
- Passed: 3
- Failed: 0

Commands run:
- `for f in frontend/scripts/common/*.js frontend/scripts/pages/*.js; do node --check "$f"; done`
- Playwright/Chrome desktop smoke test 10 page tại `http://127.0.0.1:4173/pages/<page>.html`
- Playwright/Chrome desktop interaction test: đổi theme, click sidebar sang Content, load sample data, đi tới Preview

Manual/UI checks:
- [x] 10 page trả HTTP 200.
- [x] Mỗi page có H1 đúng và active sidebar đúng.
- [x] Console không có lỗi runtime.
- [x] Light/Dark mode giữ khi chuyển page.
- [x] Dữ liệu mẫu load được bằng embedded mock data, không fetch file ngoài.
- [x] Không còn `data-tab` hoặc `.tab-pane`.
- [x] Layout content desktop đã đồng bộ width: `features`, `timeline`, `content`, `settings` không còn hardcode `max-width: 800px`.
- [x] Preview canvas dark theme đọc rõ title/text.
- [x] Settings không còn báo HyperFrames/FFmpeg đã sẵn sàng khi chưa tích hợp thật.
- [x] Các field nội dung dài dùng textarea để tránh cắt text.

Artifacts:
- None

Remaining risks:
- Responsive mobile/tablet chưa kiểm vì user yêu cầu bỏ qua, làm sau.
