---
name: wf-feature-intake
description: Làm rõ mục tiêu và phạm vi sản phẩm khi yêu cầu tính năng cho Hyper Video Tool còn mơ hồ; không thay thế implementation planning của plan-quality.
---

# Workflow: Feature Intake

## Khi dùng

Dùng khi còn quyết định sản phẩm quan trọng chưa rõ: mục tiêu, hành vi, dữ liệu, lưu trữ, render contract hoặc ranh giới MVP. Nếu yêu cầu đã rõ, có scope hữu hạn và user yêu cầu triển khai, bỏ intake, onboard rồi làm theo project rules và `plan-quality` khi task cần plan.

## Nguyên tắc

- Intake chỉ làm rõ yêu cầu sản phẩm, không tạo implementation plan dài và không sửa code.
- Không hỏi lại điều user đã chốt hoặc có thể chọn mặc định an toàn.
- Chỉ hỏi về quyết định ảnh hưởng trực tiếp đến scope, dữ liệu local, file storage, render pipeline hoặc UI flow.
- Nếu user đã yêu cầu triển khai rõ và không còn câu hỏi chặn, tiếp tục; không tạo approval gate thứ hai.
- Nếu có nguy cơ xóa/mất dữ liệu, đổi schema/JSON contract, thêm dependency lớn hoặc thay render pipeline, nêu rõ tác động và xin xác nhận cho quyết định đó.

## Bối cảnh cần đọc

1. Làm `wf-onboard` trước nếu đây là đầu cuộc trò chuyện mới.
2. Đọc `.agents/skills/plan-quality/SKILL.md` để biết ranh giới giữa intake và technical plan.
3. Đọc `.agents/tasks/current-task.md` để tránh ghi đè task đang chạy; chỉ mở `.agents/tasks/task-history.md` nếu cần tra việc cũ.
4. Đọc đúng tài liệu/rule/code context liên quan đến yêu cầu. UI thì xem UI direction và rule UI; data/render thì xem schema, architecture notes hoặc contract tương ứng.
5. Nếu file không tồn tại hoặc thông tin chưa được xác minh, ghi rõ giả định thay vì yêu cầu tạo tài liệu mới.

## Kết quả intake

Trả lời ngắn gọn theo các mục phù hợp:

- **Hiểu yêu cầu:** hành động người dùng muốn làm được.
- **Mục tiêu:** kết quả sử dụng cụ thể.
- **MVP đề xuất:** phần nhỏ nhất giải quyết mục tiêu.
- **Ngoài scope:** phần có thể để sau.
- **Khu vực ảnh hưởng:** UI, API/local storage, templates, project data, render hoặc docs — chỉ nêu phần liên quan.
- **Rủi ro/giả định:** thay đổi dữ liệu, file, contract hoặc behavior; phân biệt điều đã xác minh với suy luận.
- **Cần chốt:** tối đa 1–3 câu hỏi thật sự chặn quyết định. Nếu không có, ghi rõ không còn câu hỏi chặn.

Không cần điền mọi mục nếu không liên quan. Không ép mọi task vào ngưỡng 7 file/15 checklist; dùng `plan-quality` nếu cần chia nhỏ implementation.

## Sau intake

- Nếu user chỉ muốn phân tích hoặc đề xuất phạm vi: dừng sau báo cáo intake.
- Nếu cần quyết định quan trọng: hỏi gọn đúng phần chưa rõ rồi chờ câu trả lời.
- Nếu user đã yêu cầu triển khai và scope đã rõ: tiếp tục lập technical plan bằng `plan-quality` khi phù hợp, rồi triển khai theo authorization hiện có.
- Chỉ cập nhật `.agents/tasks/current-task.md` khi task cần tracking theo project convention hoặc user yêu cầu. Giữ lịch sử ở `.agents/tasks/task-history.md`; không thay task đang chạy một cách âm thầm.
- Khi đóng task được tracking, ghi verification đã chạy hoặc `Not run` kèm lý do; không tuyên bố test pass nếu chưa chạy.
