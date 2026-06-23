# Roadmap: Xem Trước Và Chi Tiết Kịch Bản

Ngày tạo: 23/06/2026

## Objective

Làm trang `Xem trước` dễ hiểu hơn và bổ sung vùng chi tiết cho từng đoạn ở trang `Kịch bản`.
Mục tiêu là giúp người dùng kiểm tra video flow trước khi render mà không phải mở modal sửa từng đoạn.

## Scope

### In Scope

- Trang `Kịch bản` có inspector chi tiết cho đoạn đang chọn.
- Click vào đoạn kịch bản để xem đầy đủ loại đoạn, trạng thái, thời lượng, nội dung chính, điểm nhấn và voice script.
- Trang `Xem trước` hiển thị đúng ratio theo template đang chọn.
- Trang `Xem trước` có scene list, thông tin template, thông tin scene đang chọn và tóm tắt segment đang bật.
- Giữ dữ liệu/schema hiện tại, không thêm backend hoặc render contract mới.

### Out Of Scope

- Không sửa pipeline render HyperFrames.
- Không thêm editor visual kéo thả trên canvas preview.
- Không tạo template video mới.
- Không thêm thư viện UI mới.

### Future Scope

- Preview dùng đúng renderer/template thật thay vì mock canvas trong UI.
- Timeline preview theo duration thật từng đoạn.
- Preview audio/voiceover waveform.
- Mapping từng segment sang scene riêng trong render payload.

## Files Impact

- MODIFY `frontend/scripts/common/ui-components.js` — cập nhật render `features` và `preview`.
- MODIFY `frontend/styles/pages/features.css` — layout inspector chi tiết segment.
- MODIFY `frontend/styles/pages/preview.css` — layout preview responsive và scene detail.
- NEW `.agents/tasks/preview-script-detail-roadmap.md` — roadmap/handoff của phase.

Tổng số file dự kiến: 4.

## Logic Changes

- Thêm state UI cục bộ `selectedScriptSegmentId` để nhớ đoạn đang được chọn trong trang `Kịch bản`.
- Khi reorder/xóa/toggle đoạn, inspector tự chọn lại đoạn hợp lệ.
- Preview lấy template hiện tại từ `data.templateId`, dùng `ratio` để đổi class canvas wrapper.
- Preview không chỉnh dữ liệu; chỉ đọc project data và scene đang chọn.

## Risk Assessment

- Risk: JS render common đang chứa nhiều màn hình trong một file lớn.
  Tier: 🟢 Auto. Giữ thay đổi trong hai renderer hiện có, không tách architecture ở phase này.
- Risk: Inspector click có thể đụng với nút edit/delete/toggle.
  Tier: 🟢 Auto. Action button dùng handler riêng, click card chỉ đổi selected id.
- Rollback: Có thể rollback bằng một commit vì chỉ là UI static.
- Side effect: Không ảnh hưởng backend/render payload.

## Dependency Map

Roadmap file
→ Kịch bản inspector
→ Preview layout/detail
→ Syntax/diff checks

## Checklist

- [x] Tạo roadmap file.
- [x] Thêm selected state cho segment detail.
- [x] Render layout `script-board` gồm list và inspector.
- [x] Thêm event click chọn đoạn.
- [x] Thêm CSS responsive cho inspector.
- [x] Làm lại header/layout preview.
- [x] Thêm ratio-aware preview canvas wrapper.
- [x] Thêm scene detail/template summary/segment summary.
- [x] Chạy `node --check frontend/scripts/common/ui-components.js`.
- [x] Chạy `git diff --check`.
- [x] Browser test desktop/mobile cho `Kịch bản`.
- [x] Browser test desktop/mobile cho `Xem trước`.
- [x] Browser test desktop chi tiết theo yêu cầu mới: không ưu tiên mobile.
- [x] Browser test preview template dọc `9:16`.
- [x] Chạy full backend check.
- [x] Điền Test Report.

## Verification Plan

- Command:
  - `node --check frontend/scripts/common/ui-components.js`
  - `git diff --check`
  - `npm --prefix backend run check`
- Browser:
  - Desktop 1440x950: `features.html`, `preview.html`.
  - Mobile 390x844: `features.html`, `preview.html`.
  - Template dọc `project-showcase-vertical-60s`.
- Manual:
  - User tự test UI theo yêu cầu hiện tại.

## Test Report

Status: passed

- Total checks/tests: 7
- Passed: 7
- Failed: 0

Commands run:
- `node --check frontend/scripts/common/ui-components.js`
- `git diff --check`
- `npm --prefix backend run check`

Browser checks:
- `features.html` desktop 1440x950: inspector render, click segment đổi detail, không console/page error, không horizontal overflow.
- `features.html` mobile 390x844: layout một cột, inspector static, không console/page error, không horizontal overflow.
- `preview.html` desktop 1440x950: scene list render, click scene đổi detail, autoplay đổi scene, nút hiện đúng `Dừng` khi đang chạy và `Chạy thử` sau khi dừng.
- `preview.html` mobile 390x844: layout một cột, controls stack, không console/page error, không horizontal overflow.
- `preview.html` với template dọc `9:16`: wrapper dùng `is-vertical`, canvas 280x498 ở mobile, không horizontal overflow.
- Desktop-only retest theo yêu cầu mới: `features.html` render 4 segment, inspector đổi đúng khi click, modal sửa mở đủ field, đi từ inspector sang Preview, scene click/autoplay/stop đúng, template dọc `9:16` đúng class, không console/page error, không horizontal overflow.

Fixes from testing:
- Sửa lỗi autoplay vẫn chạy nhưng nút bị render lại thành `Chạy thử` sau khi scene tự đổi.
- Dọn listener `tabChanged` khỏi `renderPreviewScreen` để tránh tích listener mỗi lần preview re-render.

Manual/UI checks:
- [ ] User test trực tiếp trên giao diện.

Artifacts:
- None

Remaining risks:
- Chưa chụp screenshot lưu artifact vì phase này ưu tiên browser assertions/DOM metrics.
