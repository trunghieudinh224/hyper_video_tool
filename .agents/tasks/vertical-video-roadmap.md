# Roadmap Video Dọc 9:16 Cho Điện Thoại

## Mục Tiêu

Thêm khả năng tạo video dọc `9:16` để xem tốt trên điện thoại, song song với template ngang `16:9` hiện tại.

Kết quả cuối cùng mong muốn:

- UI Render có lựa chọn `Ngang 16:9` và `Dọc 9:16`.
- Backend render được cả template ngang và template dọc.
- Template dọc xuất MP4 kích thước `1080x1920`.
- Trang Video đã xuất hiển thị đúng resolution/template.
- Flow ngang hiện tại không bị regression.

Lưu ý: phase này chưa làm âm thanh/voiceover. Video hiện vẫn là hình ảnh, text và animation.

## Nguyên Tắc

- Không ép template ngang sang dọc bằng CSS đơn giản vì layout sẽ xấu trên điện thoại.
- Tạo template dọc riêng để kiểm soát layout, text density và timeline dọc.
- Mỗi phase phải có test report trước khi commit.
- Không commit MP4 output thật.
- Không mở rộng sang audio, subtitle, upload asset thật hoặc timeline editor trong phase này.

## Phase 1 - Contract Và Option Dọc

### Objective

Chuẩn hóa cách app hiểu video dọc trước khi tạo template. Sau phase này payload/UI/backend schema biết có lựa chọn `9:16`, nhưng chưa cần render dọc end-to-end.

### Scope

Sẽ làm:

- Chốt template id dọc: `project-showcase-vertical-60s`.
- Thêm hoặc chuẩn hóa metadata video:
  - `aspectRatio: "9:16"`
  - `width: 1080`
  - `height: 1920`
  - `template.id: "project-showcase-vertical-60s"`
- UI Render có lựa chọn tỷ lệ video ở mức payload builder.
- Schema render payload cho phép template/resolution dọc.
- Cập nhật task docs.

Không làm:

- Chưa tạo template dọc hoàn chỉnh.
- Chưa render dọc bằng UI.
- Chưa thêm audio.

Files impact dự kiến:

- `backend/src/render/render-payload-schema.js`
- `backend/src/render/project-to-render-payload.js`
- `frontend/scripts/common/render-preview.js`
- `frontend/scripts/common/ui-components.js`
- `.agents/tasks/current-task.md`
- `.agents/tasks/hyperframes-roadmap.md`

Verification:

- `npm --prefix backend run check`
- Browser smoke nhẹ: chọn option dọc, payload build ra `1080x1920` và template id dọc.

Approval gate:

- Chỉ làm Phase 2 sau khi Phase 1 pass và commit.

## Phase 2 - Template Dọc MVP

### Objective

Tạo template dọc `project-showcase-vertical-60s` có thể preview và render bằng HyperFrames với payload mẫu.

### Scope

Sẽ làm:

- Tạo thư mục `templates/project-showcase-vertical-60s/`.
- Tạo `index.html`, `style.css`, `script.js` cho composition dọc.
- Copy GSAP local vào `vendor/gsap.min.js`.
- Composition root:
  - `data-composition-id="project-showcase-vertical-60s"`
  - `data-width="1080"`
  - `data-height="1920"`
- Scene flow MVP:
  - intro
  - problem
  - solution
  - features
  - timeline
  - impact
  - outro
- Layout dọc:
  - intro: title lớn, tagline ngắn, team pill.
  - problem/solution: card dọc, text clamp chặt.
  - features: 1 cột, tối đa 4 feature cards.
  - timeline: vertical timeline.
  - impact: số liệu lớn, mô tả ngắn.
  - outro: note ngắn, logo/team.
- Text hardening tương tự template ngang.

Không làm:

- Chưa nối UI Render end-to-end nếu backend chưa support template dọc.
- Chưa thêm voiceover/audio/subtitle.
- Chưa làm visual polish nâng cao.

Files impact dự kiến:

- `templates/project-showcase-vertical-60s/index.html`
- `templates/project-showcase-vertical-60s/style.css`
- `templates/project-showcase-vertical-60s/script.js`
- `templates/project-showcase-vertical-60s/vendor/gsap.min.js`
- `.agents/tasks/current-task.md`
- `.agents/tasks/hyperframes-roadmap.md`

Verification:

- `node --check templates/project-showcase-vertical-60s/script.js`
- `node backend/scripts/run-hyperframes-local.js --cwd templates/project-showcase-vertical-60s lint`
- Browser stress test 1080x1920 không overflow.
- Render sample payload ra `/private/tmp/hyper-video-tool-vertical-template.mp4`.
- `ffprobe` xác nhận:
  - `width=1080`
  - `height=1920`
  - duration hợp lệ.

Approval gate:

- Có thể dừng sau Phase 2 để user xem MP4 dọc render bằng command trước khi nối UI.

## Phase 3 - Backend Render Dọc End-To-End

### Objective

Backend render runner hỗ trợ nhiều template, bao gồm template dọc. Sau phase này API có thể nhận payload dọc và xuất MP4 dọc.

### Scope

Sẽ làm:

- Đổi runner từ hardcode `project-showcase-90s` sang whitelist template:
  - `project-showcase-90s`
  - `project-showcase-vertical-60s`
- Copy đúng template theo `payload.template.id`.
- Preflight kiểm cả template ngang và dọc.
- Output manifest lưu thêm resolution/aspectRatio/template nếu cần.
- Smoke API render dọc.

Không làm:

- Chưa thêm cancel job.
- Chưa persist full job log qua restart.
- Chưa thêm audio.

Files impact dự kiến:

- `backend/src/render/render-runner.js`
- `backend/src/render/preflight.js`
- `backend/src/render/output-manifest.js` nếu cần metadata rõ hơn.
- `backend/scripts/smoke-render-api.js` hoặc script smoke mới cho dọc.
- `.agents/tasks/current-task.md`
- `.agents/tasks/hyperframes-roadmap.md`

Verification:

- `npm --prefix backend run check`
- API smoke render dọc:
  - `POST /api/render-jobs` trả job queued.
  - Poll tới `succeeded`.
  - `HEAD /api/outputs/{jobId}.mp4` trả `200`.
  - `ffprobe outputs/{jobId}.mp4` xác nhận `1080x1920`.

Approval gate:

- Chỉ làm Phase 4 sau khi API dọc render pass.

## Phase 4 - UI Chọn Dọc/Ngang End-To-End

### Objective

Người dùng chọn tỷ lệ video trên UI Render và render được MP4 đúng tỷ lệ.

### Scope

Sẽ làm:

- Render page có selector rõ:
  - `Ngang 16:9 - 1920x1080`
  - `Dọc 9:16 - 1080x1920`
- Khi chọn dọc:
  - UI build payload template dọc.
  - Resolution hiển thị `1080x1920`.
  - Render flow async/poll giữ nguyên.
- Outputs page hiển thị template/resolution đúng.
- README/backend README cập nhật cách test dọc.

Không làm:

- Chưa preview video dọc trong UI Preview nếu scope quá rộng.
- Chưa thêm nhiều style dọc.
- Chưa audio.

Files impact dự kiến:

- `frontend/scripts/common/ui-components.js`
- `frontend/scripts/common/render-preview.js`
- `README.md`
- `backend/README.md`
- `.agents/tasks/current-task.md`
- `.agents/tasks/hyperframes-roadmap.md`

Verification:

- Browser smoke:
  - Mở Render page.
  - Chọn `Dọc 9:16`.
  - Bấm Render.
  - Poll tới `Hoàn tất`.
  - Outputs page có output mới.
  - Video endpoint serve MP4.
- API/ffprobe xác nhận output `1080x1920`.
- Regression check render ngang vẫn pass hoặc ít nhất payload/build không đổi.

## Phase 5 - Optional Polish Sau Khi User Test

Chỉ làm nếu user test xong và muốn đẹp hơn.

Có thể làm:

- Rút video dọc xuống 45-60 giây.
- Tối ưu typography cho điện thoại.
- Thêm subtitle/caption.
- Thêm voiceover.
- Thêm template vertical reels style.
- Thêm preview dọc trong UI Preview page.

## Rủi Ro

### Risk 1 - Template dọc xấu nếu nhồi quá nhiều chữ

Tier: 🟡 Confirm

Cách giảm rủi ro:

- Clamp text mạnh hơn template ngang.
- Ưu tiên câu ngắn, card dọc.
- Browser stress test 1080x1920.

### Risk 2 - Backend hardcode template ngang nhiều chỗ

Tier: 🟢 Auto

Cách giảm rủi ro:

- Đổi sang whitelist template rõ ràng.
- Test render ngang và dọc.

### Risk 3 - UI preview chưa phản ánh đúng video dọc

Tier: 🟡 Confirm

Quyết định MVP:

- Phase này ưu tiên Render page và output MP4 thật.
- Preview dọc có thể để Future Scope nếu làm quá rộng.

### Risk 4 - Audio chưa có

Tier: 🟢 Auto

Quyết định MVP:

- Ghi rõ video chưa có audio.
- Audio/voiceover là roadmap riêng sau khi video dọc chạy ổn.

## Thời Gian Ước Lượng

- Phase 1: 30-45 phút.
- Phase 2: 1.5-2.5 giờ.
- Phase 3: 1-1.5 giờ.
- Phase 4: 1-1.5 giờ.

Tổng: khoảng 4-6 giờ nếu làm kỹ, render thật và commit từng phase.

## Điểm Có Thể Dừng

- Dừng sau Phase 1: mới có contract, chưa xem được video dọc.
- Dừng sau Phase 2: có MP4 dọc render bằng command để user xem thử.
- Dừng sau Phase 3: API render dọc được, UI chưa chọn được.
- Dừng sau Phase 4: user test được dọc end-to-end trong UI.

## Test Report

Chưa triển khai.

Sau mỗi phase cần điền:

```text
Status: passed | failed | partial
Commands run:
- ...
Artifacts:
- ...
Remaining risks:
- ...
```
