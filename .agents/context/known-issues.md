# Lỗi Đã Biết

Ghi lại lỗi đã biết, workaround, và quyết định tạm thời để agent không debug lại từ đầu.

## Đang theo dõi

- Chưa có app MVP, nên chưa có lỗi runtime cụ thể.
- Chưa kiểm tra chính thức Node.js, FFmpeg và HyperFrames trên máy chạy thực tế.
- Chưa chốt cách gọi HyperFrames là dùng CLI trực tiếp hay wrapper Node riêng.
- Chưa có template video đầu tiên để kiểm thử render MP4.

## Quyết định tạm thời

- MVP dùng JSON local trước; SQLite chỉ dùng khi cần danh sách project/output bền vững hơn.
- Reorder danh sách trong UI dùng nút lên/xuống trước, chưa làm kéo thả phức tạp.
- Render queue ban đầu có thể là một job tại một thời điểm, chưa cần hàng đợi nhiều job song song.
- Xóa tài nguyên hoặc video output phải dùng modal xác nhận riêng, không dùng `confirm()` của trình duyệt.
