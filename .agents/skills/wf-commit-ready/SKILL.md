---
name: wf-commit-ready
description: Chuẩn bị commit cho Hyper Video Tool: review diff, chạy verification phù hợp, kiểm secrets/runtime output, chia phase commit và soạn commit message tiếng Anh.
---

# Workflow: Commit Ready

Dùng khi người dùng nói `commit-ready`, `chuẩn bị commit`, `chia phase commit`, `commit giúp tao`, hoặc trước khi push code.

## Mục Đích

- Đảm bảo diff đã được review/test ở mức hợp lý.
- Không stage nhầm secret, runtime output, cache hoặc file ngoài scope.
- Chia commit theo phase có nghĩa, không gom tất cả nếu diff lớn.
- Commit message dùng Conventional Commits bằng tiếng Anh.

## Bước 1 - Kiểm Tra Worktree

Chạy:

```bash
git status --short
git diff --stat HEAD
git diff --name-only HEAD
```

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

## Bước 3 - Verification Trước Commit

Chọn test theo diff, không chạy bừa:

- JS changed: `node --check` file JS liên quan.
- Static UI/layout changed: browser/static smoke page liên quan nếu khả dụng.
- Backend changed: test/smoke trong `backend/package.json` nếu có.
- Render changed: smoke render và kiểm output/frame nếu feasible.
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

## Bước 5 - Stage Và Commit

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

Chỉ push khi người dùng yêu cầu hoặc xác nhận rõ.

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
