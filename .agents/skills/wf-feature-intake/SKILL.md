---
name: wf-feature-intake
description: Workflow tiếp nhận yêu cầu tính năng mới cho Hyper Video Tool trước khi triển khai code. Dùng khi người dùng nói muốn thêm/sửa một tính năng, UI flow, template video, render pipeline, upload asset, preview hoặc output management nhưng scope còn cần làm rõ.
---

# Workflow: Tiếp Nhận Tính Năng Mới

Dùng workflow này khi người dùng đưa ra yêu cầu tính năng mới hoặc yêu cầu còn ngắn/mơ hồ, ví dụ:

- "Làm màn hình upload tài nguyên."
- "Thêm template video giới thiệu sản phẩm nội bộ."
- "Cho render nhiều độ phân giải."
- "Làm preview scene."
- "Thêm lưu project JSON."
- "Nâng cấp UI phần render."

Mục tiêu là biến yêu cầu thô thành phạm vi rõ ràng, có MVP nhỏ, có checklist kiểm thử được và có approval gate trước khi sửa code.

## Nguyên Tắc Bắt Buộc

- Không sửa mã nguồn trong bước intake.
- Không thêm dependency, chạy cài đặt package, render video, xóa file hoặc đổi cấu trúc dữ liệu khi chưa được người dùng duyệt.
- Không làm quá scope. Luôn đề xuất MVP trước, phần nâng cao để sau.
- Không tự biến tool này thành app cloud, SaaS, landing page, ecommerce hoặc timeline editor phức tạp nếu người dùng chưa yêu cầu rõ.
- Nếu yêu cầu còn mơ hồ nhưng có thể chọn mặc định hợp lý, đề xuất mặc định thay vì hỏi vụn vặt.
- Nếu thay đổi có thể làm mất dữ liệu local, xóa output, đổi format JSON hoặc ảnh hưởng render pipeline, phải đánh dấu rủi ro và hỏi xác nhận rõ.

## Bước 1 - Đọc Bối Cảnh Bắt Buộc

Trước khi phân tích yêu cầu, đọc các file sau:

1. `AGENTS.md` hoặc `GEMINI.md`.
2. `.agents/skills/plan-quality/SKILL.md`.
3. `.agents/tasks/current-task.md`.
4. `.agents/context/project-overview.md`.
5. `.agents/context/project-profile.md`.
6. `.agents/context/architecture-notes.md`.
7. `.agents/context/ui-direction.md` nếu task liên quan UI.
8. `.agents/tasks/ui-roadmap.md` nếu task liên quan màn hình/luồng UI.
9. `.agents/tasks/ui-items.md` nếu task liên quan item cụ thể trên UI.
10. `.agents/rules/project-config.md`.
11. `.agents/rules/frontend-architecture.md` nếu task liên quan HTML/CSS/JS.
12. `.agents/rules/ui-quality-rules.md` và `.agents/rules/design-presets.md` nếu task liên quan giao diện.
13. `.agents/context/test-data.md` nếu cần đề xuất test hoặc dữ liệu mẫu.

Nếu file chưa tồn tại hoặc chưa liên quan, ghi rõ trong phần giả định. Không được tự tạo tài liệu mới ngoài phạm vi intake nếu chưa cần.

## Bước 2 - Phân Tích Yêu Cầu

Phản hồi cho người dùng bằng tiếng Việt, ngắn nhưng đủ ý, gồm các phần sau:

### 1. Hiểu yêu cầu

Diễn giải lại tính năng theo cách hiểu kỹ thuật của agent.

Ví dụ:

```text
Tao hiểu yêu cầu là thêm màn hình quản lý tài nguyên để người dùng upload logo, screenshot và video demo, sau đó chọn file nào được dùng trong template video.
```

### 2. Mục tiêu người dùng

Nêu người dùng sẽ làm được gì sau khi tính năng hoàn thành.

Tập trung vào hành động thật trong tool:

- nhập dữ liệu dự án
- quản lý tài nguyên
- chọn template
- xem trước scene
- render MP4
- xem lại output
- import/export JSON

### 3. Câu hỏi cần xác nhận

Chỉ hỏi khi câu trả lời ảnh hưởng trực tiếp đến scope, dữ liệu, render pipeline, file storage hoặc UI flow.

Không hỏi những chuyện có thể chọn mặc định hợp lý.

Ví dụ câu hỏi đáng hỏi:

- Tính năng này chỉ cần local hay cần chuẩn bị cho nhiều người dùng?
- File output có được xóa qua UI không?
- Format JSON có cần giữ tương thích với bản cũ không?
- Template này phục vụ video 16:9 hay cần thêm 9:16?

### 4. Phạm vi MVP đề xuất

Liệt kê phần tối thiểu cần làm để tính năng dùng được ngay.

MVP phải nhỏ, kiểm thử được, thường không quá 7 file và không quá 15 checklist item.

### 5. Phạm vi chưa làm ngay

Đẩy các phần dễ phình scope vào mục này.

Ví dụ:

- realtime collaboration
- account/auth
- cloud storage
- timeline editor kéo thả
- template marketplace
- AI generation nâng cao
- nhiều render worker song song

### 6. Tác động dữ liệu và file local

Nêu rõ tính năng có chạm vào:

- `data/sample-project.json`
- `data/projects/`
- `uploads/`
- `outputs/`
- project JSON schema
- render job status
- template data contract

Nếu có khả năng đổi format dữ liệu, đánh dấu rủi ro và yêu cầu approval trước khi triển khai.

### 7. Khu vực ảnh hưởng

Liệt kê khu vực dự kiến bị tác động:

- UI app: `app/index.html`, `app/styles/`, `app/scripts/`
- Node server: `server.js`, route API local
- Template video: `templates/`
- Dữ liệu mẫu: `data/sample-project.json`
- Upload/output: `uploads/`, `outputs/`
- Tài liệu/task: `.agents/tasks/current-task.md`
- Test/smoke check

Chỉ liệt kê khu vực thật sự liên quan. Không nhét toàn bộ project vào.

### 8. Hướng triển khai và trade-off

Nếu có trade-off thật, nêu 1-3 hướng.

Ví dụ:

- Vanilla JS state đơn giản vs thêm framework.
- JSON local trước vs SQLite ngay.
- Một render job tại một thời điểm vs queue nhiều job.
- Preview static scene trước vs playback timeline giả lập.

Nếu không có trade-off đáng kể, ghi rõ:

```text
Không có trade-off lớn; nên làm theo hướng MVP trực tiếp.
```

### 9. Hướng khuyến nghị

Chọn một phương án phù hợp nhất với Hyper Video Tool:

- local-first
- HTML/CSS/JS thuần
- Node server nhẹ
- không gradient
- không landing page
- không scope cloud/auth nếu chưa cần

### 10. Draft plan ghi vào current-task

Đưa bản nháp ngắn cho nội dung sẽ ghi vào `.agents/tasks/current-task.md` sau khi người dùng duyệt.

Bản nháp phải có:

- `Feature Intake`
- `Implementation Plan`
- `Checklist`
- `Verification Plan`
- `Test Report` để trống
- `Handoff` để trống

## Bước 3 - Approval Gate

Sau khi phân tích xong, dừng lại và hỏi:

```text
Mày đồng ý với phạm vi MVP này không? Nếu đồng ý tao sẽ cập nhật `.agents/tasks/current-task.md` rồi mới bắt đầu triển khai.
```

Chỉ được chuyển sang triển khai khi người dùng xác nhận rõ bằng các câu như:

- `đồng ý`
- `ok`
- `tiến hành`
- `làm đi`
- `approve`
- `chốt`

Nếu người dùng chỉnh scope, cập nhật lại intake/plan trước, không nhảy vào code ngay.

## Bước 4 - Cập Nhật Current Task Sau Khi Được Duyệt

Khi người dùng duyệt, cập nhật `.agents/tasks/current-task.md` theo cấu trúc:

```markdown
# Task Hiện Tại

## Trạng thái workflow

in_progress

## Feature Intake

...

## Implementation Plan

### Objective

...

### Scope

#### Sẽ làm

...

#### Không làm

...

#### Để sau

...

### Files Impact

...

### Logic Changes

...

### Risk Assessment

...

### Dependency Map

...

## Checklist

- [ ] ...

## Verification Plan

...

## Execution Notes

- ...

## Test Report

Chưa chạy.

## Handoff

Chưa có.
```

Không xóa lịch sử quan trọng nếu task cũ chưa được bàn giao. Nếu cần thay task, ghi rõ task cũ đã hoàn tất/được thay thế.

## Bước 5 - Thực Thi Sau Approval

Khi bắt đầu code:

- Làm đúng checklist đã duyệt.
- Tick checklist trực tiếp trong `.agents/tasks/current-task.md` sau từng đầu việc xong.
- Ghi quyết định kỹ thuật quan trọng vào `Execution Notes`.
- Nếu scope thay đổi, dừng và hỏi người dùng trước khi mở rộng.
- Nếu phát hiện cần đổi format JSON, xóa dữ liệu, thêm dependency lớn hoặc đổi render pipeline ngoài plan, dừng lại xin xác nhận.

## Bước 6 - Test Report Trước Khi Đóng Task

Trước khi báo hoàn tất, bắt buộc cập nhật `Test Report` trong `.agents/tasks/current-task.md`.

Test Report phải ghi:

- Commands đã chạy.
- Kết quả pass/fail.
- Browser/manual UI checks nếu có.
- Render check nếu task liên quan HyperFrames.
- Screenshot hoặc output artifact nếu có.
- Rủi ro còn lại.

Nếu có lỗi chưa sửa, không được báo là hoàn tất trừ khi người dùng chấp nhận rủi ro đó.

## Mẫu Báo Cáo Intake Trong Chat

```markdown
**Feature Intake**

**Hiểu yêu cầu**
...

**MVP đề xuất**
- ...

**Không làm ngay**
- ...

**Khu vực ảnh hưởng**
- ...

**Rủi ro**
- ...

**Hướng khuyến nghị**
...

**Cần xác nhận**
1. ...

Mày đồng ý với phạm vi MVP này không? Nếu đồng ý tao sẽ cập nhật `.agents/tasks/current-task.md` rồi mới bắt đầu triển khai.
```
