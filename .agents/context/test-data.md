# Dữ Liệu Và Cách Kiểm Tra Local

Không lưu credential, token, password hoặc dữ liệu nhạy cảm trong file này.

## App Local

- Backend + UI: `npm --prefix backend start`, mặc định `http://127.0.0.1:3000`.
- Health endpoint: `GET /api/health`.
- Chỉ dùng static server/file mode khi UI đang kiểm tra không cần API; các flow project/assets/settings/render cần backend.
- Trước khi khởi chạy backend hoặc browser verification, dùng `wf-run-web` và chỉ làm khi task yêu cầu chạy app/verification.

## Sample Data

- Project mặc định cho backend: `data/sample-project.json`.
- Render payload: `data/render-payload.sample.json`.
- Dynamic motion samples: `data/dynamic-motion-payload.sample.json` và các project Codegraph trong `data/`.
- Frontend có embedded sample/fallback trong `frontend/scripts/common/storage.js`; không copy sample text vào tài liệu này vì dễ lệch.

## Verification Có Side Effect

- `npm --prefix backend run check` chạy syntax và các test script nội bộ; chỉ chạy khi user yêu cầu test/verification.
- `npm --prefix backend run smoke:render-api` cần backend và tạo MP4 thật trong `outputs/`; chỉ chạy khi user yêu cầu render verification.
- Các script hẹp có trong `backend/package.json`; chọn theo scope và báo rõ lệnh nào đã chạy.
