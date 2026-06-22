# Roadmap Backend Local

Roadmap này mô tả backend local cho Hyper Video Tool. Chưa triển khai code backend trong phase hiện tại.

## Mục Tiêu

Backend local giúp UI tĩnh hiện tại chuyển từ mock/localStorage sang thao tác thật trên máy cá nhân:

- Lưu và đọc project JSON trên ổ đĩa.
- Quản lý asset upload local.
- Chuẩn hóa contract API cho frontend.
- Chuẩn bị render queue để nối với HyperFrames ở roadmap riêng.

Backend phải nằm trong `backend/`. Không tạo backend runtime ở root.

## Nguyên Tắc

- Tool chạy local, ưu tiên setup đơn giản.
- Không cloud, không auth, không user management trong MVP backend.
- Không database ở phase đầu; dùng JSON/file-system trước.
- Không render MP4 thật trong roadmap backend này; render thật nằm ở `.agents/tasks/hyperframes-roadmap.md`.
- Mỗi phase phải có Test Report trước khi qua phase tiếp theo.

## Công Nghệ Khuyến Nghị

Khuyến nghị cho phase backend sau:

- Node.js backend local trong `backend/`.
- API HTTP đơn giản để frontend gọi.
- JSON file storage trước, SQLite chỉ thêm khi JSON khó quản lý.
- Không tạo `package.json` ở root; nếu dùng Node thì tạo `backend/package.json`.

Chốt framework cụ thể ở Phase 1. Ưu tiên nhỏ gọn, ít dependency.

## Phase 1 - Backend Skeleton Và Static Serve

### Objective

Tạo backend local tối thiểu có thể chạy được, serve UI từ `frontend/` và trả health check. Sau phase này, người dùng có thể mở một URL local thay vì mở file HTML trực tiếp.

### Scope

Sẽ làm:

- Tạo cấu trúc backend tối thiểu trong `backend/`.
- Thêm health endpoint.
- Serve static files từ `frontend/`.
- Thêm script chạy local.
- Ghi hướng dẫn chạy backend.

Không làm:

- Chưa ghi project JSON.
- Chưa upload file.
- Chưa render HyperFrames.
- Chưa thêm database.

Files impact dự kiến:

- `backend/package.json`
- `backend/src/server.js` hoặc entry tương đương
- `backend/src/config.js`
- `backend/README.md`
- `.gitignore`
- `.agents/tasks/current-task.md`

Verification:

- Chạy backend local.
- Gọi health endpoint trả OK.
- Mở được UI qua backend URL.
- Console frontend không có lỗi runtime.

Approval gate:

- Chỉ implement khi user xác nhận bắt đầu Phase 1.

### Status

Completed, ngày 23/06/2026.

- Đã tạo `backend/package.json`.
- Đã tạo `backend/src/config.js`.
- Đã tạo `backend/src/server.js`.
- Đã cập nhật `backend/README.md`.
- Backend serve UI từ `frontend/`.
- Health endpoint: `GET /api/health`.

Test report:

- `npm --prefix backend run check`: pass.
- `HVT_PORT=3010 npm --prefix backend start`: server chạy.
- `curl -s http://127.0.0.1:3010/api/health`: trả `success: true`.
- `curl -s -I http://127.0.0.1:3010/`: `200 OK`.
- `curl -s -I http://127.0.0.1:3010/pages/overview.html`: `200 OK`.
- `curl -s http://127.0.0.1:3010/api/unknown`: trả JSON lỗi chuẩn.

## Phase 2 - Project JSON API

### Objective

Thay mock/localStorage-only bằng API đọc/ghi project JSON local. Sau phase này, UI có thể lưu project thật vào `data/projects/`.

### Scope

Sẽ làm:

- Tạo file storage service cho project JSON.
- API list/create/read/update/delete project.
- Validate payload cơ bản trước khi ghi file.
- Chặn path traversal và filename không hợp lệ.
- Frontend có thể export/import qua API nếu user muốn nối UI ở phase này.

Không làm:

- Chưa upload asset binary.
- Chưa render video.
- Chưa đồng bộ nhiều user.
- Chưa SQLite.

Files impact dự kiến:

- `backend/src/routes/projects.js`
- `backend/src/services/project-store.js`
- `backend/src/validation/project-schema.js`
- `data/projects/.gitkeep`
- `frontend/scripts/common/api.js` nếu nối UI
- `.agents/tasks/current-task.md`

Verification:

- Test create/read/update/delete project JSON.
- Kiểm tra file được ghi đúng trong `data/projects/`.
- Kiểm tra request path độc hại bị reject.
- UI vẫn chạy nếu backend API lỗi.

Approval gate:

- Chỉ implement khi Phase 1 đã pass và user xác nhận.

## Phase 3 - Asset Upload Local

### Objective

Cho phép upload và quản lý asset local như logo, screenshot, video demo. Sau phase này, asset có metadata rõ ràng và có thể được chọn cho video.

### Scope

Sẽ làm:

- API upload asset local.
- Lưu file vào `uploads/`.
- Lưu metadata asset vào project JSON hoặc manifest riêng.
- API list/delete asset.
- Giới hạn loại file và dung lượng.

Không làm:

- Chưa xử lý transcode video.
- Chưa generate thumbnail phức tạp.
- Chưa lưu cloud.

Files impact dự kiến:

- `backend/src/routes/assets.js`
- `backend/src/services/asset-store.js`
- `uploads/.gitkeep`
- `frontend/scripts/common/api.js` nếu nối UI
- `.agents/tasks/current-task.md`

Verification:

- Upload file hợp lệ thành công.
- File sai type/size bị reject.
- Delete asset xóa metadata và xử lý file local đúng rule.

Approval gate:

- Chỉ implement khi Phase 2 đã ổn.

## Phase 4 - Render Job API Mock

### Objective

Tạo API render job nhưng chưa gọi HyperFrames thật. Phase này thay render mock thuần frontend bằng render job server-side giả lập, chuẩn bị contract cho render thật.

### Scope

Sẽ làm:

- API create render job.
- API get render job status/logs.
- Lưu job metadata vào `outputs/` hoặc manifest JSON.
- Frontend Render page đọc status từ backend.

Không làm:

- Chưa xuất MP4 thật.
- Chưa gọi HyperFrames.
- Chưa queue phức tạp nhiều worker.

Files impact dự kiến:

- `backend/src/routes/render-jobs.js`
- `backend/src/services/render-job-store.js`
- `outputs/.gitkeep`
- `frontend/scripts/pages/render.js`
- `frontend/scripts/pages/outputs.js`
- `.agents/tasks/current-task.md`

Verification:

- Tạo job mock thành công.
- Status chạy từ queued/running/succeeded hoặc failed theo mock.
- Frontend hiển thị log/status đúng.

Approval gate:

- Chỉ implement sau khi API project và asset ổn.

## Phase 5 - Hardening Local Tool

### Objective

Làm backend local đủ chắc để người khác clone về chạy ít lỗi hơn.

### Scope

Sẽ làm:

- Chuẩn hóa error response.
- Logging local gọn.
- Kiểm tra folder runtime tự tạo nếu thiếu.
- Script kiểm tra môi trường.
- Tài liệu troubleshooting.

Không làm:

- Không auth/cloud.
- Không packaging app desktop.
- Không installer.

Files impact dự kiến:

- `backend/src/middleware/error-handler.js`
- `backend/src/utils/logger.js`
- `backend/src/utils/ensure-runtime-dirs.js`
- `backend/README.md`
- `.agents/tasks/current-task.md`

Verification:

- Fresh clone flow chạy được theo README.
- Các lỗi thường gặp có message rõ.

Approval gate:

- Chỉ làm sau khi backend MVP có API thật.

## Future Scope

- SQLite nếu JSON không đủ.
- Desktop packaging.
- Multi-project dashboard nâng cao.
- Watch mode tự reload template/render.
- Auth hoặc cloud sync nếu tool chuyển từ local-only sang team service.
