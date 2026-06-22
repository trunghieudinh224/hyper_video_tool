# Workflow: Explore Project

Workflow thực thi nằm ở:

```text
.agents/skills/wf-explore-project/SKILL.md
```

Dùng khi muốn đọc hiểu một project nguồn rồi tạo video brief JSON cho Hyper Video Tool.

Luồng chuẩn:

```text
Hỏi path project
-> đọc context/rules/docs của project nguồn
-> tóm tắt project
-> hỏi tính năng cụ thể
-> search/đọc flow tính năng
-> lập plan brief
-> chờ duyệt
-> tạo brief JSON
```

Nguyên tắc:

- Explore chỉ đọc, không sửa project nguồn.
- Chỉ tạo brief sau khi người dùng duyệt plan.
- Brief mặc định lưu trong `briefs/<project-slug>/<feature-slug>.json`.
- Không đưa secret hoặc thông tin nhạy cảm vào brief.
