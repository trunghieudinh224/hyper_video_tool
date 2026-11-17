# Tổng Quan Project

Tóm tắt mục tiêu, kiến trúc, module chính, và trạng thái hiện tại của project.

## Mục tiêu

Hyper Video Tool là công cụ nội bộ giúp nhân viên hoặc team tạo video thuyết trình cho một nội dung bất kỳ trong project: tính năng, sản phẩm, module kỹ thuật, workflow, dashboard, bug fix, báo cáo hoặc handoff. Người dùng clone project về máy, mở/chạy giao diện local, nhập brief video, biên tập kịch bản theo từng đoạn, chọn template, xem trước nội dung và render ra video MP4 bằng HyperFrames.

UI và backend hiện đang được phát triển cùng nhau. Thay đổi luồng sản phẩm phải giữ được project data, preview và render contract đồng bộ.

## Đối tượng sử dụng

- Nhân viên muốn giới thiệu một tính năng, sản phẩm, module, workflow hoặc kết quả làm việc.
- Team cần tạo video demo nhanh để chia sẻ tiến độ, kết quả, báo cáo hoặc handoff kỹ thuật.
- Người dùng kỹ thuật vừa phải, có thể mở project local nhưng không muốn chỉnh code template bằng tay.

## Nguyên tắc sản phẩm

- UI chạy local trước, không phụ thuộc cloud.
- Giai đoạn UI dùng dữ liệu mẫu tĩnh và localStorage; dữ liệu video có thể lưu dưới dạng JSON để dễ backup, chia sẻ hoặc sửa tay khi cần.
- Giao diện là công cụ làm việc, không phải landing page.
- Ưu tiên nhập liệu rõ ràng, preview dễ hiểu và render ổn định.
- Không xây timeline editor phức tạp trong MVP.
- Không bắt người dùng nhập đủ hồ sơ dự án nếu video chỉ nói về một nội dung nhỏ.

## Kiến trúc chính

Kiến trúc hiện tại:

- Frontend: HTML/CSS/JavaScript thuần, multi-page trong `frontend/`; backend serve các trang này.
- Backend: Node.js local trong `backend/`, cung cấp project/settings/assets/render/output/voiceover APIs.
- Persistence: SQLite cho project/settings/metadata; asset và video dùng file local dưới `uploads/` và `outputs/`.
- Render: HyperFrames local, xử lý render job bất đồng bộ và tạo MP4 thật.
- Offline/static fallback: frontend vẫn có sample và localStorage path; không coi đây là nguồn dữ liệu chính khi app chạy qua backend.

Luồng chính:

```text
Người dùng mở/chọn project và biên tập nội dung, kịch bản, asset, template
-> frontend đồng bộ project/settings với backend local khi khả dụng
-> preview dựng scene từ project state
-> render preflight kiểm tra dữ liệu và môi trường
-> backend tạo job, gọi HyperFrames và ghi MP4/manifest
-> Outputs đọc metadata và phục vụ file video
```

## Module chính

- App shell: thanh trên cùng, thanh điều hướng, vùng nội dung chính, panel kiểm tra dữ liệu.
- Nội dung video: nhập brief chung như loại nội dung, chủ đề, mục tiêu, thông điệp, tone, ngôn ngữ và voiceover.
- Kịch bản: quản lý các đoạn nội dung sẽ xuất hiện trong video, bao gồm đoạn tính năng, workflow, milestone, demo, kết quả hoặc custom.
- Asset manager: upload và quản lý asset local gắn với project.
- Asset inspector: xem/phát video/audio đã upload, đọc duration/codec/độ phân giải bằng Mediabunny, hiện waveform audio nhỏ bằng wavesurfer.js; backend hỗ trợ HTTP byte range cho media seek.
- Template picker: chọn template video và tùy chỉnh theme video.
- Preview: xem trước scene theo tỉ lệ 16:9 trước khi render.
- Voiceover: Edge TTS online với venv local, có thể đổi giọng Việt/Anh/Nhật theo tag trong cùng script; chữ Nhật tự nhận theo ký tự, từ Latin khác ngôn ngữ chính cần đánh dấu. Các đoạn audio được ghép bằng FFmpeg và giữ SRT theo thời gian thực.
- Phụ đề: cấu hình theo phân đoạn từ voiceover, text riêng hoặc SRT; preview theo cue, render burn vào MP4 và xuất SRT riêng. Karaoke theo từ chỉ là ước lượng khi Edge TTS không trả word timing.
- Render queue: job local bất đồng bộ; trạng thái job còn nằm trong bộ nhớ backend.
- Outputs: liệt kê, xem và tải MP4/SRT qua backend; manifest giữ metadata sau restart.
- Settings: backend persistence cho settings; có kiểm tra preflight môi trường render.

## Tài liệu task liên quan

- `.agents/tasks/ui-roadmap.md`: roadmap giao diện tổng thể.
- `.agents/tasks/ui-items.md`: danh sách item chi tiết cần có trên từng màn hình.
- `.agents/tasks/backend-roadmap.md`: roadmap backend local theo từng phase.
- `.agents/tasks/hyperframes-roadmap.md`: roadmap tích hợp HyperFrames/render MP4.
- `.agents/tasks/video-workflow-ia-roadmap.md`: roadmap chỉnh flow và information architecture sang video brief.
- `backend/README.md`: setup HyperFrames/voiceover, lệnh backend và cách gọi render API.
- `.agents/tasks/hyperframes-roadmap.md`: lịch sử phase render và các hạng mục hardening cần đối chiếu lại với code.
- `.agents/tasks/current-task.md`: trạng thái công việc hiện tại.
- `.agents/context/video-tooling-research.md`: repo video đã đối chiếu với kiến trúc HVT và thứ tự POC đề xuất.
