---
name: wf-update-learnings
description: >
  Cập nhật `.agents/memory/learnings.md` bằng bài học kỹ thuật có thể tái sử
  dụng sau debug, review, update docs, migration, setup, handoff hoặc khi agent
  mắc lỗi và đã rút ra quy tắc tránh lặp lại.
---

# Workflow: Update Learnings

Dùng workflow này khi cần ghi bài học dài hạn vào `.agents/memory/learnings.md`.

## Mục Tiêu

- Ghi lại bài học có thể tái sử dụng cho project.
- Giúp agent sau tránh lặp lại lỗi.
- Không biến `learnings.md` thành nhật ký thao tác vụn vặt.

## Khi Nào Gọi

Gọi workflow này từ các workflow khác khi có bài học thật sự:

- `wf-update-docs` hoặc `wf-doc-audit`: phát hiện docs/code/rule lệch nhau, convention mới, known issue mới.
- `wf-diagnose`: fix xong bug khó hoặc lỗi lặp.
- `wf-review`: phát hiện pattern dễ sai hoặc rule cần nhớ.
- `wf-commit-ready`: trước khi commit nếu task có bài học mới.
- `wf-agent-team-create` / handoff: phát hiện sai lệch phối hợp agent hoặc cách bàn giao tốt hơn.
- Migration/setup/test: có cạm bẫy framework/database/cache/timezone/API.

Không gọi khi chỉ sửa typo, đổi text nhỏ, cleanup đơn giản hoặc không có bài học tái sử dụng.

## Quy Trình

### 1. Kiểm tra file memory

Tìm:

```text
.agents/memory/learnings.md
```

Nếu chưa có, tạo thư mục/file theo template chung hoặc báo user chạy `wf-shared-skills-setup-project`.

### 2. Xác định bài học có đáng ghi không

Chỉ ghi nếu trả lời được:

- Bối cảnh là gì?
- Nguyên nhân/cạm bẫy là gì?
- Cách xử lý đúng là gì?
- Quy tắc lần sau là gì?

Nếu chỉ là lịch sử thao tác, không ghi.

### 3. Lấy thời gian Việt Nam

Heading phải dùng:

```text
## Cập nhật ngày DD/MM/YYYY (HH:MM:SS UTC+7) - Tiêu đề
```

Nếu không có tool time, dùng timezone local của môi trường hoặc hỏi/ghi rõ không chắc.

### 4. Chèn entry mới đúng vị trí

Chèn entry mới ngay sau phần `## Quy chuẩn cập nhật` và đường phân cách `---` nếu có.

Không append xuống cuối file.

### 5. Format entry

Format khuyến nghị:

```markdown
## Cập nhật ngày DD/MM/YYYY (HH:MM:SS UTC+7) - Tiêu đề

### Bối cảnh
...

### Nguyên nhân
...

### Cách xử lý đúng
...

### Quy tắc lần sau
...
```

Có thể dùng bullet ngắn nếu project đang dùng style đó, nhưng vẫn phải đủ ý.

## Báo Cáo Kết Quả

```markdown
Learnings update:
- File:
- Entry added:
- Reason:
- Related workflow/task:
```

## Lưu Ý

- Không ghi secrets, token, API key, mật khẩu, dữ liệu khách hàng nhạy cảm.
- Không thay đổi entry cũ trừ khi sửa format hoặc user yêu cầu.
- Nếu bài học thuộc tài liệu kỹ thuật chính, cập nhật docs tương ứng bằng `wf-update-docs` / `wf-doc-audit`; `learnings.md` chỉ ghi quy tắc tái sử dụng.
