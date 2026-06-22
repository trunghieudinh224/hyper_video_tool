# Task Hiện Tại

## Tiếp nhận

Thiết lập nền tảng cho dự án "Hyper Video Tool": một công cụ nội bộ dùng để tạo video thuyết trình dự án cá nhân trong công ty. Giai đoạn hiện tại chỉ tập trung dựng giao diện bằng HTML, CSS và JavaScript thuần; backend, Node.js và render HyperFrames để sau.

## Kế hoạch

Giai đoạn 0: thiết lập `.agents`, kỹ năng dùng chung, quy tắc dùng chung, bộ nhớ dài hạn và hai file hướng dẫn chính `AGENTS.md`/`GEMINI.md`.

Giai đoạn 1: dựng bản MVP giao diện tĩnh bằng HTML, CSS và JavaScript thuần:
- Giao diện nhập thông tin dự án, các phần nội dung, tài nguyên và template.
- Dữ liệu mẫu tĩnh để mô phỏng project, tài nguyên, template, trạng thái render và video đã xuất.
- Màn hình xem trước template ở dạng placeholder 16:9.
- Màn hình render chỉ mô phỏng trạng thái, chưa gọi HyperFrames thật.
- Chưa cần Node.js, backend, API, upload thật hoặc lưu file thật.
- Roadmap giao diện nằm ở `.agents/tasks/ui-roadmap.md`.
- Danh sách item giao diện chi tiết nằm ở `.agents/tasks/ui-items.md`.

Giai đoạn 2: hoàn thiện UI để dùng nội bộ:
- Template video 60-90 giây để giới thiệu dự án.
- Trạng thái hàng đợi render dạng UI mock.
- Kiểm thử nhanh trên trình duyệt và kiểm tra responsive.

Giai đoạn 3: tích hợp backend/render sau khi UI ổn:
- Thêm Node.js local server nếu cần lưu project, upload file, gọi HyperFrames hoặc quản lý outputs thật.
- Tích hợp luồng render bằng HyperFrames để xuất MP4.

## Checklist

- [x] Tạo workspace `.agents`.
- [x] Sao chép kỹ năng và quy tắc dùng chung phù hợp cho công cụ quản trị nội bộ dạng web tĩnh.
- [x] Tạo bộ nhớ dài hạn, bối cảnh dự án và mục lục workflow.
- [x] Cập nhật `AGENTS.md` và `GEMINI.md` với khối hướng dẫn shared-skills.
- [x] Bổ sung `.gitignore` cho `.codegraph/`, build/output/cache cơ bản.
- [x] Tạo roadmap UI cho Antigravity.
- [x] Tạo danh sách item UI tiếng Việt có dấu.
- [x] Bổ sung bối cảnh dự án trong thư mục `.agents/context/`.
- [x] Tinh gọn `.agents`, loại bỏ skill/rule lệch domain bán hàng, framework không dùng và phần chỉ mục mã nguồn chưa cần ở MVP.
- [x] Tạo workflow `wf-feature-intake` để tiếp nhận tính năng mới trước khi triển khai.
- [ ] Khởi tạo bản MVP giao diện tĩnh bằng HTML, CSS và JavaScript.
- [ ] Tạo dữ liệu mẫu để mô phỏng project, tài nguyên, template, render và outputs.
- [ ] Tạo preview 16:9 dạng placeholder cho template video đầu tiên.
- [ ] Tạo màn hình render mock, chưa gọi HyperFrames thật.

## Xác minh

Đã chạy thiết lập shared-skills vào đúng dự án `/Users/dinhtrunghieu/Freelance/hyper_video_tool`. Cần chạy kiểm tra lại sau khi khởi tạo app nếu có thêm dependency.
