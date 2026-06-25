---
name: wf-test
description: Chạy và báo cáo test/verification cho Hyper Video Tool: JS syntax, static pages, browser checks, preview/render smoke và backend local.
---

# Workflow: Test

Dùng khi người dùng gọi `wf-test`, `/test`, "chạy test", "verify", "smoke test", hoặc trước khi commit một thay đổi có rủi ro.

## Mục Đích

- Chọn đúng mức test theo loại thay đổi.
- Không chạy test nặng không cần thiết.
- Báo cáo rõ lệnh đã chạy, kết quả, lỗi còn lại và phần chưa kiểm được.
- Với test lâu, không im lặng.

## Bước 1 - Xác Định Scope

Suy luận từ diff hoặc hỏi ngắn nếu không rõ:

- Chỉ docs/rules: không cần test runtime, kiểm link/nội dung là đủ.
- JS frontend: `node --check` file liên quan, static/browser smoke page liên quan.
- CSS/layout: browser screenshot/DOM check ở desktop/tablet/mobile nếu có thể.
- Preview/template: kiểm template page + preview page, ratio dọc/ngang, console errors.
- Backend/render: chạy script test/smoke backend tương ứng.
- Template video/render output: cần smoke render và kiểm frame nếu feasible.

## Bước 2 - Test Matrix Cho Project

### Test Nhanh

```bash
node --check frontend/scripts/common/ui-components.js
node --check frontend/scripts/common/constants.js
node --check frontend/scripts/common/storage.js
```

Khi sửa page JS:

```bash
node --check frontend/scripts/pages/<page>.js
```

### Static UI Smoke

Start server:

```bash
python3 -m http.server 8019
```

Mở các page liên quan:

- `http://127.0.0.1:8019/frontend/pages/template.html`
- `http://127.0.0.1:8019/frontend/pages/preview.html`
- Page khác tùy diff.

Kiểm:

- Page load không runtime error.
- DOM chính render đúng.
- Modal/form/drag/drop/click workflow chính hoạt động nếu vừa sửa.
- Responsive 1440px, 768px, 390px nếu layout đổi.

### Backend/Render Smoke

Chỉ chạy khi backend/template/render bị sửa hoặc người dùng yêu cầu:

```bash
npm --prefix backend test
npm --prefix backend run smoke:render-api
```

Nếu script không tồn tại, báo rõ và dùng lệnh khả dụng trong `backend/package.json`.

Với smoke render video, nếu job succeeded vẫn phải kiểm ít nhất:

- File output tồn tại và size hợp lý.
- Duration/resolution đúng nếu có `ffprobe`.
- Extract/xem frame tại 2-3 mốc nếu có tool khả dụng.

## Bước 3 - Quy Định Test Lâu

Nếu test dự kiến > 3 phút:

- Báo trước loại test và thời gian ước tính.
- Cập nhật tiến trình mỗi 3-5 phút bằng commentary.
- Nếu process không output > 5 phút, kiểm tra còn chạy không; nếu nghi treo, báo người dùng trước khi kill trừ khi rõ ràng là stuck.

Format update ngắn:

```text
[Tên test] đang chạy: X phút, tới bước Y, chưa thấy lỗi mới.
```

## Bước 4 - Báo Cáo Kết Quả

```markdown
## Test Result

Commands:
- `...` - PASS/FAIL

Result:
- PASS: ...
- FAIL: ...

Notes:
- Phần chưa kiểm được và lý do.
- Risk còn lại nếu không có browser thật/render output.
```

Nếu fail:

- Trích lỗi quan trọng, không dump log dài.
- Nêu nguyên nhân khả dĩ.
- Không tự sửa nếu người dùng chỉ yêu cầu test; nếu user yêu cầu fix thì sửa theo scope.

## Bước 5 - Cleanup

- Không để dev server/session chạy nền nếu chỉ dùng để test tạm.
- Không commit output test/render/cache.
