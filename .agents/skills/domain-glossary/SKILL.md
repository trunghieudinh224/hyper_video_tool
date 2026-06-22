---
name: domain-glossary
description: >
  Workflow tạo hoặc cập nhật glossary/ngôn ngữ miền nghiệp vụ của project
  (CONTEXT.md hoặc tài liệu tương đương). Dùng khi thuật ngữ mơ hồ, agent nói
  dài dòng, hoặc cần thống nhất vocabulary trước khi plan/code.
---

# Workflow: Domain Glossary

Dùng để tạo shared language cho project để user và agent nói cùng một ngôn ngữ.

## Mục Tiêu

- Ghi lại thuật ngữ domain quan trọng.
- Làm rõ từ mơ hồ hoặc bị dùng nhiều nghĩa.
- Giúp plan, test, issue, code naming dùng từ nhất quán.

## Quy Trình

### 1. Tìm tài liệu hiện có

Kiểm tra theo thứ tự:

- `CONTEXT.md`
- `docs/CONTEXT.md`
- `.agents/context/project-overview.md`
- tài liệu domain tương đương của project

Nếu chưa có, hỏi user muốn tạo `CONTEXT.md` hay dùng file hiện có.

### 2. Thu thập thuật ngữ

Lấy thuật ngữ từ:

- User request.
- Existing docs.
- Tên module/class/function chính.
- Flow nghiệp vụ đang làm.

### 3. Làm rõ nghĩa

Với mỗi thuật ngữ quan trọng, ghi:

- Tên canonical.
- Định nghĩa ngắn.
- Từ nên tránh hoặc dễ nhầm.
- Quan hệ với thuật ngữ khác.

Không nhét implementation detail vào glossary. File này để thống nhất ngôn ngữ, không phải spec hay plan.

### 4. Cập nhật tài liệu

Chỉ ghi file sau khi user đồng ý nếu tạo file mới hoặc đổi nghĩa thuật ngữ quan trọng.

Format gợi ý:

```markdown
# Project Context

## Language

**Term**: Definition.
_Avoid_: ambiguous synonym

## Relationships

- A owns many B
- C transitions from X to Y

## Flagged Ambiguities

- "word" was used to mean both X and Y; resolved as ...
```

## Báo Cáo Kết Quả

```markdown
Domain glossary report:
- Context file:
- Terms added/updated:
- Ambiguities resolved:
- Open questions:
- Next place to use this vocabulary:
```
