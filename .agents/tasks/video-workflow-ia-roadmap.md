# Roadmap Điều Chỉnh Flow Và Information Architecture

Roadmap này dùng để chỉnh lại Hyper Video Tool từ tư duy "nhập hồ sơ dự án" sang tư duy "tạo brief video cho một nội dung bất kỳ trong project". Mục tiêu là làm flow dễ hiểu hơn cho người dùng mới, giảm số trang dư, nhưng vẫn giữ render/backend hiện tại ổn định.

## Vấn Đề Hiện Tại

UI hiện có quá nhiều page và một số page bị đặt tên theo khung video giới thiệu dự án:

- `Nội dung dự án` đang chứa các field kiểu project profile/problem/solution/context, không phù hợp mọi video.
- `Tính năng` chỉ hợp khi video nói về feature, nhưng tool cần hỗ trợ sản phẩm, module, workflow, bug fix, dashboard, API hoặc bất kỳ nội dung nào trong project.
- `Timeline` là dữ liệu tùy chọn, không phải video nào cũng có mốc thời gian.
- `Xem trước` đúng vai trò nhưng hiện bị tách khỏi flow biên tập nên người dùng khó hiểu khi nào dùng.
- `Tài nguyên` nên là thư viện media, không nên nhét toàn bộ vào brief, nhưng brief cần chọn nhanh asset chính.

## Product Direction Mới

Người dùng không cần nhập đầy đủ "hồ sơ dự án". Người dùng chỉ cần trả lời:

1. Video này giới thiệu cái gì?
2. Video này dành cho ai hoặc dùng trong ngữ cảnh nào?
3. Người xem cần hiểu điều gì sau khi xem?
4. Video gồm những đoạn nội dung nào?
5. Mỗi đoạn dùng text, voice và asset nào?
6. Chọn template, xem trước, render và tải video.

## Navigation Đề Xuất

### Giữ Nguyên

- `Tổng quan`
- `Tài nguyên`
- `Template`
- `Xem trước`
- `Render`
- `Video đã xuất`
- `Cài đặt`

### Đổi Tên / Gộp

- `Nội dung dự án` -> `Nội dung video`
- `Tính năng` + `Timeline` -> `Kịch bản`

### Navigation Sau Khi Chỉnh

```text
Tổng quan
Nội dung video
Kịch bản
Tài nguyên
Template
Xem trước
Render
Video đã xuất
Cài đặt
```

Không gộp `Xem trước` vào `Kịch bản` trong phase này. `Kịch bản` là nơi biên tập dữ liệu, còn `Xem trước` là nơi kiểm tra visual sau khi template áp dữ liệu.

Không gộp toàn bộ `Tài nguyên` vào `Nội dung video`. `Tài nguyên` vẫn là thư viện media. `Nội dung video` chỉ chọn nhanh asset chính nếu cần.

## Page Responsibility Mới

### 1. Tổng Quan

Vai trò:

- Dashboard tình trạng video hiện tại.
- Cho biết còn thiếu gì trước khi render.
- Điều hướng nhanh tới bước cần sửa.

Không nên:

- Không nhập nội dung dài.
- Không quản lý asset chi tiết.
- Không chỉnh kịch bản chi tiết.

Nội dung nên có:

- Tên video/chủ đề.
- Loại nội dung video.
- Template đang chọn.
- Tỉ lệ video.
- Số đoạn trong kịch bản.
- Số asset đang dùng.
- Trạng thái voiceover.
- Trạng thái sẵn sàng render.

### 2. Nội Dung Video

Vai trò:

- Setting chung cho toàn bộ video.
- Đây là brief cấp video, không phải hồ sơ dự án bắt buộc.

Nội dung nên có:

- `Loại nội dung`: tính năng, sản phẩm, workflow, module kỹ thuật, demo UI, bug fix, báo cáo, handoff, khác.
- `Chủ đề video`: tên thứ đang được giới thiệu.
- `Mô tả ngắn`: video nói về gì.
- `Mục tiêu video`: người xem cần hiểu hoặc làm được gì sau khi xem.
- `Thông điệp chính`: 1-2 ý quan trọng nhất.
- `Đối tượng xem` hoặc `ngữ cảnh xem`: optional.
- `Tone trình bày`: kỹ thuật, nội bộ, thuyết trình, ngắn gọn, bán hàng nhẹ, training.
- `Ngôn ngữ nội dung`.
- `Voiceover`: bật/tắt, ngôn ngữ, giọng, tốc độ, âm lượng.
- `Asset chính`: logo/ảnh đại diện/screenshot mặc định, chọn từ thư viện tài nguyên.

Nên bỏ khỏi form chính:

- `Vấn đề cần giải quyết`
- `Giải pháp đã xây dựng`
- `Người dùng mục tiêu`
- `Bối cảnh sử dụng`
- `Điểm nổi bật nhất`

Các field trên chỉ nên xuất hiện khi template hoặc loại nội dung yêu cầu, hoặc nằm trong advanced/template-specific sau này.

### 3. Kịch Bản

Vai trò:

- Gộp `Tính năng` và `Timeline`.
- Quản lý các đoạn sẽ xuất hiện trong video.
- Đây là nơi quyết định video gồm những cảnh/ý nào.

Mỗi đoạn nên có:

- `Tiêu đề đoạn`
- `Loại đoạn`: mở đầu, vấn đề, giải pháp, tính năng, workflow step, milestone, demo, kết quả, kết thúc, custom.
- `Nội dung chính`
- `Điểm nhấn`
- `Voice script`
- `Thời lượng dự kiến`
- `Asset gắn với đoạn`
- `Bật/tắt trong video`
- `Thứ tự`

Mapping gợi ý:

- Feature hiện tại -> segment loại `tính năng`.
- Timeline milestone hiện tại -> segment loại `milestone`.
- Scene voiceover hiện tại -> segment `voice script`.

Không làm trong MVP:

- Không kéo thả phức tạp.
- Không timeline editor dạng video editor.
- Không tự căn audio theo từng frame.

### 4. Tài Nguyên

Vai trò:

- Thư viện media của video/project.
- Upload/quản lý/chọn asset.

Nên giữ riêng vì:

- Số lượng ảnh/video có thể nhiều.
- Cần thumbnail, filter, rename, delete, preview.
- Nếu nhét vào `Nội dung video`, trang brief sẽ quá nặng.

Nội dung nên có:

- Upload/chọn file.
- Grid asset.
- Filter theo loại.
- Cờ `Dùng trong video`.
- Gắn asset vào segment hoặc asset chính.

### 5. Template

Vai trò:

- Chọn kiểu video và format trình bày.
- Template nên nói rõ phù hợp loại nội dung nào.

Template card nên có:

- Tên template.
- Tỉ lệ hỗ trợ.
- Thời lượng dự kiến.
- Phù hợp với: demo tính năng, giới thiệu sản phẩm, handoff kỹ thuật, báo cáo, training.
- Scene structure.

### 6. Xem Trước

Vai trò:

- Kiểm tra visual theo template.
- Xem từng scene/segment sau khi dữ liệu được áp vào template.

Nên cải thiện:

- Từ `Kịch bản`, có nút nhỏ `Xem trước đoạn này`.
- Khi chuyển sang `Xem trước`, tự focus đúng scene tương ứng nếu có thể.
- Hiển thị rõ scene đang xem lấy dữ liệu từ segment nào.

Không nên:

- Không biến `Xem trước` thành form editor chính.
- Không gộp vào `Kịch bản` ở phase này.

### 7. Render

Vai trò:

- Cấu hình output và chạy render.

Nội dung:

- Tỉ lệ video.
- FPS.
- Tên file output.
- Start/re-render.
- Progress.
- Log collapsible.
- Status hoàn tất.
- Nút xem video/tải xuống.

Không chứa:

- Voiceover global.
- Script nội dung.
- Asset library.

### 8. Video Đã Xuất

Vai trò:

- Lịch sử output.
- Xem/tải/lọc video đã render.

### 9. Cài Đặt

Vai trò:

- Setting của tool local.
- Import/export JSON.
- Kiểm tra backend/render health.
- Theme/app preference.

Không chứa:

- Nội dung video.
- Kịch bản.
- Asset cụ thể của video, trừ import/export project JSON.

## Data Direction

Không đổi schema lớn ngay trong phase đầu. Nên làm theo hướng compatibility adapter:

```text
project fields hiện tại
-> UI mới đọc/ghi theo video brief + segments
-> mapper vẫn convert ra render payload cũ
-> template/render hiện tại không vỡ
```

Data shape mong muốn về sau:

```json
{
  "videoBrief": {
    "contentType": "feature",
    "topic": "Smart Alert Dashboard",
    "summary": "...",
    "goal": "...",
    "mainMessage": "...",
    "audience": "...",
    "tone": "technical",
    "language": "vi-VN",
    "primaryAssetId": "asset-1"
  },
  "segments": [
    {
      "id": "seg-1",
      "type": "intro",
      "title": "Mở đầu",
      "body": "...",
      "highlight": "...",
      "voiceScript": "...",
      "durationSec": 6,
      "assetIds": [],
      "enabled": true
    }
  ]
}
```

Phase đầu chưa bắt buộc migrate toàn bộ data sang shape này nếu rủi ro cao. Có thể render UI mới trên fields cũ trước, sau đó tách schema ở phase riêng.

## Implementation Phases

### Phase 0 - Confirm IA Và Cập Nhật Docs

Status: done

Objective:

- Chốt flow mới trước khi sửa UI.
- Cập nhật tài liệu product/roadmap để các phase sau không quay lại khung `project profile`.

Scope:

- Cập nhật roadmap này nếu user chỉnh.
- Cập nhật `.agents/context/project-overview.md` để mô tả tool là công cụ tạo video brief cho bất kỳ nội dung trong project.
- Cập nhật `.agents/context/ui-direction.md` nếu navigation đổi.

Files impact:

- `.agents/tasks/video-workflow-ia-roadmap.md`
- `.agents/context/project-overview.md`
- `.agents/context/ui-direction.md`

Verification:

- Review docs bằng mắt.
- Không chạy test code.

Stop point:

- Dừng để user duyệt wording và navigation mới.

### Phase 1 - Rename Navigation Và Page Copy

Status: done

Objective:

- Làm sidebar và page title dễ hiểu hơn mà chưa đổi dữ liệu sâu.

Scope:

- Đổi label `Nội dung dự án` thành `Nội dung video`.
- Đổi label `Tính năng` thành `Kịch bản` hoặc chuẩn bị page mới.
- Ẩn hoặc bỏ `Timeline` khỏi sidebar nếu đã gộp vào `Kịch bản`.
- Cập nhật title/description trên page để giải thích flow.
- `Timeline` route cũ có thể redirect/handoff sang `Kịch bản` để không vỡ link nội bộ.

Out of scope:

- Chưa merge toàn bộ UI feature/timeline.
- Chưa đổi schema data.
- Chưa đổi render mapper.

Likely files impact:

- `frontend/scripts/common/shell.js`
- `frontend/scripts/common/ui-components.js`
- `frontend/pages/features.html` hoặc page tương ứng
- `frontend/pages/timeline.html` nếu cần redirect/empty handoff
- `frontend/styles/pages/features.css`

Verification:

- `node --check frontend/scripts/common/shell.js`
- `node --check frontend/scripts/common/ui-components.js`
- Browser smoke desktop: sidebar còn đúng route, không lỗi console.

Stop point:

- User test navigation mới trước khi merge form lớn.

### Phase 2 - Rework Nội Dung Video Thành Brief Chung

Status: done

Objective:

- Biến Content page thành brief chung cho video, không còn ép khung problem/solution/context.

Scope:

- Thêm/đổi fields:
  - loại nội dung
  - chủ đề video
  - mô tả ngắn
  - mục tiêu video
  - thông điệp chính
  - đối tượng/ngữ cảnh optional
  - tone
  - ngôn ngữ
  - voiceover global
  - asset chính selector nếu backend/UI đã có asset list đủ dùng
- Bỏ khỏi form chính các field cứng không dùng phổ quát.
- Giữ compatibility với data cũ bằng fallback.

Out of scope:

- Chưa làm segment editor mới.
- Chưa thay đổi template scene structure.
- Chưa xóa vĩnh viễn data cũ khỏi sample JSON nếu mapper còn cần.

Likely files impact:

- `frontend/scripts/common/ui-components.js`
- `frontend/scripts/common/state.js`
- `frontend/scripts/common/render-preview.js`
- `frontend/styles/pages/content.css`
- `data/sample-project.json`
- `backend/src/render/project-to-render-payload.js`

Verification:

- `node --check frontend/scripts/common/ui-components.js`
- `node --check frontend/scripts/common/state.js`
- `node --check frontend/scripts/common/render-preview.js`
- `node --check backend/src/render/project-to-render-payload.js`
- Focused Node test: project data cũ vẫn tạo payload render được.
- Browser smoke desktop: Content page không overflow, voiceover vẫn cập nhật payload.

Stop point:

- User test Content page mới trước khi đụng `Kịch bản`.

### Phase 3 - Gộp Tính Năng Và Timeline Thành Kịch Bản

Status: pending

Objective:

- Một page quản lý các đoạn nội dung của video, thay cho hai page `Tính năng` và `Timeline`.

Scope:

- Tạo UI `Kịch bản` dạng list các segment.
- Segment có type để thay thế feature/milestone.
- Cho thêm/sửa/xóa/bật tắt/sắp xếp đoạn bằng nút lên/xuống.
- Mỗi segment có voice script riêng.
- Feature hiện tại được hiển thị như segment type `tính năng`.
- Milestone hiện tại được hiển thị như segment type `milestone`.
- Render mapper vẫn xuất payload tương thích template hiện tại.

Out of scope:

- Không kéo thả.
- Không waveform/timeline editor.
- Không auto split scene bằng AI.
- Không tự căn duration theo audio thật.

Likely files impact:

- `frontend/scripts/common/ui-components.js`
- `frontend/scripts/common/state.js`
- `frontend/scripts/common/render-preview.js`
- `frontend/styles/pages/features.css`
- `frontend/styles/pages/timeline.css`
- `data/sample-project.json`
- `backend/src/render/project-to-render-payload.js`

Verification:

- `node --check` cho các file JS bị đổi.
- Focused Node test:
  - feature cũ -> segment/payload features.
  - milestone cũ -> segment/payload timeline.
  - disabled segment không lên video.
- Browser smoke desktop:
  - thêm segment.
  - đổi type.
  - nhập voice script.
  - reorder.
  - qua Preview/Render không lỗi.

Stop point:

- User test `Kịch bản` mới kỹ trước khi xóa/ẩn route timeline cũ hoàn toàn.

### Phase 4 - Gắn Tài Nguyên Vào Brief Và Segment

Status: pending

Objective:

- Giữ `Tài nguyên` là thư viện riêng, nhưng cho `Nội dung video` và `Kịch bản` chọn asset liên quan.

Scope:

- Trong `Nội dung video`: chọn asset chính.
- Trong `Kịch bản`: chọn asset cho từng segment.
- Trong `Tài nguyên`: hiển thị asset nào đang được dùng ở brief/segment nào.

Out of scope:

- Chưa upload backend nâng cao nếu hiện tại chưa cần.
- Chưa xử lý asset trimming/crop.
- Chưa quản lý version file.

Likely files impact:

- `frontend/scripts/common/ui-components.js`
- `frontend/scripts/common/state.js`
- `frontend/styles/pages/content.css`
- `frontend/styles/pages/features.css`
- `frontend/styles/pages/assets.css`
- `data/sample-project.json`

Verification:

- Browser smoke desktop:
  - chọn asset chính.
  - gắn asset vào segment.
  - asset page hiển thị trạng thái đang dùng.
- Payload/render preview vẫn không lỗi nếu asset thiếu.

Stop point:

- User test asset selection flow.

### Phase 5 - Liên Kết Kịch Bản Với Xem Trước

Status: pending

Objective:

- Làm `Xem trước` có liên hệ rõ với segment, nhưng vẫn là page riêng.

Scope:

- Từ mỗi segment có nút nhỏ `Xem trước`.
- Preview nhận target scene/segment nếu có.
- Preview hiển thị tên segment đang dùng.
- Nếu template không map 1-1 với segment, hiển thị fallback rõ ràng.

Out of scope:

- Không embed preview canvas vào segment editor.
- Không preview audio waveform.
- Không live render MP4.

Likely files impact:

- `frontend/scripts/common/ui-components.js`
- `frontend/scripts/common/render-preview.js`
- `frontend/styles/pages/preview.css`
- `frontend/styles/pages/features.css`

Verification:

- Browser smoke desktop:
  - click `Xem trước` từ segment.
  - Preview focus đúng scene hoặc fallback đúng.
  - Play/pause preview vẫn hoạt động.

Stop point:

- User test flow từ edit segment -> preview.

### Phase 6 - Overview Và Validation Theo Flow Mới

Status: pending

Objective:

- Tổng quan và validation phải phản ánh flow mới, không báo lỗi theo field cũ.

Scope:

- Overview checklist:
  - Brief video đủ chưa.
  - Có ít nhất 1 segment enabled chưa.
  - Template đã chọn chưa.
  - Asset optional/required theo template.
  - Voiceover enabled/config hợp lệ.
  - Render readiness.
- Right validation panel đổi copy theo flow mới.
- Remove warning/error liên quan problem/solution/context nếu không còn required.

Out of scope:

- Không làm rule validation phức tạp theo từng template nếu chưa cần.
- Không thêm backend validation schema mới nếu frontend đủ cho MVP.

Likely files impact:

- `frontend/scripts/common/validation.js`
- `frontend/scripts/common/ui-components.js`
- `frontend/styles/pages/overview.css`
- `frontend/styles/components.css`

Verification:

- `node --check frontend/scripts/common/validation.js`
- Browser smoke desktop:
  - blank project báo thiếu brief/segment/template đúng.
  - sample project báo ready đúng.
  - Render button disabled/enabled đúng.

Stop point:

- User test từ Tổng quan tới Render theo flow mới.

## Scope Không Làm Trong Roadmap Này

- Không đổi backend render engine lớn.
- Không thêm AI generate script tự động.
- Không thêm timeline editor kiểu Premiere/CapCut.
- Không thêm multi-project database.
- Không làm cloud/auth.
- Không đổi audio roadmap background music/SFX.
- Không xóa route/file cũ ngay nếu còn cần compatibility.

## Risk Assessment

### Rủi ro 🟢 Auto

- Đổi label/sidebar/title.
- Đổi copy hướng dẫn trong UI.
- Thêm hint giải thích field.
- Reorder layout trong page.

### Rủi ro 🟡 Confirm

- Đổi schema từ `features/milestones` sang `segments`.
- Ẩn hoặc xóa page `Timeline`.
- Bỏ validation required cho problem/solution/context.
- Thay mapping render payload.

### Rủi ro 🔴 Block

- Xóa dữ liệu local/output thật.
- Migration làm mất project JSON cũ.
- Xóa hoàn toàn backward compatibility trước khi có migration/test.

## Recommended Implementation Order

1. Phase 0: chốt docs và navigation.
2. Phase 1: đổi label/navigation nhẹ.
3. Phase 2: sửa `Nội dung video`.
4. Phase 3: gộp `Tính năng` + `Timeline` thành `Kịch bản`.
5. Phase 6: cập nhật overview/validation sớm sau khi flow chính ổn.
6. Phase 4: gắn asset vào brief/segment.
7. Phase 5: nối segment sang preview.

Lý do Phase 6 có thể làm trước Phase 4/5: sau khi Content và Script đổi, validation cũ sẽ gây hiểu nhầm ngay, nên nên chỉnh sớm.

## Approval Gates

Mỗi phase phải làm riêng, test riêng, báo cáo riêng. Không gộp toàn bộ roadmap này vào một commit lớn.

Trước khi triển khai từng phase cần user xác nhận:

- Chọn tên page cuối cùng: `Nội dung video` hay `Brief video`.
- Chọn tên page gộp: `Kịch bản` hay `Phân đoạn`.
- Chọn cách xử lý `Timeline`: ẩn khỏi sidebar hay redirect sang `Kịch bản`.
- Chọn mức độ đổi data: adapter trên schema cũ trước hay migrate sang `segments` ngay.

## Test Report

Status: passed

- Phase 0: cập nhật `.agents/context/project-overview.md` và `.agents/context/ui-direction.md` theo flow video brief.
- Phase 1: dùng tên page `Nội dung video` và `Kịch bản`; ẩn `Timeline` khỏi sidebar; giữ `timeline.html` làm handoff tương thích sang `Kịch bản`; chưa đổi schema dữ liệu.

Commands run:

- `node --check frontend/scripts/common/shell.js`
- `node --check frontend/scripts/common/ui-components.js`
- `node --check frontend/scripts/common/constants.js`
- `node --check frontend/scripts/common/render-preview.js`
- Chrome headless dump DOM cho:
  - `frontend/pages/overview.html`
  - `frontend/pages/content.html`
  - `frontend/pages/features.html`
  - `frontend/pages/timeline.html`

Manual/UI checks:

- [x] Sidebar còn 9 mục chính và không còn `Timeline`.
- [x] `Tổng quan` render H1 `Tổng quan video`.
- [x] `Nội dung video` render H1 `Nội dung video`, block `Brief video`, field `Chủ đề video`.
- [x] `Kịch bản` render H1 `Kịch bản` và nút `Thêm đoạn`.
- [x] `Timeline` cũ render handoff `Timeline đã chuyển sang Kịch bản` và nút `Mở Kịch bản`.

Remaining risks:

- Validation vẫn dùng logic cũ `problemContext/solutionWhat/features/milestones`; xử lý ở Phase 6 theo roadmap.
- `Kịch bản` Phase 1 mới đổi nhãn trên dữ liệu `features` cũ; segment schema thật thuộc Phase 3.

### Phase 2 Test Report

Status: passed

- Reworked `Nội dung video` thành brief chung, thêm field:
  - `Loại nội dung`
  - `Mục tiêu video`
  - `Thông điệp chính`
  - `Tone trình bày`
  - `Ngôn ngữ nội dung`
  - `Asset chính`
- Giữ compatibility với schema cũ: `projectName`, `shortSummary`, `problemContext`, `solutionWhat`, `features`, `milestones` vẫn còn để render hiện tại không vỡ.
- Cập nhật sample project và render-payload sample để backend payload test khớp dữ liệu brief mới.

Commands run:

- `node --check frontend/scripts/common/constants.js`
- `node --check frontend/scripts/common/storage.js`
- `node --check frontend/scripts/common/ui-components.js`
- `node --check frontend/scripts/common/render-preview.js`
- `node --check backend/src/render/project-to-render-payload.js`
- `npm --prefix backend run payload:write`
- `node backend/scripts/test-render-payload.js`
- Chrome headless dump DOM cho `frontend/pages/content.html`

Manual/UI checks:

- [x] `Nội dung video` render field `Loại nội dung`.
- [x] `Nội dung video` render field `Ngôn ngữ nội dung`.
- [x] `Nội dung video` render field `Tone trình bày`.
- [x] `Nội dung video` render field `Mục tiêu video`.
- [x] `Nội dung video` render field `Thông điệp chính`.
- [x] `Nội dung video` render field `Asset chính`.
- [x] Backend payload test pass sau khi sample được đồng bộ.

Remaining risks:

- Các field brief mới mới được lưu/đọc trong UI và dùng một phần làm fallback payload; chưa có validation riêng theo từng loại nội dung.
- Segment schema thật chưa triển khai; Phase 3 mới gộp dữ liệu `features/milestones` thành `segments`.
