# Task Hiện Tại

## Trạng thái workflow

completed

## Cập Nhật Cấu Trúc Thư Mục UI Và Backend

Đã chuẩn hóa cấu trúc project để chuẩn bị phase backend sau này:

- UI tĩnh chuyển từ `app/` sang `frontend/`.
- `frontend/index.html` là entry UI, dẫn tới `frontend/pages/overview.html`.
- `frontend/pages/`, `frontend/styles/`, `frontend/scripts/`, `frontend/shared/` giữ đúng mô hình multi-page tĩnh.
- Thêm `backend/README.md` làm ranh giới cho backend local ở phase sau.
- `data/` và `templates/` giữ ở root vì dữ liệu mẫu/template render sẽ được cả UI và backend dùng.
- Cập nhật `AGENTS.md`, `GEMINI.md`, rule UI và context để agent sau này không tạo UI vào `app/` nữa.

Backend vẫn chưa triển khai trong phase này.

## Roadmap Backend Và HyperFrames

Đã tạo roadmap phase-by-phase để chuẩn bị triển khai sau khi user review:

- `.agents/tasks/backend-roadmap.md`: backend local, static serve, project JSON API, asset upload, render job API mock, hardening.
- `.agents/tasks/hyperframes-roadmap.md`: research HyperFrames, render payload contract, template adapter, render runner, UI integration render thật, hardening.
- `.agents/rules/project-structure.md`: rule ranh giới `frontend/`, `backend/`, `data/`, `templates/`, `.agents/`.

Đã triển khai bước setup ban đầu theo hướng không làm full backend:

- Backend Phase 1 tối thiểu trong `backend/`: Node HTTP server, `/api/health`, serve UI từ `frontend/`.
- HyperFrames preflight script: `backend/scripts/check-hyperframes.js`.
- HyperFrames spike composition: `templates/hyperframes-spike/`.
- Ghi chú kết quả setup: `.agents/context/hyperframes-notes.md`.

Chưa làm Project JSON API, upload asset, render queue thật hoặc full backend.

### Test Report - Backend Phase 1 Và HyperFrames Setup

Status: passed for initial setup

- Passed:
  - `npm --prefix backend run check` pass.
  - Backend server chạy được với `HVT_PORT=3010 npm --prefix backend start`.
  - `GET http://127.0.0.1:3010/api/health` trả JSON success.
  - `GET http://127.0.0.1:3010/` trả `200 OK`.
  - `GET http://127.0.0.1:3010/pages/overview.html` trả `200 OK`.
  - `GET http://127.0.0.1:3010/api/unknown` trả JSON lỗi chuẩn.
  - `npx --yes hyperframes lint` trong `templates/hyperframes-spike/` pass `0 errors, 0 warnings`.
  - `npm --prefix backend run hf:setup` pass, tạo local runner trong `.cache/hyperframes-runner/` bằng lockfile.
  - `npm --prefix backend run hf:doctor:spike` pass cho local render requirements: Node 24, FFmpeg, FFprobe, Chrome. Docker thiếu nhưng optional.
  - `npm --prefix backend run hf:lint:spike` pass `0 errors, 0 warnings`.
  - `npm --prefix backend run hf:render:spike` pass, xuất `/private/tmp/hyper-video-tool-spike.mp4`.
- `.cache/hyperframes-runner/bin/ffprobe ... /private/tmp/hyper-video-tool-spike.mp4` xác nhận `duration=5.000000`, `size=425203`.
- Review fixes:
  - Runner kiểm đủ `node`, `hyperframes`, `ffmpeg-static`, `ffprobe-static` trước khi skip install.
  - Runner dùng `npm ci` từ `backend/hyperframes-runner-package-lock.json`.
  - Static server xử lý `HEAD` không stream body.
  - `/api/health` không trả absolute local path nữa.
- Known system/global limitation:
  - `npm --prefix backend run check:hyperframes` fail vì Node hệ thống là `v20.16.0`, trong khi HyperFrames docs yêu cầu Node.js 22+.
  - `npm --prefix backend run check:hyperframes` fail vì thiếu `ffmpeg`.
  - `npx --yes hyperframes render --output /private/tmp/hyper-video-tool-spike.mp4` nếu chạy trực tiếp bằng system env sẽ fail vì thiếu FFmpeg/FFprobe.

Commands run:

```bash
npm --prefix backend run check
npm --prefix backend run check:hyperframes
npm --prefix backend run hf:setup
npm --prefix backend run hf:doctor:spike
npm --prefix backend run hf:lint:spike
npm --prefix backend run hf:render:spike
rm -rf .cache/hyperframes-runner
npm --prefix backend run hf:setup
rm -rf .cache/hyperframes-runner/node_modules/ffmpeg-static
npm --prefix backend run hf:setup
HVT_PORT=3010 npm --prefix backend start
curl -s http://127.0.0.1:3010/api/health
curl -s -I http://127.0.0.1:3010/
curl -s -I http://127.0.0.1:3010/pages/overview.html
curl -s http://127.0.0.1:3010/api/unknown
npx --yes hyperframes lint
npx --yes hyperframes doctor
npx --yes hyperframes render --output /private/tmp/hyper-video-tool-spike.mp4
.cache/hyperframes-runner/bin/ffprobe -v error -show_entries format=duration,size -of default=noprint_wrappers=1 /private/tmp/hyper-video-tool-spike.mp4
```

Remaining risks:

- Local runner hiện phục vụ spike render tốt, nhưng chưa nối vào backend render job API.
- System/global environment vẫn chưa đủ nếu user muốn gọi `npx hyperframes render` trực tiếp ngoài runner.
- Chưa làm project JSON API, upload asset, render queue hoặc render từ dữ liệu UI thật.

## Phase Hiện Tại - Render Payload Contract

### Objective

Chuẩn hóa contract JSON trung gian giữa project data và template HyperFrames. Sau phase này, `data/sample-project.json` có thể được map thành render payload ổn định, có schema validate cơ bản và sample output để template adapter phase sau sử dụng.

### Scope

Sẽ làm:

- Tạo schema validate render payload bằng JavaScript thuần, không thêm dependency.
- Tạo mapper từ project JSON sang payload gồm 7 scene MVP: intro, problem, solution, features, timeline, impact, outro.
- Tạo script sinh `data/render-payload.sample.json` từ `data/sample-project.json`.
- Thêm npm script để kiểm tra/sinh payload.
- Cập nhật Test Report sau khi chạy test.

Không làm trong phase này:

- Không refactor template HyperFrames để đọc payload.
- Không gọi render bằng payload mới.
- Không tạo API backend.
- Không nối UI Render page.

Files impact:

- `backend/src/render/render-payload-schema.js`
- `backend/src/render/project-to-render-payload.js`
- `backend/scripts/generate-render-payload-sample.js`
- `backend/scripts/test-render-payload.js`
- `backend/package.json`
- `data/render-payload.sample.json`
- `.agents/tasks/current-task.md`

Verification plan:

- `npm --prefix backend run check`
- `npm --prefix backend run payload:check`
- `npm --prefix backend run payload:write`
- So sánh sample payload sinh ra không làm dirty sau khi chạy lại.

### Test Report - Render Payload Contract

Status: passed

- Created:
  - `backend/src/render/render-payload-schema.js`
  - `backend/src/render/project-to-render-payload.js`
  - `backend/scripts/generate-render-payload-sample.js`
  - `backend/scripts/test-render-payload.js`
  - `data/render-payload.sample.json`
- Passed:
  - Mapper sinh payload từ `data/sample-project.json`.
  - Payload có đủ 7 scene MVP theo thứ tự: intro, problem, solution, features, timeline, impact, outro.
  - Payload pass schema validation.
  - Sample payload up to date.
  - Fallback payload từ input rỗng vẫn hợp lệ.
  - HyperFrames spike lint vẫn pass.

Commands run:

```bash
npm --prefix backend run payload:write
npm --prefix backend run payload:check
npm --prefix backend run payload:test
npm --prefix backend run check
npm --prefix backend run hf:lint:spike
```

Remaining risks:

- Template HyperFrames chưa đọc payload này; đó là phase tiếp theo.
- Payload contract hiện mới validate shape cơ bản, chưa enforce giới hạn độ dài text cho từng scene.

## Yêu Cầu Mới

UI trước đây từng dựng MVP tĩnh bằng một `frontend/index.html` dạng SPA tab ẩn/hiện. Hướng này không còn đúng với yêu cầu mới.

Yêu cầu mới: refactor UI sang cấu trúc nhiều trang tĩnh. Mỗi màn hình chính phải có HTML riêng, CSS riêng và JS riêng nếu có logic riêng. Phần dùng chung như topbar, sidebar, validation panel, modal, toast, theme toggle, state, storage và navigation phải tách vào file chung.

Task chi tiết nằm ở `.agents/tasks/ui-refactor-multipage.md`. Antigravity cần đọc file đó trước khi tiếp tục sửa UI.

## Kết Quả Refactor Multi-page

Đã refactor UI từ một `frontend/index.html` dạng SPA tab sang cấu trúc nhiều trang tĩnh:

- `frontend/index.html` chỉ còn là entry dẫn tới `frontend/pages/overview.html`.
- 10 màn hình chính đã tách thành HTML riêng trong `frontend/pages/`.
- CSS page riêng nằm trong `frontend/styles/pages/`.
- JS page riêng nằm trong `frontend/scripts/pages/`.
- JS dùng chung nằm trong `frontend/scripts/common/`.
- Shell chung được render bằng `frontend/scripts/common/shell.js`.
- Navigation dùng link HTML thật, không còn `data-tab` hoặc `.tab-pane`.
- Sample data dùng embedded mock data để tránh lỗi fetch khi chạy local bằng static server hoặc file protocol.
- Đã chuẩn hóa chiều ngang content: form/list/card của các trang `content`, `features`, `timeline`, `settings` stretch theo `workspace-content`, không còn hardcode `max-width: 800px` gây trống bên phải.
- Đã polish các lỗi UI ưu tiên: preview canvas dark theme đọc rõ chữ, form nội dung dùng textarea cho field dài, status mock trong Settings phản ánh đúng phase UI, layout Render nới rộng card cấu hình.

Responsive mobile/tablet chưa làm ở phase này theo yêu cầu mới của user.

## Feature Intake

- **Hiểu yêu cầu**: Triển khai giao diện MVP tĩnh cho ứng dụng nội bộ Hyper Video Tool theo roadmap (`ui-roadmap.md`) và danh sách phần tử giao diện (`ui-items.md`). Giai đoạn này chỉ dựng UI bằng HTML/CSS/JS thuần, sử dụng dữ liệu tĩnh/mock để minh họa hoạt động và lưu trạng thái cục bộ.
- **Mục tiêu người dùng**: Người dùng mở ứng dụng local, nhập thông tin dự án, chỉnh sửa các tính năng, timeline, tải lên tài nguyên mẫu, lựa chọn template/theme, xem trước các scene video 16:9, bấm render giả lập và quản lý danh sách video đã xuất.
- **MVP đề xuất**:
  - App shell đầy đủ: top bar, sidebar nav, main workspace, validation panel.
  - 10 màn hình chính: Tổng quan, Nội dung dự án, Tính năng, Timeline, Tài nguyên, Template, Xem trước, Render, Video đã xuất, Cài đặt.
  - Hệ thống dữ liệu mẫu và cơ chế tự động lưu nháp (`localStorage`), hỗ trợ Import/Export JSON.
  - Tùy biến theme video (chữ, màu nhấn, logo) và giao diện ứng dụng (Light/Dark mode) không dùng gradient.
  - Giả lập tiến trình render với logs chi tiết và cập nhật danh sách video output.
  - Panel kiểm tra dữ liệu hoạt động theo thời gian thực (hiển thị lỗi/cảnh báo).
- **Không làm ngay**:
  - Giao diện bán hàng, landing page hoặc giới thiệu sản phẩm.
  - Tích hợp Node.js backend hay API lưu file thật trên ổ đĩa.
  - Kết nối thật với engine HyperFrames để xuất file video MP4 thực tế.
  - Trình biên tập timeline kéo thả phức tạp.
- **Khu vực ảnh hưởng**:
  - Thư mục `frontend/` chứa các tệp HTML/CSS/JS của ứng dụng.
  - Thư mục `templates/` chứa tài nguyên template demo.
  - Thư mục `data/` chứa dữ liệu dự án mẫu.
- **Rủi ro**:
  - Việc không dùng framework hoặc Tailwind CSS yêu cầu quản lý CSS thuần rất chặt chẽ để tránh xung đột hoặc vỡ layout trên các màn hình mobile/tablet.
  - Đảm bảo việc đồng bộ dữ liệu giữa form nhập liệu, validation panel và khung preview luôn mượt mà bằng vanilla JS.
- **Hướng khuyến nghị**: Xây dựng cấu trúc module hóa JS và tách riêng các file CSS (tokens, base, layout, components) để dễ quản trị và mở rộng sang giai đoạn backend sau này.

## Implementation Plan Cũ

> Plan bên dưới là plan đã dùng để dựng MVP UI lần đầu. Không dùng tiếp kiến trúc SPA trong plan này cho phase hiện tại. Phase hiện tại phải theo `.agents/tasks/ui-refactor-multipage.md`.

### Objective

Dựng toàn bộ giao diện tĩnh MVP chạy local cho Hyper Video Tool bằng vanilla HTML, CSS, và JS, đáp ứng toàn bộ checklist 10 màn hình và các tiêu chuẩn thẩm mỹ nội bộ chuyên nghiệp (Quiet SaaS, không gradient, responsive đầy đủ).

### Scope

#### Sẽ làm
- Khởi tạo cấu trúc dự án chuẩn với các file CSS và JS tách biệt theo module.
- Tạo dữ liệu mẫu đầy đủ cho dự án `Internal Analytics Dashboard`.
- Xây dựng App Shell có Topbar (tên app, tên project, status lưu, theme toggle, nút render) và Sidebar (10 tab điều hướng).
- Triển khai 10 màn hình làm việc tương ứng với các tab điều hướng.
- Viết validation logic kiểm tra tính hợp lệ của dữ liệu đầu vào và hiển thị danh sách lỗi/cảnh báo trực quan trên panel bên phải.
- Xây dựng khung Preview 16:9 hiển thị các scene thiết kế, hỗ trợ xem từng scene hoặc autoplay slide giả lập video.
- Xây dựng màn hình Render giả lập chạy tiến trình từ 0-100%, sinh logs log và lưu kết quả vào danh sách video đã xuất.
- Lưu trạng thái app và dữ liệu dự án vào `localStorage` (auto-save), hỗ trợ reset dữ liệu mẫu hoặc xóa dữ liệu local.
- Hỗ trợ đổi theme ứng dụng Light Mode / Dark Mode đồng bộ bằng CSS variables.

#### Không làm
- Giao diện bán hàng hoặc marketing.
- Ghi file video MP4 thật lên đĩa hay kết nối CLI HyperFrames.
- Viết API endpoints hoặc chạy Node.js server.
- Sử dụng Tailwind hoặc các thư viện CSS/JS bên thứ ba (ngoài bộ icon SVG đơn giản nếu cần).

### Files Impact

- **[NEW]** `data/sample-project.json`
- **[NEW]** `frontend/index.html`
- **[NEW]** `frontend/styles/tokens.css`
- **[NEW]** `frontend/styles/base.css`
- **[NEW]** `frontend/styles/layout.css`
- **[NEW]** `frontend/styles/components.css`
- **[NEW]** `frontend/scripts/constants.js`
- **[NEW]** `frontend/scripts/state.js`
- **[NEW]** `frontend/scripts/storage.js`
- **[NEW]** `frontend/scripts/validation.js`
- **[NEW]** `frontend/scripts/render-preview.js`
- **[NEW]** `frontend/scripts/ui.js`
- **[NEW]** `frontend/scripts/app.js`
- **[NEW]** `templates/project-showcase-90s/index.html`
- **[NEW]** `templates/project-showcase-90s/style.css`
- **[NEW]** `templates/project-showcase-90s/script.js`

### Logic Changes Cũ

- Ứng dụng từng chạy theo kiến trúc Single Page App (SPA) giả lập: Ẩn/hiển thị các màn hình dựa trên tab được chọn trong `state.js`. Hướng này cần được refactor sang multi-page static.
- Validation logic tự động chạy mỗi khi dữ liệu project thay đổi, cập nhật badge thông báo trên sidebar và danh sách lỗi trên validation panel.
- Tiến trình render chạy qua `setInterval` trong `render-preview.js`, đẩy logs vào màn hình render và thêm item mới vào danh sách xuất khi kết thúc thành công.

### Risk Assessment

- Tránh việc layout shift khi dữ liệu thay đổi trên preview hoặc khi hiển thị validation panel.
- Giải pháp: Sử dụng kích thước cố định (fixed dimensions hoặc aspect-ratio) cho khung preview và thiết lập grid layout ổn định.

### Dependency Map

- Không có dependency bên ngoài. Toàn bộ mã nguồn sử dụng Web APIs có sẵn trên trình duyệt hiện đại.

## Checklist

- [x] Khởi tạo thư mục và tạo file dữ liệu mẫu `data/sample-project.json`.
- [x] Thiết lập hệ thống CSS Tokens (`tokens.css`) hỗ trợ Light/Dark mode không dùng gradient.
- [x] Xây dựng App Shell (`index.html` & `layout.css`, `base.css`) gồm Topbar, Sidebar, Workspace, và Validation Panel.
- [x] Triển khai các component CSS dùng chung (`components.css`): Buttons, Inputs, Cards, Badges, Modals, Toasts.
- [x] Xây dựng logic quản lý trạng thái (`state.js`, `constants.js`) và lưu trữ cục bộ (`storage.js`).
- [x] Triển khai màn hình **Tổng quan** (Hiển thị thống kê nhanh, checklist tiến độ và nút chuyển nhanh).
- [x] Triển khai màn hình **Nội dung dự án** (Form nhập liệu đầy đủ trường, bộ đếm ký tự và validation trực quan).
- [x] Triển khai màn hình **Tính năng** và **Timeline** (Quản lý danh sách, hỗ trợ thêm, sửa, xóa, và đổi thứ tự đơn giản).
- [x] Triển khai màn hình **Tài nguyên** (Upload file giả lập, lưới tài nguyên, thumbnail, phân loại filter).
- [x] Triển khai màn hình **Template** (Lựa chọn template và bộ tùy chỉnh theme màu nhấn/chữ/vị trí logo của video).
- [x] Triển khai màn hình **Xem trước** (Khung preview aspect-ratio 16:9, danh sách scene và tính năng play/pause slide mô phỏng).
- [x] Triển khai màn hình **Render** (Tùy chỉnh cấu hình render, giả lập tiến trình render chạy log, nút Hủy).
- [x] Triển khai màn hình **Video đã xuất** (Lịch sử video mock, nút xem video hoặc xóa kèm modal xác nhận tự dựng).
- [x] Triển khai màn hình **Cài đặt** (Import/Export JSON, xóa dữ liệu local, mock status các thành phần hệ thống).
- [x] Liên kết logic Validation (`validation.js`) để hiển thị lỗi/cảnh báo thời gian thực trên Validation panel và Topbar/Sidebar.
- [x] Kiểm tra responsive trên thiết bị di động, tablet và desktop. Đảm bảo trải nghiệm đổi Light/Dark mode trơn tru.
- [x] Chạy quy trình polish giao diện (`wf-ui-taste-polish`) để đạt thẩm mỹ Quiet SaaS cao cấp.

## Verification Plan

### Manual Verification
- Mở file `frontend/index.html` bằng trình duyệt Chrome trên macOS.
- Bấm nút "Tải dữ liệu mẫu" trong Cài đặt hoặc Dự án để điền thông tin tự động.
- Chuyển đổi giữa 10 tab để kiểm tra hiển thị.
- Kiểm tra nút chuyển đổi theme Sáng/Tối ở Top bar.
- Thêm/sắp xếp/xóa tính năng và cột mốc timeline, kiểm tra sự thay đổi dữ liệu.
- Giả lập tải file lên trong màn hình tài nguyên.
- Kiểm tra việc nhảy scene trong màn hình Xem trước.
- Thực hiện chạy Render giả lập và xem kết quả lưu trong lịch sử xuất.
- Test responsive bằng cách thay đổi độ rộng cửa sổ trình duyệt (kiểm tra menu tab trên mobile và vị trí validation panel).

## Execution Notes

- Đã khởi tạo cấu trúc thư mục frontend chuẩn với các file CSS và JS tách biệt theo mô hình Quiet SaaS.
- Đã định nghĩa và nhúng dữ liệu dự án mẫu tĩnh làm fallback trực tiếp trong `storage.js` nhằm đảm bảo hoạt động ngoại tuyến và tránh lỗi CORS khi mở qua protocol `file://`.
- Đã giả lập toàn bộ tiến trình render logic trong `render-preview.js` và đồng bộ hóa với validation panel để khóa render khi dữ liệu chưa hợp lệ.
- Đã verify thành công toàn bộ luồng nghiệp vụ trên cả hai chế độ sáng/tối thông qua Chrome DevTools.

## Test Report

- **Phương pháp kiểm thử**: Chạy http server và sử dụng Browser Subagent trên Chrome để tự động hóa kiểm thử tương tác UI.
- **Kịch bản kiểm thử đã chạy**:
  1. Mở link ứng dụng, verify App Shell, Top bar và các tab bên trái. (Đạt)
  2. Bấm "Tải dữ liệu mẫu thử nghiệm", verify form tự điền và validation panel tự cập nhật từ 6 lỗi về 0 lỗi. (Đạt)
  3. Chuyển đổi qua lại giữa Light Mode và Dark Mode (kiểm tra các component đổi màu đồng bộ theo tokens). (Đạt)
  4. Mở tab Xem trước, bấm Chạy thử preview để kiểm tra autoplay slides 16:9. (Đạt)
  5. Đổi độ rộng màn hình kiểm tra responsive menu trượt mobile và responsive layout. (Đạt)
  6. Sang tab Render, bấm Bắt đầu Render, verify logs terminal giả lập và tiến trình % chạy từ 0 đến 100%. (Đạt)
  7. Sang tab Video đã xuất, bấm Mở xem video mockup và bấm Xóa bản ghi lịch sử kèm theo Modal xác nhận. (Đạt)
- **Kết quả**: PASS 100%. Console sạch không có lỗi runtime.
- **Recording kiểm thử**: [verify_static_ui_1782148260216.webp](file:///Users/dinhtrunghieu/.gemini/antigravity-ide/brain/1c5a2563-eef5-49fc-9929-37b059eca458/verify_static_ui_1782148260216.webp)

## Handoff

- **Kết quả bàn giao**: Dựng xong bộ giao diện tĩnh MVP hoàn chỉnh cho Hyper Video Tool với cấu trúc tệp sạch sẽ, đáp ứng đúng visual direction (Quiet SaaS, không gradient, 2 themes, responsive đầy đủ).
- **Trạng thái lưu trữ**: Tự động lưu nháp dữ liệu thay đổi trên localStorage. Import/Export JSON hoạt động đầy đủ.
- **Khuyến nghị cho giai đoạn tiếp theo (Phase 2)**: Tích hợp Node.js backend server để xử lý ghi file dự án JSON và gọi công cụ dòng lệnh HyperFrames kết xuất file video MP4 thực tế.
