# Định Hướng Giao Diện

File này ghi lại hướng giao diện đã chốt để agent không tự suy diễn sai khi triển khai UI.

## Tinh Thần Chung

Hyper Video Tool là công cụ nội bộ, không phải landing page. Giao diện cần tạo cảm giác chuyên nghiệp, rõ ràng, đáng tin và dùng được lâu dài.

Ưu tiên:

- Dễ đọc.
- Dễ thao tác.
- Ít nhiễu thị giác.
- Mật độ thông tin vừa phải.
- Có đủ trạng thái cho form, preview và render.

## Yêu Cầu Bắt Buộc

- Có chế độ sáng và tối.
- Không dùng gradient.
- Không dùng nền tím/xanh kiểu AI.
- Không dùng hiệu ứng blob, orb, glassmorphism quá tay.
- Không dùng hero section.
- Không dùng nhiều badge/pill trang trí.
- Không dùng emoji trang trí trong giao diện chính.
- Không dùng placeholder thay cho label.

## Hướng Thiết Kế

- App shell gồm top bar, sidebar, main workspace và panel kiểm tra dữ liệu.
- Dùng CSS variables cho màu, spacing, radius, shadow.
- Surface tách bằng border và nền nhẹ, không lạm dụng shadow.
- Button chính chỉ dùng cho hành động quan trọng như `Render video`.
- Card radius tối đa 8px cho phần chính.
- Typography gọn, ưu tiên font hệ thống hoặc Inter nếu có.

## Màu Sắc

Light mode:

- Nền xám rất nhạt.
- Surface trắng.
- Text gần đen.
- Border xám xanh nhẹ.
- Màu nhấn xanh chuyên nghiệp.

Dark mode:

- Nền tối trung tính, không đen tuyền.
- Surface xám đen phân lớp rõ.
- Text sáng vừa đủ.
- Border rõ nhưng không gắt.
- Màu nhấn xanh nhạt hoặc xanh xám.

## Màn Hình Quan Trọng

- Tổng quan.
- Nội dung dự án.
- Tính năng.
- Timeline.
- Tài nguyên.
- Template.
- Xem trước.
- Render.
- Video đã xuất.
- Cài đặt.

Chi tiết item từng màn hình nằm ở `.agents/tasks/ui-items.md`.
