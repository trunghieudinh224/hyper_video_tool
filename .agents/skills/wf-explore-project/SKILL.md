---
name: wf-explore-project
description: Workflow khám phá một project nguồn trước khi tạo video brief. Dùng khi người dùng muốn agent đọc hiểu project khác, hỏi path project, đọc .agents/context/docs/rules cần thiết, sau đó chờ người dùng chỉ định tính năng cần làm video, nghiên cứu tính năng đó và lập plan trước khi tạo brief JSON cho Hyper Video Tool.
---

# Workflow: Explore Project Để Tạo Video Brief

Workflow này dùng khi người dùng muốn tạo video giải thích kỹ thuật cho một project đã có sẵn.

Mục tiêu không phải là sửa code project nguồn. Mục tiêu là:

```text
Hỏi path project nguồn
-> đọc context/rules/docs cần thiết
-> hiểu project ở mức đủ dùng
-> chờ người dùng chọn tính năng cụ thể
-> nghiên cứu tính năng đó trong code/docs
-> báo lại plan làm video
-> chờ người dùng duyệt
-> tạo video brief JSON cho Hyper Video Tool
```

## Khi Nào Dùng

Dùng workflow này khi người dùng nói các kiểu:

- "Explore project này để tạo video."
- "Đọc project X rồi tạo brief."
- "Tao muốn làm video giải thích tính năng Y trong project Z."
- "Hỏi tao path project rồi nghiên cứu tính năng."
- "Tạo video brief từ codebase."

## Nguyên Tắc Bắt Buộc

- Không sửa code project nguồn.
- Không chạy migration, seed, deploy, build, install dependency hoặc render video trong bước explore.
- Không tự tạo brief khi người dùng chưa chỉ định tính năng cụ thể.
- Không tự tạo brief khi người dùng chưa duyệt plan.
- Không đọc secret nếu thấy `.env`, credential, key, token hoặc file nhạy cảm.
- Không đưa secret, token, path private nhạy cảm vào brief.
- Chỉ dùng thông tin cần thiết để hiểu project và tính năng.
- Nếu project nguồn có rule riêng (`AGENTS.md`, `GEMINI.md`, `.agents/`, docs), phải đọc và tôn trọng.

## Bước 0 - Grill Người Dùng Để Lấy Đầu Vào

Khi workflow bắt đầu, hỏi người dùng các câu tối thiểu sau. Không làm gì tiếp nếu chưa có path project.

```text
Đưa tao path project cần explore.

Nếu đã biết luôn thì nói thêm:
- Muốn làm video cho project tổng quan hay tính năng cụ thể?
- Đối tượng xem là ai: dev nội bộ, manager, khách hàng kỹ thuật, hay người mới vào team?
- Video mong muốn dài bao lâu: 60s, 90s, 2-3 phút?
```

Nếu người dùng chỉ đưa path, tiếp tục đọc context project trước. Sau khi hiểu project, quay lại hỏi tính năng cụ thể.

## Bước 1 - Xác Minh Project Path

Sau khi có path:

1. Kiểm tra path tồn tại.
2. Kiểm tra đây có vẻ là project root không bằng các dấu hiệu:
   - `.git/`
   - `AGENTS.md`
   - `GEMINI.md`
   - `.agents/`
   - `README.md`
   - `package.json`
   - `pyproject.toml`
   - `composer.json`
   - framework entrypoint khác
3. Nếu path không rõ là project root, hỏi lại người dùng trước khi explore sâu.

Không tự `cd` sang project rồi chạy lệnh có side effect. Chỉ đọc file và search.

## Bước 2 - Đọc Context Bắt Buộc Trong Project Nguồn

Ưu tiên đọc các file này nếu tồn tại:

```text
AGENTS.md
GEMINI.md
README.md
.agents/README.md
.agents/context/project-overview.md
.agents/context/project-profile.md
.agents/context/architecture-notes.md
.agents/context/current-task.md
.agents/tasks/current-task.md
.agents/context/known-issues.md
.agents/context/test-data.md
.agents/rules/*.md
docs/**/*.md
DESIGN.md
```

Không cần đọc toàn bộ docs nếu quá nhiều. Ưu tiên:

- overview
- architecture
- feature list
- API docs
- UI docs
- roadmap/progress
- current task
- rules/safety

Nếu project có `.agents/memory/learnings.md`, đọc phần đầu và các entry liên quan nếu task có dấu hiệu debug/review/feature cũ.

## Bước 3 - Tóm Tắt Project Sau Khi Đọc Context

Sau khi đọc context, báo lại ngắn gọn:

```markdown
**Project hiểu được**
- Tên project:
- Mục tiêu:
- Stack chính:
- Các module chính:
- Luồng nghiệp vụ/kỹ thuật chính:
- UI/API/render/background jobs nếu có:
- Tài liệu/rule đã đọc:
- Điểm chưa rõ:
```

Sau đó hỏi:

```text
Bây giờ mày muốn làm video cho tính năng nào trong project này?
```

Nếu người dùng đã nói tính năng từ đầu, chuyển sang bước 4.

## Bước 4 - Nghiên Cứu Tính Năng Cụ Thể

Khi người dùng chỉ định tính năng, tìm hiểu bằng cách:

1. Search tên tính năng, từ khóa, route, component, class, command, file liên quan bằng `rg`.
2. Đọc các file liên quan ở mức đủ để hiểu flow.
3. Tìm:
   - entrypoint UI/API/CLI
   - data flow
   - module xử lý chính
   - state/data model liên quan
   - file cấu hình liên quan
   - test hoặc docs nếu có
   - rủi ro/giới hạn hiện tại
4. Nếu tính năng có UI, ghi nhận màn hình, component, state, empty/error/loading nếu tìm thấy.
5. Nếu tính năng có backend, ghi nhận route/service/model/job.
6. Nếu tính năng có async/background/render, ghi nhận queue/process/output.

Không cần đọc toàn bộ codebase. Chỉ mở rộng khi flow chưa rõ.

## Bước 5 - Báo Cáo Phân Tích Tính Năng

Báo cáo lại cho người dùng trước khi lập brief:

```markdown
**Feature Exploration**

**Tính năng**
- Tên:
- Mục đích:
- Người dùng hưởng lợi:

**Vấn đề tính năng giải quyết**
- ...

**Luồng kỹ thuật**
1. ...
2. ...
3. ...

**File/module liên quan**
- `path/file` — vai trò

**Điểm nên đưa vào video**
- ...

**Điểm không nên đưa vào video**
- ...

**Điểm chưa chắc / cần xác nhận**
- ...
```

Nếu vẫn còn câu hỏi ảnh hưởng nội dung video, hỏi ngay trước khi lập plan.

## Bước 6 - Lập Plan Video Brief

Sau khi đủ hiểu, lập plan tạo brief. Plan phải gồm:

```markdown
**Video Brief Plan**

**Loại video**
- Project overview | Technical feature explainer | Architecture walkthrough | Release update | Bugfix explanation

**Đối tượng xem**
- ...

**Thời lượng đề xuất**
- 60s | 90s | 2-3 phút

**Thông điệp chính**
- ...

**Cấu trúc scene đề xuất**
1. Mở đầu
2. Vấn đề
3. Giải pháp
4. Luồng kỹ thuật
5. File/module chính
6. Demo/visual hint
7. Kết quả/tác động
8. Kết thúc

**Dữ liệu sẽ đưa vào brief**
- project metadata
- feature summary
- technical flow
- referenced files
- scene list
- narration draft
- visual hints

**Không đưa vào brief**
- secret
- chi tiết implementation quá sâu
- code dài
- thông tin nhạy cảm

**File brief dự kiến**
- `briefs/<project-slug>/<feature-slug>.json`
```

Kết thúc bằng approval gate:

```text
Mày đồng ý với plan brief này không? Nếu đồng ý tao mới tạo JSON brief.
```

## Bước 7 - Tạo Video Brief JSON Sau Khi Được Duyệt

Chỉ tạo brief khi người dùng đồng ý rõ ràng.

Default output path trong Hyper Video Tool:

```text
briefs/<project-slug>/<feature-slug>.json
```

Nếu thư mục chưa có, được phép tạo trong project Hyper Video Tool.

Schema brief đề xuất:

```json
{
  "schemaVersion": "0.1",
  "videoType": "technical_feature_explainer",
  "sourceProject": {
    "name": "Tên project",
    "pathHint": "Tên thư mục hoặc slug, không cần absolute path nếu nhạy cảm",
    "stack": ["HTML", "CSS", "JavaScript"],
    "summary": "Mô tả ngắn project"
  },
  "audience": {
    "type": "developer_internal",
    "level": "intermediate",
    "goal": "Hiểu tính năng hoạt động thế nào"
  },
  "video": {
    "title": "Tên video",
    "durationSeconds": 90,
    "tone": "technical_clear",
    "language": "vi"
  },
  "feature": {
    "name": "Tên tính năng",
    "problem": "Vấn đề",
    "solution": "Giải pháp",
    "userValue": "Giá trị cho người dùng",
    "technicalSummary": "Tóm tắt kỹ thuật"
  },
  "technicalFlow": [
    {
      "step": 1,
      "title": "Bước kỹ thuật",
      "description": "Mô tả",
      "files": ["path/file.js"]
    }
  ],
  "referencedFiles": [
    {
      "path": "path/file.js",
      "role": "Vai trò trong tính năng",
      "safeToShow": true
    }
  ],
  "scenes": [
    {
      "id": "intro",
      "title": "Mở đầu",
      "durationSeconds": 8,
      "narration": "Lời thoại đề xuất",
      "visualHint": "Gợi ý hình ảnh/diagram/screenshot",
      "contentBullets": ["Ý chính 1", "Ý chính 2"]
    }
  ],
  "assetsNeeded": [
    {
      "type": "screenshot",
      "description": "Ảnh màn hình cần chụp",
      "optional": true
    }
  ],
  "notes": {
    "sensitiveInfoRemoved": true,
    "openQuestions": []
  }
}
```

## Bước 8 - Báo Cáo Sau Khi Tạo Brief

Sau khi tạo brief, báo:

```markdown
**Video brief đã tạo**
- File:
- Loại video:
- Số scene:
- Thời lượng ước tính:
- Asset còn thiếu:
- Câu hỏi còn mở:
- Bước tiếp theo trong Hyper Video Tool:
```

## Những Điều Không Được Làm

- Không tự sửa project nguồn.
- Không tự commit project nguồn.
- Không tự tạo video nếu chưa có brief được duyệt.
- Không tự gọi HyperFrames render.
- Không copy code dài vào brief.
- Không đưa secret/path nhạy cảm vào brief.
- Không biến video technical explainer thành video marketing.
