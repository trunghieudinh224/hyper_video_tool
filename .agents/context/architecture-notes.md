# Ghi Chú Kiến Trúc

## Trạng Thái Hiện Tại

Hyper Video Tool là app local gồm frontend nhiều trang và backend Node.js. `README.md`, `backend/README.md` và code hiện tại là nguồn kiểm tra implementation; roadmap bên dưới chỉ mô tả hướng phát triển, không mặc định phản ánh trạng thái runtime.

## Frontend

- HTML/CSS/JavaScript thuần trong `frontend/`, không có framework hoặc build step.
- Entry point là `frontend/index.html`; mỗi màn hình chính có HTML/CSS/JS riêng theo `.agents/rules/static-multipage-ui.md`.
- `frontend/scripts/common/state.js` giữ state đang mở; `storage.js` kết nối backend khi chạy qua HTTP và duy trì localStorage/sample fallback. `api.js` gom các request API.
- App chạy ở `http://127.0.0.1:3000` qua backend cho các flow cần API. Chỉ dùng static server/file mode để xem những phần có hỗ trợ fallback.
- UI target mặc định: PC/laptop; tablet/mobile chỉ nằm trong scope khi user yêu cầu.

## Backend Và Persistence

- Backend nằm trong `backend/src/`; `server.js` serve `frontend/` và route request sang các module trong `routes/`.
- API hiện có các flow project, settings, assets, render preflight/jobs, outputs và voiceover preview.
- `db/database.js` dùng SQLite CLI; database mặc định là `data/hyper-video-tool.sqlite`.
- Asset binary nằm trong `uploads/`; MP4 nằm trong `outputs/`. Các thư mục này là runtime data, không phải source/docs.
- Frontend có localStorage fallback/cache. Khi sửa persistence, kiểm tra riêng hành vi backend và fallback; không mặc định localStorage đã bị loại bỏ.

## Render Và Media

- Backend tạo render job local và gọi runner HyperFrames; template video nằm trong `templates/`.
- Render output được ghi dưới `outputs/`; manifest giữ metadata output, còn trạng thái/log job hiện được giữ trong memory và mất khi backend restart theo `README.md`.
- Voiceover preview dùng backend route và local `edge-tts` environment theo `backend/README.md`.
- Thay đổi scene, asset hoặc media phải đối chiếu frontend payload, backend schema/mapper và template runtime. Xem `.agents/rules/video-style-scene-item-contract.md` khi thay contract scene.

## Ranh Giới Và Quyết Định

- Giữ UI ở `frontend/`, API/runtime ở `backend/`, project/sample data ở `data/`, composition ở `templates/`.
- Không thêm cloud/auth hoặc framework frontend nếu user chưa yêu cầu.
- Không đổi schema, format project, dữ liệu local hay render contract ngoài scope đã được chốt.
- Chi tiết persistence còn phải cải thiện nằm ở `.agents/tasks/backend-database-roadmap.md`; kiểm tra code trước khi coi mục roadmap là trạng thái hiện tại.

## Tham Chiếu Chính

- `README.md`: trạng thái app và cách chạy/kiểm tra.
- `backend/README.md`: backend, render, HyperFrames và voiceover.
- `.agents/rules/static-multipage-ui.md`: rule cấu trúc UI và viewport.
- `.agents/tasks/current-task.md`: task đang được theo dõi; `.agents/tasks/task-history.md`: các task/report cũ.
