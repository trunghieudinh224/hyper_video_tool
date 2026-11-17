# Known Issues Và Giới Hạn Đã Ghi Nhận

Đây là các giới hạn được tài liệu hiện tại xác nhận; chưa phải kết quả runtime audit mới. Xem README/code trước khi dùng chúng làm kết luận cho một bug cụ thể.

## Giới Hạn Được README Xác Nhận

- Render job status/log nằm trong memory; restart backend làm mất job history. MP4 và manifest vẫn còn trong `outputs/`.
- App chạy local, chưa có cloud/auth/user management.
- Smoke render tạo MP4 thật trong `outputs/`; không chạy như một bước kiểm tra mặc định.

## Hạng Mục Cần Đối Chiếu Lại

- Persistence và project lifecycle còn có roadmap tại `.agents/tasks/backend-database-roadmap.md`; trạng thái roadmap cần đối chiếu với code trước khi tiếp tục.
- Render quality/hardening có ghi trạng thái cũ trong `.agents/tasks/hyperframes-roadmap.md`; các mục còn lại chưa được xác minh lại ở đây.

## Phạm Vi Chưa Rà

File này không xác nhận bug runtime mới. Khi debug, tái hiện lỗi theo `wf-diagnose` và ghi kết quả mới nếu có bài học tái sử dụng.
