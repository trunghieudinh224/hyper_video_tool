---
name: wf-run-web
description: Chạy backend local của Hyper Video Tool an toàn để phục vụ UI hoặc browser check, kiểm tra server có sẵn trước và không đụng process lạ.
---

# Workflow: Run Hyper Video Tool Locally

## Khi dùng

Dùng khi người dùng yêu cầu mở/chạy app hoặc đã yêu cầu browser verification cần backend. Không suy ra quyền khởi chạy từ việc chỉ sửa code; không tự khởi động app trong bước onboard.

## Cấu hình và lệnh

- Backend đọc `HVT_HOST` (mặc định `127.0.0.1`) và `HVT_PORT` (mặc định `3000`). Không đọc `.env`.
- Lệnh chạy: `npm --prefix backend start`.
- Health endpoint: `GET /api/health`.
- Khi tự khởi chạy, dùng `HVT_HOST=127.0.0.1` và bind loopback; không expose server ra mạng.

## Quy trình

1. Xác định host/port từ yêu cầu hiện tại hoặc mặc định trên.
2. Kiểm tra `http://127.0.0.1:<port>/api/health`. Nếu đây đã là HVT đang chạy, tái sử dụng instance đó.
3. Nếu port bị chiếm nhưng endpoint không xác nhận HVT, kiểm tra listener bằng `lsof -nP -iTCP:<port> -sTCP:LISTEN` và báo tình trạng. Không kill hoặc restart process không do workflow này tạo.
4. Nếu cần khởi chạy, chạy backend ở `127.0.0.1` với `HVT_PORT` tương ứng. Ghi nhận session/process do chính workflow tạo.
5. Xác nhận `/api/health` trả trạng thái OK và trang `/` trả HTML. Báo URL cho người dùng.
6. Nếu browser check nằm trong scope, dùng `webapp-testing` và các giới hạn viewport trong `.agents/rules/static-multipage-ui.md`.
7. Nếu server chỉ được mở để kiểm tra trong task, dừng đúng process/session do workflow tạo khi kiểm tra xong. Nếu người dùng yêu cầu để app chạy, giữ server.

## Tác động và giới hạn

- Backend có thể khởi tạo hoặc cập nhật schema SQLite và tạo runtime files khi nhận request. Không dùng workflow này như cách kiểm tra thuần chỉ đọc.
- Không chạy migration, seed, render thật, `hf:setup`, `audio:setup`, `npm install` hoặc smoke test có ghi output trừ khi task yêu cầu rõ.
- Không tự đổi database path hoặc xóa database/output để làm môi trường sạch.
- Nếu dependency hoặc môi trường thiếu, báo lỗi; không tự cài thêm.
