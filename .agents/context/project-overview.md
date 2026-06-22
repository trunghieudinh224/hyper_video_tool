# Tổng Quan Project

Tóm tắt mục tiêu, kiến trúc, module chính, và trạng thái hiện tại của project.

## Mục tiêu

Hyper Video Tool là công cụ nội bộ giúp nhân viên hoặc team tạo video thuyết trình dự án cá nhân trong công ty. Người dùng clone project về máy, mở/chạy giao diện local, nhập thông tin dự án, chọn template, xem trước nội dung và về sau render ra video MP4 bằng HyperFrames.

Mục tiêu quan trọng nhất của giai đoạn hiện tại là dựng UI MVP rõ ràng, sang, có đầy đủ màn hình và dữ liệu mẫu. Backend, upload thật, lưu file thật và render HyperFrames để sang giai đoạn sau.

## Đối tượng sử dụng

- Nhân viên muốn giới thiệu dự án cá nhân hoặc dự án nội bộ.
- Team cần tạo video demo nhanh để chia sẻ tiến độ, kết quả hoặc ý tưởng.
- Người dùng kỹ thuật vừa phải, có thể mở project local nhưng không muốn chỉnh code template bằng tay.

## Nguyên tắc sản phẩm

- UI chạy local trước, không phụ thuộc cloud.
- Giai đoạn UI dùng dữ liệu mẫu tĩnh; sau này dữ liệu dự án có thể lưu dưới dạng JSON để dễ backup, chia sẻ hoặc sửa tay khi cần.
- Giao diện là công cụ làm việc, không phải landing page.
- Ưu tiên nhập liệu rõ ràng, preview dễ hiểu và render ổn định.
- Không xây timeline editor phức tạp trong MVP.

## Kiến trúc chính

Kiến trúc dự kiến cho UI MVP:

- Frontend: HTML, CSS và JavaScript thuần.
- Backend local: chưa làm trong giai đoạn UI.
- Render: chưa gọi HyperFrames thật trong giai đoạn UI.
- Dữ liệu: object/JSON mẫu trong frontend hoặc file mẫu tĩnh.
- Upload tài nguyên: mô phỏng bằng UI state, chưa upload thật.
- Video đầu ra: mô phỏng danh sách output, chưa xuất MP4 thật.

Luồng chính:

```text
Người dùng nhập dữ liệu trên UI
-> UI cập nhật state local bằng JavaScript
-> Preview placeholder đọc dữ liệu mẫu/state
-> Render screen mô phỏng trạng thái render
-> Outputs screen hiển thị dữ liệu mẫu
```

## Module chính

- App shell: thanh trên cùng, thanh điều hướng, vùng nội dung chính, panel kiểm tra dữ liệu.
- Project editor: nhập thông tin dự án, vấn đề, giải pháp, tính năng, timeline, kết quả.
- Asset manager: upload và quản lý logo, ảnh chụp màn hình, video demo.
- Template picker: chọn template video và tùy chỉnh theme video.
- Preview: xem trước scene theo tỉ lệ 16:9 trước khi render.
- Render queue: UI mô phỏng trạng thái render và log rút gọn.
- Outputs: danh sách video đã xuất ở dạng dữ liệu mẫu.
- Settings: cấu hình giao diện local, import/export JSON dạng UI mock, trạng thái HyperFrames/FFmpeg dạng kiểm tra giả lập.

## Tài liệu task liên quan

- `.agents/tasks/ui-roadmap.md`: roadmap giao diện tổng thể.
- `.agents/tasks/ui-items.md`: danh sách item chi tiết cần có trên từng màn hình.
- `.agents/tasks/backend-roadmap.md`: roadmap backend local theo từng phase.
- `.agents/tasks/hyperframes-roadmap.md`: roadmap tích hợp HyperFrames/render MP4.
- `.agents/context/hyperframes-notes.md`: ghi chú setup, dependency và kết quả test HyperFrames.
- `.agents/tasks/current-task.md`: trạng thái công việc hiện tại.
