# Hồ Sơ Dự Án

File này ghi lại thông tin onboarding ban đầu để agent không hỏi lại cùng một việc trong các lần sau.

## Thông Tin Chính

- Tên dự án: Hyper Video Tool
- Slug dự án: hyper-video-tool
- Loại dự án: web tĩnh, ưu tiên UI trước
- Miền nghiệp vụ: công cụ nội bộ
- Kiểu giao diện: giao diện quản trị/nội bộ
- Cơ sở dữ liệu dự kiến: chưa dùng ở giai đoạn UI; JSON local/SQLite để sau nếu cần
- Template gốc: không có

## Cấu Hình Ban Đầu

- Tên database dự kiến: chưa dùng ở giai đoạn UI
- Cổng app mặc định: chưa bắt buộc; nếu chạy static server có thể dùng `3000`
- Domain hoặc deploy target dự kiến: internal.local
- Môi trường ưu tiên: chạy local trên máy cá nhân

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
- Giai đoạn hiện tại chỉ cần dữ liệu tĩnh/mock để minh họa UI, chưa cần Node.js, backend, API hoặc render HyperFrames thật.
