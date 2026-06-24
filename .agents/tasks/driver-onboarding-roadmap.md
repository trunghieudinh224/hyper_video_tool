# Roadmap: Driver.js Onboarding

Ngày tạo: 24/06/2026

## Objective

Tích hợp hướng dẫn từng bước bằng `driver.js` cho Hyper Video Tool để người mới hiểu flow tạo video từ brief đến render MP4.
Tour phải chạy trong UI tĩnh multi-page, không cần build step, không phụ thuộc CDN lúc runtime.

## Scope

### Sẽ làm

- Vendor `driver.js@1.4.0` vào `frontend/vendor/driver/`.
- Thêm nút `Hướng dẫn` trong topbar chung.
- Thêm common helper `frontend/scripts/common/onboarding.js`.
- Gắn tour theo từng page:
  - `content`: brief video, voiceover toàn video, lưu nháp.
  - `features`: kịch bản, kéo thả thứ tự, bật/tắt đoạn, hiển thị lần lượt/cùng lúc, detail/voice.
  - `assets`: upload, filter, chọn tài nguyên dùng trong video.
  - `template`: chọn tỷ lệ/template, theme, accent, logo.
  - `preview`: canvas preview, scene list, play controls, segment summary.
  - `render`: preflight, validation, format, filename, start render, log/result.
  - `outputs`: danh sách output, chi tiết video, tải MP4.
  - `settings`: thư mục local, import/export/restore/clear.
- Overview không tự chạy tour riêng; chỉ dùng topbar `Hướng dẫn` để dẫn người dùng qua flow chung.
- Lưu trạng thái đã xem vào `localStorage` để không tự bật lặp lại.

### Không làm

- Không thêm framework/build step.
- Không thêm backend API mới.
- Không làm hệ thống i18n tour.
- Không tự động điều hướng qua nhiều page trong một tour duy nhất.

### Để sau

- Tour dạng checklist onboarding xuyên trang.
- Tour theo ngữ cảnh dữ liệu lỗi/thiếu.
- Preview audio riêng cho từng step.

## Files Impact

- NEW `frontend/vendor/driver/driver.js.iife.js`
- NEW `frontend/vendor/driver/driver.css`
- NEW `frontend/scripts/common/onboarding.js`
- NEW `.agents/tasks/driver-onboarding-roadmap.md`
- MODIFY `frontend/pages/*.html`
- MODIFY `frontend/scripts/common/shell.js`
- MODIFY `frontend/scripts/common/page-bootstrap.js`
- MODIFY `frontend/styles/components.css`

## Logic Changes

- Mỗi page sau khi render xong sẽ gọi `AppOnboarding.mount(page)`.
- Topbar có nút `Hướng dẫn`, click sẽ chạy tour của page hiện tại.
- Tour tự chạy lần đầu ở các page chính nếu chưa có key `hyper_video_onboarding_seen:<page>`.
- Driver step chỉ dùng selector tồn tại; helper bỏ qua step thiếu target để tránh lỗi khi page đang empty/backend offline.

## Risk Assessment

- Auto: thêm vendor static và common JS/CSS.
- Auto: tour chỉ đọc DOM, không đổi project data.
- Confirm not needed: user đã yêu cầu roadmap rồi tiến hành.
- Rollback: xóa vendor/helper và bỏ include script/css là quay lại trạng thái cũ.

## Dependency Map

1. Vendor driver.js
2. Thêm script/css include vào page HTML
3. Thêm topbar button trong shell
4. Thêm onboarding helper và page steps
5. Gọi helper sau render
6. Test syntax, UI smoke và localStorage behavior

## Checklist

- [x] Vendor `driver.js@1.4.0`.
- [x] Thêm nút topbar `Hướng dẫn`.
- [x] Tạo `AppOnboarding` helper.
- [x] Khai báo tour cho các page chính.
- [x] Include driver/onboarding vào các page.
- [x] Gọi onboarding sau render.
- [x] Chạy syntax/backend checks.
- [x] Chạy browser smoke desktop.
- [x] Cập nhật Test Report.

## Verification Plan

- `node --check` cho JS common/page liên quan.
- `npm --prefix backend run check`.
- Browser smoke qua static server:
  - mở từng page chính desktop 1440px.
  - click `Hướng dẫn`, xác nhận driver popover xuất hiện.
  - tour không lỗi console.
  - localStorage key được set sau khi mở tour.

## Test Report

Status: passed

- Commands run:
  - `npm view driver.js version dist.unpackedSize dist.tarball --json` - selected `driver.js@1.4.0`.
  - `npm pack driver.js@1.4.0 --silent` - downloaded package for vendored static assets.
  - `node --check frontend/scripts/common/onboarding.js && node --check frontend/scripts/common/page-bootstrap.js && node --check frontend/scripts/common/shell.js && node --check frontend/scripts/common/ui-components.js` - passed.
  - `npm --prefix backend run check` - passed.
  - `git diff --check` - passed.
- Browser/UI checks:
  - Backend server: `http://127.0.0.1:3045`.
  - Playwright/Chrome desktop smoke opened:
    - `content`: first tour step `Brief cấp video`, progress `1/5`, no console errors.
    - `features`: first tour step `Cách hiển thị trong video`, progress `1/5`, no console errors.
    - `assets`: first tour step `Thêm tài nguyên`, progress `1/3`, no console errors.
    - `template`: first tour step `Lọc tỷ lệ video`, progress `1/5`, no console errors.
    - `preview`: first tour step `Khung xem trước`, progress `1/4`, no console errors.
    - `render`: first tour step `Kiểm tra môi trường render`, progress `1/6`, no console errors.
    - `outputs`: first tour step `Danh sách video đã xuất`, progress `1/3`, no console errors.
    - `settings`: first tour step `Thư mục upload`, progress `1/5`, no console errors.
    - `overview`: manual topbar guide step `Bắt đầu từ thanh điều hướng`, progress `1/2`, no console errors.
  - Auto-run verified on `features`: first visit shows tour and sets `hyper_video_onboarding_seen:features=1`.
  - Reduced-motion guard verified by syntax and smoke after patch.
  - Screenshot artifact: `/private/tmp/hvt-driver-onboarding-features.png`.
- Remaining risks:
  - `timeline.html` includes the common driver assets but has no dedicated tour because it is a compatibility page and not in main navigation.
  - Driver assets are vendored from npm package `driver.js@1.4.0`; future library upgrades should be done intentionally, not by CDN.
