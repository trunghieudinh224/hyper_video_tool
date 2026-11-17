# Hồ Sơ Dự Án

File này ghi lại thông tin onboarding ban đầu để agent không hỏi lại cùng một việc trong các lần sau.

## Thông Tin Chính

- Tên dự án: Hyper Video Tool
- Slug dự án: hyper-video-tool
- Loại dự án: web app nội bộ chạy local, frontend tĩnh nhiều trang + Node.js backend
- Miền nghiệp vụ: công cụ nội bộ
- Kiểu giao diện: giao diện quản trị/nội bộ
- Cơ sở dữ liệu: SQLite local cho project/settings/metadata; file local cho asset và output
- Không có template framework gốc; repository có các template video trong `templates/`

## Cấu Hình Runtime Hiện Tại

- Database mặc định: `data/hyper-video-tool.sqlite` (xem `backend/src/config.js`)
- Host/port mặc định: `127.0.0.1:3000`
- Deploy target: chưa có; ưu tiên chạy local trên máy cá nhân

## Agent Setup

- Quy tắc dùng chung: có
- Chỉ mục phân tích mã nguồn: chưa dùng trong MVP để giữ project gọn; có thể cài lại sau nếu codebase lớn hơn
- Bộ nhớ dài hạn/learnings: có
- Ghi đè khi setup: không

## Ghi Chú Cho Agent

- Đọc file này trước khi chọn skill/rule cho project.
- Nếu thông tin project thay đổi, cập nhật lại file này cùng với tài liệu liên quan trong `.agents/context/`.
- Không ghi credential, token, password hoặc secret thật vào file này.

## Quyết Định Đã Chốt

- UI phải có chế độ sáng và tối.
- Không dùng gradient trong giao diện app.
- Không làm landing page.
- Không làm giao diện bán hàng, đặt lịch dịch vụ hoặc marketing.
- Không làm timeline editor phức tạp ở MVP.
- Giao diện phải ưu tiên rõ ràng, sang, gọn và đủ chức năng cho nội bộ.
- Người dùng clone project về máy cá nhân rồi chạy local.
- Project hiện có Node.js backend, SQLite, asset upload và render MP4 thật. Xem `README.md` và `backend/README.md` để biết lệnh/runtime hiện tại.
- Frontend vẫn là HTML/CSS/JavaScript thuần, multi-page; UI target mặc định là PC/laptop theo `.agents/rules/static-multipage-ui.md`.
