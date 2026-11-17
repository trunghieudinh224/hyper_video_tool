---
name: wf-project-health-check
description: Rà soát chỉ đọc cấu trúc agent workspace và độ nhất quán của tài liệu cốt lõi Hyper Video Tool.
---

# Workflow: Project Health Check

## Khi dùng

- Người dùng yêu cầu kiểm tra sức khỏe project hoặc `.agents`.
- Sau khi thay đổi lớn cấu trúc workflow/skill/rule.
- Rà định kỳ để phát hiện hướng dẫn hỏng, thiếu hoặc lỗi thời.

Không chạy toàn bộ health check ở mỗi cuộc trò chuyện; dùng `wf-onboard` cho bước nạp context nhanh đầu phiên.

## Checklist

1. **Entrypoints:** `AGENTS.md`, `README.md`, `.agents/README.md`.
2. **Cấu trúc agent:** `.agents/context/`, `rules/`, `skills/`, `workflows/`, `tasks/`, `memory/`, `templates/` và các README/index tương ứng.
3. **Liên kết skill:** mọi skill được nhắc trong `AGENTS.md` hoặc `.agents/workflows/README.md` có file `SKILL.md` tương ứng; tên trong README khớp skill thực tế.
4. **Canonical workflow:** tài liệu dưới `.agents/workflows/` chỉ là mục lục/tóm tắt và trỏ về skill thực thi; không giữ quy trình chi tiết bị lệch với `.agents/skills/`.
5. **Project context:** so sánh `project-profile.md`, `project-overview.md`, `architecture-notes.md`, `known-issues.md` và roadmap liên quan với README/code ở mức module chính.
6. **Task state:** kiểm tra `current-task.md` chỉ ghi một task và status/verification khớp nội dung; dùng `task-history.md` khi cần đối chiếu report cũ. Nếu file không cho biết task nào đang active, báo trạng thái chưa rõ thay vì suy đoán.
7. **Working tree:** chạy `git status --short` để phân biệt thay đổi hiện tại với nội dung tài liệu đã commit. Không mặc định thay đổi thuộc task audit.

## Quy tắc riêng cho HVT

- Không yêu cầu `GEMINI.md`, `shared-setup-version.md` hoặc CodeGraph workflow nếu project chưa quyết định dùng chúng.
- Phân biệt app hiện chạy local với status ghi trong roadmap cũ.
- Chú ý các ranh giới `frontend/`, `backend/`, `data/`, `templates/` và runtime folders theo project rules.
- Nếu phát hiện docs mâu thuẫn, ghi lại tài liệu/code liên quan và chuyển sang `wf-doc-audit` khi cần audit sâu hoặc cập nhật.

## Giới hạn

- Chỉ đọc và báo cáo; không tự sửa file, cài dependency, chạy test, migration, seed, deploy, backup/restore, khởi động server hoặc render.
- Không đọc secret, `.env`, database chứa dữ liệu người dùng hoặc runtime media.
- Không nói đã audit toàn project nếu chưa đối chiếu các nhóm chính; ghi rõ phần đã kiểm tra và còn thiếu.

## Báo cáo

- Entrypoints và cấu trúc `.agents`.
- Skill/workflow link thiếu hoặc không khớp.
- Tài liệu cũ, mâu thuẫn hoặc task state không rõ.
- Phạm vi đã kiểm tra, phần pending và đề xuất bước tiếp theo.
