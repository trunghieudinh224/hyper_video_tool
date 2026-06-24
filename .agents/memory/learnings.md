# Nhật Ký Bài Học Kinh Nghiệm (Learnings Log)

Tài liệu này ghi lại các bài học kỹ thuật có thể tái sử dụng trong project. Entry mới nhất luôn nằm phía trên entry cũ hơn.

## Quy chuẩn cập nhật

- Heading dùng mẫu `## Cập nhật ngày DD/MM/YYYY (HH:MM:SS UTC+7) - Tiêu đề`.
- Entry mới chèn phía trên entry cũ hơn, ngay sau phần quy chuẩn.
- Chỉ ghi bài học có thể tái sử dụng, không ghi thao tác vụn vặt.

## Cập nhật ngày 24/06/2026 (11:41:52 UTC+7) - Dynamic render blank dù job succeeded

### Bối cảnh

Dynamic motion templates có thể render ra MP4 đúng resolution/duration nhưng nội dung gần như đen hoặc đứng một scene.

### Nguyên nhân

- Backend render workdir copy riêng template vào `.cache/render-jobs/{jobId}/composition`; nếu template reference `../shared/...` thì phải copy cả `templates/shared` sang `.cache/render-jobs/{jobId}/shared`.
- Bootstrap timeline rỗng trong template nếu được register trước timeline thật, hoặc overwrite timeline thật, có thể làm HyperFrames render video hợp lệ nhưng timeline không chạy đúng nội dung.

### Cách xử lý đúng

- `prepareWorkDir()` phải copy shared runtime khi template dùng shared assets/scripts.
- Dynamic template nên load `script.js` trước bootstrap fallback; bootstrap chỉ tạo timeline rỗng khi `window.__timelines[compositionId]` chưa tồn tại.
- Sau smoke render, phải extract frame ở nhiều mốc thời gian và xem nội dung, không chỉ dựa vào `ffprobe`, job status, hoặc file tồn tại.

### Quy tắc lần sau

Với render/video bug, coi MP4 `succeeded` là chưa đủ. Luôn kiểm ít nhất: file size bất thường, frame tại 2-3 mốc, và scene có đổi theo timeline.
