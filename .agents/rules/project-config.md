# Project Configuration Template

> File này chứa thông tin riêng từng project.
> Copy file này vào `.agents/rules/project-config.md`, sau đó thay toàn bộ placeholder.
> Không để credential thật trong shared rule.

---

## Project Identity

- **Project Name**: `Hyper Video Tool`
- **Project Slug**: `hyper-video-tool`
- **Project Type**: `{ecommerce | service-web | admin-tool | content | other}`
- **Client / Owner**: `{CLIENT_NAME}`
- **Domain**: `internal.local`
- **Short Description**: `Hyper Video Tool`

---

## Tech Stack

- **Framework**: Laravel `{LARAVEL_VERSION}`
- **Language**: PHP `{PHP_VERSION}`
- **Database**: MySQL
- **Frontend**: Blade templating + Vanilla JS + Vanilla CSS
- **Package manager**: npm
- **HTTP client (JS)**: axios

---

## Database

- **DB Name**: `hyper_video_tool.sqlite`
- **DB User**: đọc từ `.env DB_USERNAME` hoặc `{DB_USER}`
- **Backup folder**: `{BACKUP_FOLDER}` ví dụ `database/backups/`
- **Backup command**:

```bash
mysqldump -u {DB_USERNAME} hyper_video_tool.sqlite > {BACKUP_FOLDER}/YYYYMMDD_HHMMSS_backup_db.sql
```

---

## Asset Paths

- **CSS source**: `public/css/`
  - Client: `public/css/client/`
  - Admin: `public/css/admin/`
- **JS source**: `public/js/`
  - Client: `public/js/client/`
  - Admin: `public/js/admin/`
  - Common: `public/js/sys-common/`
- **Static images**: `public/images/`
- **Uploaded images**: `public/storage/uploads/`
- **Minification script**: `ALLOW_MINIFY=1 npm run minify` cho deploy thủ công, hoặc `npm run minify` trong CI có `CI=true`

---

## View Paths

- **Blade views**: `resources/views/`
  - Client: `resources/views/client/`
  - Admin: `resources/views/admin/`
  - Common components: `resources/views/common-components/`
- **Admin layout**: `{ADMIN_LAYOUT_PATH}`
  - Extend: `{ADMIN_LAYOUT_EXTENDS}`
- **Client layout**: `{CLIENT_LAYOUT_PATH}`
  - Extend: `{CLIENT_LAYOUT_EXTENDS}`
- **Asset helper**: `{{ asset_v('css/...') }}` và `{{ asset_v('js/...') }}`

---

## Documentation Paths

- **Doc folder**: `doc/`
- **Template CSS**: `{CSS_TEMPLATE_PATH}` ví dụ `.agents/templates/view_file_template/css_template.css`
- **Template JS**: `{JS_TEMPLATE_PATH}` ví dụ `.agents/templates/view_file_template/js_template.js`
- **Business rules**: `doc/4_business_rule.md`
- **Feature list**: `doc/2_feature_list.md`
- **Database schema**: `doc/3_database.md`
- **API spec**: `doc/5_api_spec.md`
- **System prompt**: `doc/6_system_prompt.md`

---

## Deployment

- **Server**: `{SERVER_PROVIDER}`
- **Deploy script**: `./deploy_hyper-video-tool.sh`
- **SSH config**: xem `.agents/workflows/deploy.md`
- **Credential rule**: không commit password/token/key thật.

---

## Local Environment

- **APP_PORT**: đọc từ `.env`, không hardcode
- **Local URL**: `http://localhost:3000`
- **Admin URL**: `http://localhost:3000/admin/login`
- **Chrome remote debugging**: `9222` nếu project dùng browser/CDP test

Nếu workflow test UI cần Chrome debug port, agent nên tự bật Chrome ở port `9222` nếu chưa mở, thay vì báo lỗi ngay.

---

## CSS Breakpoints

Responsive theo `max-width`, từ cao xuống thấp:

| Name | max-width |
|---|---:|
| xxl | 1600px |
| xl | 1400px |
| lg | 1200px |
| md | 992px |
| sm | 768px |
| xs | 576px |
| xxs | 450px |

---

## API Response Format

```json
{
  "success": true,
  "message": "...",
  "data": {}
}
```

Validation/error:

```json
{
  "success": false,
  "message": "...",
  "errors": {}
}
```
