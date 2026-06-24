# Roadmap Dynamic Motion Video

## Mục Tiêu

Roadmap này dành riêng cho phần tạo video có nhịp chuyển động hấp dẫn theo nội dung, không bị khóa vào video dọc, video ngang, thời lượng cố định, hoặc một kiểu template như news/report.

Kết quả cuối cùng mong muốn:

- Tool render được video `9:16` và `16:9` bằng cùng một tư duy dữ liệu scene.
- Thời lượng video được tính theo nội dung, số item, media và voiceover thay vì hardcode `60s`, `90s`, `120s`.
- Scene có nhiều item không hiện tất cả cùng lúc; item được reveal theo nhịp có kiểm soát.
- Template vẫn có style riêng, nhưng dùng chung một phần lõi motion/duration để tránh copy-paste bừa bãi.
- Video có thể là giới thiệu, tutorial, showcase, story, report, hoặc video có ảnh/screenshot/demo clip.

## Nguyên Tắc

- Ưu tiên template dọc trước vì nhu cầu hiện tại nghiêng về short-form, nhưng contract và motion core không được khóa chết vào `9:16`.
- Không làm một engine tổng quát quá lớn ngay từ đầu.
- Không tạo mỗi template như một codebase riêng biệt.
- Hướng đúng là `shared motion core` nhỏ, chắc, dùng lại được; mỗi template riêng chịu trách nhiệm layout và visual style.
- Không biến tool thành timeline editor kéo thả trong MVP.
- Không ép mọi video phải có metric/stat/list item.
- Template phải xử lý được scene chỉ có text, scene có media, scene có item list, và scene thiếu media.
- Mỗi phase phải có test report hoặc artifact chứng minh.

## Định Nghĩa Kiến Trúc Mục Tiêu

```text
Project/UI data
-> render payload
-> dynamic scene contract
-> duration resolver
-> template-specific layout
-> shared motion core builds GSAP timeline
-> HyperFrames records MP4
```

Phân lớp:

```text
Shared motion core
- đọc và chuẩn hóa scene
- tính duration
- tính start/end timeline
- animate headline/subtitle/body
- animate item sequence
- animate media reveal/pan/zoom
- expose timeline cho HyperFrames

Template riêng
- HTML composition root
- CSS layout dọc/ngang
- visual style, typography, spacing
- chọn scene renderer phù hợp
- asset placement
```

## Phase 0 - Audit Cơ Chế Render Hiện Tại

### Objective

Làm rõ tool hiện đang render video như thế nào để không thiết kế chồng lên các giả định sai. Sau phase này phải có mô tả chính xác về payload hiện tại, template hiện tại, timeline GSAP, duration hardcode và các điểm có thể tái sử dụng.

### Scope

Sẽ làm:

- Đọc `backend/src/render/project-to-render-payload.js`.
- Đọc `backend/src/render/render-payload-schema.js`.
- Đọc `backend/src/render/render-runner.js`.
- Đọc `templates/project-showcase-90s/`.
- Đọc `templates/project-showcase-vertical-60s/`.
- Ghi lại flow render hiện tại và giới hạn của template showcase.

Không làm:

- Chưa sửa code.
- Chưa thêm template.
- Chưa đổi payload schema.

### Files Impact

- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md` - cập nhật status/test report cho Phase 0.
- LIKELY MODIFY `.agents/tasks/current-task.md` - chỉ khi Phase 0 được chuyển thành task thực thi.

### Verification

- Có summary ngắn mô tả chính xác flow render hiện tại.
- Có danh sách điểm reuse được và điểm phải thay đổi.

### Status

Completed.

### Test Report

Status: passed

- Đã audit mapper payload, schema, render runner, route render job, preflight và hai template showcase hiện có.
- Kết luận: runner/backend job có thể reuse cho template dynamic, nhưng schema/mapper/template timeline đang khóa vào showcase scenes và duration cố định.
- Không chạy runtime test vì phase này chỉ đọc code và cập nhật tài liệu.

## Phase 1 - Dynamic Scene Contract MVP

### Objective

Thiết kế contract scene linh hoạt hơn `intro/problem/solution/features/timeline/impact/outro`. Sau phase này có sample payload cho video motion generic, đủ dùng cho text, media và item sequence.

### Scope

Sẽ làm:

- Thêm sample payload riêng cho dynamic motion video.
- Định nghĩa scene fields tối thiểu:
  - `id`
  - `type`
  - `headline`
  - `subtitle`
  - `body`
  - `items`
  - `media`
  - `motion`
  - `duration`
- Định nghĩa scene types MVP:
  - `title`
  - `text`
  - `media`
  - `cards`
  - `steps`
  - `outro`
- Định nghĩa media contract cho image/video:
  - `type`
  - `url`
  - `alt`
  - `fit`
  - `focus`
  - `caption`
- Chưa bắt backend chính phải dùng contract này nếu rủi ro cao; có thể bắt đầu bằng sample payload riêng cho template mới.

Không làm:

- Chưa nối UI.
- Chưa generate scene bằng AI.
- Chưa migrate payload showcase cũ.
- Chưa hỗ trợ mọi loại scene như chart, quote, comparison nâng cao.

### Files Impact

- NEW `data/dynamic-motion-payload.sample.json` - payload mẫu cho template mới.
- LIKELY MODIFY `backend/src/render/render-payload-schema.js` - chỉ khi quyết định validate contract mới trong backend.
- LIKELY MODIFY `backend/src/render/project-to-render-payload.js` - chỉ khi quyết định mapper backend sinh payload mới.
- MODIFY `.agents/tasks/current-task.md` - task checklist/test report khi triển khai.
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md` - status phase.

### Logic Changes

- Thêm khái niệm scene generic thay vì scene project showcase cố định.
- Scene không bắt buộc có item.
- Scene có thể có media hoặc không.
- Motion behavior nằm trong payload để template biết nên reveal text, sequence item hay focus media.

### Risk Assessment

- Tier Auto: thêm sample payload riêng không ảnh hưởng render hiện tại.
- Tier Confirm: nếu mở rộng schema backend chính, cần xác nhận vì có thể ảnh hưởng validation render job.
- Rollback: xóa sample payload hoặc revert schema/mapping nếu chưa nối UI.

### Verification

- `node -e "JSON.parse(require('node:fs').readFileSync('data/dynamic-motion-payload.sample.json','utf8')); console.log('ok')"`
- Nếu sửa backend schema: `npm --prefix backend run check`.

### Status

Completed.

### Test Report

Status: passed

- Đã tạo `data/dynamic-motion-payload.sample.json`.
- Payload bao phủ scene `title`, `text`, `media`, `cards`, `steps`, `outro`.
- Contract có `headline`, `subtitle`, `body`, `items`, `media`, `motion`, `duration`.
- `node -e "JSON.parse(require('node:fs').readFileSync('data/dynamic-motion-payload.sample.json','utf8')); console.log('ok')"` pass.
- Không đổi backend schema trong phase này.

## Phase 2 - Duration Resolver MVP

### Objective

Tạo cơ chế tính thời lượng scene theo nội dung. Sau phase này duration không còn phụ thuộc vào tên template hoặc bảng hardcode duy nhất.

### Scope

Sẽ làm:

- Tạo helper tính duration từ:
  - base duration theo scene type
  - số item
  - độ dài text
  - media duration/config nếu có
  - voiceover estimated duration nếu có
- Tạo output timeline plan:
  - `scene.start`
  - `scene.duration`
  - `scene.end`
  - `totalDuration`
- Đặt min/max duration để tránh video quá nhanh hoặc quá lê thê.
- Viết test cho case:
  - title ngắn
  - cards 1 item
  - cards nhiều item
  - media scene
  - voiceover dài hơn animation

Không làm:

- Chưa sync audio từng scene tuyệt đối.
- Chưa auto split text dài thành nhiều scene.
- Chưa tối ưu duration bằng machine learning hoặc heuristic phức tạp.

### Files Impact

- NEW `templates/shared/motion-core/duration.js` - duration resolver dùng được trong template.
- NEW `templates/shared/motion-core/duration.test.js` hoặc `backend/scripts/test-dynamic-duration.js` - test helper bằng Node/assert.
- MODIFY `backend/package.json` - chỉ nếu thêm script test riêng.
- MODIFY `.agents/tasks/current-task.md` - task checklist/test report khi triển khai.
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md` - status phase.

### Logic Changes

Ví dụ công thức MVP:

```text
duration = base[type]
  + itemCount * itemSlot[type]
  + textWeightSeconds
```

Nếu có voiceover:

```text
duration = max(animationDuration, voiceoverEstimatedDuration + 0.8)
```

### Risk Assessment

- Tier Auto: helper mới chưa nối render chính thì rủi ro thấp.
- Tier Confirm: nếu dùng duration resolver cho template production hiện tại, cần xác nhận để tránh đổi độ dài output cũ.
- Rollback: revert helper và test; template cũ không bị ảnh hưởng nếu chưa nối.

### Verification

- Node test duration resolver pass.
- Output timeline plan có `totalDuration` hợp lý và không có scene duration âm/zero.

### Status

Completed.

### Test Report

Status: passed

- Đã tạo `templates/shared/motion-core/duration.js`.
- Đã tạo `templates/shared/motion-core/duration.test.js`.
- `node --check templates/shared/motion-core/duration.js && node --check templates/shared/motion-core/duration.test.js` pass.
- `node templates/shared/motion-core/duration.test.js` pass.
- Helper chưa được nối vào template production.

## Phase 3 - Shared Motion Core MVP

### Objective

Tạo lõi motion nhỏ dùng chung cho template mới. Sau phase này template có thể build GSAP timeline từ timeline plan và animate text/media/items theo primitive ổn định.

### Scope

Sẽ làm:

- Tạo primitive:
  - `revealText`
  - `revealBlock`
  - `sequenceItems`
  - `spotlightItems`
  - `revealMedia`
  - `panMedia`
  - `transitionScene`
- Tạo adapter nhận `scene`, `timelinePlan`, DOM root và GSAP timeline.
- Bảo đảm không có primitive nào phụ thuộc cứng vào dọc/ngang.
- Bảo đảm thiếu item/media không crash.

Không làm:

- Chưa làm animation quá nhiều kiểu.
- Chưa thêm SFX.
- Chưa làm editor preview từng keyframe.
- Chưa thay animation template cũ.

### Files Impact

- NEW `templates/shared/motion-core/index.js`
- NEW `templates/shared/motion-core/animations.js`
- NEW `templates/shared/motion-core/dom.js`
- NEW `templates/shared/motion-core/duration.js` nếu Phase 2 chưa tạo.
- NEW `templates/shared/motion-core/README.md`
- MODIFY `.agents/tasks/current-task.md`
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`

### Logic Changes

- Template mới gọi shared primitive thay vì tự viết toàn bộ GSAP timeline trong từng `script.js`.
- Item list có thể hiện tuần tự theo slot, không show hết cùng lúc.
- Media có reveal/pan/zoom nhẹ, không chỉ là ảnh tĩnh.

### Risk Assessment

- Tier Auto: thêm shared code mới trong `templates/shared/` không ảnh hưởng template cũ nếu chưa import.
- Tier Confirm: nếu template cũ được refactor sang shared core thì cần task riêng.
- Rollback: template mới có thể bỏ import shared core nếu cần.

### Verification

- `node --check` các file JS shared core.
- Test DOM giả hoặc browser smoke tối thiểu cho primitive không crash khi thiếu optional fields.

### Status

Completed.

### Test Report

Status: passed

- Đã tạo `templates/shared/motion-core/dom.js`.
- Đã tạo `templates/shared/motion-core/animations.js`.
- Đã tạo `templates/shared/motion-core/index.js`.
- Đã tạo `templates/shared/motion-core/README.md`.
- Đã tạo `templates/shared/motion-core/motion-core.test.js`.
- `node --check templates/shared/motion-core/duration.js && node --check templates/shared/motion-core/dom.js && node --check templates/shared/motion-core/animations.js && node --check templates/shared/motion-core/index.js && node --check templates/shared/motion-core/duration.test.js && node --check templates/shared/motion-core/motion-core.test.js` pass.
- `node templates/shared/motion-core/duration.test.js && node templates/shared/motion-core/motion-core.test.js` pass.
- Shared core chưa được nối vào template production.

## Phase 4 - Dynamic Story Vertical Template MVP

### Objective

Tạo template dọc đầu tiên dùng dynamic scene contract và shared motion core. Sau phase này phải render được một MP4 dọc từ payload mẫu, có nhịp motion tốt hơn template showcase hiện tại.

### Scope

Sẽ làm:

- Tạo template `templates/dynamic-story-vertical/`.
- Composition metadata:
  - `data-composition-id="dynamic-story-vertical"`
  - `data-width="1080"`
  - `data-height="1920"`
- Hỗ trợ scene types MVP:
  - `title`
  - `text`
  - `media`
  - `cards`
  - `steps`
  - `outro`
- Import GSAP local.
- Import shared motion core.
- Render từ `data/dynamic-motion-payload.sample.json` khi preview từ project root.
- Render từ `render-payload.json` khi backend copy vào workdir.
- Visual direction:
  - motion-focused, không bị khóa thành news/report
  - text lớn nhưng có clamp
  - media rõ, không méo aspect ratio
  - item reveal tuần tự
  - background có chuyển động nhẹ, không làm rối

Không làm:

- Chưa nối UI chọn template.
- Chưa làm bản ngang.
- Chưa hỗ trợ mọi motion preset.
- Chưa dùng ảnh/video upload thật nếu backend chưa cấp URL phù hợp.

### Files Impact

- NEW `templates/dynamic-story-vertical/index.html`
- NEW `templates/dynamic-story-vertical/style.css`
- NEW `templates/dynamic-story-vertical/script.js`
- NEW `templates/dynamic-story-vertical/vendor/gsap.min.js`
- MODIFY `data/dynamic-motion-payload.sample.json`
- MODIFY `.agents/tasks/current-task.md`
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`

### Logic Changes

- Template tự build scene DOM hoặc fill scene DOM từ payload dynamic.
- Timeline duration lấy từ duration resolver.
- Items/cards/steps chạy theo sequence hoặc spotlight, không hiện cùng lúc mặc định.
- Media scene có thể focus ảnh/video với caption.

### Risk Assessment

- Tier Auto: template mới không ảnh hưởng template showcase cũ nếu chưa whitelist backend.
- Tier Confirm: nếu thêm template vào backend whitelist để render qua API, cần xác nhận vì thay đổi contract render.
- Rollback: xóa template mới và payload mẫu.

### Verification

- `node --check templates/dynamic-story-vertical/script.js`
- `node backend/scripts/run-hyperframes-local.js --cwd templates/dynamic-story-vertical lint`
- Render command ra `/private/tmp/hvt-dynamic-story-vertical.mp4`.
- FFprobe qua runner cache xác nhận output `1080x1920`.
- Manual review MP4:
  - item reveal tuần tự
  - scene không quá nhanh
  - media không méo
  - text không tràn khung

### Status

Planned.

## Phase 5 - Backend Template Whitelist Và API Render

### Objective

Cho backend render template dynamic mới qua `POST /api/render-jobs` mà không phá template ngang/dọc showcase hiện có.

### Scope

Sẽ làm:

- Thêm preset/template id `dynamic-story-vertical`.
- Cho render payload dynamic pass validation hoặc route validation riêng nếu cần.
- Preflight kiểm template mới:
  - `index.html`
  - `style.css`
  - `script.js`
  - `vendor/gsap.min.js`
  - shared motion core dependency
- Smoke render API với dynamic payload.

Không làm:

- Chưa nối UI.
- Chưa đổi template mặc định.
- Chưa migrate payload showcase cũ sang dynamic.

### Files Impact

- MODIFY `backend/src/render/render-payload-schema.js`
- MODIFY `backend/src/render/preflight.js`
- MODIFY `backend/scripts/smoke-render-api.js` hoặc NEW smoke script riêng.
- MODIFY `data/dynamic-motion-payload.sample.json`
- MODIFY `.agents/tasks/current-task.md`
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`

### Logic Changes

- Backend biết thêm template dynamic mới.
- Render runner vẫn copy template theo `payload.template.id`.
- Existing templates phải giữ pass.

### Risk Assessment

- Tier Confirm: thay schema/whitelist backend có thể ảnh hưởng render API nếu làm ẩu.
- Rollback: revert whitelist/schema/preflight; template file vẫn có thể giữ như experimental nếu chưa dùng UI.

### Verification

- `npm --prefix backend run check`
- API smoke render template cũ ngang vẫn pass.
- API smoke render template cũ dọc vẫn pass hoặc ít nhất schema/preflight không fail.
- API smoke render dynamic dọc pass và output `1080x1920`.

### Status

Planned.

## Phase 6 - UI Chọn Dynamic Template MVP

### Objective

Cho người dùng chọn template dynamic trong UI Render và render được MP4 từ dữ liệu hiện có hoặc payload mẫu có kiểm soát.

### Scope

Sẽ làm:

- Thêm option template dynamic trên Render page.
- Cho UI build payload dynamic tối thiểu từ brief/video content hiện có.
- Hiển thị cảnh báo nếu dữ liệu thiếu media hoặc text quá dài.
- Outputs page hiển thị đúng template/resolution.

Không làm:

- Chưa làm editor scene dynamic đầy đủ.
- Chưa làm drag-drop timeline.
- Chưa cho chỉnh từng animation preset sâu.
- Chưa làm template ngang dynamic.

### Files Impact

- MODIFY `frontend/scripts/common/constants.js`
- MODIFY `frontend/scripts/common/render-preview.js`
- MODIFY `frontend/scripts/pages/render.js`
- MODIFY `frontend/scripts/pages/outputs.js` nếu metadata hiển thị thiếu.
- MODIFY `frontend/pages/render.html` nếu cần control template rõ hơn.
- MODIFY `.agents/tasks/current-task.md`
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`

### Logic Changes

- UI có thêm template choice.
- Payload builder có nhánh dynamic MVP.
- Render flow/poll/output vẫn giữ cơ chế hiện có.

### Risk Assessment

- Tier Confirm: UI build payload mới có thể gây nhầm nếu validation cũ chưa phân biệt template.
- Rollback: ẩn option dynamic khỏi UI, backend/template vẫn giữ để test bằng command.

### Verification

- `npm --prefix backend run check`
- `node --check` các file frontend liên quan.
- Browser smoke:
  - mở Render page
  - chọn dynamic template
  - bấm render
  - poll tới hoàn tất
  - Outputs có record đúng template
- Manual review MP4 output.

### Status

Planned.

## Phase 7 - Dynamic Horizontal Template

### Objective

Sau khi bản dọc ổn, tạo bản ngang dùng cùng scene contract và shared motion core nhưng layout riêng cho `16:9`.

### Scope

Sẽ làm:

- Tạo `templates/dynamic-story-horizontal/`.
- Composition metadata:
  - `data-width="1920"`
  - `data-height="1080"`
- Dùng cùng payload dynamic.
- Layout ngang riêng:
  - split text/media khi phù hợp
  - cards/grid không quá to
  - text không dùng scale dọc
- Render smoke ngang.

Không làm:

- Không copy CSS dọc rồi scale bừa.
- Không làm nếu template dọc chưa pass review visual.

### Files Impact

- NEW `templates/dynamic-story-horizontal/index.html`
- NEW `templates/dynamic-story-horizontal/style.css`
- NEW `templates/dynamic-story-horizontal/script.js`
- NEW `templates/dynamic-story-horizontal/vendor/gsap.min.js`
- MODIFY `backend/src/render/render-payload-schema.js`
- MODIFY `backend/src/render/preflight.js`
- MODIFY `.agents/tasks/dynamic-motion-video-roadmap.md`

### Risk Assessment

- Tier Confirm: thêm template backend mới cần regression ngang/dọc.
- Rollback: gỡ template id khỏi whitelist.

### Verification

- Template lint pass.
- API smoke render ngang pass.
- Output `1920x1080`.
- Manual visual review không bị bố cục dọc phóng ngang.

### Status

Future.

## Phase 8 - Media Handling Nâng Cao

### Objective

Làm media scene đủ tốt cho ảnh, screenshot và demo clip thật.

### Scope

Có thể làm:

- Image focus/crop config.
- Ken Burns pan/zoom nhẹ.
- Video clip fit/crop.
- Caption theo media.
- Fallback thumbnail nếu media lỗi.
- Cảnh báo media quá nhỏ hoặc sai tỷ lệ.

Không làm ngay:

- Asset trimming editor.
- Crop editor UI.
- Transcode nâng cao.

### Status

Future.

## Phase 9 - Audio Sync Và Captions

### Objective

Đồng bộ motion duration với voiceover/caption tốt hơn.

### Scope

Có thể làm:

- Duration theo scene voiceover.
- Cảnh báo script quá dài.
- Caption overlay.
- Background music.
- SFX theo event animation nếu thật sự cần.

Liên quan roadmap:

- `.agents/tasks/audio-roadmap.md`

### Status

Future.

## Phase 10 - Preset Library

### Objective

Khi dynamic template đầu tiên đã ổn, mở rộng thành nhiều preset visual mà vẫn dùng chung contract/core.

### Preset Có Thể Có

- Product intro.
- Tutorial steps.
- Project showcase.
- Feature announcement.
- Internal report.
- Case study.
- Media-first demo.

### Không Làm Ngay

- Marketplace template.
- User custom CSS trong UI.
- Timeline editor phức tạp.

### Status

Future.

## Thứ Tự Khuyến Nghị

1. Phase 0 - Audit render hiện tại.
2. Phase 1 - Dynamic scene contract MVP.
3. Phase 2 - Duration resolver MVP.
4. Phase 3 - Shared motion core MVP.
5. Phase 4 - Dynamic story vertical template MVP.
6. Phase 5 - Backend API render.
7. Phase 6 - UI chọn dynamic template.
8. Phase 7 - Dynamic horizontal template.

Lý do: nếu làm UI trước, dễ có form đẹp nhưng video vẫn chán. Phải chứng minh template motion + duration trước.

## MVP Đề Xuất Đầu Tiên

MVP đầu tiên nên dừng ở Phase 4:

- Có payload mẫu.
- Có duration resolver.
- Có shared motion core nhỏ.
- Có template dọc dynamic.
- Có MP4 render bằng command để xem nhịp motion thật.

Chưa cần UI. Nếu MP4 mẫu chưa cuốn, UI chưa có giá trị.

## Rủi Ro Tổng

### Risk 1 - Engine quá tổng quát, chậm ra video đẹp

Tier: Confirm

Cách giảm rủi ro:

- Chỉ làm 6 scene type MVP.
- Shared core chỉ chứa primitive thật sự dùng trong template đầu.
- Không thêm preset trước khi có MP4 mẫu đạt chất lượng.

### Risk 2 - Template riêng bị copy-paste quá nhiều

Tier: Auto

Cách giảm rủi ro:

- Tách duration và animation primitive vào `templates/shared/motion-core/`.
- Template riêng chỉ lo layout/style.

### Risk 3 - Dynamic duration làm lệch voiceover

Tier: Confirm

Cách giảm rủi ro:

- MVP dùng estimated duration trước.
- Khi bật voiceover, scene duration lấy max giữa animation và voiceover estimate.
- Sync audio chi tiết để phase riêng.

### Risk 4 - Media làm vỡ layout

Tier: Auto

Cách giảm rủi ro:

- Mọi media phải có fit/focus/fallback.
- Browser/render smoke có case thiếu media và media sai tỷ lệ.

### Risk 5 - Ảnh hưởng template hiện tại

Tier: Confirm

Cách giảm rủi ro:

- Template dynamic ban đầu không thay template showcase.
- Chỉ thêm whitelist backend sau khi command render pass.
- Luôn regression render ngang/dọc cũ khi đụng backend.

## Approval Gates

- Chỉ bắt đầu Phase 1-4 khi user xác nhận làm MVP dynamic motion vertical.
- Chỉ nối backend API sau khi template render command ra MP4 đạt nhịp motion chấp nhận được.
- Chỉ nối UI sau khi API smoke pass.
- Chỉ làm horizontal sau khi bản vertical được review visual.

## Test Report

Status: not started

Commands run:

- Chưa chạy.

Artifacts:

- Chưa có.

Remaining risks:

- Roadmap mới tạo, chưa có implementation.
