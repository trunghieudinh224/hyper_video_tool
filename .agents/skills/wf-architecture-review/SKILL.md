---
name: wf-architecture-review
description: >
  Workflow rà soát kiến trúc để tìm coupling, module nông, thiếu test seam,
  hoặc cơ hội refactor làm code dễ hiểu/dễ test hơn. Dùng cho review định kỳ
  hoặc trước refactor lớn.
---

# Workflow: Architecture Review

Dùng khi user muốn xem codebase/module có đang khó sửa, khó test, hoặc cần refactor không.

## Mục Tiêu

- Tìm friction thật khi đọc/sửa/test code.
- Đề xuất refactor theo candidate nhỏ, không đụng code ngay.
- Ưu tiên locality, testability, và interface đơn giản.

## Vocabulary

- **Module**: function/class/package/slice có interface và implementation.
- **Interface**: mọi thứ caller phải biết để dùng module.
- **Implementation**: code bên trong module.
- **Seam**: nơi có thể test/thay đổi behavior mà không sửa khắp nơi.
- **Depth**: nhiều behavior hữu ích phía sau interface nhỏ.
- **Locality**: thay đổi tập trung ở ít nơi.

## Quy Trình

### 1. Explore

Đọc rule/docs/domain context của project nếu có. Với MVP nhỏ, ưu tiên đọc trực tiếp các file liên quan trong `frontend/`, `server.js`, `templates/`, `data/` và tài liệu trong `.agents/context/`.

### 2. Tìm friction

Ghi lại nơi bạn thấy:

- Hiểu một concept phải nhảy qua quá nhiều file.
- Module chỉ pass-through, interface gần phức tạp bằng implementation.
- Logic quan trọng khó test qua interface công khai.
- Coupling làm sửa một chỗ ảnh hưởng nhiều nơi.
- Tên gọi lệch domain language.

### 3. Đề xuất candidate

Mỗi candidate phải có:

- Files/modules liên quan.
- Vấn đề cụ thể.
- Đề xuất thay đổi ngắn.
- Lợi ích về locality/testability.
- Risk level: low | medium | high.
- Test cần có nếu triển khai.

Không đề xuất 20 thứ. Chọn tối đa 3 candidate đáng giá nhất.

### 4. Dừng ở approval

Architecture review không tự refactor. Hỏi user muốn explore candidate nào sâu hơn.

## Báo Cáo Kết Quả

```markdown
Architecture review:
- Area reviewed:
- Current friction:
- Candidate 1:
  - Files:
  - Problem:
  - Proposed change:
  - Benefits:
  - Risk:
  - Tests:
- Top recommendation:
- Next question for user:
```
