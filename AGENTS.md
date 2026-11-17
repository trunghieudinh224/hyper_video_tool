# AGENTS.md

Tài liệu này là entrypoint hướng dẫn AI agent khi làm việc trong project.

## Khởi Đầu Mỗi Cuộc Trò Chuyện

- Khi bắt đầu một cuộc trò chuyện mới trong project này, phải đọc và làm theo `.agents/skills/wf-onboard/SKILL.md` trước khi trả lời về project hoặc sửa file.
- Nếu người dùng đã giao task trong cùng tin nhắn, onboard nhanh rồi tiếp tục task đó; không dừng lại hỏi người dùng muốn làm gì.
- Onboard chỉ đọc. Không tự chạy test, mở server, cài dependency hoặc sửa file trong bước này.

## Agent Workspace

- Đọc `.agents/README.md` để hiểu cấu trúc agent workspace.
- Đọc `.agents/rules/` trước khi sửa code liên quan.
- Tuân thủ `.agents/rules/agent-communication.md` khi giao tiếp với người dùng.
- Đọc `.agents/context/project-overview.md` để nắm tổng quan project.
- Đọc `.agents/memory/learnings.md` trước khi debug, review, refactor hoặc sửa lỗi lặp lại.
- Khi tạo/sửa cấu trúc thư mục, bắt buộc đọc `.agents/rules/project-structure.md` trước.
- Khi sửa UI trong `frontend/`, bắt buộc đọc `.agents/rules/static-multipage-ui.md` trước. Rule này thắng nếu tài liệu cũ còn nhắc tới SPA/tab trong một `index.html`.

## Skills Và Workflows

- Skill và workflow thực thi nằm trong `.agents/skills/`.
- Workflow thực thi dùng tiền tố `wf-`.
- `.agents/workflows/README.md` chỉ là mục lục/tài liệu phân nhóm workflow để người dùng nhìn nhanh.

## Giao Tiếp

- Luôn trả lời người dùng bằng tiếng Việt, trừ khi người dùng yêu cầu rõ ngôn ngữ khác.
- Xưng hô `mày`/`tao` theo preference của project.
- Đi thẳng vào vấn đề, không khen xã giao, không lan man.
- Giữ tên lệnh, tên file, tên hàm, commit message và thuật ngữ code bằng tiếng Anh khi cần chính xác.

<!-- shared-skills:start -->
## Shared Skills / Workflows

Khi xử lý task trong dự án, agent phải ưu tiên dùng các workflow/skills đã cài trong project nếu request khớp.

### Engineering
- Review toàn bộ diff trước commit hoặc trước khi sửa tiếp: dùng `wf-review`.
- Khi người dùng yêu cầu test/verification: dùng `wf-test` để chọn scope phù hợp.
- Kiểm tra và chuẩn bị/chia phase commit: dùng `wf-commit-ready`; chỉ commit/push khi người dùng yêu cầu rõ hành động đó.
- Bug, test fail, runtime error, performance regression: dùng `wf-diagnose`.
- Khi người dùng yêu cầu TDD/test-first hoặc thêm test: dùng `wf-tdd-slice`.
- Review/refactor kiến trúc: dùng `wf-architecture-review`.
- Thuật ngữ nghiệp vụ mơ hồ hoặc cần thống nhất vocabulary: dùng `domain-glossary`.

### Onboarding / Docs
- Đầu mỗi cuộc trò chuyện mới: dùng `wf-onboard` để nạp context project, task hiện tại và trạng thái working tree.
- Khi nghi tài liệu lệch code hoặc được yêu cầu rà docs: dùng `wf-doc-audit`.
- Khi được yêu cầu kiểm tra nền `.agents` và các liên kết workflow: dùng `wf-project-health-check`.

### Web
- Khi người dùng yêu cầu chạy app hoặc browser verification cần backend: dùng `wf-run-web`.
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
- Khi người dùng yêu cầu tính năng mới nhưng còn quyết định sản phẩm/scope chưa rõ: dùng `wf-feature-intake`; yêu cầu rõ và được giao triển khai thì onboard rồi làm, không hỏi lại intake.
- Khi người dùng muốn đọc hiểu project khác để tạo video brief: dùng `wf-explore-project`.

Các workflow nghiên cứu/planning không tự sửa code nếu user chỉ yêu cầu nghiên cứu/lập plan. Yêu cầu triển khai rõ ràng trong task hiện tại là authorization; vẫn phải hỏi riêng khi còn quyết định quan trọng chưa chốt hoặc project rule yêu cầu xác nhận cho hành động rủi ro.
<!-- shared-skills:end -->

## Quy Tắc An Toàn

- Không overwrite file/rule/config đã tồn tại nếu chưa hỏi người dùng.
- Không chạy migration, deploy, restore backup, hoặc thay đổi `.env` nếu chưa có xác nhận rõ.
- Không sửa code ngoài phạm vi task.
