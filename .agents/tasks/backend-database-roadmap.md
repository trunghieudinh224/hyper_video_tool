# Roadmap Backend Database Và Lưu Trữ Bền Vững

Roadmap này thay thế hướng lưu tạm bằng `localStorage`/JSON rời cho dữ liệu cốt lõi của Hyper Video Tool. Mục tiêu là đưa backend local thành source of truth, dùng SQLite cho dữ liệu có cấu trúc và file system cho binary asset/output.

## Bối Cảnh Hiện Tại

Backend hiện đã có Node HTTP server, static serve frontend, render preflight, voiceover preview, render job API và output MP4 thật. Tuy nhiên dữ liệu workflow chính vẫn chưa bền:

- Project/video brief đang lưu trong browser `localStorage` qua key `hyper_video_project`.
- Settings đang lưu trong `localStorage` qua key `hyper_video_settings`.
- Asset upload trên UI chưa upload thật; ảnh/video có thể bị nhét vào state dạng URL tạm hoặc data URL.
- Output MP4 đã lưu file thật trong `outputs/`.
- Output metadata backend lưu trong `outputs/manifest.json`.
- Render job runtime state đang nằm trong memory process Node.

Vấn đề chính: reload browser, đổi browser, clear storage, hoặc video asset lớn đều có thể làm mất dữ liệu hoặc nổ quota. Phần này không chấp nhận được cho workflow thật.

## Objective

Chuyển dữ liệu làm video từ client-only storage sang backend database local. Sau roadmap này, người dùng chạy app qua backend URL, nhập brief, sửa kịch bản, chỉnh template, upload tài nguyên, reload hoặc restart backend vẫn giữ dữ liệu. `localStorage` chỉ còn là fallback cache hoặc dùng cho onboarding/UI preference rất nhỏ, không còn là nơi lưu chính của project.

## Nguyên Tắc Thiết Kế

- Backend local là source of truth cho project/video/settings/assets.
- SQLite là database mặc định vì local-first, dễ backup, không cần service ngoài.
- File binary không lưu trong DB. Ảnh/video upload lưu trong `uploads/`, DB chỉ lưu metadata và path.
- Output MP4 chưa cần DB hóa trong phase đầu; có thể tiếp tục dùng `outputs/` và `outputs/manifest.json`.
- Không thêm auth, cloud sync, multi-user trong MVP.
- Không phá render API đang chạy được.
- Không xóa `localStorage` cũ tự động cho tới khi migration/fallback đã test xong.

## Source Of Truth Sau Khi Hoàn Thành

| Dữ liệu | Source chính | Ghi chú |
| --- | --- | --- |
| Project/video brief | SQLite | Tên, slug, mục tiêu, message, tone, language, voiceover cơ bản |
| Kịch bản/phân đoạn | SQLite hoặc JSON trong project row theo phase | Phase đầu dump JSON, phase sau tách table |
| Template config | SQLite | `templateId`, `videoStyleId`, `templateConfig`, `videoStyleOverrides`, custom scene templates |
| Settings | SQLite | Upload folder, render folder, validation settings, theme nếu cần |
| Asset metadata | SQLite | Type, name, MIME, size, path, `useInVideo` |
| Asset binary | `uploads/{projectId}/...` | Không lưu base64/data URL |
| Output MP4 | `outputs/` | Giữ hiện trạng trong MVP |
| Output metadata | `outputs/manifest.json` | Có thể DB hóa sau |
| Render job active | Memory hiện tại | Có thể DB hóa sau nếu cần resume |

## Phase 0 - Audit Và Contract Chốt Dữ Liệu

### Objective

Chốt contract dữ liệu hiện tại trước khi thêm DB để không migrate mù. Phase này chỉ đọc code và viết tài liệu mapping; chưa sửa runtime.

### In Scope

- Liệt kê đầy đủ field hiện có trong `INITIAL_PROJECT_DATA`, sample data, UI save/load, render mapper.
- Phân loại field nào thuộc project, video settings, segment, template, asset, app settings.
- Xác định field nào phải giữ backward-compatible để render không vỡ.
- Ghi mapping vào roadmap/task report.

### Out Of Scope

- Chưa thêm SQLite.
- Chưa sửa frontend save/load.
- Chưa thay asset upload.

### Files Impact

- `MODIFY .agents/tasks/backend-database-roadmap.md` - cập nhật audit result nếu cần.
- `LIKELY MODIFY .agents/tasks/current-task.md` - ghi phase/test report khi triển khai thật.

### Verification

- `node --check` các file JS liên quan nếu có đọc/chạm helper.
- Không có code runtime thay đổi ở phase này.

## Phase 1 - SQLite Foundation Và Project Snapshot API

### Objective

Thêm SQLite local và API lưu/load project snapshot. Đây là thin slice đầu tiên để bỏ `localStorage` làm source chính mà chưa phải tách hết schema phức tạp.

### In Scope

- Thêm SQLite dependency.
- Tạo DB file mặc định: `data/hyper-video-tool.sqlite`.
- Tạo schema/version migration tối thiểu.
- Tạo default project nếu DB trống.
- API đọc project hiện tại.
- API ghi project hiện tại.
- Frontend boot load từ backend trước, fallback sample/localStorage chỉ khi API lỗi.
- Autosave project gọi backend API.

### Out Of Scope

- Chưa upload asset binary thật.
- Chưa tách segment/template ra table riêng.
- Chưa DB hóa output.
- Chưa xóa localStorage cũ.

### Files Impact

- `MODIFY backend/package.json` - thêm dependency và test/check script nếu cần.
- `MODIFY backend/src/config.js` - thêm `databasePath`.
- `NEW backend/src/db/database.js` - mở DB, init schema, helper query/transaction.
- `NEW backend/src/db/schema.sql` - schema ban đầu.
- `NEW backend/src/routes/projects.js` - API project snapshot.
- `MODIFY backend/src/server.js` - mount route.
- `NEW frontend/scripts/common/api.js` - helper gọi backend API.
- `MODIFY frontend/scripts/common/storage.js` - ưu tiên backend load/save, fallback rõ ràng.

> File impact phase này là 8 nếu làm cả frontend API mới. Nếu cần giữ đúng ngưỡng nhỏ, tách frontend API wiring thành Phase 1B.

### Data Model MVP

```sql
app_meta(
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TEXT NOT NULL
)

projects(
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

`payload_json` lưu nguyên project object hiện tại trong phase đầu. Đây là lựa chọn cố ý để giảm rủi ro phá UI/render. Phase sau mới normalize dần.

### API Contract

```text
GET /api/projects/current
-> { success, data: { project } }

PUT /api/projects/current
body: { project }
-> { success, data: { project } }
```

### Verification

- `npm --prefix backend run check`
- API smoke:
  - start backend.
  - `GET /api/projects/current` trả project.
  - `PUT /api/projects/current` với project đã đổi tên.
  - restart backend.
  - `GET /api/projects/current` vẫn còn tên mới.
- Browser smoke:
  - mở qua backend URL.
  - sửa brief hoặc segment.
  - reload page.
  - dữ liệu còn.
  - restart backend.
  - reload page dữ liệu vẫn còn.

### Risk

- 🟡 Thêm dependency SQLite có thể cần network/native build.
- 🟡 Autosave quá thường xuyên có thể ghi DB nhiều; cần debounce hoặc chỉ save khi state change ổn định.
- 🔴 Không được clear localStorage cũ tự động trong phase này.

## Phase 2 - Settings API Và Backend-First Settings

### Objective

Chuyển settings từ `localStorage` sang SQLite để cấu hình không mất khi đổi browser hoặc clear storage.

### In Scope

- Lưu settings vào SQLite.
- API đọc/ghi settings.
- Frontend Settings page dùng API.
- Validation settings đọc từ backend hoặc state đã load từ backend.

### Out Of Scope

- Không thêm UI settings mới ngoài field hiện có.
- Không thay đổi ý nghĩa `renderFolder` nếu output vẫn dùng `outputs/`.

### Files Impact

- `MODIFY backend/src/db/schema.sql` - thêm table/settings migration.
- `NEW backend/src/routes/settings.js` - API settings.
- `MODIFY backend/src/server.js` - mount route.
- `MODIFY frontend/scripts/common/storage.js` - `loadSettings/saveSettings` dùng backend path.
- `MODIFY frontend/scripts/common/ui-components.js` - Settings page handle async nếu cần.

### Data Model

```sql
app_settings(
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

Có thể dùng một row `key='default'` chứa settings object hiện tại:

```json
{
  "theme": "light",
  "renderFolder": "outputs/",
  "uploadFolder": "uploads/",
  "validation": {
    "warnMaxActiveScriptSegments": false,
    "maxActiveScriptSegments": 6
  }
}
```

### API Contract

```text
GET /api/settings
PUT /api/settings
```

### Verification

- Đổi upload/render folder trong Settings.
- Reload page còn settings.
- Restart backend còn settings.
- Validation warning settings vẫn ảnh hưởng panel validation.

### Risk

- 🟡 Frontend hiện nhiều chỗ gọi settings sync; cần đổi cẩn thận để không làm validation chạy trước khi settings load.

## Phase 3 - Asset Upload Local Thật

### Objective

Tài nguyên upload phải được lưu bền trên disk và metadata trong DB. Không dùng `blob:` URL, không nhét base64/data URL vào project payload.

### In Scope

- API upload asset bằng multipart/form-data.
- Lưu file vào `uploads/{projectId}/`.
- Lưu metadata asset vào SQLite.
- API list assets theo project.
- API delete asset.
- Serve asset qua URL backend an toàn.
- Frontend Asset page upload qua API, render card từ metadata.
- Project payload chỉ tham chiếu asset id/path, không chứa data URL.

### Out Of Scope

- Chưa generate thumbnail video phức tạp.
- Chưa transcode/compress video.
- Chưa deduplicate file.
- Chưa cloud storage.

### Files Impact

- `MODIFY backend/src/config.js` - thêm `uploadsDir`, size limits.
- `MODIFY backend/src/db/schema.sql` - thêm table assets.
- `NEW backend/src/routes/assets.js` - upload/list/delete/serve metadata.
- `NEW backend/src/storage/asset-store.js` - safe filename/path, write/delete file.
- `MODIFY backend/src/server.js` - mount route và static asset serving có guard.
- `MODIFY frontend/scripts/common/api.js` - asset API helper.
- `MODIFY frontend/scripts/common/ui-components.js` - Asset page dùng API thay vì FileReader data URL.
- `MODIFY frontend/scripts/common/render-preview.js` - đảm bảo render payload dùng URL backend asset.

### Data Model

```sql
assets(
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  mime_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT NOT NULL,
  use_in_video INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES projects(id)
)
```

### API Contract

```text
GET /api/projects/:projectId/assets
POST /api/projects/:projectId/assets
DELETE /api/projects/:projectId/assets/:assetId
GET /api/assets/:assetId/file
```

### Validation Rules

- Chỉ cho `image/*` và `video/*`.
- Default max size đề xuất:
  - image: 15 MB.
  - video: 300 MB.
- Safe filename, chặn path traversal.
- Delete asset mặc định xóa metadata và file local nếu file nằm trong `uploads/`.

### Verification

- Upload PNG/JPG thành công, reload còn preview.
- Upload MP4 thành công, reload còn video card.
- Restart backend, asset vẫn còn.
- File tồn tại trong `uploads/{projectId}/`.
- Delete asset xóa khỏi DB và file.
- File sai type bị reject.
- File vượt size bị reject.

### Risk

- 🟡 Multipart parsing cần dependency hoặc parser tự viết. Nên dùng dependency nhỏ, không tự parse multipart thủ công nếu không cần.
- 🟡 Video lớn cần tránh đọc toàn bộ vào memory nếu parser hỗ trợ stream.
- 🔴 Không được xóa file ngoài `uploads/`.

## Phase 4 - Normalize Video Detail, Segments Và Template Tables

### Objective

Tách dần dữ liệu quan trọng ra khỏi `payload_json` để backend query/update được từng phần: video brief, phân đoạn kịch bản, template config, custom scene template.

### In Scope

- Tạo tables cho video detail/settings.
- Tạo tables cho script segments.
- Tạo tables cho template config/custom scene templates.
- API update từng phần để UI không phải PUT toàn bộ project payload mỗi lần.
- Giữ payload snapshot làm backup/cache trong giai đoạn chuyển tiếp.

### Out Of Scope

- Không làm multi-project dashboard nâng cao nếu chưa cần.
- Không đổi render template logic lớn.
- Không DB hóa output.

### Files Impact

- `MODIFY backend/src/db/schema.sql`
- `NEW backend/src/routes/video.js`
- `NEW backend/src/routes/segments.js`
- `NEW backend/src/routes/templates.js`
- `MODIFY backend/src/render/project-to-render-payload.js` nếu cần đọc structured shape.
- `MODIFY frontend/scripts/common/api.js`
- `MODIFY frontend/scripts/common/ui-components.js`
- `MODIFY frontend/scripts/common/render-preview.js`

### Data Model Đề Xuất

```sql
video_details(
  project_id TEXT PRIMARY KEY,
  content_type TEXT,
  content_language TEXT,
  content_tone TEXT,
  tagline TEXT,
  short_summary TEXT,
  video_goal TEXT,
  main_message TEXT,
  problem_context TEXT,
  solution_what TEXT,
  target_users TEXT,
  use_case TEXT,
  key_highlight TEXT,
  result_impact TEXT,
  ending_note TEXT,
  voiceover_json TEXT,
  updated_at TEXT NOT NULL
)

script_segments(
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL,
  type TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  benefit TEXT,
  voiceover_script TEXT,
  duration_sec INTEGER NOT NULL,
  use_in_video INTEGER NOT NULL DEFAULT 1,
  scene_template_id TEXT,
  slots_json TEXT,
  background_json TEXT,
  scene_template_override_json TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)

project_template_settings(
  project_id TEXT PRIMARY KEY,
  template_id TEXT NOT NULL,
  video_style_id TEXT,
  default_scene_template_id TEXT,
  template_config_json TEXT,
  video_style_overrides_json TEXT,
  scene_item_views_json TEXT,
  updated_at TEXT NOT NULL
)

scene_templates(
  id TEXT PRIMARY KEY,
  project_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  aspect_ratio TEXT NOT NULL,
  category TEXT,
  recommended_duration_sec INTEGER,
  slots_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
)
```

### API Contract Đề Xuất

```text
GET /api/projects/:projectId/video
PUT /api/projects/:projectId/video

GET /api/projects/:projectId/segments
POST /api/projects/:projectId/segments
PUT /api/projects/:projectId/segments/:segmentId
DELETE /api/projects/:projectId/segments/:segmentId
PUT /api/projects/:projectId/segments/order

GET /api/projects/:projectId/template-settings
PUT /api/projects/:projectId/template-settings

GET /api/projects/:projectId/scene-templates
POST /api/projects/:projectId/scene-templates
PUT /api/projects/:projectId/scene-templates/:templateId
DELETE /api/projects/:projectId/scene-templates/:templateId
```

### Verification

- Thêm segment, reload vẫn còn.
- Sửa segment slots, reload vẫn còn.
- Reorder segments, reload vẫn đúng thứ tự.
- Đổi template/style, reload vẫn đúng.
- Tạo custom scene template, reload vẫn còn.
- Render preview đọc đúng structured data.
- Render MP4 vẫn nhận payload đúng.

### Risk

- 🟡 Đây là phase rủi ro nhất vì chạm cả UI state và render mapping.
- 🟡 Cần migration từ `payload_json` sang tables.
- 🔴 Không được xóa `payload_json` backup cho tới khi structured read/write pass qua nhiều smoke test.

## Phase 5 - Migration Từ localStorage Và JSON Cũ

### Objective

Cho người dùng đang có dữ liệu trong browser hoặc file sample cũ chuyển sang DB mà không mất việc.

### In Scope

- Detect `localStorage.hyper_video_project` nếu DB trống.
- Hỏi user hoặc hiển thị UI import một lần, không auto overwrite DB.
- API import project snapshot.
- Backup DB hoặc export JSON trước khi overwrite.
- Tài liệu migration trong README.

### Out Of Scope

- Không tự merge nhiều project phức tạp.
- Không import output MP4 history nếu chưa cần.

### Files Impact

- `MODIFY frontend/scripts/common/page-bootstrap.js`
- `MODIFY frontend/scripts/common/storage.js`
- `MODIFY frontend/scripts/common/ui-components.js`
- `MODIFY backend/src/routes/projects.js`
- `MODIFY backend/README.md`

### Verification

- DB trống + localStorage có project: UI báo có dữ liệu cũ để import.
- Import xong reload còn dữ liệu từ DB.
- DB đã có project: localStorage cũ không overwrite DB.
- Export/backup hoạt động trước overwrite.

### Risk

- 🔴 Overwrite dữ liệu DB là destructive. Phải có confirm rõ trong UI.

## Phase 6 - Hardening, Backup Và Maintenance

### Objective

Làm database local đủ chắc cho workflow hằng ngày: backup được, diagnose được, lỗi dễ hiểu.

### In Scope

- API health trả DB status.
- Script backup DB sang timestamp file.
- Script inspect DB summary.
- DB migration version rõ.
- Error response chuẩn cho DB locked, invalid JSON, disk full, path permission.
- README cập nhật cách chạy, backup, reset, migration.

### Out Of Scope

- Không packaging app desktop.
- Không sync cloud.

### Files Impact

- `MODIFY backend/src/routes/render-preflight.js` hoặc `health` response.
- `NEW backend/scripts/backup-database.js`
- `NEW backend/scripts/inspect-database.js`
- `MODIFY backend/README.md`
- `MODIFY .gitignore`

### Verification

- Backup script tạo file DB copy.
- Inspect script in được project count, asset count, DB path.
- Health check báo DB ok.
- App vẫn chạy khi `outputs/` trống.

## Thứ Tự Ưu Tiên Đề Xuất

1. Phase 1A: SQLite foundation + backend project snapshot API.
2. Phase 1B: Frontend load/save project qua API.
3. Phase 2: Settings API.
4. Phase 3: Asset upload thật.
5. Phase 4A: Segment table.
6. Phase 4B: Template/style table.
7. Phase 5: Migration UI.
8. Phase 6: Backup/hardening.

Không nên làm Phase 3 trước Phase 1 vì asset metadata cần project id/source of truth. Không nên làm structured segment/template tables trước snapshot API vì sẽ làm phase đầu quá rộng và khó rollback.

## Approval Gates

Mỗi phase phải dừng ở gate riêng:

- Trước Phase 1: xác nhận chọn SQLite dependency và chấp nhận thêm DB file local.
- Trước Phase 3: xác nhận giới hạn dung lượng upload image/video.
- Trước Phase 4: xác nhận migration strategy từ `payload_json` sang structured tables.
- Trước Phase 5: xác nhận cách xử lý dữ liệu `localStorage` cũ.

## Test Report Template

Mỗi phase khi triển khai phải điền:

```markdown
### Test Report

Status: passed | failed | partial

- Total checks/tests:
- Passed:
- Failed:

Commands run:
- `npm --prefix backend run check`
- `<api smoke command>`

Manual/UI checks:
- [ ] Load app through backend URL.
- [ ] Save data.
- [ ] Reload page.
- [ ] Restart backend.
- [ ] Confirm data remains.

Artifacts:
- Path to screenshot/log, or `None`.

Remaining risks:
- Risk description, or `None`.
```

## Future Scope

- Render job history trong DB để resume sau restart.
- Output metadata trong DB thay cho `outputs/manifest.json`.
- Asset thumbnail generation bằng FFmpeg.
- Project switcher nhiều project.
- Export/import nguyên project gồm DB record + uploads folder.
- Vacuum/compact DB command.
