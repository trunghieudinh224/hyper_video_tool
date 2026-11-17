---
name: wf-onboard
description: Onboard Hyper Video Tool ở đầu mỗi cuộc trò chuyện mới bằng cách đọc context cốt lõi, trạng thái task và thay đổi hiện có rồi tiếp tục yêu cầu của người dùng.
---

# Workflow: Onboard Hyper Video Tool

## Khi dùng

Chạy ở đầu mỗi cuộc trò chuyện mới trong repo Hyper Video Tool, trước khi trả lời câu hỏi về project hoặc bắt đầu sửa code. Nếu người dùng đã giao task trong cùng tin nhắn, onboard rồi tiếp tục task đó.

## Quy trình

1. Đọc `AGENTS.md`, `.agents/README.md`, `.agents/context/project-profile.md` và `.agents/context/project-overview.md`.
2. Đọc trạng thái và objective trong `.agents/tasks/current-task.md`. `completed` nghĩa là file không ghi task active; chỉ đọc `.agents/tasks/task-history.md` khi cần truy vết task cũ. Nếu trạng thái trong file mơ hồ, báo `task hiện tại chưa rõ` thay vì đoán.
3. Chạy `git status --short`, `git diff --name-only HEAD` và `git ls-files --others --exclude-standard` để nhận diện thay đổi chưa commit, gồm file untracked. Không mặc định các thay đổi đó thuộc task mới hoặc do agent hiện tại tạo ra.
4. Sau khi biết yêu cầu, đọc thêm rule, known issues, learnings, roadmap và code đúng phạm vi. Với debug/review/refactor, đọc `.agents/memory/learnings.md` và workflow tương ứng theo `AGENTS.md`.
5. Nếu context mâu thuẫn với README hoặc code hiện tại, ghi rõ điểm chưa chắc; không coi tài liệu cũ là trạng thái runtime đã xác minh.

## Kết quả cần báo

- Tóm tắt ngắn mục tiêu và cấu trúc hiện tại của project nếu người dùng cần hiểu project.
- Nêu task hiện tại nếu file xác định rõ; nếu không, nói rõ trạng thái chưa xác định được.
- Báo các thay đổi chưa commit có thể ảnh hưởng đến task.
- Phân biệt điều được xác nhận từ code với điều chỉ thấy trong tài liệu.
- Nếu người dùng đã giao task, tiếp tục làm ngay sau onboard. Chỉ hỏi khi thiếu quyết định quan trọng mà không thể suy ra.

## Giới hạn

- Onboard là bước chỉ đọc; không sửa file, chạy test, khởi động server, cài dependency, render video, migration hoặc deploy.
- Không đọc `.env`, credential, key, token hay dữ liệu nhạy cảm.
- Không tải toàn bộ `.agents/tasks/task-history.md`, changelog, memory hoặc docs dài nếu chưa cần.
- Trước khi sửa file, tuân thủ các rule và workflow review/verification trong `AGENTS.md`.
