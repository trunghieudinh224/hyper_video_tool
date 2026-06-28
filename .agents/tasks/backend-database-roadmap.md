# Roadmap Database Và Multi-Project Persistence

Roadmap này là kế hoạch chính thức cho phần lưu trữ bền vững của Hyper Video Tool. Mục tiêu không chỉ là lưu một project hiện tại, mà là quản lý nhiều video project độc lập: tạo mới, lưu nháp, mở lại từ lịch sử, chỉnh sửa, render lại và xem output cũ.

## Bối Cảnh Hiện Tại

Tool đã có backend local, SQLite, upload/output/render API ở mức cơ bản. Tuy nhiên persistence hiện vẫn chưa đúng mô hình sản phẩm:

- Backend đang dùng khái niệm `CURRENT_PROJECT_ID = "current"`.
- Bảng `projects` hiện lưu một JSON blob chính trong `payload_json`.
- Frontend vẫn dùng `localStorage` cho project data trong nhiều path.
- Khi backend và browser storage lệch nhau, app có thể hiển thị lại sample cũ như `internal-analytics-dashboard`.
- User cần làm nhiều project video khác nhau, không phải chỉ sửa một project duy nhất.

Kết luận: phải chuyển sang thiết kế multi-project DB-first. `localStorage` chỉ được dùng cho UI preference hoặc fallback offline, không được là source of truth khi backend chạy.

## Objective Tổng

Sau khi roadmap này hoàn thành:

- Người dùng có thể tạo nhiều video project.
- Mỗi project có metadata riêng, project JSON riêng, asset riêng, output render riêng.
- App mở lên sẽ load active project từ DB.
- Người dùng có thể vào lịch sử project, chọn project cũ, load lại để chỉnh sửa hoặc render lại.
- Clear browser localStorage không làm mất dữ liệu project.
- Default/sample project chính là `Codegraph cho AI Agent`, không quay lại dashboard demo cũ.

## Nguyên Tắc Thiết Kế

- SQLite là source of truth cho backend local.
- File binary không lưu trong DB; DB chỉ lưu metadata/path.
- Project content giai đoạn đầu vẫn lưu dạng JSON snapshot để giảm rủi ro phá UI/render.
- Metadata cần tách ra column riêng để list/search nhanh mà không parse JSON.
- Không xóa cứng project trong MVP; dùng archive.
- Không destructive migration. Dữ liệu cũ `current` phải được migrate/copy an toàn.
- Khi backend available, frontend không được lấy `localStorage` để override DB.
- Khi backend unavailable, app có thể fallback offline nhưng UI phải báo rõ đang chạy local/offline.

## Source Of Truth Sau Khi Hoàn Thành

| Dữ liệu | Source chính | Ghi chú |
| --- | --- | --- |
| Project metadata | SQLite `projects` | List/history nhanh |
| Full project content | SQLite `project_snapshots.payload_json` | JSON snapshot hiện tại |
| Active project | SQLite `active_project` | Project đang mở |
| App settings | SQLite `app_settings` | Theme, render/upload folder, validation |
| Asset metadata | SQLite `assets` | Gắn theo `project_id` thật |
| Asset binary | `uploads/{projectId}/...` | Không lưu base64 trong project |
| Render output metadata | SQLite `render_outputs` | Gắn theo project |
| Render output file | `outputs/{projectId}/...` hoặc current output path | Tối ưu sau |
| UI preference nhỏ | `localStorage` | Chỉ theme/sidebar/onboarding nếu cần |

## Data Model Đề Xuất

### `projects`

Lưu metadata nhẹ cho project history.

```sql
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  content_type TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  thumbnail_url TEXT,
  last_rendered_output_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  archived_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_projects_updated_at
  ON projects(updated_at);

CREATE INDEX IF NOT EXISTS idx_projects_archived_at_updated_at
  ON projects(archived_at, updated_at);
```

Trạng thái dự kiến:

- `draft`: đang soạn.
- `ready`: đủ dữ liệu để render.
- `rendered`: đã có output.
- `archived`: không hiện mặc định trong history chính.

### `project_snapshots`

Lưu full JSON project. Phase đầu chỉ cần một current snapshot mỗi project; phase sau có thể thêm version history.

```sql
CREATE TABLE IF NOT EXISTS project_snapshots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  version INTEGER NOT NULL DEFAULT 1,
  label TEXT,
  payload_json TEXT NOT NULL,
  created_at TEXT NOT NULL,
  is_current INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_project_snapshots_project_current
  ON project_snapshots(project_id, is_current);
```

Quy tắc phase đầu:

- Save project sẽ update current snapshot in-place hoặc replace row current.
- Không tạo version mới mỗi autosave để tránh DB phình.
- Khi cần version history sau này, tạo snapshot mới theo mốc thủ công hoặc render checkpoint.

### `active_project`

Lưu project đang mở.

```sql
CREATE TABLE IF NOT EXISTS active_project (
  key TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);
```

Row chính:

```text
key = 'default'
project_id = '<project-id>'
```

### `assets`

Giữ bảng hiện có nhưng đổi usage: `project_id` phải là id project thật, không dùng `"current"`.

```sql
CREATE TABLE IF NOT EXISTS assets (
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
);

CREATE INDEX IF NOT EXISTS idx_assets_project_id_created_at
  ON assets(project_id, created_at);
```

### `render_outputs`

Đưa output metadata vào DB để mở project cũ vẫn thấy video đã render.

```sql
CREATE TABLE IF NOT EXISTS render_outputs (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  filename TEXT NOT NULL,
  file_path TEXT NOT NULL,
  public_url TEXT,
  format_id TEXT,
  width INTEGER,
  height INTEGER,
  duration_sec REAL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY(project_id) REFERENCES projects(id)
);

CREATE INDEX IF NOT EXISTS idx_render_outputs_project_created_at
  ON render_outputs(project_id, created_at);
```

### `app_settings`

Giữ như hiện tại cho global settings.

```sql
CREATE TABLE IF NOT EXISTS app_settings (
  key TEXT PRIMARY KEY,
  value_json TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

## API Contract Đề Xuất

### Project history

```text
GET /api/projects
```

Query tương lai:

- `?includeArchived=1`
- `?q=codegraph`
- `?limit=50`

Response:

```json
{
  "success": true,
  "data": {
    "projects": [
      {
        "id": "proj_...",
        "name": "Codegraph cho AI Agent",
        "slug": "codegraph-ai-agent-intro",
        "contentType": "technical-module",
        "status": "draft",
        "thumbnailUrl": null,
        "lastRenderedOutputId": null,
        "createdAt": "...",
        "updatedAt": "...",
        "archivedAt": null
      }
    ]
  }
}
```

### Create project

```text
POST /api/projects
```

Body tạo từ full JSON:

```json
{
  "project": { "...": "full project json" },
  "activate": true
}
```

Body tạo từ default:

```json
{
  "template": "default",
  "activate": true
}
```

Backend behavior:

- Tạo `projects` metadata.
- Tạo `project_snapshots` current.
- Nếu `activate = true`, set active project.

### Load project

```text
GET /api/projects/:id
```

Trả metadata + current snapshot:

```json
{
  "success": true,
  "data": {
    "project": { "...": "full project json" },
    "meta": { "...": "project metadata" }
  }
}
```

### Save project

```text
PUT /api/projects/:id
```

Body:

```json
{
  "project": { "...": "full project json" }
}
```

Backend behavior:

- Validate body có `project` object.
- Update `projects.name`, `slug`, `content_type`, `updated_at`.
- Update current snapshot `payload_json`.
- Không archive/xóa dữ liệu.

### Active project

```text
GET /api/projects/active
PUT /api/projects/active
```

PUT body:

```json
{
  "projectId": "proj_..."
}
```

### Archive project

```text
POST /api/projects/:id/archive
```

Behavior:

- Set `archived_at`.
- Nếu archived project đang active, backend nên chọn project active khác hoặc trả warning để frontend chọn.

### Duplicate project

```text
POST /api/projects/:id/duplicate
```

Behavior:

- Copy current snapshot.
- Tạo project metadata mới.
- Reset output refs.
- Tên mặc định: `<old name> Copy`.

### Project outputs

```text
GET /api/projects/:id/outputs
```

Trả output đã render của project đó.

## Frontend Flow Đề Xuất

### App boot

1. Detect backend available.
2. Nếu backend available:
   - `GET /api/projects/active`.
   - Nếu có active project, load full project.
   - Nếu chưa có project nào, `POST /api/projects { template: "default", activate: true }`.
   - Set `AppState.projectData` từ DB.
   - Không đọc `localStorage.hyper_video_project` để override.
3. Nếu backend unavailable:
   - Dùng `localStorage` hoặc static sample.
   - Hiển thị trạng thái offline/localStorage.

### Autosave

Khi `projectDataChanged`:

- Backend available:
  - debounce `PUT /api/projects/:activeId`;
  - status: `Đang lưu DB`, `Đã lưu DB`, hoặc `Lưu DB lỗi`.
- Backend unavailable:
  - save `localStorage`;
  - status: `Đang lưu local`.

### Load project từ history

1. User chọn project trong history.
2. `PUT /api/projects/active`.
3. `GET /api/projects/:id`.
4. `AppState.setProjectData(project)`.
5. Re-render current page.

### New project

Phase đầu nên có:

- `New from default`: tạo project Codegraph/default mới.
- `Duplicate current`: copy project hiện tại.

Không cần blank project nếu flow nhập liệu chưa tối ưu.

### Project history UI

Vị trí đề xuất phase đầu:

- Thêm section trong `overview.html` / `renderOverviewScreen`.
- Table/card gồm:
  - tên project;
  - slug/content type;
  - updated time;
  - status;
  - last output nếu có;
  - buttons: `Load`, `Duplicate`, `Archive`.

Sau này nếu nhiều project hơn thì tách page `projects.html`.

## Migration Strategy

Không drop dữ liệu cũ.

### Migration từ `projects.id = "current"`

1. Init schema mới.
2. Tìm row `projects.id = 'current'`.
3. Nếu chưa có project thật nào:
   - tạo id mới `proj_<timestamp>` hoặc random id;
   - copy payload JSON sang `project_snapshots`;
   - insert metadata vào `projects` với id mới;
   - set `active_project.default = new id`.
4. Giữ row `current` trong phase đầu để rollback dễ.
5. Sau vài phase ổn định mới tính cleanup.

### Migration default sample

- `data/sample-project.json` là Codegraph default.
- Nếu DB trống, seed bằng file này.
- Nếu localStorage còn legacy sample (`internal-analytics-dashboard`, `codegraph-migration-agent`), frontend không được dùng nó khi backend available.

## Implementation Slices

Plan tổng này lớn, không implement một lần. Chia thành 4 slice để mỗi slice có thể test độc lập.

## Slice 0 - Ổn Định Default Codegraph Và Contract Hiện Tại

### Objective

Đảm bảo default/sample hiện tại là Codegraph và backend check pass trước khi bắt đầu schema multi-project.

### In Scope

- `data/sample-project.json` là Codegraph general intro.
- Static sample trong `storage.js` là Codegraph.
- Backend payload converter build được dynamic project.
- Tests liên quan default sample pass.

### Out Of Scope

- Chưa thêm multi-project API.
- Chưa thay frontend history UI.

### Files Impact

- `MODIFY data/sample-project.json`
- `NEW data/codegraph-intro-project.json`
- `MODIFY frontend/scripts/common/storage.js`
- `MODIFY backend/src/render/project-to-render-payload.js`
- `MODIFY backend/scripts/test-render-payload.js`
- `MODIFY backend/scripts/test-audio-voiceover.js`

### Verification

- `npm --prefix backend run check`
- Render payload từ `data/sample-project.json` phải là `dynamic-story-vertical`, 7 scenes.

## Slice 1 - Backend Multi-Project DB Và API

### Objective

Thêm schema/API multi-project, nhưng chưa đổi frontend flow lớn. Backend phải tự quản lý nhiều project, active project, current snapshot và archive.

### In Scope

- Add schema:
  - `project_snapshots`
  - `active_project`
  - `render_outputs` nếu scope vẫn <= 7 file; nếu không, đẩy output sang Slice 4.
- Refactor database helper:
  - create project
  - list projects
  - get project
  - save project
  - set/get active project
  - archive project
  - duplicate project
  - migrate legacy `current`
- Add/extend `/api/projects` routes.
- Add backend tests.

### Out Of Scope

- Chưa làm UI history.
- Chưa đổi asset upload theo project thật nếu đang vượt scope; nhưng DB helper nên chừa project id.
- Chưa version history UI.

### Files Impact

- `MODIFY backend/src/db/schema.sql`
- `MODIFY backend/src/db/database.js`
- `MODIFY backend/src/routes/projects.js`
- `MODIFY backend/src/server.js`
- `NEW backend/scripts/test-projects.js`
- `MODIFY backend/package.json`

### Checklist

- [x] Thêm schema mới không phá bảng cũ.
- [x] Viết helper `createProject(project, options)`.
- [x] Viết helper `listProjects({ includeArchived })`.
- [x] Viết helper `getProject(projectId)`.
- [x] Viết helper `saveProject(projectId, project)`.
- [x] Viết helper `getActiveProject()` / `setActiveProject(projectId)`.
- [x] Viết helper `archiveProject(projectId)`.
- [x] Viết helper `duplicateProject(projectId)`.
- [x] Viết migration legacy `current` sang project thật.
- [x] Thêm API routes.
- [x] Thêm tests backend.

### Verification

- `npm --prefix backend run check`
- Test riêng:
  - create/list/get/save;
  - active project;
  - archive;
  - duplicate;
  - legacy current migration.

### Risk

- 🟡 Schema migration phải non-destructive.
- 🟡 Route ordering cần cẩn thận để `/api/projects/active` không bị match nhầm `/:id`.
- 🔴 Không drop row `current`, không delete DB.

## Slice 2 - Frontend DB-First Storage

### Objective

Frontend dùng DB làm source of truth khi backend chạy. `localStorage` không override DB.

### In Scope

- Update `AppBackendApi` cho project list/active/load/save.
- Update `AppStorage.loadProjectData()` DB-first.
- Update autosave theo active project id.
- Update sample/import/reset actions để save DB nếu backend available.
- Keep offline fallback.

### Out Of Scope

- Chưa làm UI project history đầy đủ.
- Chưa làm duplicate/archive button nếu history UI chưa có.

### Files Impact

- `MODIFY frontend/scripts/common/api.js`
- `MODIFY frontend/scripts/common/storage.js`
- `MODIFY frontend/scripts/common/page-bootstrap.js`
- `MODIFY frontend/scripts/common/ui-components.js`

### Checklist

- [x] `loadProjectData()` gọi active project từ DB.
- [x] Nếu DB trống, tạo default Codegraph project qua backend.
- [x] Autosave DB theo active project id.
- [x] Save status phân biệt DB/local.
- [x] Import JSON save vào DB.
- [x] Tải sample save vào DB.
- [x] Clear/reset không xóa DB ngoài ý muốn; nếu reset thì update active project payload.

### Verification

- `node --check` các JS liên quan.
- `npm --prefix backend run check`
- Browser smoke:
  - clear localStorage;
  - reload app;
  - vẫn load active project từ DB;
  - sửa field, reload, field còn.

### Risk

- 🟡 Frontend hiện nhiều flow sync state; phải tránh double save hoặc save stale data.
- 🟢 Offline fallback giữ lại nên mở static không chết.

## Slice 3 - Project History UI

### Objective

Cho user thấy danh sách project đã làm và load lại project cũ.

### In Scope

- Add section `Project history` trong Overview.
- List active/non-archived projects.
- Buttons:
  - `Load`
  - `Duplicate`
  - `Archive`
  - `New from default`
- Refresh list sau action.

### Out Of Scope

- Chưa có search/filter phức tạp.
- Chưa có page riêng `projects.html`.
- Chưa có version history trong từng project.

### Files Impact

- `MODIFY frontend/scripts/common/ui-components.js`
- `MODIFY frontend/styles/pages/overview.css` hoặc `frontend/styles/components.css`
- `MAYBE MODIFY frontend/pages/overview.html`
- `MAYBE MODIFY frontend/scripts/pages/overview.js`

### Checklist

- [x] Render project list từ `GET /api/projects`.
- [x] Button Load set active + load project.
- [x] Button Duplicate tạo project mới + active/load nếu user chọn.
- [x] Button Archive dùng modal confirm.
- [x] Button New from default tạo project mới.
- [x] Empty state nếu chưa có project.
- [x] Error state nếu backend unavailable.

### Verification

- Browser smoke 1440x900:
  - tạo project mới;
  - load project cũ;
  - duplicate;
  - archive;
  - reload vẫn active đúng.
- Không horizontal scroll.
- Console không lỗi.

Status: implemented in Settings and Overview. Automated checks pass; browser smoke was partially blocked by approval quota in Codex, so manual/browser re-check remains recommended before a release build.

### Risk

- 🟡 UX action archive/load cần confirm rõ để tránh user tưởng mất dữ liệu.

## Slice 4 - Outputs Theo Project

### Objective

Output render gắn với project để mở project cũ có thể xem output cũ và render lại.

### In Scope

- Add DB metadata `render_outputs` nếu chưa làm ở Slice 1.
- Khi render xong, ghi output metadata với `project_id`.
- API list outputs by project.
- Outputs page filter theo active project.

### Out Of Scope

- Chưa move tất cả file output cũ.
- Chưa thumbnail extraction nếu chưa có.

### Files Impact

- `MODIFY backend/src/db/schema.sql`
- `MODIFY backend/src/db/database.js`
- `MODIFY backend/src/render/output-manifest.js` hoặc route output liên quan
- `MODIFY backend/src/routes/outputs.js`
- `MODIFY frontend/scripts/common/ui-components.js`

### Verification

- Render một project, output gắn đúng project.
- Load project khác, outputs page không lẫn output project cũ.
- Load lại project đầu, output cũ hiện lại.

Status: metadata/API/frontend filtering implemented. Automated DB/API tests cover per-project output isolation; full MP4 render smoke remains a release-gate check.

## Slice 5 - Version History / Snapshots Nâng Cao

### Objective

Cho phép lưu các mốc snapshot thủ công hoặc theo render checkpoint.

### In Scope

- Create snapshot labels.
- List snapshots of project.
- Restore snapshot.

### Out Of Scope

- Realtime autosave history mỗi keystroke.
- Branching/collaboration.

### Risk

- 🟡 Restore snapshot có thể overwrite current payload; cần confirm modal.

Status: implemented as manual project snapshots in Settings. Backend supports list/create/restore; UI requires confirm before restore. Automated DB/API/frontend storage tests pass.

## Decision: JSON Snapshot Trước, Normalize Sau

Không nên normalize ngay toàn bộ `features`, `slots`, `sceneTemplateOverride`, `videoStyleOverrides` thành bảng riêng trong phase đầu.

Lý do:

- UI/render hiện đang dùng object JSON đầy đủ.
- Slot/template data có cấu trúc linh hoạt, dễ thay đổi.
- Normalize sớm sẽ làm migration phức tạp nhưng chưa tạo giá trị rõ.

Điểm cần normalize trước:

- `projects` metadata để list/history.
- `assets` metadata vì có file binary.
- `render_outputs` metadata vì cần xem output theo project.
- `app_settings` global.

## Test Strategy Tổng

Backend automated:

- `npm --prefix backend run check`
- `backend/scripts/test-projects.js`
- `backend/scripts/test-render-payload.js`
- `backend/scripts/test-audio-voiceover.js`

Frontend static:

- `node --check frontend/scripts/common/api.js`
- `node --check frontend/scripts/common/storage.js`
- `node --check frontend/scripts/common/page-bootstrap.js`
- `node --check frontend/scripts/common/ui-components.js`

Browser smoke:

- Backend running.
- Clear localStorage.
- Load app.
- Confirm active project loads from DB.
- Create project A.
- Create project B.
- Load project A again.
- Edit A, reload, A persists.
- Duplicate A, verify new project id.
- Archive B, verify hidden from default list.

Render smoke later:

- Build render payload from loaded project.
- Render MP4.
- Confirm output metadata belongs to active project.

## Rollback Strategy

- Không drop old `projects.current` row in early slices.
- Keep `data/sample-project.json` as seed.
- If frontend DB-first breaks, backend API data still inspectable via SQLite/API.
- All schema additions are additive.
- Archive is reversible by clearing `archived_at` if needed.

## Open Questions

- Project id format: `proj_<timestamp>_<random>` hay UUID? Đề xuất dùng `crypto.randomUUID()` nếu Node version hỗ trợ.
- Project history UI nằm tạm ở Overview hay tạo page `projects.html`? Đề xuất Overview trong Slice 3.
- Output file path có nên chuyển sang `outputs/{projectId}/` ngay Slice 4 hay chỉ metadata gắn project trước? Đề xuất metadata trước.
- Có cần `project_templates` table không? Chưa cần; default sample file đủ cho phase này.

## Approval Gates

- Trước Slice 1: confirm schema/API.
- Trước Slice 2: confirm frontend DB-first không dùng localStorage project khi backend available.
- Trước Slice 3: confirm vị trí UI Project History.
- Trước Slice 4: confirm output storage strategy.

## Current Recommended Next Step

Các slice chính của roadmap multi-project đã có implementation và automated checks. Trước release nên chạy browser smoke thủ công trên app local và một render MP4 thật để xác nhận UI/history/output hoạt động end-to-end.
