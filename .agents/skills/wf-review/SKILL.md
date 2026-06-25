---
name: wf-review
description: Review toàn bộ thay đổi chưa commit trong Hyper Video Tool: frontend HTML/CSS/JS, backend local, templates render, rules/docs và dữ liệu mẫu.
---

# Workflow: Review

Dùng khi người dùng yêu cầu `review`, `wf-review`, `rà soát code`, hoặc trước khi chốt một batch thay đổi lớn.

## Mục Đích

- Rà soát toàn bộ file thay đổi trong git trước khi sửa tiếp hoặc commit.
- Ưu tiên phát hiện bug, regression, rủi ro render/preview, lỗi UI/responsive, và thiếu verification.
- Không tự sửa code trong workflow này nếu người dùng chỉ yêu cầu review. Nếu người dùng yêu cầu "review rồi fix", báo findings ngắn rồi tiến hành sửa các lỗi đã xác định.

## Bước 1 - Xác Định Diff

Chạy:

```bash
git status --short
git diff --name-only HEAD
git diff --stat HEAD
```

Phân loại file thay đổi:

- `frontend/pages/`: page HTML tĩnh.
- `frontend/scripts/common/`, `frontend/scripts/pages/`: JS shared/page behavior.
- `frontend/styles/`: token, layout, components, page CSS.
- `backend/`: API local, render adapter, smoke scripts.
- `templates/`: composition/render template.
- `data/`: dữ liệu mẫu/project JSON.
- `.agents/`: rules, workflows, context, memory.

Loại trừ khỏi review sâu nếu không liên quan trực tiếp:

- Runtime output/cache: `outputs/`, `.cache/`, `uploads/`, log tạm.
- Dependency/vendor generated file.
- File môi trường hoặc secret: `.env*` chỉ kiểm tra có bị stage nhầm không, không đọc/quote secret.

## Bước 2 - Checklist Review

### Frontend Static UI

- Tuân thủ `.agents/rules/static-multipage-ui.md`: mỗi màn hình chính là page riêng, không gom SPA giả.
- HTML không dùng inline event (`onclick`, `onchange`) và không nhúng logic page vào HTML.
- CSS không dùng inline style trong HTML; nếu JS cần position động thì phải có lý do rõ.
- Dùng CSS variables/tokens thay vì hardcode màu tràn lan.
- Không thêm gradient/hero marketing/orb decoration.
- Icon action tuân thủ `.agents/rules/ui-quality-rules.md`, đặc biệt FontAwesome solid cho edit/save/delete.
- Modal/form có empty/error/loading state phù hợp.
- Không tạo horizontal scroll ngoài vùng chủ đích.
- Text không overlap/tràn trên desktop/tablet/mobile.

### JavaScript UI/State

- Common JS không phụ thuộc DOM chỉ có ở một page nếu không có guard.
- Page JS không query DOM của page khác.
- Đọc/ghi project data qua `AppState`/`AppStorage`, không tạo localStorage key rời nếu chưa có lý do.
- Không còn `console.log`, debug hook, hoặc global tạm.
- Không dùng `alert`, `confirm`, `prompt`; dùng toast/modal chung.
- Event listener không bị bind lặp gây double action.
- Drag/drop/resize/click không làm scroll modal hoặc layout giật bất thường.

### Preview/Render/Templates

- Preview UI và render output dùng cùng dữ liệu/layout/ratio khi cần nhất quán.
- Scene template/slot phải giữ đúng `supportedAspectRatios`, layout slot, delay, animation, required.
- Video Style chỉ là token; Scene Item/Slot quyết định `colorRole` và `displayStyle` theo `.agents/rules/video-style-scene-item-contract.md`.
- Template render không phụ thuộc asset/CDN ngoài nếu render backend cần chạy offline.
- Nếu sửa render pipeline, phải kiểm tra frame output chứ không chỉ dựa vào job `succeeded`.

### Backend/Tooling

- Không tạo backend/root dependency mới trái `.agents/rules/project-structure.md`.
- Endpoint có validation lỗi cơ bản, không crash khi input thiếu.
- Không hardcode secret/path máy cá nhân nếu không phải config local có chủ đích.
- Smoke script/test không ghi output runtime vào git.

### Docs/Rules

- Rule mới không mâu thuẫn với rule hiện có.
- Nếu có bài học tái sử dụng sau debug/review, dùng `wf-update-learnings`.
- Không ghi thao tác vụn vặt vào memory.

## Bước 3 - Verification Cần Xem Xét

Tùy diff, đề xuất hoặc chạy:

```bash
node --check frontend/scripts/common/*.js
node --check frontend/scripts/pages/*.js
python3 -m http.server 8019
```

Browser/static checks:

- Mở trực tiếp page bị ảnh hưởng.
- Kiểm console runtime.
- Kiểm desktop 1440px, tablet 768px, mobile 390px nếu layout đổi.
- Với preview/render: kiểm DOM/canvas không blank và đúng ratio.

Backend/render checks nếu liên quan:

```bash
npm --prefix backend test
npm --prefix backend run smoke:render-api
```

Chỉ chạy lệnh tồn tại trong project; nếu thiếu script thì báo rõ "không có script".

## Bước 4 - Báo Cáo

Nếu review thuần, findings phải đi trước summary:

```markdown
## Review

Files reviewed:
- [file](/absolute/path/file:line)

Findings:
- [High] [file](/absolute/path/file:line) - Vấn đề, impact, cách tái hiện nếu có.
- [Medium] ...
- [Low] ...

Test gaps / residual risk:
- ...

Summary:
- ...
```

Nếu không thấy issue:

```markdown
Không phát hiện lỗi blocking.

Test gaps / residual risk:
- ...
```

## Bước 5 - Khi Người Dùng Muốn Fix

- Chỉ sửa lỗi thuộc scope review.
- Trước khi sửa file, nói ngắn gọn đang sửa nhóm lỗi nào.
- Sau khi sửa, chạy verification tối thiểu liên quan và báo lại kết quả.
