# Nhật Ký Bài Học Kinh Nghiệm (Learnings Log)

Tài liệu này ghi lại các bài học kỹ thuật có thể tái sử dụng trong project. Entry mới nhất luôn nằm phía trên entry cũ hơn.

## Quy chuẩn cập nhật

- Heading dùng mẫu `## Cập nhật ngày DD/MM/YYYY (HH:MM:SS UTC+7) - Tiêu đề`.
- Entry mới chèn phía trên entry cũ hơn, ngay sau phần quy chuẩn.
- Chỉ ghi bài học có thể tái sử dụng, không ghi thao tác vụn vặt.

## Cập nhật ngày 17/11/2026 (11:53:25 UTC+7) - Local app phải kiểm cả listener và URL trong dữ liệu mẫu

### Bối cảnh

HVT mặc định bind `127.0.0.1`, nhưng `HVT_HOST` từng cho mở ra LAN. UI và dữ liệu mẫu vẫn tham chiếu CDN/ảnh placeholder online dù backend và renderer chạy local.

### Cách xử lý đúng

- Chỉ chấp nhận loopback khi mở backend không có đăng nhập; kiểm thêm Host và Origin để request từ website khác không đi vào API local qua DNS rebinding hoặc cross-origin POST.
- Kiểm URL trong HTML, JS, template và JSON mẫu; giữ CSS/font/media mặc định trong repo hoặc nhúng dữ liệu tự chứa.
- Phân biệt runtime local với TTS online: cài venv tại máy không có nghĩa tổng hợp giọng hoạt động offline.

### Quy tắc lần sau

Khi nói “chạy local”, kiểm cả địa chỉ listen, runtime data, asset mặc định và request trình duyệt; không kết luận chỉ từ URL `localhost` trong README.

## Cập nhật ngày 17/11/2026 (11:31:28 UTC+7) - TTS đa ngôn ngữ cần ghép audio và dời mốc SRT

### Bối cảnh

Voice Edge TTS chọn theo một locale nên câu Việt có từ Anh hoặc Nhật dễ bị phát âm sai. Bản `edge-tts` 7.2.8 còn trả WebSocket 403 sau khi dịch vụ đổi handshake.

### Cách xử lý đúng

- Khóa bản `edge-tts` đã kiểm thực tế trong setup local; 7.3.1 hoạt động trên máy này.
- Với câu đa ngôn ngữ, tách script theo tag ngôn ngữ và ký tự Nhật, tổng hợp từng voice rồi ghép audio bằng FFmpeg. Dùng thời lượng thật của từng đoạn để cộng offset SRT.
- Nếu SRT Edge rỗng hoặc chỉ có một cue dài, tạo timing ước lượng và nói rõ karaoke không chính xác từng từ.

### Quy tắc lần sau

Khi đổi TTS provider hoặc version, kiểm audio thật, thời lượng sau concat, mốc SRT và một MP4 có voice; unit test parser không chứng minh dịch vụ tổng hợp giọng còn chạy.

## Cập nhật ngày 17/11/2026 (11:31:28 UTC+7) - Dynamic render phải đồng bộ duration trước khi HyperFrames đọc HTML

### Bối cảnh

Dynamic payload một scene 4 giây từng render MP4 68 giây vì `data-duration` tĩnh trong HTML mẫu. Một render có voice ngắn hơn scene lại bị mux cắt video theo audio do `-shortest`.

### Cách xử lý đúng

- Ghi tổng duration theo payload vào bản `index.html` trong workdir trước khi gọi HyperFrames.
- Khi mux voice/nhạc, lấy thời lượng video làm mốc output, không dùng thời lượng voice làm giới hạn video.
- Kiểm duration bằng FFprobe và xem frame ở các mốc sau render.

### Quy tắc lần sau

Timeline runtime, metadata HTML mà renderer đọc trước khi chạy script, thời lượng audio mux và mốc SRT phải dùng cùng clock của video; job `succeeded` không chứng minh duration đúng.

## Cập nhật ngày 17/11/2026 (10:25:54 UTC+7) - Media preview cần HTTP byte range

### Bối cảnh

HVT đã serve asset video/audio bằng GET nguyên file. Khi thêm player và bộ đọc metadata theo URL, media cần seek và đọc từng đoạn file mà không tải toàn bộ clip.

### Nguyên nhân

Endpoint chỉ trả `200` với toàn bộ nội dung; HTML5 media và thư viện đọc container có thể yêu cầu `Range: bytes=...`. File lớn vì vậy dễ tải thừa, seek kém hoặc không đọc được metadata ở phần cuối file.

### Cách xử lý đúng

- Hỗ trợ một byte range với `206`, `Content-Range`, `Content-Length` chính xác và `Accept-Ranges: bytes`; range không hợp lệ trả `416`.
- Giữ request không có Range ở `200` để không phá client cũ. Test GET, HEAD, prefix/suffix range và lỗi range trên asset mẫu.
- Khi thêm media library phía browser, kiểm cả decode/playback và đường đọc URL theo byte range; chỉ đọc được metadata từ file blob chưa chứng minh endpoint HTTP tương thích.

### Quy tắc lần sau

Mọi tính năng preview/seek video hoặc audio qua asset URL phải kiểm đường HTTP range cùng với browser playback; không coi file tải được bằng GET là đủ.

## Cập nhật ngày 29/06/2026 (10:37:13 UTC+7) - Setting media phải nối đủ editor, preview và render

### Bối cảnh

Nhạc nền đã chọn và lưu đúng trong project, render payload cũng đã mang source/volume sang backend, nhưng trang Xem trước hoàn toàn không phát nhạc.

### Nguyên nhân

Setting mới chỉ được nối vào form, persistence và render pipeline. Preview player vẫn chỉ quản lý voiceover nên cấu hình nhạc nền tồn tại nhưng không có consumer ở UI xem trước.

### Cách xử lý đúng

- Với media toàn video, dùng player riêng cho từng track cần điều khiển độc lập, ví dụ voiceover và background music.
- Đồng bộ play, pause, mute, seek, replay, chuyển scene, loop và volume với timeline preview.
- Browser smoke phải xác nhận đúng source asset, volume, trạng thái loop, hành vi mute và console error; render test vẫn kiểm tra mux riêng.

### Quy tắc lần sau

Mọi setting ảnh hưởng output video phải được rà theo chuỗi hoàn chỉnh: editor → database/storage → preview → render payload → render output. Không coi form lưu được hoặc render payload đúng là feature đã hoàn thành.

## Cập nhật ngày 28/06/2026 (11:57:53 UTC+7) - Asset upload phải tách URL preview khỏi nguồn media render

### Bối cảnh

Asset lưu trên backend có thể hiển thị đúng ở trang tài nguyên qua `/api/assets/:id/file`, nhưng render worker chạy composition trong workdir riêng.

### Nguyên nhân

- URL tương đối `/api/...` được resolve theo origin của composition/HyperFrames, không chắc trỏ về backend app.
- Multipart parser buffer toàn bộ video và chuyển qua binary string làm tăng RAM nhiều lần.
- Ghi nhiều file/DB row tuần tự mà không rollback tạo asset mồ côi khi batch lỗi giữa chừng.

### Cách xử lý đúng

- Stream multipart xuống file tạm, validate size/MIME/magic bytes rồi mới rename thành file chính thức.
- Rollback toàn bộ file và metadata đã tạo nếu một file trong batch thất bại.
- Trước render, resolve asset bằng metadata DB, kiểm path thuộc `uploads/`, copy vào composition và đổi payload sang URL local.

### Quy tắc lần sau

Không coi asset hiển thị trong app là bằng chứng render dùng được. Mọi thay đổi asset persistence phải test đủ upload, reload, file serving, rollback và localization vào render workdir.

## Cập nhật ngày 28/06/2026 (10:58:12 UTC+7) - Dynamic scene type phải đi qua đủ frontend, template và backend schema

### Bối cảnh

Trang template có thể tạo phân đoạn theo scene template/slot và preview nội bộ chạy đúng, nhưng render API vẫn có thể fail nếu payload sinh ra scene type mới.

### Nguyên nhân

Dynamic render có nhiều lớp hợp đồng độc lập: frontend build payload, template runtime render DOM, và backend `render-payload-schema.js` validate scene type trước khi render. Nếu chỉ sửa frontend/template mà quên schema/test backend, payload mới sẽ bị reject ở API.

### Cách xử lý đúng

- Khi thêm dynamic scene type mới, cập nhật `DYNAMIC_SCENE_TYPES` trong backend schema.
- Thêm test payload tối thiểu trong `backend/scripts/test-render-payload.js`.
- Verify cả `AppRender.buildRenderPayload`, template runtime DOM, và `npm --prefix backend run check`.

### Quy tắc lần sau

Không coi preview trong browser là đủ cho thay đổi render contract. Mỗi scene type mới phải có coverage qua ba chỗ: frontend payload builder, template renderer, backend schema/test.

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
