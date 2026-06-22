# GEMINI.md

Tài liệu này là entrypoint hướng dẫn Antigravity/Gemini khi làm việc trong project.

## Agent Workspace

- Đọc `.agents/README.md` để hiểu cấu trúc agent workspace.
- Đọc `.agents/rules/` trước khi sửa code liên quan.
- Đọc `.agents/context/project-overview.md` để nắm tổng quan project.
- Đọc `.agents/memory/learnings.md` trước khi debug, review, refactor hoặc sửa lỗi lặp lại.

## Skills Và Workflows

- Skill và workflow thực thi nằm trong `.agents/skills/`.
- Workflow thực thi dùng tiền tố `wf-`.
- `.agents/workflows/README.md` chỉ là mục lục/tài liệu phân nhóm workflow để người dùng nhìn nhanh.

<!-- shared-skills:start -->
## Shared Skills / Workflows

Khi xử lý task trong dự án, agent phải ưu tiên dùng các workflow/skills đã cài trong project nếu request khớp.

### CodeGraph
- Project mới: `wf-codegraph-init` -> `wf-codegraph-explore`.
- Project cũ: `wf-codegraph-status` -> `wf-codegraph-explore`.
- Sau khi pull/sửa nhiều code: `wf-codegraph-status` -> `wf-codegraph-sync` -> `wf-codegraph-explore`.
- Trước khi sửa/refactor symbol quan trọng: `wf-codegraph-impact`.
- Khi cần hiểu caller/callee/flow: `wf-codegraph-callgraph`.
- Khi bàn giao giữa agent: `wf-codegraph-handoff`.

### Engineering
- Bug, test fail, runtime error, performance regression: dùng `wf-diagnose`.
- Feature/fix cần test-first hoặc logic rủi ro cao: dùng `wf-tdd-slice`.
- Review/refactor kiến trúc: dùng `wf-architecture-review`.
- Thuật ngữ nghiệp vụ mơ hồ hoặc cần thống nhất vocabulary: dùng `domain-glossary`.

### Web
- UI/layout mới: dùng `frontend-design`, `design-taste-frontend`, `web-design-guidelines`.
- UI cần responsive: dùng `responsive-ui`.
- Polish UI sau khi chạy được: dùng `wf-ui-taste-polish`.
- Test web app hoặc browser smoke test: dùng `webapp-testing`.
- Review thay đổi route/form/API/UI: dùng `wf-web-review`.

### Memory / Learnings
- Trước khi debug, review, refactor hoặc sửa lỗi lặp lại: đọc `.agents/memory/learnings.md`.
- Sau debug/review/update-docs/handoff, nếu có bài học tái sử dụng: dùng `wf-update-learnings`.
- Không ghi thao tác vụn vặt vào learnings; chỉ ghi bug khó, cạm bẫy, quy tắc project, framework quirk hoặc cách test/debug đã chứng minh hiệu quả.

### Planning / Coordination
- Trước khi lập implementation plan hoặc checklist lớn: dùng `plan-quality`.

Các workflow nghiên cứu/planning không được tự sửa code nếu chưa có yêu cầu hoặc approval rõ ràng.
<!-- shared-skills:end -->

## Quy Tắc An Toàn

- Không overwrite file/rule/config đã tồn tại nếu chưa hỏi người dùng.
- Không chạy migration, deploy, restore backup, hoặc thay đổi `.env` nếu chưa có xác nhận rõ.
- Không sửa code ngoài phạm vi task.
