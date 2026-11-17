# Shared Setup Version

Đây là snapshot lịch sử lần setup shared-skills/shared-rules ban đầu. Không dùng các tham số cũ bên dưới làm trạng thái stack hiện tại; xem `.agents/context/project-profile.md`, `project-overview.md` và code.

## Phiên Bản Khi Setup

- Shared skills path: /Users/dinhtrunghieu/shared-skills
- Shared skills version: 2026.06.06
- Shared rules path: /Users/dinhtrunghieu/shared-rules
- Shared rules version: 2026.06.06

## Tham Số Onboarding Ban Đầu

- Project type: static-web
- Domain: admin-tool
- UI: admin-only
- Database: sqlite
- Rules: yes
- Chỉ mục phân tích mã nguồn: đã bật khi onboarding, nhưng đã loại khỏi `.agents` sau khi tinh gọn vì project MVP chưa cần
- Memory: yes
- Template: none

Các tham số trên mô tả lần setup ban đầu; stack/runtime hiện tại được ghi trong `.agents/context/project-profile.md`.

## Cách Dùng

- Khi shared-skills/shared-rules được nâng cấp, so sánh file này để biết project có đang dùng bộ setup cũ không.
- Không tự overwrite skill/rule project cũ nếu chưa review khác biệt và hỏi người dùng.
