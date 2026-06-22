# Task Hiện Tại

## Trạng thái workflow

needs_refactor

## Yêu Cầu Mới

UI hiện tại đã dựng được MVP tĩnh, nhưng đang gom toàn bộ màn hình vào một `app/index.html` dạng SPA tab ẩn/hiện. Hướng này không còn đúng với yêu cầu mới.

Yêu cầu mới: refactor UI sang cấu trúc nhiều trang tĩnh. Mỗi màn hình chính phải có HTML riêng, CSS riêng và JS riêng nếu có logic riêng. Phần dùng chung như topbar, sidebar, validation panel, modal, toast, theme toggle, state, storage và navigation phải tách vào file chung.

Task chi tiết nằm ở `.agents/tasks/ui-refactor-multipage.md`. Antigravity cần đọc file đó trước khi tiếp tục sửa UI.

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
  - Thư mục `app/` chứa các tệp HTML/CSS/JS của ứng dụng.
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
- **[NEW]** `app/index.html`
- **[NEW]** `app/styles/tokens.css`
- **[NEW]** `app/styles/base.css`
- **[NEW]** `app/styles/layout.css`
- **[NEW]** `app/styles/components.css`
- **[NEW]** `app/scripts/constants.js`
- **[NEW]** `app/scripts/state.js`
- **[NEW]** `app/scripts/storage.js`
- **[NEW]** `app/scripts/validation.js`
- **[NEW]** `app/scripts/render-preview.js`
- **[NEW]** `app/scripts/ui.js`
- **[NEW]** `app/scripts/app.js`
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
- Mở file `app/index.html` bằng trình duyệt Chrome trên macOS.
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
