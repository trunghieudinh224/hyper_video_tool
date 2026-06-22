# Tổng Quan Project

Tóm tắt mục tiêu, kiến trúc, module chính, và trạng thái hiện tại của project.

## Mục tiêu

Hyper Video Tool là công cụ nội bộ giúp nhân viên hoặc team tạo video thuyết trình dự án cá nhân trong công ty. Người dùng clone project về máy, chạy local, nhập thông tin dự án, chọn template, xem trước nội dung và render ra video MP4 bằng HyperFrames.

Mục tiêu quan trọng nhất của MVP là tạo được video giới thiệu dự án 60-90 giây với quy trình đơn giản, không bắt người dùng hiểu chi tiết HyperFrames.

## Đối tượng sử dụng

- Nhân viên muốn giới thiệu dự án cá nhân hoặc dự án nội bộ.
- Team cần tạo video demo nhanh để chia sẻ tiến độ, kết quả hoặc ý tưởng.
- Người dùng kỹ thuật vừa phải, có thể chạy lệnh local nhưng không muốn chỉnh code template bằng tay.

## Nguyên tắc sản phẩm

- Chạy local trước, không phụ thuộc cloud.
- Dữ liệu dự án lưu được dưới dạng JSON để dễ backup, chia sẻ hoặc sửa tay khi cần.
- Giao diện là công cụ làm việc, không phải landing page.
- Ưu tiên nhập liệu rõ ràng, preview dễ hiểu và render ổn định.
- Không xây timeline editor phức tạp trong MVP.

## Kiến trúc chính

Kiến trúc dự kiến cho MVP:

- Frontend: HTML, CSS và JavaScript thuần.
- Backend local: Node.js server.
- Render: HyperFrames.
- Lưu trữ dữ liệu: JSON local trong thư mục `data/`.
- Upload tài nguyên: lưu local trong thư mục `uploads/`.
- Video đầu ra: lưu local trong thư mục `outputs/`.

Luồng chính:

```text
Người dùng nhập dữ liệu trên UI
-> UI lưu nháp hoặc gửi dữ liệu qua Node API
-> Node ghi JSON project
-> Preview dùng template HTML/JS
-> Render pipeline gọi HyperFrames
-> MP4 được lưu trong outputs/
```

## Module chính

- App shell: thanh trên cùng, thanh điều hướng, vùng nội dung chính, panel kiểm tra dữ liệu.
- Project editor: nhập thông tin dự án, vấn đề, giải pháp, tính năng, timeline, kết quả.
- Asset manager: upload và quản lý logo, ảnh chụp màn hình, video demo.
- Template picker: chọn template video và tùy chỉnh theme video.
- Preview: xem trước scene theo tỉ lệ 16:9 trước khi render.
- Render queue: theo dõi trạng thái render và log rút gọn.
- Outputs: danh sách video đã xuất.
- Settings: cấu hình local, import/export JSON, kiểm tra HyperFrames và FFmpeg.

## Tài liệu task liên quan

- `.agents/tasks/ui-roadmap.md`: roadmap giao diện tổng thể.
- `.agents/tasks/ui-items.md`: danh sách item chi tiết cần có trên từng màn hình.
- `.agents/tasks/current-task.md`: trạng thái công việc hiện tại.
