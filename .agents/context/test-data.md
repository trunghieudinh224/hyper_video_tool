# Dữ Liệu Kiểm Thử

Ghi lại tài khoản test, dữ liệu mẫu, URL local, hoặc kịch bản kiểm thử thủ công.

Không lưu password/token/secret thật trong file này.

## URL Local Dự Kiến

- Giai đoạn UI có thể mở trực tiếp `app/index.html` hoặc chạy static server đơn giản nếu cần.
- Nếu dùng static server, URL gợi ý: `http://127.0.0.1:3000`.
- Chưa cần route preview riêng.

## Dữ Liệu Project Mẫu

Tên dự án mẫu:

```text
Internal Analytics Dashboard
```

Tagline mẫu:

```text
Bảng điều khiển giúp team theo dõi hiệu suất dự án theo thời gian thực.
```

Nội dung mẫu:

- Chủ dự án/team: Platform Team
- Người dùng mục tiêu: quản lý dự án, team lead, vận hành nội bộ
- Vấn đề: dữ liệu tiến độ nằm rải rác nhiều nguồn, khó nhìn tổng quan
- Giải pháp: gom dữ liệu vào dashboard nội bộ có biểu đồ, cảnh báo và báo cáo nhanh
- Kết quả: giảm thời gian tổng hợp báo cáo hàng tuần, giúp team phát hiện điểm nghẽn sớm hơn

Tính năng mẫu:

- Tổng quan tiến độ theo dự án
- Biểu đồ hiệu suất theo tuần
- Cảnh báo task trễ hạn
- Xuất báo cáo nhanh cho buổi họp

Timeline mẫu:

- Tháng 1: khảo sát nhu cầu nội bộ
- Tháng 2: dựng MVP dashboard
- Tháng 3: chạy thử với một team
- Tháng 4: mở rộng cho nhiều team hơn

## Kịch Bản Kiểm Thử Thủ Công

1. Mở app local.
2. Chuyển qua lại giữa chế độ sáng và tối.
3. Tải dữ liệu mẫu.
4. Sửa tên dự án và mô tả.
5. Thêm một tính năng mới.
6. Thêm một mốc timeline mới.
7. Chọn template `Giới thiệu dự án 90 giây`.
8. Mở màn hình xem trước.
9. Kiểm tra panel cảnh báo dữ liệu.
10. Bấm render mock khi dữ liệu hợp lệ.
11. Kiểm tra trạng thái render giả lập và danh sách video đã xuất bằng dữ liệu mock.
