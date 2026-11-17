# Mục Lục Workflow

> Workflow thực thi nằm trong `.agents/skills/wf-*`.
> Thư mục `.agents/workflows/` chỉ dùng để xem nhanh, không phải nguồn gọi workflow chính.

## Chọn workflow

- Đầu cuộc trò chuyện trong repo: `wf-onboard`.
- Yêu cầu tính năng còn mơ hồ: `wf-feature-intake`; yêu cầu rõ và được giao triển khai thì bỏ intake.
- Review toàn bộ working tree: `wf-review`; review web scope hẹp: `wf-web-review`; verification: `wf-test`.
- `wf-commit-ready` chỉ chuẩn bị diff, phase và message. Stage/commit/push cần user yêu cầu rõ.

## Onboarding / Docs

- `wf-onboard` — Nạp context và trạng thái repo ở đầu mỗi cuộc trò chuyện mới; nếu đã có task thì tiếp tục task sau khi onboard.
- `wf-doc-audit` — Đối chiếu tài liệu với code/rule theo phạm vi task và báo chỗ lệch.
- `wf-project-health-check` — Rà cấu trúc agent workspace, liên kết skill/workflow và các tài liệu cốt lõi; chỉ đọc, dùng khi cần rà định kỳ hoặc theo yêu cầu.

## Planning

- `wf-feature-intake` — Làm rõ mục tiêu/scope khi yêu cầu tính năng còn mơ hồ; implementation plan thuộc `plan-quality`.
- `wf-explore-project` — Xác định path project nguồn, đọc context/docs, nghiên cứu tính năng cụ thể và tạo video brief JSON sau khi người dùng duyệt.
- `plan-quality` — Kiểm tra chất lượng kế hoạch trước khi triển khai việc lớn.
- `domain-glossary` — Thống nhất thuật ngữ nghiệp vụ khi tên gọi còn mơ hồ.

## Engineering

- `wf-review` — Rà soát toàn bộ diff chưa commit: frontend, backend, preview/render, templates, data và docs/rules.
- `wf-test` — Chạy verification theo scope khi user yêu cầu: JS syntax, static UI smoke, browser check, backend/render smoke.
- `wf-commit-ready` — Kiểm diff, secrets/output rác, đề xuất verification, chia phase commit và soạn Conventional Commit; commit/push cần yêu cầu rõ.
- `wf-diagnose` — Debug lỗi runtime, test fail hoặc hành vi khó hiểu.
- `wf-tdd-slice` — Làm feature/fix theo TDD khi user yêu cầu test-first hoặc thêm test.
- `wf-architecture-review` — Rà soát kiến trúc trước refactor hoặc khi code bắt đầu khó sửa.

## UI

- `design-taste-frontend` — Định hướng giao diện gọn, sang, không giống template AI.
- `web-design-guidelines` — Quy tắc thiết kế web chung.
- `responsive-ui` — Kiểm tra viewport theo project rule; HVT mặc định hỗ trợ desktop/laptop.
- `wf-ui-taste-polish` — Polish giao diện sau khi UI chạy được.

## Web

- `wf-run-web` — Khởi chạy backend local an toàn, tái sử dụng server đang chạy và kiểm tra health endpoint.
- `webapp-testing` — Kiểm thử UI/web app local bằng browser hoặc script phù hợp.
- `wf-web-review` — Review một phạm vi web cụ thể gồm HTML/CSS/JS, Node API local, asset, preview và render contract.

## Memory

- `wf-update-learnings` — Cập nhật bài học kỹ thuật tái sử dụng vào `.agents/memory/learnings.md`.
