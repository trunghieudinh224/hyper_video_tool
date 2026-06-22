# Lỗi Đã Biết

Ghi lại lỗi đã biết, workaround, và quyết định tạm thời để agent không debug lại từ đầu.

## Đang theo dõi

- Chưa có app MVP, nên chưa có lỗi runtime cụ thể.
- Chưa làm backend, upload thật, lưu file thật hoặc render HyperFrames thật.
- Chưa kiểm tra chính thức FFmpeg và HyperFrames trên máy chạy thực tế.
- Chưa chốt cách gọi HyperFrames ở phase sau.
- Chưa có template video đầu tiên để kiểm thử render MP4.

## Quyết định tạm thời

- MVP hiện tại dùng UI tĩnh và dữ liệu mock trước.
- JSON local/SQLite chỉ xét sau khi cần lưu project/output thật.
- Reorder danh sách trong UI dùng nút lên/xuống trước, chưa làm kéo thả phức tạp.
- Render queue ban đầu có thể là một job tại một thời điểm, chưa cần hàng đợi nhiều job song song.
- Xóa tài nguyên hoặc video output phải dùng modal xác nhận riêng, không dùng `confirm()` của trình duyệt.
