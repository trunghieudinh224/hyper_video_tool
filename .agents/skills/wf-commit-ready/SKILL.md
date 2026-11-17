---
name: wf-commit-ready
description: "Chuẩn bị commit cho Hyper Video Tool: review diff, đề xuất verification, kiểm secrets/runtime output, chia phase commit và soạn commit message tiếng Anh."
---

# Workflow: Commit Ready

Dùng khi người dùng nói `commit-ready`, `chuẩn bị commit`, `chia phase commit`, hoặc `commit giúp tao`.

`commit-ready`, `chuẩn bị commit` và `chia phase commit` chỉ cho phép kiểm tra diff, đề xuất cách chia và soạn commit message. Chỉ stage/commit khi người dùng yêu cầu rõ việc commit. Chỉ push khi người dùng yêu cầu rõ việc push.

## Mục Đích

- Đảm bảo diff đã được review/test ở mức hợp lý.
- Không stage nhầm secret, runtime output, cache hoặc file ngoài scope.
- Chia commit theo phase có nghĩa, không gom tất cả nếu diff lớn.
- Commit message dùng Conventional Commits bằng tiếng Anh.

## Bước 1 - Kiểm Tra Worktree

Chạy:

```bash
git status --short
git ls-files --others --exclude-standard
git diff --stat HEAD
git diff --name-only HEAD
```

`git diff` không chứa nội dung file untracked. Đọc từng file mới liên quan trước khi phân loại hoặc đưa vào một phase commit.

Phân loại thay đổi:

- `docs/rules`: `.agents/`, docs, workflow.
- `ui-foundation`: tokens/components/layout/page shell.
- `frontend-feature`: page HTML/CSS/JS behavior.
- `preview-render`: preview canvas/render/template output.
- `backend`: API/render server/smoke scripts.
- `data`: sample project/template data.

## Bước 2 - Kiểm Secret Và Output Rác

Không commit:

- `.env*` chứa secret thật.
- `outputs/`, `uploads/`, `.cache/`, render job output.
- DB/local runtime/cache/log không chủ đích.
- Screenshot/video tạm nếu user không yêu cầu lưu artifact.

Rà nhanh:

```bash
git diff --cached --name-only
git diff --name-only HEAD
```

Nếu có file nhạy cảm: dừng và báo người dùng.

## Bước 3 - Đề Xuất Verification

Chọn kiểm tra phù hợp theo diff và báo lệnh đề xuất. Chỉ chạy test/browser/smoke khi user yêu cầu test hoặc verification; yêu cầu commit tự nó không đồng nghĩa với yêu cầu chạy test.

- JS changed: `node --check` file JS liên quan.
- Static UI/layout changed: browser/static smoke page liên quan nếu khả dụng.
- Backend changed: đề xuất `npm --prefix backend run check`.
- Render changed: đề xuất `smoke:render-api` riêng khi user yêu cầu render verification vì lệnh tạo MP4 runtime.
- Docs/rules only: không cần runtime test.

Nếu không chạy được test/browser vì thiếu dependency/tool, báo rõ trong final.

## Bước 4 - Chia Phase Commit

Ưu tiên commit nhỏ theo dependency:

1. Rules/docs/workflow.
2. Shared foundation: tokens/components/layout/vendor/page includes.
3. Data/model constants/storage migration.
4. Feature UI/behavior.
5. Preview/render/backend integration.
6. Test/update docs nếu tách hợp lý.

Không tách quá nhỏ bằng `git add -p` nếu cùng file có dependency chặt khiến commit trung gian vỡ app. Khi cùng file chứa nhiều phase nhưng khó split an toàn, gom vào phase feature và nói rõ lý do.

## Bước 5 - Stage Và Commit Khi Được Yêu Cầu Rõ

Ở chế độ `commit-ready` mặc định, dừng sau khi báo phase đề xuất, file thuộc từng phase và commit message. Không stage hoặc commit.

Chỉ chạy tiếp phần này khi người dùng yêu cầu rõ `commit` hoặc `commit giúp tao`. Chỉ stage file thuộc phase đã thống nhất; không stage toàn bộ worktree theo mặc định.

Trước mỗi commit:

```bash
git diff --cached --stat
git diff --cached --name-only
```

Commit message:

```text
type(scope): short English summary
```

Ví dụ:

- `docs: add agent workflow guardrails`
- `ui: refine template layout foundation`
- `feat(template): add editable scene layouts`
- `fix(preview): preserve scene slot positions`

Chỉ push khi người dùng yêu cầu rõ. Yêu cầu chuẩn bị commit không bao gồm quyền push.

## Bước 6 - Báo Cáo Sau Commit

```markdown
Committed:
1. `<sha>` `message` - scope ngắn
2. ...

Verification:
- `command` PASS
- Not run: lý do

Worktree:
- clean / còn file nào chưa commit
```

Nếu đã stage thành công, final phải emit directive `::git-stage{cwd="..."}` theo quy định Codex app.
Nếu đã commit thành công, final phải emit directive `::git-commit{cwd="..."}`.
