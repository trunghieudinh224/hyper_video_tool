---
name: wf-shared-skills-setup-project
description: >
  Thiết lập một project để agent tự biết khi nào dùng các workflow/skill đã sao chép
  vào dự án. Quét skill hiện có, cập nhật AGENTS.md/GEMINI.md/CLAUDE.md bằng
  block hướng dẫn ngắn, và giữ nguyên rule/chỉnh sửa của người dùng xung quanh.
---

# Workflow: Shared Skills Setup Project

Dùng workflow này sau khi sao chép một hoặc nhiều skill từ `shared-skills` vào một project cụ thể.

## Mục Tiêu

- Phát hiện project hiện có những workflow/skill nào.
- Tạo `.agents/memory/learnings.md` nếu project chưa có memory.
- Thêm hoặc cập nhật một block rule ngắn để agent biết khi nào dùng chúng.
- Không sửa code ứng dụng.
- Không overwrite rule hiện có ngoài block được quản lý.

## Khi Nào Dùng

Kích hoạt khi người dùng nói:

- `wf-shared-skills-setup-project`
- `setup shared skills cho project này`
- `cài rule để agent tự biết dùng workflow`
- `thêm hướng dẫn sử dụng skills vào AGENTS/GEMINI`

## Quy Trình

### 1. Xác nhận project root

Chạy:

```bash
pwd
```

Kiểm tra đây là thư mục gốc project bằng các dấu hiệu như `.git/`, `README.md`, `package.json`, `pyproject.toml`, `.agents/`, `AGENTS.md`, `GEMINI.md`, `CLAUDE.md`.

Nếu chưa chắc đang ở project root, hỏi người dùng trước khi ghi file.

### 2. Quét skill/workflow đã cài trong project

Tìm các file:

```bash
find . -path '*/SKILL.md' -maxdepth 5 -print
```

Ưu tiên các vị trí phổ biến:

- `.agents/skills/**/SKILL.md`
- `.codex/skills/**/SKILL.md`
- `skills/**/SKILL.md`
- `workflows/**/SKILL.md`
- `planning/**/SKILL.md`
- `coordination/**/SKILL.md`
- `engineering/**/SKILL.md`
- `codegraph/**/SKILL.md`
- `web/**/SKILL.md`
- `python-web/**/SKILL.md`
- `memory/**/SKILL.md`

Đọc frontmatter `name` và `description` của từng skill để phân nhóm.

### 3. Setup project memory nếu thiếu

Kiểm tra:

```text
.agents/memory/
.agents/memory/README.md
.agents/memory/learnings.md
```

Nếu thiếu thư mục `.agents/memory/`, tạo thư mục đó.

Nếu thiếu `.agents/memory/learnings.md`, tạo từ template memory chung hoặc dùng nội dung tối thiểu:

```markdown
# Nhật Ký Bài Học Kinh Nghiệm (Learnings Log)

Tài liệu này ghi lại các bài học kỹ thuật có thể tái sử dụng trong project. Entry mới nhất luôn nằm phía trên entry cũ hơn.

## Quy chuẩn cập nhật

- Heading dùng mẫu `## Cập nhật ngày DD/MM/YYYY (HH:MM:SS UTC+7) - Tiêu đề`.
- Entry mới chèn phía trên entry cũ hơn, ngay sau phần quy chuẩn.
- Chỉ ghi bài học có thể tái sử dụng, không ghi thao tác vụn vặt.
```

Nếu thiếu `.agents/memory/README.md`, tạo file ngắn:

```markdown
# Bộ Nhớ Agent

Thư mục này lưu bài học kỹ thuật dài hạn của project.

- `learnings.md`: bài học giúp agent tránh lặp lại lỗi.
```

Không overwrite file memory đã tồn tại.

### 4. Chọn file rule để cập nhật

Chọn theo thứ tự:

1. `GEMINI.md` nếu có.
2. `AGENTS.md` nếu có.
3. `CLAUDE.md` nếu có.
4. Nếu không có file nào, hỏi người dùng muốn tạo file nào.

Nếu project có nhiều file rule, có thể cập nhật nhiều file nếu người dùng yêu cầu; mặc định cập nhật file đầu tiên tìm thấy theo thứ tự trên.

### 5. Thêm/cập nhật block được quản lý

Tìm block:

```markdown
<!-- shared-skills:start -->
...
<!-- shared-skills:end -->
```

Nếu có, cập nhật nội dung trong block.

Nếu chưa có, thêm block vào vị trí hợp lý:

- Sau phần planning/workflow nếu có.
- Nếu không có, thêm gần đầu file sau phần giới thiệu.

Không sửa nội dung ngoài block.

### 6. Sinh nội dung block

Block phải ngắn, theo skill thực sự có trong project. Không liệt kê skill chưa cài.

Template:

```markdown
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
- Review thay đổi route/form/API/UI: dùng `wf-web-review`.

### Python Web
- Tạo/migrate tooling Python: dùng `modern-python`.
- Setup Sentry/error monitoring/tracing/logging: dùng `sentry-python-sdk`.
- Thêm/sửa schema SQLAlchemy: dùng `wf-sqlalchemy-safe-migration`.
- Chạy pytest/smoke test Python: dùng `wf-python-pytest`.

### Memory / Learnings
- Trước khi debug, review, refactor hoặc sửa lỗi lặp lại: đọc `.agents/memory/learnings.md`.
- Sau debug/review/update-docs/handoff, nếu có bài học tái sử dụng: dùng `wf-update-learnings`.
- Không ghi thao tác vụn vặt vào learnings; chỉ ghi bug khó, cạm bẫy, quy tắc project, framework quirk hoặc cách test/debug đã chứng minh hiệu quả.

### Planning / Coordination
- Trước khi lập implementation plan hoặc checklist lớn: dùng `plan-quality`.
- Khi muốn phối hợp nhiều agent chuyên biệt: dùng `wf-agent-team-create`.

Các workflow nghiên cứu/planning không được tự sửa code nếu chưa có yêu cầu hoặc approval rõ ràng.
<!-- shared-skills:end -->
```

Chỉ giữ section có skill tương ứng:

- Có `wf-codegraph-*` thì giữ `CodeGraph`.
- Có `wf-diagnose`, `wf-tdd-slice`, `wf-architecture-review`, hoặc `domain-glossary` thì giữ `Engineering`.
- Có `wf-web-review` thì giữ `Web`.
- Có `modern-python`, `sentry-python-sdk`, `wf-sqlalchemy-safe-migration`, hoặc `wf-python-pytest` thì giữ `Python Web`.
- Có `wf-update-learnings` hoặc có `.agents/memory/learnings.md` thì giữ `Memory / Learnings`.
- Có `plan-quality` trong `planning/` hoặc bất kỳ vị trí skill nào thì giữ `Planning / Coordination`.
- Có `wf-agent-team-create` trong `coordination/` hoặc bất kỳ vị trí skill nào thì giữ `Planning / Coordination`.

### 7. Báo cáo

Kết thúc bằng:

```markdown
Shared skills setup:
- Project path:
- Rule file updated:
- Memory initialized: yes | no | already present
- Skills detected:
- Sections added:
- Next recommended action:
```

## Lưu Ý An Toàn

- Không tự sao chép skill từ shared-skills vào project; workflow này chỉ thiết lập rule cho skill đã có trong project, trừ khi người dùng yêu cầu sao chép.
- Không sửa code ứng dụng.
- Không tạo block trùng lặp; luôn cập nhật block cũ nếu đã tồn tại.
- Nếu file rule có nội dung nhạy cảm hoặc format lạ, báo người dùng trước khi sửa.
