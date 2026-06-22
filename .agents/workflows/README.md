# Mục Lục Workflow

> Workflow thực thi nằm trong `.agents/skills/wf-*`.
> Thư mục `.agents/workflows/` chỉ dùng để phân nhóm và xem nhanh.

## Setup

- `wf-project-health-check` — Kiểm tra nhanh sau khi onboarding project mới để xác nhận cấu trúc `.agents`,
- `wf-shared-skills-setup-project` — Thiết lập một project để agent tự biết khi nào dùng các workflow/skill đã sao chép

## Daily

- `wf-architecture-review` — Workflow rà soát kiến trúc để tìm coupling, module nông, thiếu test seam,
- `wf-diagnose` — Workflow debug có kỷ luật cho bug khó, lỗi runtime, test fail, hoặc
- `wf-update-learnings` — Cập nhật `.agents/memory/learnings.md` bằng bài học kỹ thuật có thể tái sử

## UI

- `wf-ui-taste-polish` — Workflow audit và polish chất lượng UI cho web project bằng design-taste-frontend, responsive-ui và browser verification. Dùng khi UI trông generic, giống AI, chưa chuyên nghiệp, thiếu nhất quán, cần nâng cấp hoặc cần premium hơn mà không đổi business logic.

## Web

- `wf-web-review` — Workflow review thay đổi web app chung cho HTML/CSS/JS, templates, routes,

## CodeGraph

- `wf-codegraph-callgraph` — Workflow dựng call graph cho một symbol hoặc flow cụ thể bằng CodeGraph
- `wf-codegraph-explore` — Workflow dùng CodeGraph để nghiên cứu khu vực code liên quan tới một yêu cầu,
- `wf-codegraph-handoff` — Workflow tạo báo cáo bàn giao dựa trên kết quả CodeGraph khi chuyển việc giữa
- `wf-codegraph-impact` — Workflow phân tích tác động trước khi sửa/refactor một symbol quan trọng bằng
- `wf-codegraph-index` — Workflow dựng lại chỉ mục CodeGraph cho project hiện tại. Dùng khi chỉ mục có vẻ cũ,
- `wf-codegraph-init` — Workflow khởi tạo CodeGraph cho project hiện tại. Dùng khi mở một dự án mới
- `wf-codegraph-setup-project` — Setup CodeGraph cho một project cụ thể: kiểm tra MCP/global binary, thêm
- `wf-codegraph-status` — Workflow kiểm tra trạng thái CodeGraph của project hiện tại. Dùng để xác nhận
- `wf-codegraph-sync` — Workflow cập nhật CodeGraph index sau khi pull code, sửa/thêm/xóa file, hoặc
- `wf-codegraph-unlock` — Workflow gỡ stale lock của CodeGraph khi lần index/sync trước bị dừng đột

## Other

- `wf-tdd-slice` — Workflow phát triển hoặc sửa bug theo TDD dạng vertical slice/tracer bullet:

