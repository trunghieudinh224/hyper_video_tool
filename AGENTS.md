# AGENTS.md

Tài liệu này là entrypoint hướng dẫn AI agent khi làm việc trong project.

## Agent Workspace

- Đọc `.agents/README.md` để hiểu cấu trúc agent workspace.
- Đọc `.agents/rules/` trước khi sửa code liên quan.
- Đọc `.agents/context/project-overview.md` để nắm tổng quan project.
- Đọc `.agents/memory/learnings.md` trước khi debug, review, refactor hoặc sửa lỗi lặp lại.
- Khi tạo/sửa cấu trúc thư mục, bắt buộc đọc `.agents/rules/project-structure.md` trước.
- Khi sửa UI trong `frontend/`, bắt buộc đọc `.agents/rules/static-multipage-ui.md` trước. Rule này thắng nếu tài liệu cũ còn nhắc tới SPA/tab trong một `index.html`.

## Skills Và Workflows

- Skill và workflow thực thi nằm trong `.agents/skills/`.
- Workflow thực thi dùng tiền tố `wf-`.
- `.agents/workflows/README.md` chỉ là mục lục/tài liệu phân nhóm workflow để người dùng nhìn nhanh.

<!-- shared-skills:start -->
## Shared Skills / Workflows

Khi xử lý task trong dự án, agent phải ưu tiên dùng các workflow/skills đã cài trong project nếu request khớp.

### Engineering
- Review toàn bộ diff trước commit hoặc trước khi sửa tiếp: dùng `wf-review`.
- Chạy test/verification theo scope thay đổi: dùng `wf-test`.
- Chuẩn bị/chia phase commit hoặc commit/push: dùng `wf-commit-ready`.
- Bug, test fail, runtime error, performance regression: dùng `wf-diagnose`.
- Feature/fix cần test-first hoặc logic rủi ro cao: dùng `wf-tdd-slice`.
- Review/refactor kiến trúc: dùng `wf-architecture-review`.
- Thuật ngữ nghiệp vụ mơ hồ hoặc cần thống nhất vocabulary: dùng `domain-glossary`.

### Web
- UI/layout mới: dùng `design-taste-frontend`, `web-design-guidelines`.
- UI cần responsive: dùng `responsive-ui`.
- Polish UI sau khi chạy được: dùng `wf-ui-taste-polish`.
- Test web app hoặc browser smoke test: dùng `webapp-testing`.
- Review thay đổi form/UI/HTML/CSS/JS riêng lẻ: dùng `wf-web-review`. Review toàn bộ diff thì dùng `wf-review`.
- Với Hyper Video Tool UI tĩnh trong `frontend/`: tuân thủ `.agents/rules/static-multipage-ui.md`; không gom nhiều màn hình vào một HTML dạng SPA.
- Với cấu trúc project: tuân thủ `.agents/rules/project-structure.md`; không tạo lại `app/`, không đặt backend ở root.

### Memory / Learnings
- Trước khi debug, review, refactor hoặc sửa lỗi lặp lại: đọc `.agents/memory/learnings.md`.
- Sau debug/review/update-docs/handoff, nếu có bài học tái sử dụng: dùng `wf-update-learnings`.
- Không ghi thao tác vụn vặt vào learnings; chỉ ghi bug khó, cạm bẫy, quy tắc project, framework quirk hoặc cách test/debug đã chứng minh hiệu quả.

### Planning / Coordination
- Trước khi lập implementation plan hoặc checklist lớn: dùng `plan-quality`.
- Khi người dùng yêu cầu tính năng mới nhưng scope chưa rõ: dùng `wf-feature-intake`.
- Khi người dùng muốn đọc hiểu project khác để tạo video brief: dùng `wf-explore-project`.

Các workflow nghiên cứu/planning không được tự sửa code nếu chưa có yêu cầu hoặc approval rõ ràng.
<!-- shared-skills:end -->

## Quy Tắc An Toàn

- Không overwrite file/rule/config đã tồn tại nếu chưa hỏi người dùng.
- Không chạy migration, deploy, restore backup, hoặc thay đổi `.env` nếu chưa có xác nhận rõ.
- Không sửa code ngoài phạm vi task.
